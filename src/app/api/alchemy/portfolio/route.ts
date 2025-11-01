import { NextRequest, NextResponse } from "next/server";
import { getTokenBalancesWithPrices, type SupportedChain } from "@/lib/alchemy";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");
    const chainsParam = searchParams.get("chains");

    if (!address) {
      return NextResponse.json(
        { error: "Address parameter is required" },
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

    // Parse chains from query parameter
    const chains: SupportedChain[] = chainsParam
      ? chainsParam.split(",").map(c => c.trim() as SupportedChain)
      : ["ethereum", "polygon", "base", "arbitrum", "optimism"];

    // Get comprehensive portfolio with prices
    const portfolio = await getTokenBalancesWithPrices(address, chains);

    return NextResponse.json({ 
      success: true, 
      portfolio: {
        address: portfolio.address,
        chains: portfolio.chains,
        totalValue: portfolio.totalValue,
        tokens: portfolio.tokens,
        tokenCount: portfolio.tokens.length
      }
    });
  } catch (error) {
    console.error("Portfolio API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch portfolio data" },
      { status: 500 }
    );
  }
}