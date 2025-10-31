'use client';

import { ChatWidget } from '@/components/ChatWidget';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function WidgetDemoPage() {
  const [copied, setCopied] = useState(false);

  const integrationCode = `// Install dependencies
npm install @privy-io/react-auth

// Add to your layout.tsx or _app.tsx
import { PrivyProvider } from '@privy-io/react-auth';
import { ChatWidget } from './components/ChatWidget';

export default function App({ children }) {
  return (
    <PrivyProvider
      appId="your-privy-app-id"
      config={{
        loginMethods: ['wallet', 'email'],
        appearance: {
          theme: 'light',
          accentColor: '#667eea',
        },
      }}
    >
      {children}
      <ChatWidget 
        apiEndpoint="/api/chat"
        position="bottom-right"
        primaryColor="#3b82f6"
      />
    </PrivyProvider>
  );
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(integrationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-16 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Embeddable Chat Widget Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See ChainBot in action! The widget appears in the bottom-right corner. 
            Integrate it into your DeFi or Web3 application with just a few lines of code.
          </p>
        </div>

        {/* Demo Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Features */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Widget Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Wallet Integration</p>
                    <p className="text-sm text-gray-600">Connects with Privy for secure wallet authentication</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">AI-Powered Responses</p>
                    <p className="text-sm text-gray-600">Uses GPT-4o via AIML API for intelligent answers</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Context-Aware</p>
                    <p className="text-sm text-gray-600">Maintains conversation history and user context</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Customizable</p>
                    <p className="text-sm text-gray-600">Configure position, colors, and API endpoints</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Responsive Design</p>
                    <p className="text-sm text-gray-600">Works seamlessly on all devices</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-bold text-sm">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Unread Notifications</p>
                    <p className="text-sm text-gray-600">Badge shows unread message count</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Props Configuration */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Configuration Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-900 mb-1">apiEndpoint</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Custom API endpoint for chat processing
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    default: "/api/chat"
                  </code>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">position</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Widget placement on screen
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    "bottom-right" | "bottom-left"
                  </code>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">primaryColor</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Theme color for widget elements
                  </p>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    default: "#3b82f6"
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Code */}
        <Card className="border-2 border-blue-200 mb-12">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Code className="w-6 h-6 text-blue-600" />
                Integration Code
              </CardTitle>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
              <code className="text-sm">{integrationCode}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Quick Setup Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Install Dependencies</p>
                  <p className="text-sm text-gray-600">
                    Install Privy for wallet authentication: <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">npm install @privy-io/react-auth</code>
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Copy Widget Component</p>
                  <p className="text-sm text-gray-600">
                    Copy the <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">ChatWidget.tsx</code> component to your project
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Setup API Route</p>
                  <p className="text-sm text-gray-600">
                    Create <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">/api/chat/route.ts</code> with AIML API integration
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Configure Environment</p>
                  <p className="text-sm text-gray-600">
                    Add your Privy App ID and AIML API key to <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">.env</code>
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                  5
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Add to Your App</p>
                  <p className="text-sm text-gray-600">
                    Wrap your app with PrivyProvider and add the ChatWidget component
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Live Widget Demo Note */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-xl px-6 py-4">
            <p className="text-gray-700 font-semibold mb-2">
              👉 Check the bottom-right corner to see the live widget in action!
            </p>
            <p className="text-sm text-gray-600">
              Click the chat button to start a conversation with ChainBot
            </p>
          </div>
        </div>
      </div>

      {/* Actual Widget Instance */}
      <ChatWidget />
    </div>
  );
}
