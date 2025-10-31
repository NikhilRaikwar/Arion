import { NextRequest, NextResponse } from "next/server";
import { getNFTs } from "@/lib/alchemy";
import type { SupportedChain } from "@/lib/alchemy";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");
    const chain = searchParams.get("chain") as SupportedChain;

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

    const nfts = await getNFTs(address, chain);
    return NextResponse.json({ success: true, nfts });
  } catch (error) {
    console.error("NFTs API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch NFT data" },
      { status: 500 }
    );
  }
}
