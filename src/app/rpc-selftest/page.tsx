"use client";

import { useEffect, useState } from "react";
import { rpc } from "@/lib/rpc";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";

function hexToInt(h: string) {
  try {
    return parseInt(h, 16);
  } catch {
    return NaN;
  }
}

export default function SelfTest() {
  const [ethBlock, setEthBlock] = useState<number | null>(null);
  const [baseBlock, setBaseBlock] = useState<number | null>(null);
  const [polygonBlock, setPolygonBlock] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testRPC = async () => {
    setLoading(true);
    setErr(null);
    setEthBlock(null);
    setBaseBlock(null);
    setPolygonBlock(null);

    try {
      const [ethHex, baseHex, polygonHex] = await Promise.all([
        rpc<string>("eth_blockNumber", [], "eth-mainnet"),
        rpc<string>("eth_blockNumber", [], "base-mainnet"),
        rpc<string>("eth_blockNumber", [], "polygon-mainnet"),
      ]);

      setEthBlock(hexToInt(ethHex));
      setBaseBlock(hexToInt(baseHex));
      setPolygonBlock(hexToInt(polygonHex));
    } catch (e: any) {
      setErr(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testRPC();
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            RPC Proxy Self Test
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Tests connection to Alchemy via <code className="bg-gray-100 px-2 py-1 rounded">/api/rpc</code> with x-chain header
          </p>

          <Button
            onClick={testRPC}
            disabled={loading}
            className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Test Again
              </>
            )}
          </Button>

          {err ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Error</p>
                  <p className="text-sm text-red-700">{err}</p>
                  <div className="mt-3 text-xs text-red-600">
                    <p className="font-semibold mb-1">Troubleshooting:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check your Alchemy API key in <code>.env</code></li>
                      <li>Ensure <code>ALCHEMY_API_URL</code> is set correctly</li>
                      <li>Format: <code>https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <BlockResult chain="Ethereum Mainnet" block={ethBlock} loading={loading} />
              <BlockResult chain="Base Mainnet" block={baseBlock} loading={loading} />
              <BlockResult chain="Polygon Mainnet" block={polygonBlock} loading={loading} />
            </div>
          )}

          {!err && !loading && ethBlock && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-green-900">All tests passed!</p>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Your Alchemy RPC proxy is working correctly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BlockResult({
  chain,
  block,
  loading,
}: {
  chain: string;
  block: number | null;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div>
        <p className="font-medium text-gray-900">{chain}</p>
        <p className="text-xs text-gray-500">Latest block number</p>
      </div>
      <div className="text-right">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
        ) : block ? (
          <>
            <p className="text-2xl font-bold text-gray-900">{block.toLocaleString()}</p>
            <CheckCircle className="w-4 h-4 text-green-600 ml-auto mt-1" />
          </>
        ) : (
          <p className="text-gray-400">—</p>
        )}
      </div>
    </div>
  );
}
