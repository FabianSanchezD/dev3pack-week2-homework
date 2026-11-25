import {
  appendTransactionMessageInstructions,
  createTransactionMessage,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type Address,
  type Blockhash,
  type Instruction,
  type Transaction,
  type TransactionSigner,
} from '@solana/kit';
import { getTransferSolInstruction } from '@solana-program/system';

// 1 SOL = 1 000 000 000 lamports.
export const LAMPORTS_PER_SOL = 1_000_000_000n;

export type BlockhashLifetime = {
  blockhash: Blockhash;
  lastValidBlockHeight: bigint;
};

export function solToLamports(sol: number): bigint {
  if (!Number.isFinite(sol) || sol < 0) {
    throw new RangeError('SOL amount must be a non-negative finite number.');
  }

  const lamports = Math.round(sol * Number(LAMPORTS_PER_SOL));
  if (!Number.isSafeInteger(lamports)) {
    throw new RangeError('SOL amount is too large to convert safely.');
  }

  return BigInt(lamports);
}

export function createTransferInstruction(
  from: TransactionSigner,
  to: Address,
  amount: bigint,
): Instruction {
  return getTransferSolInstruction({
    source: from,
    destination: to,
    amount,
  });
}

export async function buildTransaction(
  feePayer: TransactionSigner,
  instructions: Instruction[],
  lifetime: BlockhashLifetime,
): Promise<Transaction> {
  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(lifetime, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx),
  );

  return signTransactionMessageWithSigners(transactionMessage);
}
