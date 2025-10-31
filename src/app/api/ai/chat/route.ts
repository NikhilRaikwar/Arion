import { NextRequest, NextResponse } from "next/server";
import {
  detectChainFromURL,
  extractTransactionHash,
  extractAddress,
  extractBlockNumber,
  getTransaction,
  getBlock,
  getAddressInfo,
  getContractInfo,
  getGasPrice,
  getTokenMetadata,
  getNFTs,
  getTransactionHistory,
  chainNames,
  type SupportedChain,
  getAlchemy,
} from "@/lib/alchemy";
import { formatEther, formatUnits } from "ethers";

const AIML_API_KEY = process.env.AIML_API_KEY;

// Blockchain-related keywords that should trigger Alchemy API usage
const BLOCKCHAIN_KEYWORDS = [
  "block", "transaction", "wallet", "address", "ethereum", "polygon", "arbitrum",
  "base", "optimism", "chain", "gas", "smart contract", "token", "nft", "defi",
  "web3", "crypto", "balance", "transfer", "eth", "matic", "arb", "op",
  "latest block", "block number", "blockchain", "on-chain", "contract address",
  "tx", "txn", "hash", "etherscan", "polygonscan", "arbiscan", "basescan",
  "optimistic", "zkevm", "blast", "frax", "zksync", "erc20", "erc721", "erc1155",
  "portfolio", "holdings", "price", "gas fee"
];

function isBlockchainQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return BLOCKCHAIN_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

// Format large numbers with commas
function formatNumber(num: number): string {
  return num.toLocaleString();
}

// Convert Wei to Ether with proper formatting
function weiToEther(wei: string): string {
  try {
    return parseFloat(formatEther(wei)).toFixed(6);
  } catch {
    return "0";
  }
}

// Convert timestamp to readable date
function timestampToDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

