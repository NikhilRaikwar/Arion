import { Alchemy, Network } from "alchemy-sdk";

// Multi-chain Alchemy instances for all supported EVM chains
export const alchemyInstances = {
  ethereum: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
  }),
  "ethereum-sepolia": new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
  }),
  polygon: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.MATIC_MAINNET,
  }),
  "polygon-amoy": new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.MATIC_AMOY,
  }),
  arbitrum: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ARB_MAINNET,
  }),
  "arbitrum-sepolia": new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ARB_SEPOLIA,
  }),
  optimism: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.OPT_MAINNET,
  }),
  "optimism-sepolia": new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.OPT_SEPOLIA,
  }),
  base: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.BASE_MAINNET,
  }),
  "base-sepolia": new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.BASE_SEPOLIA,
  }),
  "polygon-zkevm": new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.POLYGONZKEVM_MAINNET,
  }),
  blast: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.BLAST_MAINNET,
  }),
  frax: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.FRAX_MAINNET,
  }),
  zksync: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ZKSYNC_MAINNET,
  }),
};

export type SupportedChain = keyof typeof alchemyInstances;

// Network enum mapping for Portfolio API
export const networkEnumMap: Record<SupportedChain, string> = {
  ethereum: "eth-mainnet",
  "ethereum-sepolia": "eth-sepolia",
  polygon: "polygon-mainnet",
  "polygon-amoy": "polygon-amoy",
  arbitrum: "arb-mainnet",
  "arbitrum-sepolia": "arb-sepolia",
  optimism: "opt-mainnet",
  "optimism-sepolia": "opt-sepolia",
  base: "base-mainnet",
  "base-sepolia": "base-sepolia",
  "polygon-zkevm": "polygonzkevm-mainnet",
  blast: "blast-mainnet",
  frax: "frax-mainnet",
  zksync: "zksync-mainnet",
};

export const chainNames: Record<SupportedChain, string> = {
  ethereum: "Ethereum Mainnet",
  "ethereum-sepolia": "Ethereum Sepolia",
  polygon: "Polygon",
  "polygon-amoy": "Polygon Amoy",
  arbitrum: "Arbitrum",
  "arbitrum-sepolia": "Arbitrum Sepolia",
  optimism: "Optimism",
  "optimism-sepolia": "Optimism Sepolia",
  base: "Base",
  "base-sepolia": "Base Sepolia",
  "polygon-zkevm": "Polygon zkEVM",
  blast: "Blast",
  frax: "Frax",
  zksync: "zkSync",
};

export function getAlchemy(chain: SupportedChain) {
  return alchemyInstances[chain];
}

// Helper function to convert hex to decimal
function hexToDecimal(hex: string): string {
  if (!hex || hex === "0x" || hex === "0x0") return "0";
  try {
    return BigInt(hex).toString();
  } catch {
    return "0";
  }
}

// Helper function to format balance with decimals
function formatBalance(rawBalance: string, decimals: number): string {
  try {
    const balance = BigInt(rawBalance);
    const divisor = BigInt(10 ** decimals);
    const wholePart = balance / divisor;
    const fractionalPart = balance % divisor;

    if (fractionalPart === 0n) {
      return wholePart.toString();
    }

    const fractionalStr = fractionalPart.toString().padStart(decimals, "0");
    const trimmedFractional = fractionalStr.replace(/0+$/, "");

    if (trimmedFractional === "") {
      return wholePart.toString();
    }

    return `${wholePart}.${trimmedFractional}`;
  } catch {
    return "0";
  }
}

