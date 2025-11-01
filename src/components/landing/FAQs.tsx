"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Arion?",
    answer: "Arion is an AI-driven support chatbot platform specifically designed for DeFi and Web3 applications. It uses GPT-4o from AIML API to provide intelligent, context-aware responses about blockchain, tokens, smart contracts, and personalized wallet support.",
  },
  {
    question: "How does wallet integration work?",
    answer: "Arion integrates with your wallet using Privy authentication. Once connected, the chatbot can access your wallet address and provide personalized support based on your holdings, transaction history, and portfolio. All data is secure and only used to enhance your support experience.",
  },
  {
    question: "What kind of questions can I ask Arion?",
    answer: "You can ask about token prices, DeFi protocols, smart contract interactions, gas fees, transaction history, portfolio analysis, and general Web3 concepts. Arion understands blockchain-specific terminology and provides accurate, up-to-date information.",
  },
  {
    question: "Can I embed Arion on my own site?",
    answer: "Yes! Arion is designed to be easily embeddable as a widget on any DeFi or Web3 website. It's marketplace-ready and can be deployed quickly by developers to provide instant AI-powered support for your users.",
  },
  {
    question: "Is my wallet data safe?",
    answer: "Absolutely. Arion only reads public blockchain data associated with your wallet address. We never request or store your private keys or seed phrases. All communications are encrypted, and we follow best practices for Web3 security.",
  },
  {
    question: "How accurate is the AI?",
    answer: "Arion is powered by GPT-4o from AIML API, one of the most advanced language models available. It's specifically trained to understand Web3 contexts and provides highly accurate responses. For real-time data like token prices, we pull from live blockchain sources.",
  },
];

export function FAQs() {
  return (
    <section id="faqs" className="py-24 px-4 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Arion
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white border-2 border-gray-100 rounded-2xl px-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 hover:text-purple-600 py-6">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-6">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
