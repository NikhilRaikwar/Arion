"use client";

import { useState } from "react";
import { Upload, Shield, CheckCircle, XCircle, Loader2, Code, FileText } from "lucide-react";

const SUPPORTED_CHAINS = [
  { id: "ethereum", name: "Ethereum", logo: "🔷" },
  { id: "polygon", name: "Polygon", logo: "🟣" },
  { id: "arbitrum", name: "Arbitrum", logo: "🔵" },
  { id: "optimism", name: "Optimism", logo: "🔴" },
  { id: "base", name: "Base", logo: "🔵" },
];

interface ValidationResult {
  valid: boolean;
  isContract?: boolean;
  message?: string;
  metadata?: any;
  code?: string;
  creator?: string | null;
  creationTx?: string | null;
}

export function ContractInteraction() {
  const [contractAddress, setContractAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [dragActive, setDragActive] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload for contract ABI/address
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          // Try to extract contract address from file
          const addressMatch = content.match(/0x[a-fA-F0-9]{40}/);
          if (addressMatch) {
            setContractAddress(addressMatch[0]);
          }
        } catch (error) {
          console.error("Error reading file:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const validateContract = async () => {
    if (!contractAddress) return;

    try {
      setLoading(true);
      setValidationResult(null);

      const response = await fetch("/api/alchemy/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: contractAddress,
          chain: selectedChain,
          action: "validate",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setValidationResult({
          valid: false,
          message: data.error || "Validation failed",
        });
        return;
      }

      setValidationResult(data);
    } catch (error) {
      console.error("Validation error:", error);
      setValidationResult({
        valid: false,
        message: "Network error during validation",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Smart Contract Interaction</h2>

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

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            dragActive
              ? "border-purple-600 bg-purple-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium mb-2">
            Drop contract file or paste address
          </p>
          <p className="text-sm text-gray-500">
            Supports ABI files, contract addresses, or text files
          </p>
        </div>

        {/* Contract Address Input */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contract Address
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
            <button
              onClick={validateContract}
              disabled={!contractAddress || loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Validate</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <div className="mt-6">
            {validationResult.valid ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 text-lg">
                      Valid Smart Contract ✅
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      Contract verified on {selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {validationResult.metadata?.name && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">Token Name</p>
                      <p className="font-semibold text-gray-900">{validationResult.metadata.name}</p>
                    </div>
                  )}
                  {validationResult.metadata?.symbol && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">Symbol</p>
                      <p className="font-semibold text-gray-900">{validationResult.metadata.symbol}</p>
                    </div>
                  )}
                  {validationResult.creator && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">Creator</p>
                      <p className="font-mono text-xs text-gray-900">{validationResult.creator}</p>
                    </div>
                  )}
                  {validationResult.metadata?.decimals && (
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-1">Decimals</p>
                      <p className="font-semibold text-gray-900">{validationResult.metadata.decimals}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Code className="w-4 h-4" />
                    <span>View Contract Code</span>
                  </button>
                  <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Ask AI About Contract</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 text-lg">
                      Validation Failed
                    </h3>
                    <p className="text-sm text-red-700 mt-1">
                      {validationResult.message || "Unable to validate contract"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <Shield className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Security Check</h3>
          <p className="text-sm text-gray-600">
            Validate contract bytecode and verify creator information
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <Code className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Read Functions</h3>
          <p className="text-sm text-gray-600">
            Query contract state and read public variables
          </p>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-xl p-6">
          <FileText className="w-8 h-8 text-pink-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
          <p className="text-sm text-gray-600">
            Get AI-powered insights about contract functionality
          </p>
        </div>
      </div>
    </div>
  );
}
