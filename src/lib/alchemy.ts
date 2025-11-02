import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from "alchemy-sdk";

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

    if (fractionalPart === BigInt(0)) {
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

// Portfolio API - Token Balances with Prices (using direct fetch API)
export async function getTokenBalancesWithPrices(
  address: string,
  chains: SupportedChain[] = ["ethereum"]
) {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("ALCHEMY_API_KEY not configured");

  const allTokens: any[] = [];

  // Fetch token balances from each chain
  for (const chain of chains) {
    try {
      const network = networkEnumMap[chain];
      const rpcUrl = `https://${network}.g.alchemy.com/v2/${apiKey}`;
      
      // Get native balance (ETH, MATIC, etc.)
      const nativeBalanceResp = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBalance',
          params: [address, 'latest']
        }),
        cache: 'no-store'
      });
      
      const nativeBalanceData = await nativeBalanceResp.json();
      
      if (nativeBalanceData.result) {
        const nativeBalance = hexToDecimal(nativeBalanceData.result);
        const nativeBalanceStr = formatBalance(nativeBalance, 18);
        
        if (parseFloat(nativeBalanceStr) > 0) {
          // Determine native token symbol
          let nativeSymbol = 'ETH';
          let nativeName = 'Ethereum';
          if (chain.includes('polygon')) {
            nativeSymbol = 'MATIC';
            nativeName = 'Polygon';
          } else if (chain.includes('arbitrum')) {
            nativeSymbol = 'ETH';
            nativeName = 'Arbitrum ETH';
          } else if (chain.includes('optimism')) {
            nativeSymbol = 'ETH';
            nativeName = 'Optimism ETH';
          } else if (chain.includes('base')) {
            nativeSymbol = 'ETH';
            nativeName = 'Base ETH';
          }
          
          allTokens.push({
            network: chain,
            contractAddress: null,
            symbol: nativeSymbol,
            name: nativeName,
            logo: null,
            decimals: 18,
            balance: nativeBalanceStr,
            priceUsd: null,
            valueUsd: null,
          });
        }
      }

      // Get ERC20 token balances
      const tokenBalancesResp = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'alchemy_getTokenBalances',
          params: [address, 'erc20']
        }),
        cache: 'no-store'
      });
      
      const tokenBalancesData = await tokenBalancesResp.json();
      const tokenBalances = tokenBalancesData.result?.tokenBalances || [];
      
      for (const token of tokenBalances) {
        if (token.tokenBalance && token.tokenBalance !== '0x0' && token.tokenBalance !== '0x') {
          try {
            // Get token metadata
            const metadataResp = await fetch(rpcUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 3,
                method: 'alchemy_getTokenMetadata',
                params: [token.contractAddress]
              }),
              cache: 'no-store'
            });
            
            const metadataData = await metadataResp.json();
            const metadata = metadataData.result || {};
            
            const decimals = metadata.decimals ?? 18;
            const balance = hexToDecimal(token.tokenBalance);
            const balanceStr = formatBalance(balance, decimals);
            
            if (parseFloat(balanceStr) > 0) {
              allTokens.push({
                network: chain,
                contractAddress: token.contractAddress,
                symbol: metadata.symbol ?? 'UNKNOWN',
                name: metadata.name ?? null,
                logo: metadata.logo ?? null,
                decimals,
                balance: balanceStr,
                priceUsd: null,
                valueUsd: null,
              });
            }
          } catch (error) {
            console.error(`Error fetching token metadata for ${token.contractAddress}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching balances for ${chain}:`, error);
    }
  }

  // Sort by balance (tokens with values first, then by balance)
  const processedTokens = allTokens.sort((a, b) => {
    const aValue = a.valueUsd ?? 0;
    const bValue = b.valueUsd ?? 0;
    if (aValue !== bValue) return bValue - aValue;
    return parseFloat(b.balance) - parseFloat(a.balance);
  });

  const totalValue = processedTokens.reduce((sum, t) => sum + (t.valueUsd ?? 0), 0);

  return {
    address,
    chains,
    tokens: processedTokens,
    totalValue,
  };
}

