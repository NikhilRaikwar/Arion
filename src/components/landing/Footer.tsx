"use client";

import { Github, Twitter } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center text-center">
          {/* Brand */}
          <div className="flex items-center gap-3 mb-3">
            <Image
              src="/logo1.png"
              alt="Arion Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
            <h3 className="text-4xl brand-font">
              ARION
            </h3>
          </div>
          <p className="text-gray-600 mb-8 max-w-xl text-sm">
            Your private AI assistant for Web3 and blockchain intelligence.
          </p>
          
          {/* Social Icons */}
          <div className="flex gap-4 mb-12">
            <a
              href="https://github.com/NikhilRaikwar"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 text-gray-700" />
            </a>
            <a
              href="https://x.com/nikhilraikwarr"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5 text-gray-700" />
            </a>
          </div>

          {/* Bottom Copyright */}
          <div className="border-t border-gray-200 pt-8 w-full">
            <p className="text-sm text-gray-500">
              © 2025 Arion. Built with NodeOps Template. Powered by AIML API.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}