"use client";

import { useState, useEffect, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  User as UserIcon,
  Wallet,
  Paperclip,
  Image as ImageIcon,
  FileCode,
  File,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  file?: {
    name: string;
    type: string;
    data: string;
  };
  txHash?: string;
}

const FREE_QUERY_LIMIT = 5;

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [freeQueryCount, setFreeQueryCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { authenticated, user, login } = usePrivy();
  const { wallets } = useWallets();
  const router = useRouter();

  const walletAddress = user?.wallet?.address;

  // Load free query count for unauthenticated users
  useEffect(() => {
    if (!authenticated) {
      const stored = localStorage.getItem('chainbot_free_queries');
      if (stored) {
        setFreeQueryCount(parseInt(stored, 10));
      }
    } else {
      // Reset count when authenticated
      setFreeQueryCount(0);
    }
  }, [authenticated]);

  // Load messages from localStorage on mount
  useEffect(() => {
    const storageKey = authenticated && walletAddress 
      ? `chainbot_widget_${walletAddress}`
      : 'chainbot_widget_guest';
      
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load messages:", e);
      }
    }
  }, [walletAddress, authenticated]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      const storageKey = authenticated && walletAddress 
        ? `chainbot_widget_${walletAddress}`
        : 'chainbot_widget_guest';
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, walletAddress, authenticated]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);

    // Create preview based on file type
    const isImage = file.type.startsWith("image/");
    const isText = file.type.startsWith("text/") || 
                   file.name.endsWith(".sol") || 
                   file.name.endsWith(".txt") ||
                   file.name.endsWith(".json") ||
                   file.name.endsWith(".js") ||
                   file.name.endsWith(".ts") ||
                   file.name.endsWith(".md");

    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (isText) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsText(file);
    } else {
      // For other file types, just store the name
      setFilePreview(null);
    }

    toast.success(`${file.name} uploaded successfully`);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || isLoading) return;

    // Check free query limit for unauthenticated users
    if (!authenticated && freeQueryCount >= FREE_QUERY_LIMIT) {
      const limitMessage: Message = {
        role: "assistant",
        content: "🔒 You've reached the free query limit (5 queries).\n\n💡 Connect your wallet and go to the dashboard for unlimited queries!\n\n✨ Benefits:\n• Unlimited AI queries\n• Advanced blockchain analytics\n• Transaction history\n• Portfolio tracking\n\nClick 'Connect Wallet' to get started! 🚀",
        timestamp: Date.now()
      };
      setMessages([...messages, limitMessage]);
      return;
    }

    const userMessage = message.trim() || `[Uploaded ${selectedFile?.name}]`;
    setMessage("");
    setIsLoading(true);

    // Prepare file data if present
    let fileData = null;
    if (selectedFile && filePreview) {
      fileData = {
        name: selectedFile.name,
        type: selectedFile.type || "application/octet-stream",
        data: filePreview
      };
    } else if (selectedFile) {
      // For binary files without preview
      fileData = {
        name: selectedFile.name,
        type: selectedFile.type || "application/octet-stream",
        data: `[Binary file: ${selectedFile.name}]`
      };
    }

    // Add user message
    const newUserMessage: Message = {
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
      file: fileData || undefined
    };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    // Clear file after adding to message
    clearFile();

    // Increment free query count for unauthenticated users
    if (!authenticated) {
      const newCount = freeQueryCount + 1;
      setFreeQueryCount(newCount);
      localStorage.setItem('chainbot_free_queries', newCount.toString());
    }

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          messages: updatedMessages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          wallet_address: walletAddress,
          file: fileData
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add assistant response
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
          txHash: data.txHash
        };
        setMessages([...updatedMessages, assistantMessage]);

        // Show remaining queries warning
        if (!authenticated && freeQueryCount + 1 >= FREE_QUERY_LIMIT - 1) {
          const remainingQueries = FREE_QUERY_LIMIT - (freeQueryCount + 1);
          if (remainingQueries > 0) {
            toast.warning(`${remainingQueries} free ${remainingQueries === 1 ? 'query' : 'queries'} remaining. Connect wallet for unlimited access!`);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <File className="w-4 h-4" />;
    
    if (selectedFile.type.startsWith("image/")) {
      return <ImageIcon className="w-4 h-4 text-purple-600" />;
    } else if (selectedFile.name.endsWith(".sol") || selectedFile.type.startsWith("text/")) {
      return <FileCode className="w-4 h-4 text-purple-600" />;
    }
    return <File className="w-4 h-4 text-purple-600" />;
  };

  const handleConnectWallet = () => {
    login();
  };

  const handleGoToDashboard = () => {
    if (authenticated) {
      router.push('/dashboard');
      setIsOpen(false);
    } else {
      toast.info("Please connect your wallet first");
    }
  };

  const remainingFreeQueries = authenticated ? null : Math.max(0, FREE_QUERY_LIMIT - freeQueryCount);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50 hover:scale-110"
        >
          <MessageSquare className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </button>
      )}

      {/* Widget Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-96 h-[calc(100vh-2rem)] md:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">ChainBot</h3>
                <p className="text-xs text-white/80">
                  {authenticated ? 'AI Web3 Assistant' : `${remainingFreeQueries} free ${remainingFreeQueries === 1 ? 'query' : 'queries'} left`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {authenticated && messages.length > 0 && (
                <button
                  onClick={handleGoToDashboard}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                  title="Go to Dashboard"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-gray-50 to-purple-50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-2">
                  Hi! I'm ChainBot. Ask me anything about:
                </p>
                <ul className="text-xs text-gray-500 space-y-1 mb-4">
                  <li>💰 Check wallet balances</li>
                  <li>🔄 Guide token transfers</li>
                  <li>📜 Analyze smart contracts</li>
                  <li>📊 View transaction history</li>
                  <li>📎 Upload any file for analysis</li>
                  <li>⛽ Check gas prices</li>
                </ul>
                {!authenticated && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-700 font-medium">
                      🎁 Try {FREE_QUERY_LIMIT} free queries without connecting!
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Connect wallet for unlimited access
                    </p>
                  </div>
                )}
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm break-words ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.file && (
                      <div className="mb-2 pb-2 border-b border-white/20">
                        {msg.file.type.startsWith("image/") ? (
                          <img 
                            src={msg.file.data} 
                            alt={msg.file.name}
                            className="rounded-lg max-w-full h-auto mb-1"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-xs">
                            <FileCode className="w-4 h-4" />
                            <span className="font-mono break-all">{msg.file.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                      {msg.content}
                    </p>
                    {msg.txHash && (
                      <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-1 text-xs">
                        <a 
                          href={`https://etherscan.io/tx/${msg.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Transaction
                        </a>
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <UserIcon className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
            {/* Connect Wallet Banner for unauthenticated users */}
            {!authenticated && (
              <div className="mb-3 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-700">
                    <Wallet className="w-3 h-3 inline mr-1" />
                    Connect for unlimited access
                  </p>
                  <Button
                    onClick={handleConnectWallet}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs h-7 px-3"
                  >
                    Connect
                  </Button>
                </div>
              </div>
            )}

            {/* File Preview */}
            {selectedFile && (
              <div className="mb-2 p-2 bg-purple-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {selectedFile.type.startsWith("image/") && filePreview ? (
                    <>
                      <img 
                        src={filePreview} 
                        alt={selectedFile.name}
                        className="h-10 w-10 object-cover rounded flex-shrink-0"
                      />
                      <span className="text-xs text-gray-700 truncate">{selectedFile.name}</span>
                    </>
                  ) : (
                    <>
                      {getFileIcon()}
                      <span className="text-xs text-gray-700 truncate font-mono">{selectedFile.name}</span>
                    </>
                  )}
                </div>
                <button
                  onClick={clearFile}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="icon"
                className="rounded-xl flex-shrink-0"
                disabled={isLoading || !!selectedFile}
                title="Upload any file - AI validates blockchain relevance"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={selectedFile ? "Add message (optional)" : "Ask about balance, transfers..."}
                className="flex-1 text-sm rounded-xl border-2 border-gray-200 focus:border-purple-400"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={(!message.trim() && !selectedFile) || isLoading}
                size="icon"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}