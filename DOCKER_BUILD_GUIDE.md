# Arion - Docker Build & Deployment Guide

This guide will walk you through building, testing, and deploying your Arion Docker image to NodeOps Cloud Marketplace.

## 📋 Prerequisites

- Docker installed on your machine ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Hub account ([Sign up](https://hub.docker.com/signup))
- NodeOps account ([Sign up](https://cloud.nodeops.network))

## 🔧 Step 1: Update Configuration

### 1.1 Update Docker Image Name

Edit `nodeops_template.yaml` and replace `YOUR_DOCKERHUB_USERNAME` with your actual Docker Hub username:

```yaml
image: YOUR_DOCKERHUB_USERNAME/arion:latest
```

**Example:**
```yaml
image: johndoe/arion:latest
```

### 1.2 Verify Environment Variables

Make sure your `.env` file contains all required keys:

```env
# Privy Wallet Authentication
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# AIML API (Required - Get from https://aimlapi.com)
AIML_API_KEY=your_aiml_api_key_here

# Alchemy API (Required for blockchain data)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here
ALCHEMY_API_URL=https://eth-mainnet.g.alchemy.com/v2/your_alchemy_api_key_here

# Chain-specific Alchemy RPC URLs (Optional)
ALCHEMY_API_URL_ETH_MAINNET=https://eth-mainnet.g.alchemy.com/v2/your_alchemy_api_key_here
ALCHEMY_API_URL_POLYGON_MAINNET=https://polygon-mainnet.g.alchemy.com/v2/your_alchemy_api_key_here
ALCHEMY_API_URL_BASE_MAINNET=https://base-mainnet.g.alchemy.com/v2/your_alchemy_api_key_here
ALCHEMY_API_URL_OPTIMISM_MAINNET=https://opt-mainnet.g.alchemy.com/v2/your_alchemy_api_key_here
ALCHEMY_API_URL_ARBITRUM_MAINNET=https://arb-mainnet.g.alchemy.com/v2/your_alchemy_api_key_here
```

⚠️ **IMPORTANT**: Never commit `.env` to version control. It's already in `.dockerignore`.

## 🐳 Step 2: Build Docker Image

### 2.1 Login to Docker Hub

```bash
docker login
```

Enter your Docker Hub credentials when prompted.

### 2.2 Build the Image

**Important:** Next.js requires certain environment variables at build time for static optimization. You MUST provide them using `--build-arg`:

Replace `YOUR_DOCKERHUB_USERNAME` and API keys with your actual values:

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/arion:latest \
  --build-arg NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id \
  --build-arg NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key \
  .
```

**Example:**
```bash
docker build -t johndoe/arion:latest \
  --build-arg NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id \
  --build-arg NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key \
  .
```

**PowerShell users (Windows):**
```powershell
docker build -t YOUR_DOCKERHUB_USERNAME/arion:latest `
  --build-arg NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id `
  --build-arg NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key `
  .
```

This will take 5-10 minutes. The multi-stage build process:
1. **deps stage**: Installs production dependencies only
2. **builder stage**: Installs all dependencies and builds Next.js app with environment variables
3. **runner stage**: Creates minimal production image (~400MB) with only runtime dependencies

### 2.3 Tag with Version (Optional)

It's good practice to also tag with a version number:

```bash
docker tag YOUR_DOCKERHUB_USERNAME/arion:latest YOUR_DOCKERHUB_USERNAME/arion:v1.0.0
```

## ✅ Step 3: Test Locally

Before pushing, test your Docker image locally with all environment variables:

**Bash/Linux/Mac:**
```bash
docker run -p 3000:3000 \
  -e AIML_API_KEY=your_aiml_api_key \
  -e NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id \
  -e NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key \
  -e ALCHEMY_API_KEY=your_alchemy_api_key \
  YOUR_DOCKERHUB_USERNAME/arion:latest
```

**PowerShell (Windows):**
```powershell
docker run -p 3000:3000 `
  -e AIML_API_KEY=your_aiml_api_key `
  -e NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id `
  -e NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key `
  -e ALCHEMY_API_KEY=your_alchemy_api_key `
  YOUR_DOCKERHUB_USERNAME/arion:latest
```

**Visit `http://localhost:3000` to verify:**
- ✅ Landing page loads correctly
- ✅ Wallet connection works (Privy modal appears)
- ✅ Chat interface responds with AI
- ✅ Blockchain queries work
- ✅ All features functional

**Logs should show:**
```
▲ Next.js 15.3.5
- Local:        http://localhost:3000
✓ Ready in XXXms
```

Press `Ctrl+C` to stop the container.

## 📤 Step 4: Push to Docker Hub

### 4.1 Push Latest Tag

```bash
docker push YOUR_DOCKERHUB_USERNAME/arion:latest
```

### 4.2 Push Version Tag (if created)

```bash
docker push YOUR_DOCKERHUB_USERNAME/arion:v1.0.0
```

### 4.3 Verify Upload

Visit your Docker Hub repository:
```
https://hub.docker.com/r/YOUR_DOCKERHUB_USERNAME/arion
```

Make sure the image is **PUBLIC** (not private) for NodeOps marketplace.

## 🚀 Step 5: Deploy to NodeOps

### 5.1 Login to NodeOps

Visit [https://cloud.nodeops.network](https://cloud.nodeops.network) and login.

### 5.2 Create New Template

1. Navigate to **Marketplace** → **My Templates**
2. Click **Create New Template**
3. Upload your `nodeops_template.yaml` file

### 5.3 Configure Environment Variables

In the NodeOps dashboard, add your environment variables:

| Variable | Value | Required |
|----------|-------|----------|
| `AIML_API_KEY` | Your AIML API key | ✅ Yes |
| `NEXT_PUBLIC_PRIVY_APP_ID` | Your Privy App ID | ✅ Yes |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | Your Alchemy key | ✅ Yes |
| `ALCHEMY_API_KEY` | Your Alchemy key | ✅ Yes |
| `ALCHEMY_API_URL` | https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY | ⚠️ Optional |
| `ALCHEMY_API_URL_ETH_MAINNET` | https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY | ⚠️ Optional |
| `ALCHEMY_API_URL_POLYGON_MAINNET` | https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY | ⚠️ Optional |
| `ALCHEMY_API_URL_BASE_MAINNET` | https://base-mainnet.g.alchemy.com/v2/YOUR_KEY | ⚠️ Optional |
| `ALCHEMY_API_URL_OPTIMISM_MAINNET` | https://opt-mainnet.g.alchemy.com/v2/YOUR_KEY | ⚠️ Optional |
| `ALCHEMY_API_URL_ARBITRUM_MAINNET` | https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY | ⚠️ Optional |

**Note:** Chain-specific URLs are optional. If not provided, the app will use the main `ALCHEMY_API_KEY` for all chains.

### 5.4 Set Template Details

Fill in the template information:

**Template Name:** Arion - AI Web3 Assistant

**Short Description:**
```
Intelligent AI chatbot for DeFi and Web3 applications. Powered by GPT-4o with wallet integration.
```

**Full Description:**
```
Arion is a production-ready AI assistant specifically designed for Web3 and DeFi applications. 

Key Features:
✨ GPT-4o powered AI responses
🔐 Privy wallet authentication
💬 Context-aware conversations
🎨 Modern, responsive UI
🚀 Embeddable chat widget
📱 Fully mobile-friendly

Perfect for:
- DeFi protocols
- NFT marketplaces
- Wallet applications
- Web3 gaming platforms
- Blockchain explorers

Built with Next.js 15, TypeScript, and Tailwind CSS.
```

**Category:** AI & Machine Learning / Web3 Tools

**Tags:** AI, Chatbot, Web3, DeFi, GPT-4, Wallet, Next.js

**Pricing:** Set your desired pricing tier

### 5.5 Get Your Template URL

Once published, your template will be available at:
```
https://cloud.nodeops.network/marketplace/YOUR_TEMPLATE_ID
```

Copy this URL for your hackathon submission!

## 📝 Step 6: Hackathon Submission

Add the following to your BUIDL submission:

### Template URL
```
https://cloud.nodeops.network/marketplace/YOUR_TEMPLATE_ID
```

### Project Overview
Use the content from `README.md` highlighting:
- AI-powered Web3 assistant
- Wallet integration with Privy
- GPT-4o via AIML API
- Embeddable widget
- Production-ready

### Use Cases
- **DeFi Education**: Help users understand complex DeFi concepts
- **Wallet Support**: Assist with wallet connections and transactions
- **NFT Queries**: Answer questions about NFT collections and trading
- **Smart Contract Help**: Explain smart contract interactions
- **Token Information**: Provide real-time token data and analysis

### Demo Video Checklist
Record a 5-10 minute video showing:
1. ✅ Arion landing page tour
2. ✅ Wallet connection demo
3. ✅ AI chat interaction (ask DeFi questions)
4. ✅ Widget demo page
5. ✅ Integration code walkthrough
6. ✅ NodeOps deployment process
7. ✅ Live deployment URL showcase

## 🔄 Updating Your Image

When you make changes to your app:

1. **Rebuild the image with build args:**
   ```bash
   docker build -t YOUR_DOCKERHUB_USERNAME/arion:latest \
     --build-arg NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id \
     --build-arg NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key \
     .
   ```

2. **Push the update:**
   ```bash
   docker push YOUR_DOCKERHUB_USERNAME/arion:latest
   ```

3. **NodeOps auto-updates** (thanks to `imagePullPolicy: Always` in the template)

**Quick rebuild and push (one command):**

Bash/Linux/Mac:
```bash
docker build -t YOUR_DOCKERHUB_USERNAME/arion:latest \
  --build-arg NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id \
  --build-arg NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key \
  . && docker push YOUR_DOCKERHUB_USERNAME/arion:latest
```

PowerShell:
```powershell
docker build -t YOUR_DOCKERHUB_USERNAME/arion:latest `
  --build-arg NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id `
  --build-arg NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key `
  . ; docker push YOUR_DOCKERHUB_USERNAME/arion:latest
```

## 🐛 Troubleshooting

### Build Fails

**Error: Module not found**
```bash
# Clear npm cache and rebuild
rm -rf node_modules package-lock.json
npm install
docker build -t YOUR_DOCKERHUB_USERNAME/arion:latest .
```

**Error: EACCES permission denied**
```bash
# Run with sudo (Linux/Mac)
sudo docker build -t YOUR_DOCKERHUB_USERNAME/arion:latest .
```

### Image Too Large

Check image size:
```bash
docker images YOUR_DOCKERHUB_USERNAME/arion
```

Should be around 200-400MB. If larger, the multi-stage build is working correctly.

### Container Won't Start

Check logs:
```bash
docker logs <container-id>
```

Common issues:
- Missing environment variables
- Port 3000 already in use
- Out of memory

### Push Fails

**Error: denied: requested access to the resource is denied**
```bash
# Make sure you're logged in
docker login

# Verify image name matches your username
docker images
```

## 📊 Docker Image Information

**Base Image:** node:24-slim  
**Build Type:** Multi-stage  
**Final Size:** ~200-400MB  
**Exposed Port:** 3000  
**Environment:** Production  

## 🔗 Useful Commands

```bash
# List all images
docker images

# List running containers
docker ps

# Stop a container
docker stop <container-id>

# Remove an image
docker rmi YOUR_DOCKERHUB_USERNAME/arion:latest

# View image layers
docker history YOUR_DOCKERHUB_USERNAME/arion:latest

# Inspect image
docker inspect YOUR_DOCKERHUB_USERNAME/arion:latest
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com)
- [NodeOps Documentation](https://docs.nodeops.network)
- [Next.js Docker Docs](https://nextjs.org/docs/deployment#docker-image)
- [Docker Hub](https://hub.docker.com)

## 💡 Best Practices

1. ✅ Always tag with version numbers
2. ✅ Test locally before pushing
3. ✅ Keep secrets in environment variables
4. ✅ Use multi-stage builds (already configured)
5. ✅ Minimize image size with .dockerignore
6. ✅ Use specific base image versions
7. ✅ Document environment variables

---

## 🎉 Success Checklist

- [ ] Updated `nodeops_template.yaml` with your Docker Hub username
- [ ] Built Docker image successfully
- [ ] Tested image locally
- [ ] Pushed image to Docker Hub (set as public)
- [ ] Deployed template to NodeOps marketplace
- [ ] Got template URL
- [ ] Recorded demo video
- [ ] Submitted to hackathon with template URL

**Need Help?** Check the [NodeOps Discord](https://discord.gg/nodeops) or create an issue in the repository.

Good luck with your hackathon submission! 🚀
