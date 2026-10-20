import assert from 'node:assert/strict';
import { address, generateKeyPairSigner, type Instruction } from '@solana/kit';
import { SYSTEM_PROGRAM_ADDRESS } from '@solana-program/system';
import { TOKEN_PROGRAM_ADDRESS } from '@solana-program/token';
import { loadSolution, type Solution } from '../src/load-solution.ts';

export async function grade(solution: Solution) {
  const cases: [string, () => unknown | Promise<unknown>][] = [];
  const check = (name: string, run: () => unknown | Promise<unknown>) => cases.push([name, run]);
  check('Conversión exacta de unidades y límites u64', () => {
    for (const [value, decimals, expected] of [
      ['0', 6, 0n], ['250', 6, 250_000_000n], ['0.000001', 6, 1n],
      ['10.25', 2, 1025n], ['1', 0, 1n], ['9007199254740993', 0, 9007199254740993n],
      ['18446744073709551615', 0, 18446744073709551615n],
    ] as const) assert.equal(solution.toRawAmount(value, decimals), expected);
  });
  check('Rechazo de importes inválidos', () => {
    for (const value of ['-1', '1e3', 'NaN', ' 1', '1 ', '', '.5', '1.', '1.0000001', '18446744073709551616']) {
      assert.throws(() => solution.toRawAmount(value, 6), value);
    }
    for (const decimals of [-1, 1.5, 256, NaN]) {
      assert.throws(() => solution.toRawAmount('1', decimals));
    }
  });
  check('Lectura de una cuenta y cantidad real de bytes', async () => {
    const account = address('11111111111111111111111111111111');
    const snapshot = await solution.inspectAccount({
      getAccountInfo: (received, config) => {
        assert.equal(received, account);
        assert.equal(config.encoding, 'base64');
        assert.equal(config.commitment, 'confirmed');
        return { send: async () => ({ value: {
          owner: TOKEN_PROGRAM_ADDRESS, lamports: 123n, executable: false,
          data: [Buffer.from([1, 2, 3, 4, 5]).toString('base64'), 'base64'],
        } }) };
      },
    }, account);
    assert.deepEqual(snapshot, {
      exists: true, programOwner: TOKEN_PROGRAM_ADDRESS, lamports: 123n, dataLength: 5, executable: false,
    });
    const missing = await solution.inspectAccount({
      getAccountInfo: () => ({ send: async () => ({ value: null }) }),
    }, account);
    assert.deepEqual(missing, {
      exists: false, programOwner: null, lamports: 0n, dataLength: 0, executable: false,
    });
  });
  check('Mint: creación e inicialización en la misma transacción', async () => {
    const payer = await generateKeyPairSigner();
    const mint = await generateKeyPairSigner();
    const { lamports } = await import('@solana/kit');
    const instructions = solution.createMintInstructions({ payer, mint, rent: lamports(1_461_600n), decimals: 6 });
    assert.equal(instructions.length, 2);
    assert.equal(instructions[0].programAddress, SYSTEM_PROGRAM_ADDRESS);
    assert.equal(instructions[1].programAddress, TOKEN_PROGRAM_ADDRESS);
    assert(instructions[0].accounts?.some(a => a.address === mint.address));
  });
  check('TransferChecked, BurnChecked y autoridades usan el Token Program', async () => {
    const authority = await generateKeyPairSigner();
    const source = (await generateKeyPairSigner()).address;
    const destination = (await generateKeyPairSigner()).address;
    const mint = (await generateKeyPairSigner()).address;
    const instructions: [Instruction, number][] = [
      [solution.transferTokensInstruction({ source, destination, mint, authority, amount: 1n, decimals: 6 }), 12],
      [solution.burnTokensInstruction({ account: source, mint, authority, amount: 1n, decimals: 6 }), 15],
      [solution.setFrozenInstruction({ account: source, mint, authority, frozen: true }), 10],
      [solution.setFrozenInstruction({ account: source, mint, authority, frozen: false }), 11],
      [solution.revokeMintAuthorityInstruction({ mint, authority }), 6],
    ];
    for (const [instruction, discriminator] of instructions) {
      assert.equal(instruction.programAddress, TOKEN_PROGRAM_ADDRESS);
      assert.equal(instruction.data?.[0], discriminator);
    }
  });
  check('Reflection conserva las preguntas de la entrega', () => {
    for (const name of [
      'githubUsername', 'accountOwnership', 'ataAndPda', 'atomicity', 'transactionLifecycle',
      'tokenSupply', 'tokenProgramChoice', 'evidence',
    ]) {
      const answer = (solution.reflection as Record<string, string>)[name];
      assert.equal(typeof answer, 'string', name);
      assert(answer.trim().length >= 3 && !answer.includes('TODO'), `Completá reflection.${name}`);
    }
  });
  let failures = 0;
  for (const [name, run] of cases) {
    try { await run(); console.log(`✓ ${name}`); }
    catch (error) { failures++; console.error(`✗ ${name}\n  ${error instanceof Error ? error.message : error}`); }
  }
  if (failures) throw new Error(`${failures}/${cases.length} grupos pendientes. Revisá los TODO y volvé a ejecutar.`);
  console.log(`${cases.length}/${cases.length} grupos aprobados. Falta ejecutar el escenario local completo y revisar reflection.`);
}

// La evaluación rápida no necesita RPC ni envía transacciones.
if (import.meta.url === (await import('node:url')).pathToFileURL(process.argv[1]).href) {
  try { await grade(await loadSolution(process.argv[2])); }
  catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
}
