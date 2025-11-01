"use client";

import { MessageSquare, Bot, Shield, Database, Blocks, FileCode, Wallet, Activity } from "lucide-react";

const mainFeatures = [
  {
    icon: MessageSquare,
    title: "Private AI Chat",
    description: "Powered by GPT-4o with complete privacy and no data tracking.",
    features: [
      "End-to-end encryption",
      "No logs used for training",
      "Full conversation control"
    ]
  },
  {
    icon: Database,
    title: "Real Blockchain Data",
    description: "Live data from Alchemy APIs across multiple chains.",
    features: [
      "Wallet balance checks",
      "NFT collections viewing",
      "Transaction history",
      "Multi-chain support"
    ]
  },
  {
    icon: FileCode,
    title: "Smart Contract Analysis",
    description: "AI-powered security auditing and contract validation.",
    features: [
      "Solidity code analysis",
      "Security vulnerability detection",
      "Contract validation"
    ]
  }
];

const whyFeatures = [
  {
    icon: Shield,
    title: "Truly Private AI",
    description: "Your conversations are encrypted and never used for AI training. Complete privacy guaranteed."
  },
  {
    icon: Bot,
    title: "GPT-4o Powered",
    description: "Access the latest GPT-4o model for intelligent blockchain and Web3 assistance."
  },
  {
    icon: Wallet,
    title: "Wallet Integration",
    description: "Seamless Privy wallet connection for personalized blockchain data and queries."
  },
  {
    icon: Database,
    title: "Multi-Chain Support",
    description: "Query data across Ethereum, Polygon, Base, Optimism, and Arbitrum networks."
  },
  {
    icon: Activity,
    title: "Live Blockchain Data",
    description: "Real-time token balances, NFTs, and transaction history via Alchemy APIs."
  },
  {
    icon: FileCode,
    title: "File Analysis",
    description: "Upload Solidity contracts, images, or documents for AI-powered blockchain analysis."
  }
];

export function Features() {
  return (
    <>
      {/* Main Features Section */}
      <section id="features" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Meet ChainBot — Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Private AI Workspace
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chat, create, and research with complete privacy. No data tracking, no ads—just powerful AI for you.
            </p>
          </div>

          {/* Features Grid with Image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-100">
              <div className="aspect-[4/5] bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                    <Bot className="w-16 h-16 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">ChainBot AI</h3>
                  <p className="text-gray-600">Your Private Web3 Assistant</p>
                </div>
              </div>
            </div>

            {/* Right: Feature Cards */}
            <div className="space-y-6">
              {mainFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="p-8 rounded-2xl border-2 border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                        <p className="text-gray-600 mb-4">{feature.description}</p>
                        <ul className="space-y-2">
                          {feature.features.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Why Professionals Choose{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChainBot
              </span>
            </h2>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
