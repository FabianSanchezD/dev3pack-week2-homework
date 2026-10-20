import type { Address, Blockhash, Instruction, Transaction, TransactionSigner } from '@solana/kit';

// 1 SOL = 1 000 000 000 lamports.
export const LAMPORTS_PER_SOL = 1_000_000_000n;

export type BlockhashLifetime = {
  blockhash: Blockhash;
  lastValidBlockHeight: bigint;
};

export function solToLamports(sol: number): bigint {
  // TODO 3: convertí SOL a lamports. Ejemplo: 0.5 → 500_000_000n.
  throw new Error('TODO 3: implementar solToLamports');
}

export function createTransferInstruction(from: TransactionSigner, to: Address, amount: bigint): Instruction {
  // TODO 4: creá la instrucción del System Program que transfiere `amount` lamports de `from` a `to`.
  // Pista: getTransferSolInstruction de '@solana-program/system'.
  throw new Error('TODO 4: implementar createTransferInstruction');
}

export async function buildTransaction(
  feePayer: TransactionSigner,
  instructions: Instruction[],
  lifetime: BlockhashLifetime,
): Promise<Transaction> {
  // TODO 5: armá y firmá la transacción con pipe():
  //   1. createTransactionMessage({ version: 0 })
  //   2. setTransactionMessageFeePayerSigner(feePayer, ...)
  //   3. setTransactionMessageLifetimeUsingBlockhash(lifetime, ...)
  //   4. appendTransactionMessageInstructions(instructions, ...)
  // Al final devolvé signTransactionMessageWithSigners(mensaje).
  throw new Error('TODO 5: implementar buildTransaction');
}
