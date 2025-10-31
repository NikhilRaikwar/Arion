'use client';

import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export const Header = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuth = () => {
    if (authenticated) {
      logout();
    } else {
      login();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">CB</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ChainBot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Features
            </Link>
            <Link href="#faqs" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              FAQs
            </Link>
            <Link href="/chat" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Try Chat
            </Link>
            <Link href="/widget-demo" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Widget Demo
            </Link>
          </nav>

          {/* Wallet Button */}
          <div className="hidden md:block">
            <Button
              onClick={handleAuth}
              disabled={!ready}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              {!ready ? (
                'Loading...'
              ) : authenticated && user?.wallet?.address ? (
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  {formatAddress(user.wallet.address)}
                  <LogOut className="w-4 h-4 ml-2" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-blue-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col gap-4">
              <Link
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#faqs"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQs
              </Link>
              <Link
                href="/chat"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Try Chat
              </Link>
              <Link
                href="/widget-demo"
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Widget Demo
              </Link>
              <Button
                onClick={() => {
                  handleAuth();
                  setMobileMenuOpen(false);
                }}
                disabled={!ready}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg w-full"
              >
                {!ready ? (
                  'Loading...'
                ) : authenticated && user?.wallet?.address ? (
                  <span className="flex items-center gap-2 justify-center">
                    <Wallet className="w-4 h-4" />
                    {formatAddress(user.wallet.address)}
                    <LogOut className="w-4 h-4 ml-2" />
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </span>
                )}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};