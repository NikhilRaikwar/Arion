"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Send, 
  Loader2, 
  Bot,
  User as UserIcon,
  Plus,
  Sparkles,
  Paperclip,
  X
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  image?: string;
}

interface AIAssistantProps {
  walletAddress?: string;
}

export function AIAssistant({ walletAddress }: AIAssistantProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachedImage(event.target?.result as string);
      toast.success("Image attached");
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !attachedImage) || isLoading) return;

    const userMessage = message.trim();
    const imageData = attachedImage;
    setMessage("");
    setAttachedImage(null);
    setIsLoading(true);

    // Add user message
    const newUserMessage: Message = {
      role: "user",
      content: userMessage || "Analyze this blockchain-related image",
      timestamp: Date.now(),
      image: imageData || undefined,
    };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage || "Analyze this blockchain-related image",
          messages: updatedMessages.map(m => ({ 
            role: m.role, 
            content: m.content,
            image: m.image 
          })),
          wallet_address: walletAddress,
          image: imageData,
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
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to send message");
        // Remove the user message on error
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setAttachedImage(null);
    toast.success("Started new chat");
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-purple-200">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900">ChainBot AI Assistant</h3>
                <p className="text-xs md:text-sm text-gray-600">Powered by GPT-4o & Alchemy APIs</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-300 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            )}
          </div>

          {/* Messages Area */}
          <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-3 md:p-6 mb-4 min-h-[400px] md:min-h-[500px] max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-purple-300 mb-4" />
                <h4 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
                  Welcome to ChainBot AI!
                </h4>
                <p className="text-sm md:text-base text-gray-600 max-w-md mb-6">
                  Ask me anything about blockchain, DeFi, smart contracts, or your wallet.
                  You can also attach blockchain-related images for analysis.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  <Button
                    variant="outline"
                    className="justify-start text-left h-auto py-3 px-4 text-sm"
                    onClick={() => setMessage("What is the latest block on Ethereum?")}
                  >
                    <span>What is the latest block on Ethereum?</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start text-left h-auto py-3 px-4 text-sm"
                    onClick={() => setMessage("Explain gas fees on Ethereum")}
                  >
                    <span>Explain gas fees on Ethereum</span>
                  </Button>
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
                    onClick={() => setMessage("How do smart contracts work?")}
                  >
                    <span>How do smart contracts work?</span>
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
                      className={`max-w-[85%] md:max-w-3xl rounded-2xl px-4 py-3 md:px-6 md:py-4 ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                          : "bg-white border border-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.image && (
                        <img 
                          src={msg.image} 
                          alt="Attached" 
                          className="rounded-lg mb-2 max-w-full h-auto max-h-64 object-contain"
                        />
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                        {msg.content}
                      </p>
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

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="mb-4 relative inline-block">
              <img 
                src={attachedImage} 
                alt="Attached preview" 
                className="rounded-lg max-h-32 border-2 border-purple-300"
              />
              <button
                onClick={() => setAttachedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-2 md:gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileAttach}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex-shrink-0 rounded-xl border-2 border-gray-200 hover:border-purple-400"
              title="Attach blockchain-related image"
            >
              <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about blockchain, DeFi, or attach an image..."
              className="flex-1 px-3 py-5 md:px-4 md:py-6 text-sm md:text-base rounded-xl border-2 border-gray-200 focus:border-purple-400"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={(!message.trim() && !attachedImage) || isLoading}
              className="px-4 py-5 md:px-6 md:py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              ) : (
                <Send className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}