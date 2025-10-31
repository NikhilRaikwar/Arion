import { NextRequest, NextResponse } from "next/server";

const AIML_API_KEY = process.env.AIML_API_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Blockchain-related keywords that should trigger Alchemy API usage
const BLOCKCHAIN_KEYWORDS = [
  "block", "transaction", "wallet", "address", "ethereum", "polygon", "arbitrum",
  "base", "optimism", "chain", "gas", "smart contract", "token", "nft", "defi",
  "web3", "crypto", "balance", "transfer", "eth", "matic", "arb", "op",
  "latest block", "block number", "blockchain", "on-chain", "contract address"
];

function isBlockchainQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return BLOCKCHAIN_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

async function fetchAlchemyData(query: string) {
  try {
    // Example: Get latest block number from Ethereum
    if (query.toLowerCase().includes("latest block") || query.toLowerCase().includes("block number")) {
      const response = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_blockNumber",
          params: []
        })
      });
      
      const data = await response.json();
      if (data.result) {
        const blockNumber = parseInt(data.result, 16);
        return `The latest Ethereum block number is ${blockNumber.toLocaleString()}.`;
      }
    }
    
    // For other blockchain queries, we'll let the AI handle it with context
    return null;
  } catch (error) {
    console.error("Alchemy API error:", error);
    return null;
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
    let systemMessage = "You are ChainBot, an AI assistant specialized in blockchain, Web3, DeFi, and cryptocurrency. You help users understand blockchain concepts, analyze transactions, explain smart contracts, and provide insights about the crypto ecosystem.";
    
    if (wallet_address) {
      systemMessage += ` The user's wallet address is ${wallet_address}.`;
    }
    
    if (alchemyContext) {
      systemMessage += ` Here is real-time blockchain data: ${alchemyContext}`;
    }

    if (isBlockchain) {
      systemMessage += " The user is asking about blockchain-related topics. Provide accurate, technical information while remaining accessible.";
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