// Fetch comprehensive blockchain data using Alchemy
async function fetchAlchemyData(query: string) {
  try {
    // Detect chain from URL or default to ethereum
    const chain = detectChainFromURL(query);
    const chainName = chainNames[chain];

    // Check for specific block number
    const blockNumber = extractBlockNumber(query);
    if (blockNumber !== null) {
      const blockData = await getBlock(blockNumber, chain);
      const block = blockData.block;
      
      return `📦 **Block #${formatNumber(blockNumber)} on ${chainName}**

**Block Hash:** \`${block.hash}\`
**Timestamp:** ${timestampToDate(block.timestamp)}
**Miner/Validator:** \`${block.miner}\`
**Transactions:** ${block.transactions.length} transactions
**Gas Used:** ${formatNumber(Number(block.gasUsed))} / ${formatNumber(Number(block.gasLimit))} (${((Number(block.gasUsed) / Number(block.gasLimit)) * 100).toFixed(2)}%)
**Base Fee:** ${block.baseFeePerGas ? `${weiToEther(block.baseFeePerGas.toString())} ETH` : "N/A"}
**Parent Hash:** \`${block.parentHash}\`
**Chain:** ${chainName}`;
    }
    
    // Check for transaction hash
    const txHash = extractTransactionHash(query);
    if (txHash) {
      const txData = await getTransaction(txHash, chain);
      const tx = txData.transaction;
      const receipt = txData.receipt;
      
      if (!tx) {
        return `⚠️ **Transaction not found:** \`${txHash}\` on ${chainName}`;
      }
      
      return `💳 **Transaction Details on ${chainName}**

**Transaction Hash:** \`${tx.hash}\`
**Status:** ${receipt?.status === 1 ? "✅ Success" : receipt?.status === 0 ? "❌ Failed" : "⏳ Pending"}
**Block:** ${tx.blockNumber ? `#${formatNumber(tx.blockNumber)}` : "Pending"}
**From:** \`${tx.from}\`
**To:** \`${tx.to || "Contract Creation"}\`
**Value:** ${weiToEther(tx.value.toString())} ETH
**Gas Price:** ${tx.gasPrice ? `${weiToEther(tx.gasPrice.toString())} ETH` : "N/A"}
**Gas Limit:** ${formatNumber(Number(tx.gasLimit))}
**Gas Used:** ${receipt ? formatNumber(Number(receipt.gasUsed)) : "N/A"}
**Nonce:** ${tx.nonce}
**Input Data:** ${tx.data.length > 10 ? `${tx.data.substring(0, 10)}... (${(tx.data.length - 2) / 2} bytes)` : tx.data}
**Chain:** ${chainName}`;
    }
    
    // Check for Ethereum address
    const address = extractAddress(query);
    if (address && !txHash) {
      // Determine if it's asking about contract or general address
      const isContractQuery = query.toLowerCase().includes("contract");
      
      if (isContractQuery) {
        const contractInfo = await getContractInfo(address, chain);
        
        if (!contractInfo.isContract) {
          return `ℹ️ **Address \`${address}\` is not a smart contract on ${chainName}.**`;
        }
        
        return `📜 **Smart Contract on ${chainName}**

**Address:** \`${address}\`
**Type:** Smart Contract
**Bytecode Size:** ${formatNumber(contractInfo.bytecodeLength || 0)} bytes
${contractInfo.metadata ? `**Token Name:** ${contractInfo.metadata.name || "N/A"}
**Token Symbol:** ${contractInfo.metadata.symbol || "N/A"}
**Decimals:** ${contractInfo.metadata.decimals || "N/A"}` : ""}
**Creator:** ${contractInfo.creator ? `\`${contractInfo.creator}\`` : "Unknown"}
**Creation Tx:** ${contractInfo.creationTx ? `\`${contractInfo.creationTx}\`` : "Unknown"}
**Chain:** ${chainName}`;
      } else {
        const addressInfo = await getAddressInfo(address, chain);
        
        return `💰 **Address Information on ${chainName}**

**Address:** \`${address}\`
**Type:** ${addressInfo.isContract ? "📜 Smart Contract" : "👤 Externally Owned Account (EOA)"}
**Native Balance:** ${weiToEther(addressInfo.nativeBalance)} ETH
**Token Count:** ${addressInfo.tokenCount} different tokens
${addressInfo.tokens.length > 0 ? `\n**Top Tokens:**\n${addressInfo.tokens.slice(0, 5).map((t: any) => {
  const balance = formatUnits(t.balance, t.decimals || 18);
  return `  • ${t.symbol || "Unknown"}: ${parseFloat(balance).toFixed(4)}`;
}).join("\n")}` : ""}
**Chain:** ${chainName}`;
      }
    }
    
    // Check for latest block query
    if (query.toLowerCase().includes("latest block") || query.toLowerCase().includes("current block")) {
      const alchemy = getAlchemy(chain);
      const blockNumber = await alchemy.core.getBlockNumber();
      return `🔗 The latest block number on **${chainName}** is **${formatNumber(blockNumber)}**.`;
    }
    
    // Check for gas price query
    if (query.toLowerCase().includes("gas price") || query.toLowerCase().includes("gas fee")) {
      const gasData = await getGasPrice(chain);
      return `⛽ **Current Gas Price on ${chainName}:** ${weiToEther(gasData.gasPrice)} ETH (${(parseFloat(weiToEther(gasData.gasPrice)) * 1e9).toFixed(2)} Gwei)`;
    }
    
    // Check for NFT query
    if (address && (query.toLowerCase().includes("nft") || query.toLowerCase().includes("collection"))) {
      const nfts = await getNFTs(address, chain);
      
      if (nfts.length === 0) {
        return `🎨 **No NFTs found** for address \`${address}\` on ${chainName}.`;
      }
      
      return `🎨 **NFT Collection for \`${address}\` on ${chainName}**

**Total NFTs:** ${nfts.length}

${nfts.slice(0, 5).map((nft: any, i: number) => `${i + 1}. **${nft.name || "Unnamed"}**
   Collection: ${nft.collection || "Unknown"}
   Token ID: ${nft.tokenId}
   Contract: \`${nft.contractAddress}\``).join("\n\n")}

