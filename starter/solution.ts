import type {
  Address, Blockhash, Instruction, Lamports, TransactionSigner, signTransactionMessageWithSigners,
} from '@solana/kit';

// Este archivo es la única pieza que tenés que entregar. Agregá los imports necesarios.
// Los tipos viven acá para poder copiarlo a submissions sin corregir rutas relativas.
export type AccountSnapshot = Readonly<{
  exists: boolean;
  programOwner: Address | null;
  lamports: bigint;
  dataLength: number;
  executable: boolean;
}>;

export type AccountReader = {
  getAccountInfo: (account: Address, config: { encoding: 'base64'; commitment: 'confirmed' }) => {
    send(): Promise<{ value: null | {
      owner: Address; lamports: bigint; executable: boolean; data: readonly [string, string];
    } }>;
  };
};

export type Lifetime = Readonly<{ blockhash: Blockhash; lastValidBlockHeight: bigint }>;
export type MintInput = Readonly<{
  payer: TransactionSigner; mint: TransactionSigner; rent: Lamports; decimals: number;
}>;
export type AtaInput = Readonly<{
  payer: TransactionSigner; mint: Address; owners: readonly Address[];
}>;
export type TransferInput = Readonly<{
  source: Address; destination: Address; mint: Address;
  authority: TransactionSigner; amount: bigint; decimals: number;
}>;
export type BurnInput = Readonly<{
  account: Address; mint: Address; authority: TransactionSigner; amount: bigint; decimals: number;
}>;
export type FreezeInput = Readonly<{
  account: Address; mint: Address; authority: TransactionSigner; frozen: boolean;
}>;
export type BuildInput = Readonly<{
  payer: TransactionSigner; lifetime: Lifetime; instructions: readonly Instruction[];
}>;

export function toRawAmount(_value: string, _decimals: number): bigint {
  // TODO 1: convertí texto decimal a unidades enteras sin usar Number ni parseFloat.
  // Rechazá negativos, notación científica, espacios, exceso de decimales y overflow de u64.
  throw new Error('TODO 1: implementar toRawAmount');
}

export async function inspectAccount(_rpc: AccountReader, _account: Address): Promise<AccountSnapshot> {
  // TODO 2: leé owner, lamports, executable y longitud de los bytes base64.
  // Si la cuenta no existe: exists=false, programOwner=null y los otros campos en cero/false.
  throw new Error('TODO 2: implementar inspectAccount');
}

export function createMintInstructions(_input: MintInput): readonly Instruction[] {
  // TODO 3: creá la cuenta con rent y tamaño del mint; inicializala con ambas autoridades = payer.
  // Devolvé CreateAccount + InitializeMint en ese orden, para una única transacción atómica.
  throw new Error('TODO 3: implementar createMintInstructions');
}

export async function createAtaInstructions(_input: AtaInput): Promise<readonly Instruction[]> {
  // TODO 4: una ATA idempotente para cada owner; usá el Token Program clásico explícitamente.
  throw new Error('TODO 4: implementar createAtaInstructions');
}

export function mintTokensInstruction(_input: {
  mint: Address; token: Address; authority: TransactionSigner; amount: bigint;
}): Instruction {
  // TODO 5: emití tokens al token account, con la firma de la mint authority.
  throw new Error('TODO 5: implementar mintTokensInstruction');
}

export function transferTokensInstruction(_input: TransferInput): Instruction {
  // TODO 6: usá TransferChecked; source y destination son token accounts, no wallets.
  throw new Error('TODO 6: implementar transferTokensInstruction');
}

export function burnTokensInstruction(_input: BurnInput): Instruction {
  // TODO 7: quemá unidades con BurnChecked y la autoridad correcta.
  throw new Error('TODO 7: implementar burnTokensInstruction');
}

export function setFrozenInstruction(_input: FreezeInput): Instruction {
  // TODO 8: elegí FreezeAccount o ThawAccount según frozen.
  throw new Error('TODO 8: implementar setFrozenInstruction');
}

export function revokeMintAuthorityInstruction(_input: {
  mint: Address; authority: TransactionSigner;
}): Instruction {
  // TODO 9: SetAuthority, tipo MintTokens, newAuthority=null.
  throw new Error('TODO 9: implementar revokeMintAuthorityInstruction');
}

export async function buildSignedTransaction(_input: BuildInput): ReturnType<typeof signTransactionMessageWithSigners> {
  // TODO 10: pipe → mensaje v0 → fee payer → lifetime → instrucciones → firmas.
  // Usá los signers adjuntos a las instrucciones. No envíes ni simules desde esta función.
  throw new Error('TODO 10: implementar buildSignedTransaction');
}

// Respondé en español dentro del mismo archivo. El evaluador revisa estas respuestas manualmente.
export const reflection = {
  githubUsername: 'TODO',
  accountOwnership: 'TODO: diferencia entre el owner del account y el owner en los datos del token account.',
  ataAndPda: 'TODO: semillas de una ATA, programa que la deriva y por qué no tiene clave privada.',
  atomicity: 'TODO: qué pasa con ambas transferencias del caso fallido y cuándo se cobran fees.',
  transactionLifecycle: 'TODO: fee payer, signers, blockhash, simulación, confirmed y expiración.',
  tokenSupply: 'TODO: por qué transferir no cambia supply y quemar sí; efecto de revocar mint authority.',
  tokenProgramChoice: 'TODO: por qué SPL Token clásico alcanza; cuándo elegirías Token-2022.',
  evidence: 'TODO: resumen de tu ejecución local, saldos finales y casos negativos observados.',
};
