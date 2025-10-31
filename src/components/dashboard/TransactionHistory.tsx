"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowUpRight, ArrowDownLeft, ExternalLink, AlertCircle } from "lucide-react";

const SUPPORTED_CHAINS = [
  { id: "ethereum", name: "Ethereum", logo: "🔷" },
  { id: "polygon", name: "Polygon", logo: "🟣" },
  { id: "arbitrum", name: "Arbitrum", logo: "🔵" },
  { id: "optimism", name: "Optimism", logo: "🔴" },
  { id: "base", name: "Base", logo: "🔵" },
];

interface Transaction {
  blockNum: string;
  hash: string;
  from: string;
  to: string | null;
  value: number;
  asset: string | null;
  category: string;
  rawContract?: {
    address: string;
    value: string;
  };
}

export function TransactionHistory({ address }: { address: string }) {
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [address, selectedChain]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/alchemy/transactions?address=${address}&chain=${selectedChain}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch transactions");
      }

      setTransactions(data.transactions || []);
    } catch (err) {
      console.error("Transaction fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {/* Chain Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Chain
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {SUPPORTED_CHAINS.map((chain) => (
              <button
                key={chain.id}
                onClick={() => setSelectedChain(chain.id)}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-all ${
                  selectedChain === chain.id
                    ? "border-purple-600 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-xl">{chain.logo}</span>
                <span className="text-sm font-medium">{chain.name}</span>
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600">Loading transactions...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Transactions</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && transactions.length === 0 && (
          <div className="text-center py-12">
            <ArrowUpRight className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No transactions found</p>
            <p className="text-sm text-gray-500 mt-2">
              Try selecting a different chain to view transaction history
            </p>
          </div>
        )}

        {!loading && !error && transactions.length > 0 && (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{transactions.length}</span> recent transaction{transactions.length > 1 ? 's' : ''} on {selectedChain}
              </p>
            </div>

            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <TransactionCard
                  key={`${tx.hash}-${index}`}
                  transaction={tx}
                  userAddress={address}
                  chain={selectedChain}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TransactionCard({
  transaction,
  userAddress,
  chain,
}: {
  transaction: Transaction;
  userAddress: string;
  chain: string;
}) {
  const isOutgoing = transaction.from.toLowerCase() === userAddress.toLowerCase();
  const explorerUrl = `https://${chain === "ethereum" ? "" : chain + "."}etherscan.io/tx/${transaction.hash}`;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`p-2 rounded-lg ${
            isOutgoing ? "bg-red-100" : "bg-green-100"
          }`}>
            {isOutgoing ? (
              <ArrowUpRight className={`w-5 h-5 ${isOutgoing ? "text-red-600" : "text-green-600"}`} />
            ) : (
              <ArrowDownLeft className="w-5 h-5 text-green-600" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`text-sm font-semibold ${
                isOutgoing ? "text-red-600" : "text-green-600"
              }`}>
                {isOutgoing ? "Sent" : "Received"}
              </span>
              <span className="text-xs text-gray-500">
                {transaction.category}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">From:</span>
                <span className="text-xs font-mono text-gray-700 truncate">
                  {transaction.from.slice(0, 10)}...{transaction.from.slice(-8)}
                </span>
              </div>
              {transaction.to && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">To:</span>
                  <span className="text-xs font-mono text-gray-700 truncate">
                    {transaction.to.slice(0, 10)}...{transaction.to.slice(-8)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-2 flex items-center space-x-4">
              <span className="text-xs text-gray-500">
                Block: {transaction.blockNum}
              </span>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-800"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="text-right ml-4">
          <p className={`font-semibold ${
            isOutgoing ? "text-red-600" : "text-green-600"
          }`}>
            {isOutgoing ? "-" : "+"}{transaction.value.toFixed(4)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {transaction.asset || "ETH"}
          </p>
        </div>
      </div>
    </div>
  );
}
