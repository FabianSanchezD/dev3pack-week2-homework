import {
  airdropFactory,
  assertIsSendableTransaction,
  assertIsTransactionWithBlockhashLifetime,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  lamports,
  sendAndConfirmTransactionFactory,
  type Address,
} from '@solana/kit';
import { SYSTEM_PROGRAM_ADDRESS } from '@solana-program/system';
import { getAccountSummary, getBalance } from './accounts.ts';
import { buildTransaction, createTransferInstruction, LAMPORTS_PER_SOL, solToLamports } from './transactions.ts';

// Este archivo ya está completo: usa tus funciones de accounts.ts y transactions.ts.
// Necesita un nodo local corriendo (surfpool start o solana-test-validator).
const rpc = createSolanaRpc('http://127.0.0.1:8899');
const rpcSubscriptions = createSolanaRpcSubscriptions('ws://127.0.0.1:8900');

async function printAccount(name: string, address: Address) {
  console.log(`\n${name}: ${address}`);
  console.table(await getAccountSummary(rpc, address));
}

async function printBalance(name: string, address: Address) {
  const balance = await getBalance(rpc, address);
  console.log(`${name}: ${Number(balance) / Number(LAMPORTS_PER_SOL)} SOL`);
}

// 1. Crear dos wallets nuevas en memoria.
const alice = await generateKeyPairSigner();
const bob = await generateKeyPairSigner();

// 2. Darle 2 SOL de prueba a Alice.
await airdropFactory({ rpc, rpcSubscriptions })({
  recipientAddress: alice.address,
  lamports: lamports(solToLamports(2)),
  commitment: 'confirmed',
});

// 3. Inspeccionar cuentas: una wallet con saldo, una que no existe y un programa.
console.log('=== Paso 1: cuentas ===');
await printAccount('Alice', alice.address);
await printAccount('Bob (todavía no existe)', bob.address);
await printAccount('System Program', SYSTEM_PROGRAM_ADDRESS);

// 4. Transferir 0.5 SOL de Alice a Bob.
console.log('\n=== Paso 2: transacción ===');
const { value: lifetime } = await rpc.getLatestBlockhash().send();
const instruction = createTransferInstruction(alice, bob.address, solToLamports(0.5));
const transaction = await buildTransaction(alice, [instruction], lifetime);
assertIsSendableTransaction(transaction);
assertIsTransactionWithBlockhashLifetime(transaction);

await sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions })(transaction, { commitment: 'confirmed' });
console.log('Firma:', getSignatureFromTransaction(transaction));

// 5. Ver saldos finales.
console.log('\n=== Paso 3: saldos finales ===');
await printBalance('Alice', alice.address);
await printBalance('Bob', bob.address);
await printAccount('Bob (ahora sí existe)', bob.address);
