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
  // TODO 1: pedile al RPC el saldo de la cuenta (en lamports) y devolvelo.
  // Pista: rpc.getBalance(address).send() devuelve { value }.
  const { value } = await rpc.getBalance(address).send();
  return value;
}

export async function getAccountSummary(rpc: Rpc<SolanaRpcApi>, address: Address): Promise<AccountSummary> {
  // TODO 2: leé la cuenta con rpc.getAccountInfo(address, { encoding: 'base64' }).send().
  // - Si value es null, la cuenta no existe: exists=false, owner=null, lamports=0n, executable=false, dataLength=0.
  // - Si existe, devolvé owner, lamports, executable y el tamaño de data en bytes.
  // Pista: data llega como [texto, 'base64']; Buffer.from(texto, 'base64').length da los bytes.
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
