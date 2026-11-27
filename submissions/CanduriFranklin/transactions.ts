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
  // Convierte SOL a lamports evitando residuos de coma flotante.
  return BigInt(Math.round(sol * Number(LAMPORTS_PER_SOL)));
}

export function createTransferInstruction(from: TransactionSigner, to: Address, amount: bigint): Instruction {
  // Crea la instrucción de transferencia del System Program.
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
  // Construye el mensaje v0 y lo firma con los firmantes requeridos.
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (msg) => setTransactionMessageFeePayerSigner(feePayer, msg),
    (msg) => setTransactionMessageLifetimeUsingBlockhash(lifetime, msg),
    (msg) => appendTransactionMessageInstructions(instructions, msg),
  );

  return await signTransactionMessageWithSigners(message);
}