// Portfolio API - Token Balances with Prices
export async function getTokenBalancesWithPrices(
  address: string,
  chains: SupportedChain[] = ["ethereum"]
) {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("ALCHEMY_API_KEY not configured");

  const url = `https://api.g.alchemy.com/data/v1/${apiKey}/assets/tokens/by-address`;

  const networks = chains.map((chain) => networkEnumMap[chain]);

  const body = {
    addresses: [{ address, networks }],
    withMetadata: true,
    withPrices: true,
    includeNativeTokens: true,
    includeErc20Tokens: true,
  };

  let allTokens: any[] = [];
  let pageKey: string | undefined = undefined;

  do {
    const requestBody = pageKey ? { ...body, pageKey } : body;

    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(requestBody),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Portfolio API error: ${response.status}`);
    }

    const data = await response.json();
    const tokens = data?.data?.tokens ?? [];
    allTokens.push(...tokens);
    pageKey = data?.data?.pageKey;
  } while (pageKey);

  // Process tokens with proper formatting
  const processedTokens = allTokens
    .map((token) => {
      const metadata = token.tokenMetadata ?? {};
      const decimals =
        typeof metadata.decimals === "number"
          ? metadata.decimals
          : 18;

      const rawBalance = token.tokenBalance ?? "0";
      const balanceStr = formatBalance(rawBalance, decimals);
      const balanceNum = parseFloat(balanceStr);

      // Get USD price
      const priceUsd =
        token.tokenPrices?.find((p: any) => p.currency?.toLowerCase() === "usd")?.value ?? null;
      const priceNum = priceUsd ? parseFloat(priceUsd) : null;
      const valueUsd = priceNum && balanceNum ? balanceNum * priceNum : null;

      return {
        network: token.network,
        contractAddress: token.tokenAddress ?? null,
        symbol: metadata.symbol ?? (token.tokenAddress ? "TOKEN" : "Native"),
        name: metadata.name ?? null,
        logo: metadata.logo ?? null,
        decimals,
        balance: balanceStr,
        priceUsd: priceNum,
        valueUsd,
      };
    })
    .filter((t) => parseFloat(t.balance) > 0)
    .sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0));

  const totalValue = processedTokens.reduce((sum, t) => sum + (t.valueUsd ?? 0), 0);

  return {
    address,
    chains,
    tokens: processedTokens,
    totalValue,
  };
}

// Portfolio API - NFTs
export async function getNFTsForWallet(
  address: string,
  chains: SupportedChain[] = ["ethereum"]
) {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("ALCHEMY_API_KEY not configured");

  const url = `https://api.g.alchemy.com/data/v1/${apiKey}/assets/nfts/by-address`;

  const networks = chains.map((chain) => networkEnumMap[chain]);

  const body = {
    addresses: [{ address, networks }],
    withMetadata: true,
    pageSize: 100,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`NFT API error: ${response.status}`);
  }

  const data = await response.json();
  return data?.data?.ownedNfts ?? [];
}

