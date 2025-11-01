import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Optional per-chain envs, fallback to generic ALCHEMY_API_URL
const URLS: Record<string, string | undefined> = {
  "eth-mainnet": process.env.ALCHEMY_API_URL_ETH_MAINNET,
  "polygon-mainnet": process.env.ALCHEMY_API_URL_POLYGON_MAINNET,
  "base-mainnet": process.env.ALCHEMY_API_URL_BASE_MAINNET,
  "optimism-mainnet": process.env.ALCHEMY_API_URL_OPTIMISM_MAINNET,
  "arbitrum-mainnet": process.env.ALCHEMY_API_URL_ARBITRUM_MAINNET,
};

export async function POST(request: NextRequest) {
  const chain = request.headers.get("x-chain") || "eth-mainnet";
  const upstream = URLS[chain] || process.env.ALCHEMY_API_URL;
  
  if (!upstream) {
    return NextResponse.json(
      { error: `Missing upstream for chain "${chain}". Set ALCHEMY_API_URL or chain-specific env.` },
      { status: 500 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const res = await fetch(upstream, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  let json: any;
  try {
    json = await res.json();
  } catch {
    return NextResponse.json(
      { error: "Upstream returned non-JSON", status: res.status },
      { status: 502 }
    );
  }

  return NextResponse.json(json, {
    status: res.ok ? 200 : res.status || 502,
    headers: { "cache-control": "no-store" },
  });
}