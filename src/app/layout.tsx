import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Arion - Your AI Web3 Assistant",
  description: "AI-driven support chatbot platform for DeFi and Web3 applications powered by GPT-4o with wallet integration",
  icons: {
    icon: '/logo1.png',
    shortcut: '/logo1.png',
    apple: '/logo1.png',
  },
  openGraph: {
    title: "Arion - AI Web3 Assistant",
    description: "Intelligent AI chatbot for Web3 and DeFi applications",
    type: "website",
    images: ['/logo1.png'],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arion - AI Web3 Assistant",
    description: "Intelligent AI chatbot for Web3 and DeFi applications",
    images: ['/logo1.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <ErrorReporter />
          <Script
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
            strategy="afterInteractive"
            data-target-origin="*"
            data-message-type="ROUTE_CHANGE"
            data-include-search-params="true"
            data-only-in-iframe="true"
            data-debug="true"
            data-custom-data='{"appName": "Arion", "version": "1.0.0", "greeting": "hi"}'
          />
          {children}
          <VisualEditsMessenger />
        </Providers>
      </body>
    </html>
  )
}