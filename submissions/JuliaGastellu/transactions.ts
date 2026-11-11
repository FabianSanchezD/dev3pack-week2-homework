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

// Uso mil millones de lamports por cada SOL.
export const LAMPORTS_PER_SOL = 1_000_000_000n;

export type BlockhashLifetime = {
  blockhash: Blockhash;
  lastValidBlockHeight: bigint;
};

export function solToLamports(sol: number): bigint {
  if (!Number.isFinite(sol) || sol < 0) {
    throw new RangeError('Necesito un monto finito y no negativo.');
  }

  // Redondeo al lamport más cercano antes de convertir el monto a bigint.
  const amount = Math.round(sol * Number(LAMPORTS_PER_SOL));
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError('El monto supera el rango seguro de conversión.');
  }
  return BigInt(amount);
}

export function createTransferInstruction(from: TransactionSigner, to: Address, amount: bigint): Instruction {
  return getTransferSolInstruction({ source: from, destination: to, amount });
}

export async function buildTransaction(
  feePayer: TransactionSigner,
  instructions: Instruction[],
  lifetime: BlockhashLifetime,
): Promise<Transaction> {
  // Agrego quién paga, la vigencia y las instrucciones antes de firmar el mensaje.
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (message) => setTransactionMessageFeePayerSigner(feePayer, message),
    (message) => setTransactionMessageLifetimeUsingBlockhash(lifetime, message),
    (message) => appendTransactionMessageInstructions(instructions, message),
  );

  return signTransactionMessageWithSigners(message);
}
