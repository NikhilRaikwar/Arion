import { NextRequest, NextResponse } from "next/server";
import { getTransactionHistory, type SupportedChain } from "@/lib/alchemy";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");
    let chain = searchParams.get("chain");

    if (!address || !chain) {
      return NextResponse.json(
        { error: "Address and chain parameters are required" },
        { status: 400 }
      );
    }

    // Validate address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    // Extract chain name if it has a colon (e.g., "ethereum:1" -> "ethereum")
    if (chain.includes(':')) {
      chain = chain.split(':')[0];
    }

    // Validate chain
    const validChains = ["ethereum", "polygon", "arbitrum", "optimism", "base"];
    if (!validChains.includes(chain.toLowerCase())) {
      return NextResponse.json(
        { error: `Unsupported chain: ${chain}` },
        { status: 400 }
      );
    }

    // Get transaction history using Alchemy SDK
    const transfers = await getTransactionHistory(address, chain.toLowerCase() as SupportedChain);

    return NextResponse.json({ 
      success: true, 
      transactions: transfers,
      chain: chain 
    });
  } catch (error) {
    console.error("Transactions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction history" },
      { status: 500 }
    );
  }
}
