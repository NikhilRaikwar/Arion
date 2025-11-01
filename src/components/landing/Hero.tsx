"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      // Save query and go to temp chat
      localStorage.setItem('chainbot_pending_query', query.trim());
      router.push("/temp-chat");
    }
  };

  return (
    <section className="relative py-32 sm:py-40 overflow-hidden">
      {/* Clean white background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white -z-10"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center">
          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Meet ChainBot — Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Private AI Workspace
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto mb-12">
            Chat, create, and research with complete privacy. No data tracking, no ads—just powerful AI for you.
          </p>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative group">
              <input
                type="text"
                placeholder="How can I help you today?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-6 py-5 text-lg rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all shadow-sm hover:shadow-md"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all hover:scale-105"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}