import { NextRequest, NextResponse } from "next/server";
import { validateContract, getAlchemy } from "@/lib/alchemy";
import type { SupportedChain } from "@/lib/alchemy";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, chain, action } = body;

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

    const alchemy = getAlchemy(chain as SupportedChain);

    // Handle different actions
    switch (action) {
      case "validate":
        const validation = await validateContract(address, chain as SupportedChain);
        return NextResponse.json({ success: true, ...validation });

      case "getABI":
        // Note: Alchemy doesn't provide ABI directly, but we can get contract metadata
        const metadata = await alchemy.core.getTokenMetadata(address);
        return NextResponse.json({ success: true, metadata });

      case "readContract":
        const { method, params } = body;
        if (!method) {
          return NextResponse.json(
            { error: "Method parameter is required for readContract action" },
            { status: 400 }
          );
        }

        // Use eth_call for contract reads
        const result = await alchemy.core.call({
          to: address,
          data: method, // This should be the encoded function signature
        });

        return NextResponse.json({ success: true, result });

      default:
        return NextResponse.json(
          { error: "Invalid action. Supported actions: validate, getABI, readContract" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Contract API error:", error);
    return NextResponse.json(
      { error: "Failed to process contract request" },
      { status: 500 }
    );
  }
}
