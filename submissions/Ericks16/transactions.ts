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
  // Math.round evita errores de punto flotante (p. ej. 0.1 * 1e9 no es exacto).
  return BigInt(Math.round(sol * Number(LAMPORTS_PER_SOL)));
}

export function createTransferInstruction(from: TransactionSigner, to: Address, amount: bigint): Instruction {
  // Instrucción de transferencia del System Program: `from` firma y paga, `to` recibe.
  return getTransferSolInstruction({ source: from, destination: to, amount });
}

export async function buildTransaction(
  feePayer: TransactionSigner,
  instructions: Instruction[],
  lifetime: BlockhashLifetime,
): Promise<Transaction> {
  // Armamos el mensaje paso a paso con pipe(): versión, fee payer, blockhash e instrucciones.
  const message = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayerSigner(feePayer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(lifetime, m),
    (m) => appendTransactionMessageInstructions(instructions, m),
  );

  // Firma con los signers incluidos en el mensaje (fee payer y source).
  return await signTransactionMessageWithSigners(message);
}
