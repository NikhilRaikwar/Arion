import { NextRequest, NextResponse } from "next/server";

const AIML_API_KEY = process.env.AIML_API_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

// Blockchain-related keywords
const BLOCKCHAIN_KEYWORDS = [
  "balance", "wallet", "token", "eth", "ethereum", "polygon", "my tokens",
  "my balance", "check balance", "show balance", "how much", "transfer",
  "send", "transaction", "tx", "contract", "nft", "gas", "wei", "gwei",
  "smart contract", "contract address", "validate contract"
];

function isBlockchainQuery(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  return BLOCKCHAIN_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

// Check if query is asking for user's own balance
function isBalanceQuery(message: string): boolean {
  const balanceKeywords = [
    'my balance', 'my wallet', 'my tokens', 'check my', 
    'show my', 'what do i have', 'how much do i have', 
    "what's my", 'check balance', 'show balance', 'balance on',
    'my portfolio', 'show portfolio', 'my holdings', 'check wallet'
  ];
  return balanceKeywords.some(kw => message.toLowerCase().includes(kw));
}

// Check if query is asking about a smart contract
function isContractQuery(message: string): boolean {
  const contractKeywords = [
    'contract', 'smart contract', 'contract address', 'validate contract',
    'check contract', 'contract details', 'token contract', 'about this contract'
  ];
  const hasKeyword = contractKeywords.some(kw => message.toLowerCase().includes(kw));
  const hasAddress = /0x[a-fA-F0-9]{40}/.test(message);
  return hasKeyword && hasAddress;
}

// Extract wallet address from message (0x followed by 40 hex characters)
function extractWalletAddress(message: string): string | null {
  const addressRegex = /0x[a-fA-F0-9]{40}/;
  const match = message.match(addressRegex);
  return match ? match[0] : null;
}

// Validate Ethereum address format
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Check if query is asking for NFTs
function isNFTQuery(message: string): boolean {
  const nftKeywords = ['nft', 'nfts', 'my nft', 'show nft', 'my collection'];
  return nftKeywords.some(kw => message.toLowerCase().includes(kw));
}

// Check if query is asking for transactions
function isTransactionQuery(message: string): boolean {
  const txKeywords = ['transaction', 'transactions', 'my transactions', 'recent transactions', 'tx history'];
  return txKeywords.some(kw => message.toLowerCase().includes(kw));
}

// Extract network/chain from query
function extractNetwork(message: string): string {
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('polygon')) return 'polygon';
  if (lowerMsg.includes('base')) return 'base';
  if (lowerMsg.includes('arbitrum') || lowerMsg.includes('arb')) return 'arbitrum';
  if (lowerMsg.includes('optimism') || lowerMsg.includes('op')) return 'optimism';
  if (lowerMsg.includes('eth') || lowerMsg.includes('ethereum')) return 'ethereum';
  return 'ethereum'; // default
}

