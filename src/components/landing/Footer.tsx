"use client";

import { Github, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Brand */}
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
            ChainBot
          </h3>
          <p className="text-gray-400 mb-6 max-w-md">
            Your AI Web3 Assistant. Instant answers, smart support, powered by your wallet.
          </p>
          <div className="flex gap-4 mb-8">
            <a
              href="https://github.com/NikhilRaikwar"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://x.com/nikhilraikwarr"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-6 w-full">
            <p className="text-sm text-gray-500">
              © 2024 ChainBot. Built with NodeOps Template. Powered by AIML API.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}