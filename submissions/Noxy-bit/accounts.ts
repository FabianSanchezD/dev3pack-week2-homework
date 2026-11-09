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
  // Pedimos al RPC el saldo de la cuenta en lamports y devolvemos su valor.
  const { value } = await rpc.getBalance(address).send();
  return value;
}

export async function getAccountSummary(rpc: Rpc<SolanaRpcApi>, address: Address): Promise<AccountSummary> {
  // Consultamos la información de la cuenta codificada en base64.
  const { value } = await rpc.getAccountInfo(address, { encoding: 'base64' }).send();

  // Si value es null, la cuenta aún no existe en la red.
  if (!value) {
    return {
      exists: false,
      owner: null,
      lamports: 0n,
      executable: false,
      dataLength: 0,
    };
  }

  // Extraemos el contenido en base64 y calculamos su longitud en bytes.
  const [base64Data] = value.data;
  return {
    exists: true,
    owner: value.owner,
    lamports: value.lamports,
    executable: value.executable,
    dataLength: Buffer.from(base64Data, 'base64').length,
  };
}