// Portfolio API - NFTs (using network-specific NFT API endpoint)
export async function getNFTsForWallet(
  address: string,
  chains: SupportedChain[] = ["ethereum"]
) {
  const apiKey = process.env.ALCHEMY_API_KEY;
  if (!apiKey) throw new Error("ALCHEMY_API_KEY not configured");

  // Fetch NFTs from each chain using the NFT API endpoint
  const allNfts: any[] = [];

  for (const chain of chains) {
    try {
      const network = networkEnumMap[chain];
      const url = `https://${network}.g.alchemy.com/nft/v2/${apiKey}/getNFTs`;
      
      const queryParams = new URLSearchParams({
        owner: address,
        withMetadata: 'true',
        pageSize: '100'
      });

      const response = await fetch(`${url}?${queryParams.toString()}`, {
        method: "GET",
        headers: { "accept": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        console.error(`NFT API error for ${chain}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const nfts = data?.ownedNfts ?? [];
      
      // Add network info to each NFT
      const nftsWithNetwork = nfts.map((nft: any) => ({
        ...nft,
        network: chain
      }));
      
      allNfts.push(...nftsWithNetwork);
    } catch (error) {
      console.error(`Error fetching NFTs for ${chain}:`, error);
      // Continue to next chain
    }
  }

  return allNfts;
}

// Token Prices API (Note: Prices API requires special access, returning empty for now)
export async function getTokenPrices(addresses: { network: string; address: string }[]) {
  // Note: The Prices API at api.g.alchemy.com may require special access
  // For production, consider integrating with CoinGecko, CoinMarketCap, or similar
  console.warn('Token prices API not available - consider integrating a price feed service');
  return [];
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
    category: [AssetTransfersCategory.EXTERNAL],
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
export async function validateContractLegacy(address: string, chain: SupportedChain) {
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
    category: [AssetTransfersCategory.EXTERNAL],
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
    category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
    maxCount: 50,
    order: SortingOrder.DESCENDING,
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

// Validate if an address is a smart contract
export async function validateContract(address: string, chain: SupportedChain) {
  try {
    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) throw new Error("ALCHEMY_API_KEY not configured");

    const network = networkEnumMap[chain];
    const rpcUrl = `https://${network}.g.alchemy.com/v2/${apiKey}`;

    // Check if it's a contract using eth_getCode
    const codeResponse = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getCode",
        params: [address, "latest"],
      }),
    });

    const codeData = await codeResponse.json();
    const code = codeData.result || "0x";
    const isContract = code !== "0x" && code.length > 2;

    if (!isContract) {
      return {
        success: true,
        valid: false,
        isContract: false,
        message: "Address is not a smart contract"
      };
    }

    // Get token metadata (if it's a token contract)
    let metadata = null;
    try {
      const metadataResponse = await fetch(rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "alchemy_getTokenMetadata",
          params: [address],
        }),
      });
      const metadataData = await metadataResponse.json();
      metadata = metadataData.result || null;
    } catch {
      // Not a token contract, that's okay
    }

    return {
      success: true,
      valid: true,
      isContract: true,
      address,
      chain,
      network,
      metadata,
      bytecodeLength: (code.length - 2) / 2,
    };
  } catch (error: any) {
    console.error("Contract validation error:", error);
    return {
      success: false,
      error: error.message || "Contract validation failed"
    };
  }
}

// Get NFT transactions (transfers) by address using alchemy_getAssetTransfers
export async function getNFTTransactionsByAddress(
  address: string,
  chain: SupportedChain,
  direction: 'from' | 'to' | 'both' = 'both',
  fromBlock: string = '0x0',
  toBlock: string = 'latest'
) {
  try {
    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) throw new Error("ALCHEMY_API_KEY not configured");

    const network = networkEnumMap[chain];
    const rpcUrl = `https://${network}.g.alchemy.com/v2/${apiKey}`;

    const transfers: any[] = [];

    // Fetch transfers FROM the address (NFTs sent)
    if (direction === 'from' || direction === 'both') {
      const fromResponse = await fetch(rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "alchemy_getAssetTransfers",
          params: [{
            fromBlock,
            toBlock,
            fromAddress: address,
            excludeZeroValue: true,
            category: ["erc721", "erc1155"]
          }]
        }),
      });

      const fromData = await fromResponse.json();
      if (fromData.result?.transfers) {
        transfers.push(...fromData.result.transfers.map((t: any) => ({ ...t, direction: 'sent' })));
      }
    }

    // Fetch transfers TO the address (NFTs received)
    if (direction === 'to' || direction === 'both') {
      const toResponse = await fetch(rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "alchemy_getAssetTransfers",
          params: [{
            fromBlock,
            toBlock,
            toAddress: address,
            excludeZeroValue: true,
            category: ["erc721", "erc1155"]
          }]
        }),
      });

      const toData = await toResponse.json();
      if (toData.result?.transfers) {
        transfers.push(...toData.result.transfers.map((t: any) => ({ ...t, direction: 'received' })));
      }
    }

    // Sort by block number (most recent first)
    transfers.sort((a, b) => {
      const blockA = parseInt(a.blockNum, 16);
      const blockB = parseInt(b.blockNum, 16);
      return blockB - blockA;
    });

    return {
      success: true,
      address,
      chain,
      transfers,
      totalCount: transfers.length
    };
  } catch (error: any) {
    console.error("NFT transactions fetch error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch NFT transactions"
    };
  }
}

// Get all asset transfers (including NFTs, ERC20, and native tokens)
export async function getAssetTransfers(
  params: {
    fromBlock?: string;
    toBlock?: string;
    fromAddress?: string;
    toAddress?: string;
    contractAddresses?: string[];
    excludeZeroValue?: boolean;
    category?: Array<'external' | 'internal' | 'erc20' | 'erc721' | 'erc1155'>;
    maxCount?: number;
    pageKey?: string;
  },
  chain: SupportedChain
) {
  try {
    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) throw new Error("ALCHEMY_API_KEY not configured");

    const network = networkEnumMap[chain];
    const rpcUrl = `https://${network}.g.alchemy.com/v2/${apiKey}`;

    const requestParams: any = {
      fromBlock: params.fromBlock || '0x0',
      toBlock: params.toBlock || 'latest',
      excludeZeroValue: params.excludeZeroValue !== false,
      category: params.category || ['external', 'erc20', 'erc721', 'erc1155'],
    };

    if (params.fromAddress) requestParams.fromAddress = params.fromAddress;
    if (params.toAddress) requestParams.toAddress = params.toAddress;
    if (params.contractAddresses) requestParams.contractAddresses = params.contractAddresses;
    if (params.maxCount) requestParams.maxCount = `0x${params.maxCount.toString(16)}`;
    if (params.pageKey) requestParams.pageKey = params.pageKey;

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getAssetTransfers",
        params: [requestParams]
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'API Error');
    }

    return {
      success: true,
      transfers: data.result?.transfers || [],
      pageKey: data.result?.pageKey,
      totalCount: data.result?.transfers?.length || 0
    };
  } catch (error: any) {
    console.error("Asset transfers fetch error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch asset transfers"
    };
  }
}