import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import {
  assertIsTransactionWithBlockhashLifetime, createSolanaRpc, createSolanaRpcSubscriptions,
  generateKeyPairSigner, getBase64EncodedWireTransaction, getSignatureFromTransaction,
  isNone, lamports, sendAndConfirmTransactionFactory, airdropFactory, type Address, type Instruction,
} from '@solana/kit';
import { getTransferSolInstruction, SYSTEM_PROGRAM_ADDRESS } from '@solana-program/system';
import {
  AccountState, fetchMint, fetchToken, findAssociatedTokenPda, getMintSize, TOKEN_PROGRAM_ADDRESS,
  TOKEN_ERROR__OWNER_MISMATCH, TOKEN_ERROR__MINT_DECIMALS_MISMATCH, TOKEN_ERROR__INSUFFICIENT_FUNDS,
  TOKEN_ERROR__ACCOUNT_FROZEN, TOKEN_ERROR__FIXED_SUPPLY,
} from '@solana-program/token';
import { loadSolution } from './load-solution.ts';

// Este ejecutor solo admite un nodo local y claves efímeras; nunca guarda claves privadas.
function localEndpoint(value: string, protocol: 'http:' | 'ws:') {
  const url = new URL(value);
  assert.equal(url.protocol, protocol, 'Protocolo RPC incorrecto');
  assert(['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname), 'Usá únicamente localnet');
  return value;
}

async function main() {
  if (!process.argv.includes('--execute-local')) {
    throw new Error('Para crear cuentas y mover tokens de prueba: npm run campus -- <archivo.ts> --execute-local');
  }
  const file = process.argv.slice(2).find(arg => !arg.startsWith('--')) ?? 'starter/solution.ts';
  const solution = await loadSolution(file);
  const rpcUrl = localEndpoint(process.env.RPC_URL ?? 'http://127.0.0.1:8899', 'http:');
  const wsUrl = localEndpoint(process.env.WS_URL ?? 'ws://127.0.0.1:8900', 'ws:');
  const rpc = createSolanaRpc(rpcUrl);
  const rpcSubscriptions = createSolanaRpcSubscriptions(wsUrl);
  const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });
  const academy = await generateKeyPairSigner();
  const student = await generateKeyPairSigner();
  const store = await generateKeyPairSigner();
  const mint = await generateKeyPairSigner();
  const decimals = 6;
  const raw = (value: string) => solution.toRawAmount(value, decimals);
  const journal: Record<string, unknown>[] = [];
  const timeout = () => AbortSignal.timeout(30_000);
  const serialize = (value: unknown) => JSON.stringify(value, (_, item) => typeof item === 'bigint' ? item.toString() : item, 2);

  console.log('Red: localnet. Fee payer y autoridades: wallets efímeras. Token: SPL clásico.');
  console.log('Flujo: emitir 1000 → beca 250 → compra 40 → quemar 10 → congelar/descongelar → revocar emisión.');
  await airdropFactory({ rpc, rpcSubscriptions })({
    recipientAddress: academy.address, lamports: lamports(3_000_000_000n),
    commitment: 'confirmed', abortSignal: timeout(),
  });

  async function build(instructions: readonly Instruction[]) {
    const { value: lifetime } = await rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
    const transaction = await solution.buildSignedTransaction({ payer: academy, lifetime, instructions });
    assertIsTransactionWithBlockhashLifetime(transaction);
    assert.equal(transaction.lifetimeConstraint.blockhash, lifetime.blockhash);
    return transaction;
  }

  async function execute(label: string, instructions: readonly Instruction[]) {
    const transaction = await build(instructions);
    const signature = getSignatureFromTransaction(transaction);
    const { value: simulation } = await rpc.simulateTransaction(getBase64EncodedWireTransaction(transaction), {
      encoding: 'base64', commitment: 'confirmed', sigVerify: true,
    }).send();
    if (simulation.err) {
      console.error(simulation.logs);
      throw new Error(`Falló la simulación de ${label}: ${serialize(simulation.err)}`);
    }
    console.log(`Simulación OK: ${label}; CU=${simulation.unitsConsumed}; firma=${signature}`);
    await sendAndConfirm(transaction, { commitment: 'confirmed', abortSignal: timeout() });
    // Se permite leer v0 o v1, aunque este ejercicio construye mensajes v0 como las diapositivas.
    const landed = await rpc.getTransaction(signature, {
      encoding: 'json', commitment: 'confirmed', maxSupportedTransactionVersion: 1,
    }).send();
    assert(landed?.meta && !landed.meta.err, `No se pudo verificar ${label}`);
    journal.push({ label, signature, unitsConsumed: simulation.unitsConsumed, fee: landed.meta.fee });
  }

  async function rejectSimulation(label: string, instructions: readonly Instruction[], expectedCode: number, failedIndex = 0) {
    const transaction = await build(instructions);
    const { value: simulation } = await rpc.simulateTransaction(getBase64EncodedWireTransaction(transaction), {
      encoding: 'base64', commitment: 'confirmed', sigVerify: true,
    }).send();
    assert(simulation.err, `${label} debía fallar`);
    assert(typeof simulation.err === 'object' && 'InstructionError' in simulation.err, 'Se esperaba un error de instrucción');
    assert.equal(Number(simulation.err.InstructionError[0]), failedIndex);
    const reason = simulation.err.InstructionError[1];
    assert(typeof reason === 'object' && 'Custom' in reason, 'Se esperaba un error del Token Program');
    assert.equal(Number(reason.Custom), expectedCode, `Código de error incorrecto en ${label}`);
    journal.push({ label, expectedFailure: true, error: simulation.err, logs: simulation.logs });
    console.log(`Rechazo esperado: ${label}`);
    return transaction;
  }

  const missing = await solution.inspectAccount(rpc, mint.address);
  assert.equal(missing.exists, false, 'El mint todavía no debe existir');
  await execute('Financiar wallets de prueba', [
    getTransferSolInstruction({ source: academy, destination: student.address, amount: lamports(10_000_000n) }),
    getTransferSolInstruction({ source: academy, destination: store.address, amount: lamports(10_000_000n) }),
  ]);
  const rent = await rpc.getMinimumBalanceForRentExemption(BigInt(getMintSize())).send();
  await execute('Crear e inicializar mint', solution.createMintInstructions({ payer: academy, mint, rent, decimals }));
  const mintSnapshot = await solution.inspectAccount(rpc, mint.address);
  assert.equal(mintSnapshot.programOwner, TOKEN_PROGRAM_ADDRESS);
  assert.equal(mintSnapshot.dataLength, getMintSize());
  assert.equal(mintSnapshot.executable, false);
  assert(mintSnapshot.lamports >= rent);
  const walletSnapshot = await solution.inspectAccount(rpc, student.address);
  assert.equal(walletSnapshot.programOwner, SYSTEM_PROGRAM_ADDRESS);
  assert.equal(walletSnapshot.dataLength, 0);
  const programSnapshot = await solution.inspectAccount(rpc, TOKEN_PROGRAM_ADDRESS);
  assert.equal(programSnapshot.executable, true);
  const initializedMint = await fetchMint(rpc, mint.address, { commitment: 'confirmed' });
  assert.equal(initializedMint.data.decimals, decimals);
  assert.equal(initializedMint.data.supply, 0n);
  assert.deepEqual(initializedMint.data.mintAuthority, { __option: 'Some', value: academy.address });
  assert.deepEqual(initializedMint.data.freezeAuthority, { __option: 'Some', value: academy.address });

  const owners = [academy.address, student.address, store.address];
  const atas = await Promise.all(owners.map(async owner => (await findAssociatedTokenPda({
    owner, mint: mint.address, tokenProgram: TOKEN_PROGRAM_ADDRESS,
  }))[0]));
  const [treasuryAta, studentAta, storeAta] = atas;
  const ataInput = { payer: academy, mint: mint.address, owners };
  await execute('Crear tres ATAs', await solution.createAtaInstructions(ataInput));
  await execute('Repetir creación idempotente de ATAs', await solution.createAtaInstructions(ataInput));
  for (const [index, ata] of atas.entries()) {
    const snapshot = await solution.inspectAccount(rpc, ata);
    assert.equal(snapshot.programOwner, TOKEN_PROGRAM_ADDRESS);
    assert.equal(snapshot.dataLength, 165);
    const token = await fetchToken(rpc, ata, { commitment: 'confirmed' });
    assert.equal(token.data.owner, owners[index]);
    assert.equal(token.data.mint, mint.address);
    assert.equal(token.data.amount, 0n);
  }
  const tokenBalance = async (account: Address) => (await fetchToken(rpc, account, { commitment: 'confirmed' })).data.amount;
  const supply = async () => (await fetchMint(rpc, mint.address, { commitment: 'confirmed' })).data.supply;
  async function balances(treasury: string, learner: string, merchant: string, total: string) {
    assert.deepEqual(await Promise.all(atas.map(tokenBalance)), [raw(treasury), raw(learner), raw(merchant)]);
    assert.equal(await supply(), raw(total));
  }
  await execute('Emitir 1000 créditos', [solution.mintTokensInstruction({
    mint: mint.address, token: treasuryAta, authority: academy, amount: raw('1000'),
  })]);
  await balances('1000', '0', '0', '1000');
  const transfer = (source: Address, destination: Address, authority: typeof academy, amount: string, checkedDecimals = decimals) =>
    solution.transferTokensInstruction({ source, destination, mint: mint.address, authority, amount: raw(amount), decimals: checkedDecimals });
  await execute('Beca: tesorería → estudiante, 250', [transfer(treasuryAta, studentAta, academy, '250')]);
  await balances('750', '250', '0', '1000');
  await execute('Compra: estudiante → tienda, 40', [transfer(studentAta, storeAta, student, '40')]);
  await balances('750', '210', '40', '1000');
  await execute('Quemar 10 créditos de la tienda', [solution.burnTokensInstruction({
    account: storeAta, mint: mint.address, authority: store, amount: raw('10'), decimals,
  })]);
  await balances('750', '210', '30', '990');

  await rejectSimulation('Firma de dueño incorrecto', [transfer(studentAta, storeAta, academy, '1')], TOKEN_ERROR__OWNER_MISMATCH);
  await rejectSimulation('Decimales incorrectos', [transfer(studentAta, storeAta, student, '1', 5)], TOKEN_ERROR__MINT_DECIMALS_MISMATCH);

  // Esta prueba publica deliberadamente un fallo SOLO en localnet para comprobar rollback y fee.
  const atomic = await rejectSimulation('Atomicidad: segunda transferencia excede el saldo', [
    transfer(studentAta, storeAta, student, '5'), transfer(studentAta, storeAta, student, '9999'),
  ], TOKEN_ERROR__INSUFFICIENT_FUNDS, 1);
  const payerBefore = (await rpc.getBalance(academy.address, { commitment: 'confirmed' }).send()).value;
  const atomicSignature = await rpc.sendTransaction(getBase64EncodedWireTransaction(atomic), {
    encoding: 'base64', skipPreflight: true, maxRetries: 0n,
  }).send();
  let failedOnChain = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    const { value: [status] } = await rpc.getSignatureStatuses([atomicSignature]).send();
    if (status && ['confirmed', 'finalized'].includes(status.confirmationStatus ?? '')) {
      assert(status.err && typeof status.err === 'object' && 'InstructionError' in status.err);
      assert.equal(Number(status.err.InstructionError[0]), 1);
      failedOnChain = true;
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  assert(failedOnChain, 'El fallo atómico no confirmó a tiempo');
  await balances('750', '210', '30', '990');
  const payerAfter = (await rpc.getBalance(academy.address, { commitment: 'confirmed' }).send()).value;
  assert(payerAfter < payerBefore, 'Un fallo incluido en un bloque igualmente cobra fees');
  journal.push({ label: 'Rollback confirmado en localnet', signature: atomicSignature, fee: payerBefore - payerAfter });

  const freezeInput = { account: studentAta, mint: mint.address, authority: academy };
  await execute('Congelar cuenta del estudiante', [solution.setFrozenInstruction({ ...freezeInput, frozen: true })]);
  assert.equal((await fetchToken(rpc, studentAta, { commitment: 'confirmed' })).data.state, AccountState.Frozen);
  await rejectSimulation('Cuenta congelada no puede transferir', [transfer(studentAta, storeAta, student, '1')], TOKEN_ERROR__ACCOUNT_FROZEN);
  await execute('Descongelar cuenta del estudiante', [solution.setFrozenInstruction({ ...freezeInput, frozen: false })]);
  assert.equal((await fetchToken(rpc, studentAta, { commitment: 'confirmed' })).data.state, AccountState.Initialized);
  await execute('Revocar mint authority', [solution.revokeMintAuthorityInstruction({ mint: mint.address, authority: academy })]);
  assert(isNone((await fetchMint(rpc, mint.address, { commitment: 'confirmed' })).data.mintAuthority));
  await rejectSimulation('Emisión prohibida luego de revocar autoridad', [solution.mintTokensInstruction({
    mint: mint.address, token: treasuryAta, authority: academy, amount: raw('1'),
  })], TOKEN_ERROR__FIXED_SUPPLY);
  await balances('750', '210', '30', '990');
  const report = {
    cluster: 'localnet', mint: mint.address, decimals, academy: academy.address, student: student.address,
    store: store.address, atas, snapshots: { wallet: walletSnapshot, mint: mintSnapshot, program: programSnapshot },
    finalBalances: { treasury: '750', student: '210', store: '30', supply: '990' }, journal,
  };
  await mkdir('reports', { recursive: true });
  await writeFile('reports/latest.json', serialize(report) + '\n');
  console.log('✓ Escenario completo aprobado. Tesorería=750, estudiante=210, tienda=30, supply=990.');
  console.log('Evidencia local guardada en reports/latest.json. Resumila en reflection.evidence.');
}

try { await main(); }
catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