// Token Prices API
export async function getTokenPrices(addresses: { network: string; address: string }[]) {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("ALCHEMY_API_KEY not configured");

  const url = `https://api.g.alchemy.com/prices/v1/${apiKey}/tokens/by-address`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ addresses }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Prices API error: ${response.status}`);
  }

  const data = await response.json();
  return data?.data ?? [];
}

// RPC Methods via JSON-RPC
export async function rpcCall(method: string, params: any[], chain: SupportedChain) {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("ALCHEMY_API_KEY not configured");

  const networkEnum = networkEnumMap[chain];
  const baseUrl = networkEnum.replace("-mainnet", "").replace("-sepolia", "");
  const url = `https://${networkEnum}.g.alchemy.com/v2/${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method,
      params,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`RPC error: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "RPC error");
  }

  return data.result;
}

// Get token balances (alchemy_getTokenBalances)
export async function getTokenBalances(address: string, chain: SupportedChain) {
  const result = await rpcCall("alchemy_getTokenBalances", [address, "erc20"], chain);
  
  // Get metadata for each token
  const tokensWithMetadata = await Promise.all(
    result.tokenBalances
      .filter((t: any) => t.tokenBalance !== "0x0" && t.tokenBalance !== "0x")
      .map(async (token: any) => {
        try {
          const metadata = await rpcCall(
            "alchemy_getTokenMetadata",
            [token.contractAddress],
            chain
          );
          
          const decimals = metadata.decimals ?? 18;
          const balance = hexToDecimal(token.tokenBalance);
          const formattedBalance = formatBalance(balance, decimals);

          return {
            contractAddress: token.contractAddress,
            balance: formattedBalance,
            rawBalance: balance,
            symbol: metadata.symbol,
            name: metadata.name,
            decimals,
            logo: metadata.logo,
          };
        } catch {
          return null;
        }
      })
  );

  return tokensWithMetadata.filter((t) => t !== null);
}

// Extract chain from explorer URL
export function detectChainFromURL(url: string): SupportedChain {
  if (url.includes("etherscan.io")) return "ethereum";
  if (url.includes("sepolia.etherscan.io")) return "ethereum-sepolia";
  if (url.includes("polygonscan.com")) return "polygon";
  if (url.includes("arbiscan.io")) return "arbitrum";
  if (url.includes("optimistic.etherscan.io")) return "optimism";
  if (url.includes("basescan.org")) return "base";
  if (url.includes("zkevm.polygonscan.com")) return "polygon-zkevm";
  if (url.includes("blastscan.io")) return "blast";
  if (url.includes("fraxscan.com")) return "frax";
  if (url.includes("explorer.zksync.io")) return "zksync";
  return "ethereum"; // default
}

// Parse transaction hash from URL or text
export function extractTransactionHash(input: string): string | null {
  const txHashPattern = /0x[a-fA-F0-9]{64}/;
  const match = input.match(txHashPattern);
  return match ? match[0] : null;
}

// Parse address from URL or text
export function extractAddress(input: string): string | null {
  const addressPattern = /0x[a-fA-F0-9]{40}(?![a-fA-F0-9])/;
  const match = input.match(addressPattern);
  return match ? match[0] : null;
}

// Parse block number from URL or text
export function extractBlockNumber(input: string): number | null {
  const blockUrlPattern = /block\/(\d+)/;
  const match = input.match(blockUrlPattern);
  if (match) return parseInt(match[1]);
  
  const blockPattern = /block\s*#?(\d+)/i;
  const blockMatch = input.match(blockPattern);
  return blockMatch ? parseInt(blockMatch[1]) : null;
}

// Get transaction details
export async function getTransaction(txHash: string, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  const tx = await alchemy.core.getTransaction(txHash);
  const receipt = await alchemy.core.getTransactionReceipt(txHash);
  return { transaction: tx, receipt, chain };
}

// Get block details
export async function getBlock(blockNumber: number, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  const block = await alchemy.core.getBlock(blockNumber);
  return { block, chain };
}

// Get address information (balance, type, token holdings)
export async function getAddressInfo(address: string, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  const balance = await alchemy.core.getBalance(address);
  const code = await alchemy.core.getCode(address);
  const isContract = code !== "0x";
  
  const tokens = await getTokenBalances(address, chain);
  
  return {
    address,
    chain,
    nativeBalance: balance.toString(),
    isContract,
    tokenCount: tokens.length,
    tokens,
  };
}

// Get contract metadata and info
export async function getContractInfo(address: string, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  const code = await alchemy.core.getCode(address);
  const isContract = code !== "0x";
  
  if (!isContract) {
    return { isContract: false, message: "Not a contract address" };
  }

  const metadata = await alchemy.core.getTokenMetadata(address).catch(() => null);
  const transfers = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    toAddress: address,
    category: ["external"],
    maxCount: 1,
  });

  return {
    address,
    chain,
    isContract: true,
    metadata,
    bytecodeLength: (code.length - 2) / 2,
    creator: transfers.transfers[0]?.from || null,
    creationTx: transfers.transfers[0]?.hash || null,
  };
}

// Wallet portfolio analytics
export async function getWalletPortfolio(address: string, chain: SupportedChain) {
  return getTokenBalancesWithPrices(address, [chain]);
}

// Get multi-chain portfolio
export async function getMultiChainPortfolio(address: string) {
  const chains: SupportedChain[] = ["ethereum", "polygon", "arbitrum", "optimism", "base"];
  return getTokenBalancesWithPrices(address, chains);
}

// Smart contract validation
export async function validateContract(address: string, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  const code = await alchemy.core.getCode(address);
  const isContract = code !== "0x";

  if (!isContract) {
    return { valid: false, message: "Address is not a smart contract" };
  }

  const metadata = await alchemy.core.getTokenMetadata(address).catch(() => null);
  const assetTransfers = await alchemy.core.getAssetTransfers({
    fromBlock: "0x0",
    toAddress: address,
    category: ["external"],
    maxCount: 1,
  });

  return {
    valid: true,
    isContract: true,
    metadata,
    code,
    creator: assetTransfers.transfers[0]?.from || null,
    creationTx: assetTransfers.transfers[0]?.hash || null,
  };
}

// Get NFTs for an address
export async function getNFTs(address: string, chain: SupportedChain) {
  const nfts = await getNFTsForWallet(address, [chain]);
  return nfts;
}

// Get transaction history
export async function getTransactionHistory(address: string, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  const transfers = await alchemy.core.getAssetTransfers({
    fromAddress: address,
    category: ["external", "erc20", "erc721", "erc1155"],
    maxCount: 50,
    order: "desc",
  });
  return transfers.transfers;
}

// Get gas prices
export async function getGasPrice(chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  const gasPrice = await alchemy.core.getGasPrice();
  return { chain, gasPrice: gasPrice.toString() };
}

// Get token metadata
export async function getTokenMetadata(contractAddress: string, chain: SupportedChain) {
  const result = await rpcCall("alchemy_getTokenMetadata", [contractAddress], chain);
  return { chain, ...result };
}