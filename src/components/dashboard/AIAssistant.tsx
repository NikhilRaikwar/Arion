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
  X,
  FileCode,
  Image as ImageIcon,
  File
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  file?: {
    name: string;
    type: string;
    data: string;
  };
}

interface AIAssistantProps {
  walletAddress?: string;
}

export function AIAssistant({ walletAddress }: AIAssistantProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File must be less than 10MB");
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
      setFilePreview(null);
    }

    toast.success(`${file.name} uploaded`);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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

  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || isLoading) return;

    const userMessage = message.trim() || `[Uploaded ${selectedFile?.name}]`;
    setMessage("");
    setIsLoading(true);

    // Prepare file data
    let fileData = null;
    if (selectedFile && filePreview) {
      fileData = {
        name: selectedFile.name,
        type: selectedFile.type || "application/octet-stream",
        data: filePreview
      };
    } else if (selectedFile) {
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
      file: fileData || undefined,
    };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    // Clear file
    clearFile();

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          messages: updatedMessages.map(m => ({ 
            role: m.role, 
            content: m.content,
            file: m.file 
          })),
          wallet_address: walletAddress,
          file: fileData,
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
    setSelectedFile(null);
    setFilePreview(null);
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
                  Upload ANY file for AI-powered analysis.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  <Button
                    variant="outline"
                    className="justify-start text-left h-auto py-3 px-4 text-sm"
                    onClick={() => setMessage("What's my balance?")}
                  >
                    <span>What's my balance?</span>
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
                    onClick={() => setMessage("How do I transfer tokens?")}
                  >
                    <span>How do I transfer tokens?</span>
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
                      {msg.file && (
                        <div className="mb-2 pb-2 border-b border-white/20">
                          {msg.file.type.startsWith("image/") ? (
                            <img 
                              src={msg.file.data} 
                              alt={msg.file.name}
                              className="rounded-lg max-w-full h-auto max-h-64 object-contain mb-1"
                            />
                          ) : (
                            <div className="flex items-center gap-2 text-xs opacity-80">
                              <FileCode className="w-4 h-4" />
                              <span className="font-mono">{msg.file.name}</span>
                            </div>
                          )}
                        </div>
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

          {/* File Preview */}
          {selectedFile && (
            <div className="mb-4 p-2 bg-purple-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {selectedFile.type.startsWith("image/") && filePreview ? (
                  <>
                    <img 
                      src={filePreview} 
                      alt={selectedFile.name}
                      className="h-12 w-12 object-cover rounded flex-shrink-0"
                    />
                    <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>
                  </>
                ) : (
                  <>
                    {getFileIcon()}
                    <span className="text-sm text-gray-700 truncate font-mono">{selectedFile.name}</span>
                  </>
                )}
              </div>
              <button
                onClick={clearFile}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
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
              accept="*/*"
              onChange={handleFileAttach}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || !!selectedFile}
              className="flex-shrink-0 rounded-xl border-2 border-gray-200 hover:border-purple-400"
              title="Upload any file - AI will validate if blockchain-related"
            >
              <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={selectedFile ? "Add message (optional)" : "Ask about balance, transfers, or upload files..."}
              className="flex-1 px-3 py-5 md:px-4 md:py-6 text-sm md:text-base rounded-xl border-2 border-gray-200 focus:border-purple-400"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={(!message.trim() && !selectedFile) || isLoading}
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