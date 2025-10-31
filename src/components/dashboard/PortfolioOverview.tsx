"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Wallet, AlertCircle } from "lucide-react";

interface TokenBalance {
  contractAddress: string;
  balance: string;
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  logo: string | null;
}

interface ChainPortfolio {
  chain: string;
  status: string;
  data: {
    nativeBalance: string;
    tokens: TokenBalance[];
  } | null;
  error: any;
}

const chainLogos: Record<string, string> = {
  ethereum: "🔷",
  polygon: "🟣",
  arbitrum: "🔵",
  optimism: "🔴",
  base: "🔵",
};

export function PortfolioOverview({ address }: { address: string }) {
  const [portfolios, setPortfolios] = useState<ChainPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, [address]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/alchemy/portfolio?address=${address}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch portfolio");
      }

      setPortfolios(data.portfolios || []);
    } catch (err) {
      console.error("Portfolio fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch portfolio");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 text-gray-600">Loading portfolio across all chains...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Portfolio</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchPortfolio}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Multi-Chain Portfolio</h2>
          <button
            onClick={fetchPortfolio}
            className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((portfolio) => (
            <ChainCard key={portfolio.chain} portfolio={portfolio} />
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900">AI Portfolio Insights</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your portfolio is spread across {portfolios.filter(p => p.status === "fulfilled").length} chains.
              For detailed analysis and actionable suggestions, visit the AI Assistant tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChainCard({ portfolio }: { portfolio: ChainPortfolio }) {
  const chainName = portfolio.chain.charAt(0).toUpperCase() + portfolio.chain.slice(1);
  const chainLogo = chainLogos[portfolio.chain] || "⛓️";

  if (portfolio.status === "rejected" || !portfolio.data) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-2xl">{chainLogo}</span>
          <h3 className="font-semibold text-gray-900">{chainName}</h3>
        </div>
        <p className="text-sm text-gray-500">Unable to load data</p>
      </div>
    );
  }

  const { nativeBalance, tokens } = portfolio.data;
  const nativeBalanceFormatted = (parseInt(nativeBalance) / 1e18).toFixed(4);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">{chainLogo}</span>
        <h3 className="font-semibold text-gray-900">{chainName}</h3>
      </div>

      <div className="space-y-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Native Balance</p>
          <p className="text-lg font-bold text-gray-900">{nativeBalanceFormatted}</p>
          <p className="text-xs text-gray-500">
            {portfolio.chain === "ethereum" ? "ETH" :
             portfolio.chain === "polygon" ? "MATIC" :
             portfolio.chain === "arbitrum" ? "ETH" :
             portfolio.chain === "optimism" ? "ETH" :
             portfolio.chain === "base" ? "ETH" : ""}
          </p>
        </div>

        {tokens.length > 0 && (
          <div>
            <p className="text-xs text-gray-600 mb-2">{tokens.length} Token{tokens.length > 1 ? 's' : ''}</p>
            <div className="space-y-2">
              {tokens.slice(0, 3).map((token, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                  <div className="flex items-center space-x-2">
                    {token.logo && (
                      <img src={token.logo} alt={token.symbol || ""} className="w-5 h-5 rounded-full" />
                    )}
                    <span className="font-medium">{token.symbol || "Unknown"}</span>
                  </div>
                  <span className="text-gray-600 text-xs">
                    {token.decimals ? (parseInt(token.balance || "0") / Math.pow(10, token.decimals)).toFixed(2) : ""}
                  </span>
                </div>
              ))}
              {tokens.length > 3 && (
                <p className="text-xs text-gray-500 text-center">+{tokens.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        {tokens.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-2">No tokens found</p>
        )}
      </div>
    </div>
  );
}
