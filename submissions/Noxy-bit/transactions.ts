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
  // Convertimos la cantidad de SOL a lamports como bigint.
  return BigInt(Math.round(sol * Number(LAMPORTS_PER_SOL)));
}

export function createTransferInstruction(from: TransactionSigner, to: Address, amount: bigint): Instruction {
  // Creamos la instrucción del System Program para transferir lamports.
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
  // Armamos el mensaje de transacción paso a paso con pipe() y lo firmamos.
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(lifetime, tx),
    (tx) => appendTransactionMessageInstructions(instructions, tx),
  );

  return await signTransactionMessageWithSigners(message);
}
