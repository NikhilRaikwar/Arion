import { Alchemy, Network } from "alchemy-sdk";

// Multi-chain Alchemy instances
export const alchemyInstances = {
  ethereum: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
  }),
  polygon: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.MATIC_MAINNET,
  }),
  arbitrum: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ARB_MAINNET,
  }),
  optimism: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.OPT_MAINNET,
  }),
  base: new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.BASE_MAINNET,
  }),
};

export type SupportedChain = keyof typeof alchemyInstances;

export const chainNames: Record<SupportedChain, string> = {
  ethereum: "Ethereum",
  polygon: "Polygon",
  arbitrum: "Arbitrum",
  optimism: "Optimism",
  base: "Base",
};

export function getAlchemy(chain: SupportedChain) {
  return alchemyInstances[chain];
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
      category: ["external", "erc20", "erc721", "erc1155"],
      maxCount: 50,
      order: "desc",
    });

    return transfers.transfers;
  } catch (error) {
    console.error(`Error fetching transactions for ${chain}:`, error);
    throw error;
  }
}
