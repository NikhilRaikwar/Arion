"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Brain, Wallet, Sparkles } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-Time Token Info",
    description: "Get instant access to live token prices, market data, and transaction information directly through conversational AI.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "Smart Contract Q&A",
    description: "Ask questions about smart contracts, DeFi protocols, and blockchain interactions. Get expert answers powered by GPT-4o.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Wallet,
    title: "Personalized Wallet Support",
    description: "Connect your wallet for tailored assistance based on your holdings, transaction history, and portfolio composition.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    icon: Sparkles,
    title: "Powered by AIML GPT-4o",
    description: "State-of-the-art AI technology ensures accurate, context-aware responses for all your Web3 queries and support needs.",
    gradient: "from-violet-500 to-purple-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Web3 Builders
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to provide intelligent, wallet-connected support for your DeFi and Web3 applications.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl group"
              >
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-purple-200">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span className="text-gray-700 font-medium">
              Embeddable widget • Developer-friendly API • Marketplace-ready
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
