"use client";

import { useEffect, useState } from "react";
import { Loader2, Image as ImageIcon, ExternalLink, AlertCircle } from "lucide-react";

const SUPPORTED_CHAINS = [
  { id: "ethereum", name: "Ethereum", logo: "🔷" },
  { id: "polygon", name: "Polygon", logo: "🟣" },
  { id: "arbitrum", name: "Arbitrum", logo: "🔵" },
  { id: "optimism", name: "Optimism", logo: "🔴" },
  { id: "base", name: "Base", logo: "🔵" },
];

interface NFT {
  contractAddress: string;
  tokenId: string;
  name: string | null;
  description: string | null;
  image: string | null;
  collection: string | null;
}

export function NFTGallery({ address }: { address: string }) {
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNFTs();
  }, [address, selectedChain]);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/alchemy/nfts?address=${address}&chain=${selectedChain}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch NFTs");
      }

      setNfts(data.nfts || []);
    } catch (err) {
      console.error("NFT fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch NFTs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">NFT Collection</h2>
          <button
            onClick={fetchNFTs}
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
            <span className="ml-3 text-gray-600">Loading NFTs...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading NFTs</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && nfts.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-medium">No NFTs found on {selectedChain}</p>
            <p className="text-sm text-gray-500 mt-2">
              Try selecting a different chain to explore your NFT collection
            </p>
          </div>
        )}

        {!loading && !error && nfts.length > 0 && (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Found <span className="font-semibold text-gray-900">{nfts.length}</span> NFT{nfts.length > 1 ? 's' : ''} on {selectedChain}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {nfts.map((nft, index) => (
                <NFTCard key={`${nft.contractAddress}-${nft.tokenId}-${index}`} nft={nft} chain={selectedChain} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NFTCard({ nft, chain }: { nft: NFT; chain: string }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 hover:shadow-lg transition-all">
      <div className="aspect-square bg-gray-100 relative">
        {nft.image && !imageError ? (
          <img
            src={nft.image}
            alt={nft.name || "NFT"}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-300" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate mb-1">
          {nft.name || `#${nft.tokenId}`}
        </h3>
        <p className="text-xs text-gray-500 truncate mb-2">
          {nft.collection || "Unknown Collection"}
        </p>
        
        {nft.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3">
            {nft.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Token ID: {nft.tokenId}</span>
          <a
            href={`https://${chain === "ethereum" ? "" : chain + "."}etherscan.io/token/${nft.contractAddress}?a=${nft.tokenId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-purple-600 hover:text-purple-800"
          >
            <span>View</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
