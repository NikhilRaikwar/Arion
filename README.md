# Arion - AI Web3 Assistant

![Arion](https://img.shields.io/badge/Arion-AI%20Web3%20Assistant-blue?style=for-the-badge&logo=ethereum)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![GPT-4o](https://img.shields.io/badge/GPT--4o-AIML-purple?style=for-the-badge)

**Arion** is a modern, production-ready SaaS platform featuring an AI-driven support chatbot for DeFi and Web3 applications. Powered by GPT-4o via AIML API and integrated with Privy wallet authentication, Arion provides intelligent, context-aware assistance for blockchain users.

## 🌟 Features

- ✨ **AI-Powered Chat**: GPT-4o integration via AIML API for intelligent responses
- 🔐 **Wallet Integration**: Secure authentication with Privy (supports multiple wallets)
- 💬 **Context-Aware**: Personalized responses based on connected wallet
- 🎨 **Modern UI**: Clean, responsive design with blue/purple gradient theme
- 🚀 **Embeddable Widget**: Easy-to-integrate chat widget for any Web3 site
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile
- ⚡ **Real-Time Chat**: Instant message processing with conversation history
- 🎯 **DeFi Focused**: Specialized knowledge in DeFi, tokens, and smart contracts

## 🏗️ Architecture

```
Arion/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page with hero, features, FAQs
│   │   ├── chat/page.tsx         # Full-page chat interface
│   │   ├── widget-demo/page.tsx  # Widget demo & integration guide
│   │   └── api/
│   │       └── chat/route.ts     # AIML API integration endpoint
│   ├── components/
│   │   ├── Header.tsx            # Navigation header with wallet connect
│   │   ├── ChatWidget.tsx        # Embeddable chat widget
│   │   ├── Providers.tsx         # Privy provider wrapper
│   │   └── ui/                   # shadcn/ui components
│   └── lib/
│       └── utils.ts              # Utility functions
└── .env                          # Environment variables
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- AIML API Key ([Get one here](https://aimlapi.com))
- Privy App ID 
### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd arion
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Configure environment variables**

Edit `.env` file and add your AIML API key:

```env
# Already configured
NEXT_PUBLIC_PRIVY_APP_ID=PRIVY_APP_ID

# Add your AIML API key here
AIML_API_KEY=your_actual_aiml_api_key_here
```

4. **Run development server**
```bash
npm run dev
# or
bun dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 🔑 Getting API Keys

### AIML API Key

1. Visit [https://aimlapi.com](https://aimlapi.com)
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste into `.env` file

### Privy App ID (Already Configured)

The app is already configured with a Privy App ID. If you want to use your own:

1. Visit [https://privy.io](https://privy.io)
2. Create an account and new app
3. Copy your App ID
4. Update `NEXT_PUBLIC_PRIVY_APP_ID` in `.env`

## 📦 Deployment

### NodeOps Cloud Marketplace

This template is designed for deployment on NodeOps Cloud Marketplace:

1. **Build Docker image**
```bash
docker build -t arion .
```

2. **Push to container registry**
```bash
docker tag arion your-registry/arion:latest
docker push your-registry/arion:latest
```

3. **Deploy on NodeOps**
   - Upload your `nodeops_template.yaml`
   - Configure environment variables in NodeOps dashboard
   - Deploy and start earning revenue share!

### Traditional Deployment (Vercel, Netlify, etc.)

1. **Build for production**
```bash
npm run build
```

2. **Deploy to your platform**
   - Vercel: `vercel deploy`
   - Netlify: `netlify deploy`
   - Or use your preferred hosting

## 🎯 Usage

### Landing Page

The homepage features:
- Hero section with compelling headline and CTA
- Features showcase (4 key features)
- FAQ section with expandable accordions
- Footer with links and social media

### Chat Interface (`/chat`)

Full-page chat interface with:
- Real-time AI responses powered by GPT-4o
- Wallet-aware context (when connected)
- Message history
- Quick action buttons for common queries
- Mobile-responsive design

### Embeddable Widget (`/widget-demo`)

Demo page showing the chat widget in action, plus:
- Integration code examples
- Configuration options
- Setup instructions
- Copy-to-clipboard functionality

## 🔧 Customization

### Widget Configuration

The `ChatWidget` component accepts these props:

```tsx
<ChatWidget 
  apiEndpoint="/api/chat"           // Custom API endpoint
  position="bottom-right"           // "bottom-right" | "bottom-left"
  primaryColor="#3b82f6"           // Theme color
/>
```

### Styling

- Edit `src/app/globals.css` for global styles
- Components use Tailwind CSS classes
- Color scheme: Blue (#3b82f6) and Purple (#9333ea)

### AI Behavior

Modify the system prompt in `src/app/api/chat/route.ts`:

```typescript
let systemPrompt = `You are Arion, an intelligent AI assistant...`;
```

## 📱 Integrating the Widget

To add Arion to your existing Web3 app:

1. **Copy files to your project**
   - `src/components/ChatWidget.tsx`
   - `src/components/Providers.tsx`
   - `src/app/api/chat/route.ts`

2. **Install dependencies**
```bash
npm install @privy-io/react-auth openai
```

3. **Wrap your app with Providers**
```tsx
// app/layout.tsx
import { Providers } from '@/components/Providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

4. **Add the widget**
```tsx
// Any page or layout
import { ChatWidget } from '@/components/ChatWidget';

export default function Page() {
  return (
    <>
      {/* Your content */}
      <ChatWidget />
    </>
  );
}
```

## 🛠️ Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **AI**: OpenAI SDK with AIML API (GPT-4o)
- **Wallet**: Privy Authentication
- **Icons**: Lucide React
- **Deployment**: Docker + NodeOps

## 📊 API Endpoints

### POST `/api/chat`

Chat completion endpoint.

**Request Body:**
```json
{
  "message": "What is DeFi?",
  "walletAddress": "0x1234...", // optional
  "conversationHistory": []      // optional
}
```

**Response:**
```json
{
  "response": "DeFi stands for Decentralized Finance...",
  "walletAddress": "0x1234..." // if provided
}
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [NodeOps Documentation](https://docs.nodeops.network)
- [NodeOps GitHub Template](https://github.com/NodeOps-app/Nodeops-Template-Example-App)
- [AIML API Documentation](https://docs.aimlapi.com)
- [Privy Documentation](https://docs.privy.io)
- [Next.js Documentation](https://nextjs.org/docs)

## 💬 Support

For support and questions:

- GitHub Issues: [Create an issue](https://github.com/your-repo/issues)
- Twitter: [@BuildOnNodeOps](https://twitter.com/BuildOnNodeOps)
- Documentation: [NodeOps Docs](https://docs.nodeops.network)

## 🎉 Acknowledgments

- Built with [NodeOps](https://nodeops.network) template
- Powered by [AIML API](https://aimlapi.com)
- Wallet integration by [Privy](https://privy.io)
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

Built with ❤️ by the Arion team. Ready to revolutionize Web3 support!