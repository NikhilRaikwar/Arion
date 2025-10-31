import { Alchemy, Network, AlchemySettings, AssetTransfersCategory, SortingOrder } from "alchemy-sdk";

// Custom fetch configuration for server-side usage
const getAlchemyConfig = (network: Network): AlchemySettings => ({
  apiKey: process.env.ALCHEMY_API_KEY,
  network,
  maxRetries: 3,
});

// Multi-chain Alchemy instances for all supported EVM chains
export const alchemyInstances = {
  ethereum: new Alchemy(getAlchemyConfig(Network.ETH_MAINNET)),
  "ethereum-sepolia": new Alchemy(getAlchemyConfig(Network.ETH_SEPOLIA)),
  polygon: new Alchemy(getAlchemyConfig(Network.MATIC_MAINNET)),
  "polygon-amoy": new Alchemy(getAlchemyConfig(Network.MATIC_AMOY)),
  arbitrum: new Alchemy(getAlchemyConfig(Network.ARB_MAINNET)),
  "arbitrum-sepolia": new Alchemy(getAlchemyConfig(Network.ARB_SEPOLIA)),
  optimism: new Alchemy(getAlchemyConfig(Network.OPT_MAINNET)),
  "optimism-sepolia": new Alchemy(getAlchemyConfig(Network.OPT_SEPOLIA)),
  base: new Alchemy(getAlchemyConfig(Network.BASE_MAINNET)),
  "base-sepolia": new Alchemy(getAlchemyConfig(Network.BASE_SEPOLIA)),
  "polygon-zkevm": new Alchemy(getAlchemyConfig(Network.POLYGONZKEVM_MAINNET)),
  blast: new Alchemy(getAlchemyConfig(Network.BLAST_MAINNET)),
  frax: new Alchemy(getAlchemyConfig(Network.FRAX_MAINNET)),
  zksync: new Alchemy(getAlchemyConfig(Network.ZKSYNC_MAINNET)),
};

export type SupportedChain = keyof typeof alchemyInstances;

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
  
  try {
    const tx = await alchemy.core.getTransaction(txHash);
    const receipt = await alchemy.core.getTransactionReceipt(txHash);
    
    return {
      transaction: tx,
      receipt: receipt,
      chain,
    };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
}

// Get block details
export async function getBlock(blockNumber: number, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  
  try {
    const block = await alchemy.core.getBlock(blockNumber);
    return {
      block,
      chain,
    };
  } catch (error) {
    console.error("Error fetching block:", error);
    throw error;
  }
}

// Get address information (balance, type, token holdings)
export async function getAddressInfo(address: string, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  
  try {
    // Get native balance
    const balance = await alchemy.core.getBalance(address);
    
    // Check if it's a contract
    const code = await alchemy.core.getCode(address);
    const isContract = code !== "0x";
    
    // Get token balances
    const tokenBalances = await alchemy.core.getTokenBalances(address);
    
    // Get token metadata
    const tokensWithMetadata = await Promise.all(
      tokenBalances.tokenBalances
        .filter((token) => token.tokenBalance !== "0")
        .slice(0, 20) // Limit to 20 tokens
        .map(async (token) => {
          try {
            const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
            return {
              contractAddress: token.contractAddress,
              balance: token.tokenBalance,
              name: metadata.name,
              symbol: metadata.symbol,
              decimals: metadata.decimals,
            };
          } catch {
            return null;
          }
        })
    );

    return {
      address,
      chain,
      nativeBalance: balance.toString(),
      isContract,
      tokenCount: tokenBalances.tokenBalances.filter(t => t.tokenBalance !== "0").length,
      tokens: tokensWithMetadata.filter(t => t !== null),
    };
  } catch (error) {
    console.error("Error fetching address info:", error);
    throw error;
  }
}

