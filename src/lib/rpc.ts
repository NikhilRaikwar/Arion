type JsonRpcError = { code: number; message: string; data?: unknown };
type JsonRpcResponse<T = unknown> = { jsonrpc: "2.0"; id: number | string; result?: T; error?: JsonRpcError };

export async function rpc<T = unknown>(
  method: string,
  params: unknown[] = [],
  chain: "eth-mainnet" | "base-mainnet" | "optimism-mainnet" | "arbitrum-mainnet" | "polygon-mainnet" = "eth-mainnet"
): Promise<T> {
  const res = await fetch("/api/rpc", {
    method: "POST",
    headers: { "content-type": "application/json", "x-chain": chain },
    body: JSON.stringify({ jsonrpc: "2.0", id: Date.now(), method, params }),
    cache: "no-store",
  });
  
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RPC HTTP ${res.status}${text ? `: ${text}` : ""}`);
  }
  
  const data = (await res.json()) as JsonRpcResponse<T>;
  if (data.error) throw new Error(data.error.message || "RPC error");
  return data.result as T;
}

// Helper function to get balance
export async function getBalance(address: string, chain?: "eth-mainnet" | "base-mainnet" | "optimism-mainnet" | "arbitrum-mainnet" | "polygon-mainnet"): Promise<string> {
  return await rpc<string>("eth_getBalance", [address, "latest"], chain);
}

// Helper function to get block number
export async function getBlockNumber(chain?: "eth-mainnet" | "base-mainnet" | "optimism-mainnet" | "arbitrum-mainnet" | "polygon-mainnet"): Promise<string> {
  return await rpc<string>("eth_blockNumber", [], chain);
}

// Helper function to get gas price
export async function getGasPrice(chain?: "eth-mainnet" | "base-mainnet" | "optimism-mainnet" | "arbitrum-mainnet" | "polygon-mainnet"): Promise<string> {
  return await rpc<string>("eth_gasPrice", [], chain);
}

// Helper to convert hex to decimal
export function hexToDecimal(hex: string): number {
  return parseInt(hex, 16);
}

// Helper to convert Wei to Ether
export function weiToEther(wei: string): string {
  const weiNum = BigInt(wei);
  const etherNum = Number(weiNum) / 1e18;
  return etherNum.toFixed(6);
}