${nfts.length > 5 ? `\n_...and ${nfts.length - 5} more NFTs_` : ""}`;
    }
    
    // Check for transaction history query
    if (address && (query.toLowerCase().includes("transaction") || query.toLowerCase().includes("history") || query.toLowerCase().includes("activity"))) {
      const txHistory = await getTransactionHistory(address, chain);
      
      if (txHistory.length === 0) {
        return `📋 **No transaction history** found for address \`${address}\` on ${chainName}.`;
      }
      
      return `📋 **Transaction History for \`${address}\` on ${chainName}**

**Total Transactions:** ${txHistory.length}

${txHistory.slice(0, 5).map((tx: any, i: number) => `${i + 1}. **${tx.category.toUpperCase()}**
   Hash: \`${tx.hash}\`
   From: \`${tx.from}\`
   To: \`${tx.to}\`
   Value: ${tx.value ? `${tx.value.toFixed(6)}` : "0"} ${tx.asset || "ETH"}
   Block: ${tx.blockNum}`).join("\n\n")}

${txHistory.length > 5 ? `\n_...and ${txHistory.length - 5} more transactions_` : ""}`;
    }
    
    return null;
  } catch (error) {
    console.error("Alchemy API error:", error);
    return `⚠️ **Error fetching blockchain data:** ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

async function analyzeImageWithAI(imageBase64: string, prompt: string): Promise<string> {
  try {
    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are ChainBot, an AI assistant specialized in blockchain, Web3, DeFi, and cryptocurrency. You can analyze blockchain-related images such as transaction receipts, wallet screenshots, smart contract code, NFTs, and blockchain data visualizations. If an image is NOT related to blockchain/crypto/Web3, politely inform the user that you can only help with blockchain-related content."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt || "Is this image related to blockchain/crypto/Web3? If yes, please analyze it in detail. If no, let me know it's not blockchain-related."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error("Failed to analyze image with AI");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Image analysis error:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, messages = [], wallet_address, image } = body;

    if (!message && !image) {
      return NextResponse.json({ error: "Message or image is required" }, { status: 400 });
    }

    // Check if image is attached
    if (image) {
      try {
        const analysis = await analyzeImageWithAI(image, message);
        return NextResponse.json({ response: analysis });
      } catch (error) {
        console.error("Image analysis error:", error);
        return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
      }
    }

    // Check if this is a blockchain query
    const isBlockchain = isBlockchainQuery(message);
    
    // Try to fetch Alchemy data if it's a blockchain query
    let alchemyContext = null;
    if (isBlockchain) {
      alchemyContext = await fetchAlchemyData(message);
    }

    // Prepare system message with context
    let systemMessage = "You are ChainBot, an AI assistant specialized in blockchain, Web3, DeFi, and cryptocurrency. You help users understand blockchain concepts, analyze transactions, explain smart contracts, and provide insights about the crypto ecosystem across multiple chains including Ethereum, Polygon, Arbitrum, Optimism, Base, zkSync, Blast, Frax, and more.";
    
    if (wallet_address) {
      systemMessage += ` The user's wallet address is ${wallet_address}.`;
    }
    
    if (alchemyContext) {
      systemMessage += `\n\nHere is real-time blockchain data retrieved from Alchemy API:\n${alchemyContext}\n\nPlease analyze this data and provide helpful insights to the user.`;
    }

    if (isBlockchain) {
      systemMessage += " The user is asking about blockchain-related topics. Provide accurate, technical information while remaining accessible. If real-time data is provided above, use it to give specific answers.";
    }

    // Call AIML API (OpenAI compatible)
    const response = await fetch("https://api.aimlapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${AIML_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemMessage },
          ...messages,
          { role: "user", content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("AIML API error:", errorData);
      return NextResponse.json({ error: "Failed to get AI response" }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}