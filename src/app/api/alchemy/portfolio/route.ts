import { NextRequest, NextResponse } from "next/server";
import { getMultiChainPortfolio, getWalletPortfolio } from "@/lib/alchemy";
import type { SupportedChain } from "@/lib/alchemy";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");
    const chain = searchParams.get("chain") as SupportedChain | null;

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

    // If chain is specified, get single chain portfolio
    if (chain) {
      const portfolio = await getWalletPortfolio(address, chain);
      return NextResponse.json({ success: true, portfolio });
    }

    // Otherwise get multi-chain portfolio
    const portfolios = await getMultiChainPortfolio(address);
    return NextResponse.json({ success: true, portfolios });
  } catch (error) {
    console.error("Portfolio API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 }
    );
  }
}
