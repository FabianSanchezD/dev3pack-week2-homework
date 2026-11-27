import type { Address, Rpc, SolanaRpcApi } from '@solana/kit';

export type AccountSummary = {
  exists: boolean;
  owner: Address | null;
  lamports: bigint;
  executable: boolean;
  dataLength: number;
};

export async function getBalance(rpc: Rpc<SolanaRpcApi>, address: Address): Promise<bigint> {
  // Consulta el saldo de la cuenta en lamports desde el RPC.
  const { value } = await rpc.getBalance(address).send();
  return value;
}

export async function getAccountSummary(rpc: Rpc<SolanaRpcApi>, address: Address): Promise<AccountSummary> {
  // Obtiene la información de la cuenta codificada en base64.
  const { value } = await rpc.getAccountInfo(address, { encoding: 'base64' }).send();

  if (!value) {
    return {
      exists: false,
      owner: null,
      lamports: 0n,
      executable: false,
      dataLength: 0,
    };
  }

  // Calcula la longitud en bytes a partir del payload en base64.
  const dataLength = Buffer.from(value.data[0], 'base64').length;

  return {
    exists: true,
    owner: value.owner,
    lamports: value.lamports,
    executable: value.executable,
    dataLength,
  };
}