// Fetch contract validation data from Alchemy
async function fetchContractValidation(address: string, chain: string = 'ethereum') {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/alchemy/contract`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, chain, action: "validate" })
      }
    );

    if (!response.ok) {
      throw new Error("Failed to validate contract");
    }

    return await response.json();
  } catch (error) {
    console.error("Contract validation error:", error);
    return null;
  }
}

// Fetch comprehensive portfolio data from Alchemy
async function fetchAlchemyPortfolio(address: string, chains: string[] = ['ethereum']) {
  try {
    const chainsParam = chains.join(',');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/alchemy/portfolio?address=${address}&chains=${chainsParam}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch portfolio");
    }

    return await response.json();
  } catch (error) {
    console.error("Portfolio fetch error:", error);
    return null;
  }
}

// Fetch NFT data from Alchemy
async function fetchAlchemyNFTs(address: string, chains: string[] = ['ethereum']) {
  try {
    const chainsParam = chains.join(',');
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/alchemy/nfts?address=${address}&chains=${chainsParam}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch NFTs");
    }

    return await response.json();
  } catch (error) {
    console.error("NFT fetch error:", error);
    return null;
  }
}

// Fetch transaction history from Alchemy
async function fetchAlchemyTransactions(address: string, chain: string = 'ethereum') {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/alchemy/transactions?address=${address}&chain=${chain}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    return await response.json();
  } catch (error) {
    console.error("Transaction fetch error:", error);
    return null;
  }
}

// Analyze file with AI validation
async function analyzeFileWithAI(fileName: string, fileType: string, fileData: string, userMessage: string): Promise<string> {
  try {
    // Check if Solidity contract
    if (fileName.endsWith('.sol') || fileData.includes('pragma solidity') || fileData.includes('contract ')) {
      return await analyzeSolidityContract(fileData, fileName);
    }
    
    // Check if image
    if (fileType.startsWith('image/')) {
      return await analyzeImageWithAI(fileData, userMessage || "Analyze this blockchain/crypto-related image");
    }
    
    // Check if blockchain-related text file
    const isBlockchainFile = 
      fileData.toLowerCase().includes('blockchain') ||
      fileData.toLowerCase().includes('ethereum') ||
      fileData.toLowerCase().includes('contract') ||
      fileData.toLowerCase().includes('web3') ||
      fileData.toLowerCase().includes('token') ||
      fileData.toLowerCase().includes('0x') ||
      fileData.toLowerCase().includes('wallet');
    
    if (!isBlockchainFile) {
      return `❌ Not Blockchain-Related\n\nI can only analyze blockchain, cryptocurrency, and Web3-related files. The file "${fileName}" doesn't appear to contain blockchain-related content.\n\nI can help with:\n• Solidity smart contracts (.sol)\n• Transaction receipts (images)\n• Wallet screenshots (images)\n• Blockchain configuration files\n• Web3 documentation\n• NFT metadata`;
    }
    
    // Analyze with AI
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
            content: "You are Arion, a blockchain expert. Analyze files and give SHORT insights with emojis. NO markdown symbols like ** or ##. Just use plain bold text."
          },
          { 
            role: "user", 
            content: `File: ${fileName}\nContent:\n${fileData}\n\nUser's question: ${userMessage || "Analyze this file"}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error("Failed to analyze file");
    }

    const data = await response.json();
    return cleanMarkdown(data.choices[0].message.content);
  } catch (error) {
    console.error("File analysis error:", error);
    return `⚠️ Error analyzing file: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Clean markdown symbols from AI response
function cleanMarkdown(text: string): string {
  // Remove ** for bold - just keep the text
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  // Remove ## for headings - just keep the text
  text = text.replace(/^##\s+(.+)$/gm, '$1');
  text = text.replace(/^#\s+(.+)$/gm, '$1');
  return text;
}

// Analyze Solidity contract
async function analyzeSolidityContract(contractCode: string, fileName: string): Promise<string> {
  try {
    const lines = contractCode.split('\n');
    const pragmaLine = lines.find(l => l.trim().startsWith('pragma solidity'));
    const contractLine = lines.find(l => l.includes('contract ') && !l.trim().startsWith('//'));
    
    const functions = contractCode.match(/function\s+\w+/g)?.length || 0;
    const events = contractCode.match(/event\s+\w+/g)?.length || 0;
    const modifiers = contractCode.match(/modifier\s+\w+/g)?.length || 0;
    
    const hasConstructor = contractCode.includes('constructor');
    const hasPayable = contractCode.includes('payable');
    const usesOpenZeppelin = contractCode.includes('@openzeppelin');
    const hasOwnable = contractCode.includes('Ownable');
    const hasReentrancyGuard = contractCode.includes('ReentrancyGuard');
    
    let analysis = `📜 Solidity Contract Analysis: ${fileName}\n\n`;
    analysis += `Compiler Version: ${pragmaLine || 'Not specified'}\n`;
    analysis += `Contract Name: ${contractLine?.match(/contract\s+(\w+)/)?.[1] || 'Unknown'}\n\n`;
    
    analysis += `Structure:\n`;
    analysis += `• Functions: ${functions}\n`;
    analysis += `• Events: ${events}\n`;
    analysis += `• Modifiers: ${modifiers}\n`;
    analysis += `• Has Constructor: ${hasConstructor ? '✅' : '❌'}\n\n`;
    
    analysis += `Features Detected:\n`;
    if (usesOpenZeppelin) analysis += `• ✅ Uses OpenZeppelin libraries\n`;
    if (hasOwnable) analysis += `• ✅ Implements Ownable (access control)\n`;
    if (hasReentrancyGuard) analysis += `• ✅ Protected against reentrancy attacks\n`;
    if (hasPayable) analysis += `• ✅ Can receive ETH (payable functions)\n`;
    
    analysis += `\nSecurity Notes:\n`;
    if (!hasReentrancyGuard && hasPayable) {
      analysis += `• ⚠️ Contains payable functions without ReentrancyGuard\n`;
    }
    if (contractCode.includes('selfdestruct')) {
      analysis += `• ⚠️ Contains selfdestruct - contract can be destroyed\n`;
    }
    if (contractCode.includes('delegatecall')) {
      analysis += `• ⚠️ Uses delegatecall - potential security risk\n`;
    }
    
    try {
      const aiResponse = await fetch("https://api.aimlapi.com/v1/chat/completions", {
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
              content: "You are Arion, an expert Solidity auditor. Provide SHORT security analysis with emojis. NO markdown symbols like ** or ##."
            },
            { role: "user", content: `Analyze this Solidity contract briefly:\n\n${contractCode}` }
          ],
          max_tokens: 800,
          temperature: 0.3
        })
      });

      if (aiResponse.ok) {
        const data = await aiResponse.json();
        analysis += `\n\nAI Security Analysis:\n${cleanMarkdown(data.choices[0].message.content)}`;
      }
    } catch (e) {
      console.error("AI analysis error:", e);
    }
    
    return analysis;
  } catch (error) {
    return `⚠️ Error analyzing contract: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Analyze image with AI
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
            content: "You are Arion. Analyze blockchain images. Give SHORT responses with emojis. NO markdown symbols like ** or ##. Just plain bold text."
          },
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageBase64 } }
            ]
          }
        ],
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error("Failed to analyze image with AI");
    }

    const data = await response.json();
    return cleanMarkdown(data.choices[0].message.content);
  } catch (error) {
    console.error("Image analysis error:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, messages = [], wallet_address, file } = body;

    if (!message && !file) {
      return NextResponse.json({ error: "Message or file is required" }, { status: 400 });
    }

    // Handle file uploads with validation
    if (file) {
      const fileAnalysis = await analyzeFileWithAI(file.name, file.type, file.data, message);
      return NextResponse.json({ response: fileAnalysis });
    }

    // Extract wallet address from message if provided
    const messageAddress = extractWalletAddress(message);
    const targetAddress = messageAddress || wallet_address;

    // Extract network from query
    const requestedNetwork = extractNetwork(message);
    const chains = [requestedNetwork];

    // Check if this is an Alchemy API query (balance, NFT, transactions, contract)
    let alchemyData = null;
    let alchemyContext = "";

    // Check for smart contract queries
    if (isContractQuery(message) && messageAddress) {
      if (!isValidAddress(messageAddress)) {
        return NextResponse.json({
          response: "❌ Invalid contract address!\n\nPlease provide a valid Ethereum address (0x followed by 40 hex characters). 🔍"
        });
      }

      alchemyData = await fetchContractValidation(messageAddress, requestedNetwork);
      if (alchemyData && alchemyData.success) {
        if (alchemyData.valid && alchemyData.isContract) {
          alchemyContext = `SMART CONTRACT DATA FROM ALCHEMY API:\n`;
          alchemyContext += `Address: ${messageAddress}\n`;
          alchemyContext += `Chain: ${requestedNetwork}\n`;
          alchemyContext += `Network: ${alchemyData.network}\n`;
          alchemyContext += `Is Contract: ✅ YES\n`;
          alchemyContext += `Bytecode Length: ${alchemyData.bytecodeLength} bytes\n\n`;
          
          if (alchemyData.metadata) {
            alchemyContext += `TOKEN METADATA:\n`;
            alchemyContext += `Name: ${alchemyData.metadata.name || 'N/A'}\n`;
            alchemyContext += `Symbol: ${alchemyData.metadata.symbol || 'N/A'}\n`;
            alchemyContext += `Decimals: ${alchemyData.metadata.decimals || 'N/A'}\n`;
            alchemyContext += `Logo: ${alchemyData.metadata.logo || 'N/A'}\n\n`;
          }
          
          alchemyContext += `This is a verified smart contract on ${requestedNetwork}. `;
          if (alchemyData.metadata) {
            alchemyContext += `It appears to be a token contract for ${alchemyData.metadata.name} (${alchemyData.metadata.symbol}).`;
          }
        } else {
          alchemyContext = `ADDRESS VALIDATION:\nAddress ${messageAddress} is NOT a smart contract. It appears to be a regular wallet address (EOA - Externally Owned Account).`;
        }
      } else {
        alchemyContext = `Failed to validate contract. Error: ${alchemyData?.error || 'Unknown error'}`;
      }
    } else if (targetAddress && (isBalanceQuery(message) || isNFTQuery(message) || isTransactionQuery(message))) {
      // Validate address format
      if (!isValidAddress(targetAddress)) {
        return NextResponse.json({
          response: "❌ Invalid wallet address!\n\nPlease provide a valid Ethereum address (0x followed by 40 hex characters). 🔍"
        });
      }

      // Fetch data from Alchemy first
      if (isBalanceQuery(message)) {
        alchemyData = await fetchAlchemyPortfolio(targetAddress, chains);
        if (alchemyData && alchemyData.success) {
          const isOtherWallet = messageAddress && messageAddress !== wallet_address;
          alchemyContext = `${isOtherWallet ? 'WALLET' : 'USER WALLET'} DATA FROM ALCHEMY API:\n`;
          alchemyContext += `Address: ${targetAddress}\n`;
          alchemyContext += `Networks checked: ${chains.join(', ')}\n`;
          
          // Add null check for totalValue
          const totalValue = alchemyData.totalValue ?? 0;
          alchemyContext += `Total Portfolio Value: $${totalValue.toFixed(2)} USD\n\n`;
          
          alchemyContext += `TOKENS:\n`;
          if (alchemyData.tokens && alchemyData.tokens.length > 0) {
            alchemyData.tokens.forEach((token: any, idx: number) => {
              alchemyContext += `${idx + 1}. ${token.symbol} (${token.name || 'Unknown'})\n`;
              alchemyContext += `   Chain: ${token.network}\n`;
              alchemyContext += `   Balance: ${token.balance}\n`;
              
              // Add null checks for price and value
              const priceUsd = token.priceUsd ?? 'N/A';
              const valueUsd = token.valueUsd != null ? token.valueUsd.toFixed(2) : 'N/A';
              
              alchemyContext += `   USD Price: $${priceUsd}\n`;
              alchemyContext += `   USD Value: $${valueUsd}\n\n`;
            });
          } else {
            alchemyContext += `No tokens found on ${chains.join(', ')}.\n`;
          }
        } else {
          alchemyContext = `Failed to fetch balance data from Alchemy API. Error: ${alchemyData?.error || 'Unknown error'}`;
        }
      } else if (isNFTQuery(message)) {
        alchemyData = await fetchAlchemyNFTs(targetAddress, chains);
        if (alchemyData && alchemyData.success) {
          alchemyContext = `USER NFT DATA FROM ALCHEMY API:\n`;
          alchemyContext += `Address: ${targetAddress}\n`;
          alchemyContext += `Total NFTs: ${alchemyData.count || 0}\n\n`;
          
          if (alchemyData.nfts && alchemyData.nfts.length > 0) {
            alchemyData.nfts.forEach((nft: any, idx: number) => {
              alchemyContext += `NFT ${idx + 1}:\n`;
              alchemyContext += `Name: ${nft.name || 'Unnamed NFT'}\n`;
              alchemyContext += `Description: ${nft.description || 'No description'}\n`;
              alchemyContext += `Collection: ${nft.collection?.name || nft.contract?.openSeaMetadata?.collectionName || 'Unknown'}\n`;
              alchemyContext += `Chain: ${nft.network}\n`;
              alchemyContext += `Token ID: ${nft.tokenId}\n`;
              alchemyContext += `Token Type: ${nft.tokenType}\n`;
              alchemyContext += `Contract Address: ${nft.contract?.address}\n`;
              
              // Image URLs
              if (nft.image?.cachedUrl) {
                alchemyContext += `Image URL: ${nft.image.cachedUrl}\n`;
              }
              if (nft.image?.thumbnailUrl) {
                alchemyContext += `Thumbnail URL: ${nft.image.thumbnailUrl}\n`;
              }
              
              // External links
              if (nft.raw?.metadata?.url) {
                alchemyContext += `View on ENS: ${nft.raw.metadata.url}\n`;
              }
              if (nft.contract?.address && nft.tokenId) {
                const openseaUrl = `https://opensea.io/assets/${nft.network.includes('eth') ? 'ethereum' : nft.network.replace('-mainnet', '')}/${nft.contract.address}/${nft.tokenId}`;
                alchemyContext += `OpenSea URL: ${openseaUrl}\n`;
              }
              
              alchemyContext += `\n`;
            });
          }
        }
      } else if (isTransactionQuery(message)) {
        alchemyData = await fetchAlchemyTransactions(targetAddress, requestedNetwork);
        if (alchemyData && alchemyData.success) {
          alchemyContext = `USER TRANSACTION DATA FROM ALCHEMY API:\n`;
          alchemyContext += `Address: ${targetAddress}\n`;
          alchemyContext += `Chain: ${requestedNetwork}\n`;
          alchemyContext += `Total Transactions: ${alchemyData.totalCount}\n\n`;
          
          if (alchemyData.transactions && alchemyData.transactions.length > 0) {
            alchemyData.transactions.slice(0, 10).forEach((tx: any, idx: number) => {
              alchemyContext += `${idx + 1}. ${tx.category.toUpperCase()}\n`;
              alchemyContext += `   From: ${tx.from}\n`;
              alchemyContext += `   To: ${tx.to || 'Contract Creation'}\n`;
              alchemyContext += `   Value: ${tx.value} ${tx.asset}\n`;
              alchemyContext += `   Time: ${new Date(tx.timestamp).toLocaleString()}\n\n`;
            });
          }
        }
      }
    }

    // If no wallet address at all for balance query
    if (isBalanceQuery(message) && !targetAddress) {
      return NextResponse.json({
        response: "💡 To check wallet balance, either:\n\n1️⃣ Connect your wallet using the button above\n2️⃣ Provide a wallet address in your message (e.g., 'check balance 0x...')\n\nTry again! 🚀"
      });
    }

    // Prepare system message with Alchemy data context
    let systemMessage = `You are Arion, a friendly AI assistant for blockchain and Web3.

CRITICAL FORMATTING RULES:
- Use emojis liberally 🚀💰🎯
- Keep responses SHORT and concise (3-5 sentences max)
- NO markdown symbols like ** for bold or ## for headings
- Just use plain text that will naturally bold
- Use bullet points with emojis instead of long paragraphs

NFT DISPLAY RULES (IMPORTANT):
- When showing NFT data, ALWAYS display the image using the Image URL provided
- Format NFT images as: [Image](ImageURL) so they are clickable and viewable
- Make ALL URLs clickable by formatting them properly
- Show FULL NFT details including name, description, collection, chain, and links
- Display thumbnail for quick preview and full image URL for high quality
- Include OpenSea and ENS links when available

Your capabilities:
💰 Check wallet balances (Alchemy API integration)
🖼️ View NFT collections
📊 Show transaction history
🔄 Guide token transfers
📜 Analyze smart contracts
🔍 Validate contract addresses
🎓 Explain blockchain concepts

${alchemyContext ? `\n\nREAL-TIME BLOCKCHAIN DATA FROM ALCHEMY:\n${alchemyContext}\n\nUSE THIS DATA to answer the user's question. Format it nicely with emojis and keep it SHORT.` : ''}

${wallet_address ? `\nUser's connected wallet: ${wallet_address}` : ''}

Remember: SHORT responses, lots of emojis, NO ** or ## symbols!`;

    // Call AI API
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
          ...messages.slice(-10), // Keep last 10 messages for context
          { role: "user", content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AIML API error:", response.status, errorText);
      return NextResponse.json({ 
        error: "Failed to get AI response",
        details: `Status: ${response.status}, ${errorText}`
      }, { status: 500 });
    }

    const data = await response.json();
    const aiResponse = cleanMarkdown(data.choices[0].message.content);
    
    return NextResponse.json({ response: aiResponse });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}