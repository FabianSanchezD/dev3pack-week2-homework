import type { Address, Rpc, SolanaRpcApi } from '@solana/kit';

// Resumo los datos que me interesan de una cuenta de Solana.
export type AccountSummary = {
  exists: boolean;
  owner: Address | null;
  lamports: bigint;
  executable: boolean;
  dataLength: number;
};

export async function getBalance(rpc: Rpc<SolanaRpcApi>, address: Address): Promise<bigint> {
  // Consulto el saldo en lamports y conservo el entero bigint que devuelve el RPC.
  const { value } = await rpc.getBalance(address).send();
  return value;
}

export async function getAccountSummary(rpc: Rpc<SolanaRpcApi>, address: Address): Promise<AccountSummary> {
  const { value } = await rpc.getAccountInfo(address, { encoding: 'base64' }).send();

  if (value === null) {
    return { exists: false, owner: null, lamports: 0n, executable: false, dataLength: 0 };
  }

  // Decodifico base64 para contar los bytes de datos, no los caracteres del texto.
  return {
    exists: true,
    owner: value.owner,
    lamports: value.lamports,
    executable: value.executable,
    dataLength: Buffer.from(value.data[0], 'base64').length,
  };
}
