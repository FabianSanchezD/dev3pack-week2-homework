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
  const { value } = await rpc.getBalance(address).send();
  return value;
}

export async function getAccountSummary(rpc: Rpc<SolanaRpcApi>, address: Address): Promise<AccountSummary> {
  // Solicitamos la información de la cuenta codificada en base64
  const { value } = await rpc.getAccountInfo(address, { encoding: 'base64' }).send();

  // Si value es null, la cuenta no existe en el cluster (saldo 0 y sin datos asignados)
  if (value === null) {
    return {
      exists: false,
      owner: null,
      lamports: 0n,
      executable: false,
      dataLength: 0,
    };
  }

  // value.data llega como una tupla [textoBase64, 'base64']
  const [base64Data] = value.data;
  const dataLength = Buffer.from(base64Data, 'base64').length;

  return {
    exists: true,
    owner: value.owner,
    lamports: value.lamports,
    executable: value.executable,
    dataLength,
  };
}
