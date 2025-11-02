"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Send, 
  Loader2, 
  Bot,
  User as UserIcon,
  Sparkles,
  Wallet,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { FormattedMessage } from "@/components/shared/FormattedMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const FREE_QUERY_LIMIT = 5;

export default function TempChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [freeQueryCount, setFreeQueryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedPendingQuery = useRef(false);
  const { authenticated, login } = usePrivy();
  const router = useRouter();

  // Load free query count
  useEffect(() => {
    const stored = localStorage.getItem('arion_free_queries');
    if (stored) {
      setFreeQueryCount(parseInt(stored, 10));
    }
  }, []);

  // If user is authenticated, redirect to dashboard
  useEffect(() => {
    if (authenticated) {
      router.push("/dashboard");
    }
  }, [authenticated, router]);

  // Process pending query from Hero
  useEffect(() => {
    if (hasProcessedPendingQuery.current) return;
    
    const pendingQuery = localStorage.getItem('arion_pending_query');
    if (pendingQuery) {
      hasProcessedPendingQuery.current = true;
      setMessage(pendingQuery);
      localStorage.removeItem('arion_pending_query');
      
      // Auto-send after short delay
      setTimeout(() => {
        sendMessageWithContent(pendingQuery);
      }, 500);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageWithContent = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    // Check free query limit
    if (freeQueryCount >= FREE_QUERY_LIMIT) {
      toast.error(`You've used all ${FREE_QUERY_LIMIT} free queries. Connect wallet for unlimited access!`);
      return;
    }

    setMessage("");
    setIsLoading(true);

    // Add user message
    const newUserMessage: Message = {
      role: "user",
      content: messageContent,
      timestamp: Date.now(),
    };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    // Increment free query count
    const newCount = freeQueryCount + 1;
    setFreeQueryCount(newCount);
    localStorage.setItem('arion_free_queries', newCount.toString());

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageContent,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add assistant response
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        };
        setMessages([...updatedMessages, assistantMessage]);

        // Show warning if approaching limit
        if (newCount >= FREE_QUERY_LIMIT - 1) {
          const remainingQueries = FREE_QUERY_LIMIT - newCount;
          if (remainingQueries > 0) {
            toast.warning(`${remainingQueries} free ${remainingQueries === 1 ? 'query' : 'queries'} remaining!`);
          }
        }
      } else {
        toast.error("Failed to send message");
        setMessages(messages);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;
    await sendMessageWithContent(message.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConnectWallet = () => {
    // Save current chat to transfer to dashboard
    if (messages.length > 0) {
      localStorage.setItem('arion_temp_messages', JSON.stringify(messages));
    }
    login();
  };

  const remainingQueries = Math.max(0, FREE_QUERY_LIMIT - freeQueryCount);
  const isLimitReached = freeQueryCount >= FREE_QUERY_LIMIT;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push("/")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <Image
                src="/logo1.png"
                alt="Arion Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <div>
                <h1 className="text-xl md:text-2xl brand-font bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ARION
                </h1>
                <p className="text-xs text-gray-500">Try {FREE_QUERY_LIMIT} free queries</p>
              </div>
            </div>
            
            <Button
              onClick={handleConnectWallet}
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
          <CardContent className="p-4 md:p-6">
            {/* Query Counter */}
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Free Trial: {remainingQueries}/{FREE_QUERY_LIMIT} queries remaining
                    </p>
                    <p className="text-xs text-gray-600">
                      Connect wallet for unlimited access to all features
                    </p>
                  </div>
                </div>
                {remainingQueries <= 2 && remainingQueries > 0 && (
                  <Button
                    onClick={handleConnectWallet}
                    size="sm"
                    variant="outline"
                    className="gap-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                  >
                    <Wallet className="w-4 h-4" />
                    Upgrade Now
                  </Button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-3 md:p-6 mb-4 min-h-[400px] md:min-h-[500px] max-h-[500px] overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-purple-300 mb-4" />
                  <h4 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                    Welcome to Arion AI!
                  </h4>
                  <p className="text-sm md:text-base text-gray-600 max-w-md mb-6">
                    Try me with {FREE_QUERY_LIMIT} free queries! Ask about blockchain, DeFi, smart contracts, or Web3.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                    <Button
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4 text-sm"
                      onClick={() => setMessage("What is DeFi?")}
                    >
                      <span>What is DeFi?</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4 text-sm"
                      onClick={() => setMessage("Explain gas fees on Ethereum")}
                    >
                      <span>Explain gas fees</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4 text-sm"
                      onClick={() => setMessage("What are smart contracts?")}
                    >
                      <span>What are smart contracts?</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4 text-sm"
                      onClick={() => setMessage("How do NFTs work?")}
                    >
                      <span>How do NFTs work?</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 md:gap-4 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 md:w-6 md:h-6 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] md:max-w-3xl rounded-2xl px-4 py-3 md:px-6 md:py-4 break-words ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-white border border-gray-200 text-gray-800"
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base break-words overflow-wrap-anywhere">
                          <FormattedMessage content={msg.content} />
                        </div>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <UserIcon className="w-4 h-4 md:w-6 md:h-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-2 md:gap-4 justify-start">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 md:w-6 md:h-6 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 md:px-6 md:py-4">
                        <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-purple-600" />
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Limit Reached Message */}
            {isLimitReached && (
              <div className="mb-4 p-4 bg-purple-50 border-2 border-purple-300 rounded-xl">
                <div className="flex items-start gap-3">
                  <Wallet className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">Free Queries Used!</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      You've used all {FREE_QUERY_LIMIT} free queries. Connect your wallet to continue with unlimited access.
                    </p>
                    <Button
                      onClick={handleConnectWallet}
                      className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Wallet className="w-4 h-4" />
                      Connect Wallet for Unlimited Access
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2 md:gap-3">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isLimitReached ? "Connect wallet to continue..." : "Ask about blockchain, DeFi, Web3..."}
                className="flex-1 px-3 py-5 md:px-4 md:py-6 text-sm md:text-base rounded-xl border-2 border-gray-200 focus:border-purple-400"
                disabled={isLoading || isLimitReached}
              />
              {isLimitReached ? (
                <Button
                  onClick={handleConnectWallet}
                  className="px-4 py-5 md:px-6 md:py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl gap-2"
                >
                  <Wallet className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Connect</span>
                </Button>
              ) : (
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                  className="px-4 py-5 md:px-6 md:py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
