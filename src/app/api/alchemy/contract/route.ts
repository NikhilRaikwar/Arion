import { NextRequest, NextResponse } from "next/server";

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

    const apiKey = process.env.ALCHEMY_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ALCHEMY_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Map chain names to Alchemy network identifiers
    const networkMap: Record<string, string> = {
      ethereum: "eth-mainnet",
      polygon: "polygon-mainnet",
      arbitrum: "arb-mainnet",
      optimism: "opt-mainnet",
      base: "base-mainnet",
    };

    const network = networkMap[chain] || "eth-mainnet";
    const rpcUrl = `https://${network}.g.alchemy.com/v2/${apiKey}`;

    // Handle different actions
    switch (action) {
      case "validate":
        try {
          // Check if it's a contract using eth_getCode
          const codeResponse = await fetch(rpcUrl, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "eth_getCode",
              params: [address, "latest"],
            }),
          });

          const codeData = await codeResponse.json();
          const code = codeData.result || "0x";
          const isContract = code !== "0x" && code.length > 2;

          if (!isContract) {
            return NextResponse.json({
              success: true,
              valid: false,
              isContract: false,
              message: "Address is not a smart contract"
            });
          }

          // Get token metadata (if it's a token contract)
          let metadata = null;
          try {
            const metadataResponse = await fetch(rpcUrl, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 2,
                method: "alchemy_getTokenMetadata",
                params: [address],
              }),
            });
            const metadataData = await metadataResponse.json();
            metadata = metadataData.result || null;
          } catch {
            // Not a token contract, that's okay
          }

          return NextResponse.json({
            success: true,
            valid: true,
            isContract: true,
            address,
            chain,
            network,
            metadata,
            bytecodeLength: (code.length - 2) / 2,
          });
        } catch (error: any) {
          console.error("Contract validation error:", error);
          return NextResponse.json(
            { success: false, error: error.message || "Contract validation failed" },
            { status: 500 }
          );
        }

      case "getMetadata":
        try {
          const metadataResponse = await fetch(rpcUrl, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: 1,
              method: "alchemy_getTokenMetadata",
              params: [address],
            }),
          });
          const metadataData = await metadataResponse.json();
          return NextResponse.json({ 
            success: true, 
            metadata: metadataData.result || null 
          });
        } catch (error: any) {
          return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { error: "Invalid action. Supported actions: validate, getMetadata" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Contract API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process contract request" },
      { status: 500 }
    );
  }
}