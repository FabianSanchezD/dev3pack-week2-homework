import type { Address, Rpc, SolanaRpcApi } from '@solana/kit';

// Resumen simple de una cuenta de Solana.
export type AccountSummary = {
  exists: boolean;
  owner: Address | null;
  lamports: bigint;
  executable: boolean;
  dataLength: number;
};

export async function getBalance(rpc: Rpc<SolanaRpcApi>, address: Address): Promise<bigint> {
  // Pedimos el saldo al RPC; `value` viene en lamports (bigint).
  const { value } = await rpc.getBalance(address).send();
  return value;
}

export async function getAccountSummary(rpc: Rpc<SolanaRpcApi>, address: Address): Promise<AccountSummary> {
  const { value } = await rpc.getAccountInfo(address, { encoding: 'base64' }).send();

  // Si value es null, la cuenta no existe en la red.
  if (value === null) {
    return { exists: false, owner: null, lamports: 0n, executable: false, dataLength: 0 };
  }

  // data llega como [texto en base64, 'base64']; lo decodificamos para contar los bytes.
  const [encodedData] = value.data;
  return {
    exists: true,
    owner: value.owner,
    lamports: value.lamports,
    executable: value.executable,
    dataLength: Buffer.from(encodedData, 'base64').length,
  };
}