// Get contract metadata and info
export async function getContractInfo(address: string, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  
  try {
    const code = await alchemy.core.getCode(address);
    const isContract = code !== "0x";
    
    if (!isContract) {
      return { isContract: false, message: "Not a contract address" };
    }

    // Try to get token metadata
    const metadata = await alchemy.core.getTokenMetadata(address).catch(() => null);
    
    // Get contract creation info
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
      bytecodeLength: (code.length - 2) / 2, // Remove 0x and divide by 2
      creator: transfers.transfers[0]?.from || null,
      creationTx: transfers.transfers[0]?.hash || null,
    };
  } catch (error) {
    console.error("Error fetching contract info:", error);
    throw error;
  }
}

// Wallet portfolio analytics
export async function getWalletPortfolio(address: string, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  
  try {
    // Get token balances
    const balances = await alchemy.core.getTokenBalances(address);
    
    // Get token metadata for each token
    const tokensWithMetadata = await Promise.all(
      balances.tokenBalances
        .filter((token) => token.tokenBalance !== "0")
        .map(async (token) => {
          const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
          return {
            contractAddress: token.contractAddress,
            balance: token.tokenBalance,
            name: metadata.name,
            symbol: metadata.symbol,
            decimals: metadata.decimals,
            logo: metadata.logo,
          };
        })
    );

    // Get ETH/native token balance
    const ethBalance = await alchemy.core.getBalance(address);

    return {
      chain,
      address,
      nativeBalance: ethBalance.toString(),
      tokens: tokensWithMetadata,
    };
  } catch (error) {
    console.error(`Error fetching portfolio for ${chain}:`, error);
    throw error;
  }
}

// Get multi-chain portfolio
export async function getMultiChainPortfolio(address: string) {
  const chains: SupportedChain[] = ["ethereum", "polygon", "arbitrum", "optimism", "base"];
  
  const portfolios = await Promise.allSettled(
    chains.map((chain) => getWalletPortfolio(address, chain))
  );

  return portfolios.map((result, index) => ({
    chain: chains[index],
    status: result.status,
    data: result.status === "fulfilled" ? result.value : null,
    error: result.status === "rejected" ? result.reason : null,
  }));
}

// Smart contract validation
export async function validateContract(address: string, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  
  try {
    // Get contract code to verify it's a contract
    const code = await alchemy.core.getCode(address);
    const isContract = code !== "0x";

    if (!isContract) {
      return {
        valid: false,
        message: "Address is not a smart contract",
      };
    }

    // Get contract metadata
    const metadata = await alchemy.core.getTokenMetadata(address).catch(() => null);
    
    // Get contract creator and creation transaction
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
  } catch (error) {
    console.error("Contract validation error:", error);
    throw error;
  }
}

// Get NFTs for an address
export async function getNFTs(address: string, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  
  try {
    const nfts = await alchemy.nft.getNftsForOwner(address);
    return nfts.ownedNfts.map((nft) => ({
      contractAddress: nft.contract.address,
      tokenId: nft.tokenId,
      name: nft.name || nft.contract.name,
      description: nft.description,
      image: nft.image.originalUrl || nft.image.cachedUrl,
      collection: nft.contract.name,
    }));
  } catch (error) {
    console.error(`Error fetching NFTs for ${chain}:`, error);
    throw error;
  }
}

// Get transaction history
export async function getTransactionHistory(address: string, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  
  try {
    const transfers = await alchemy.core.getAssetTransfers({
      fromAddress: address,
      category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20, AssetTransfersCategory.ERC721, AssetTransfersCategory.ERC1155],
      maxCount: 50,
      order: SortingOrder.DESCENDING,
    });

    return transfers.transfers;
  } catch (error) {
    console.error(`Error fetching transactions for ${chain}:`, error);
    throw error;
  }
}

// Get gas prices
export async function getGasPrice(chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  
  try {
    const gasPrice = await alchemy.core.getGasPrice();
    return {
      chain,
      gasPrice: gasPrice.toString(),
    };
  } catch (error) {
    console.error("Error fetching gas price:", error);
    throw error;
  }
}

// Get token metadata
export async function getTokenMetadata(contractAddress: string, chain: SupportedChain) {
  const alchemy = getAlchemy(chain);
  
  try {
    const metadata = await alchemy.core.getTokenMetadata(contractAddress);
    return {
      chain,
      ...metadata,
    };
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    throw error;
  }
}