# LLM Platform - Setup Guide

Welcome to the LLM Platform! This guide will help you get the project up and running.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd llm
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for all workspaces in the monorepo.

### 3. Setup Environment Variables

#### Backend API

```bash
cd apps/api
cp .env.example .env
```

Edit `apps/api/.env` and configure:
- `DATABASE_URL` - PostgreSQL connection string (default works with Docker)
- `JWT_SECRET` - Generate a secure random string
- `REDIS_HOST` and `REDIS_PORT` - Redis configuration
- `OLLAMA_BASE_URL` - Ollama API endpoint

#### Frontend

```bash
cd apps/web
cp .env.example .env
```

Edit `apps/web/.env` and configure:
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Get from [WalletConnect Cloud](https://cloud.walletconnect.com/)
- Contract addresses (after deployment)

#### Smart Contracts

```bash
cd apps/contracts
cp .env.example .env
```

Edit `apps/contracts/.env` and configure:
- `PRIVATE_KEY` - Your wallet private key (for deployment)
- `BASESCAN_API_KEY` - For contract verification

### 4. Start Local Services

Start PostgreSQL, Redis, and Ollama using Docker Compose:

```bash
# From project root
pnpm docker:up
```

This will start:
- **PostgreSQL** with pgvector on port 5432
- **Redis** on port 6379
- **Ollama** on port 11434

Verify services are running:

```bash
docker ps
```

### 5. Setup Database

Generate Prisma client and run migrations:

```bash
cd packages/database
pnpm generate
pnpm migrate
```

### 6. Pull Ollama Models

Download the embedding model:

```bash
docker exec -it llm-ollama ollama pull nomic-embed-text
```

Optionally, download an LLM model:

```bash
docker exec -it llm-ollama ollama pull llama2
# or
docker exec -it llm-ollama ollama pull mistral
```

### 7. Start Development Servers

From the project root:

```bash
pnpm dev
```

This will start:
- **Backend API** on http://localhost:3000
- **Frontend** on http://localhost:3001
- **GraphQL Playground** on http://localhost:3000/graphql

## 🔗 Deploying Smart Contracts

### Local Deployment (for testing)

```bash
# Terminal 1: Start local Hardhat node
cd apps/contracts
npx hardhat node

# Terminal 2: Deploy contracts
pnpm deploy:local
```

### Testnet Deployment (Base Sepolia)

1. Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)

2. Deploy contracts:

```bash
cd apps/contracts
pnpm deploy:testnet
```

3. Copy contract addresses from `deployments.json` to your `.env` files

4. Verify contracts on BaseScan:

```bash
pnpm verify --network baseSepolia <CONTRACT_ADDRESS>
```

## 📱 Accessing the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **GraphQL Playground**: http://localhost:3000/graphql
- **Prisma Studio**: `cd packages/database && pnpm studio`

## 🧪 Testing

### Run All Tests

```bash
pnpm test
```

### Test Individual Packages

```bash
# Smart contracts
cd apps/contracts
pnpm test

# Backend
cd apps/api
pnpm test

# Frontend
cd apps/web
pnpm test
```

## 🛠️ Development Workflow

### Adding a New Package

```bash
# Create package directory
mkdir -p packages/my-package

# Initialize package.json
cd packages/my-package
pnpm init
```

### Database Changes

1. Edit `packages/database/prisma/schema.prisma`
2. Create migration:

```bash
cd packages/database
pnpm migrate
```

3. Regenerate Prisma client:

```bash
pnpm generate
```

### Smart Contract Changes

1. Edit contracts in `apps/contracts/contracts/`
2. Compile:

```bash
cd apps/contracts
pnpm compile
```

3. Test:

```bash
pnpm test
```

## 🐛 Troubleshooting

### Docker Services Not Starting

```bash
# Stop all containers
pnpm docker:down

# Remove volumes and restart
docker-compose down -v
pnpm docker:up
```

### Database Connection Issues

1. Verify PostgreSQL is running: `docker ps`
2. Check connection string in `.env`
3. Try connecting manually:

```bash
docker exec -it llm-postgres psql -U llm_user -d llm_platform
```

### Prisma Client Not Found

```bash
cd packages/database
pnpm generate
```

### Ollama Not Responding

```bash
# Check Ollama status
docker logs llm-ollama

# Restart Ollama
docker restart llm-ollama
```

### Port Already in Use

Change ports in:
- `apps/api/.env` - `PORT=3000`
- `apps/web/package.json` - `"dev": "next dev -p 3001"`

## 📚 Next Steps

1. **Explore the codebase** - Check out the different modules
2. **Read the documentation** - See `TECH_STACK.md` for architecture details
3. **Create your first agent** - Use the frontend to create an AI agent
4. **Deploy to testnet** - Test the blockchain integration
5. **Contribute** - Check open issues and contribute!

## 🆘 Getting Help

- Check the [README.md](./README.md)
- Review [TECH_STACK.md](./TECH_STACK.md)
- Open an issue on GitHub
- Join our Discord community

## 🎉 You're Ready!

Your LLM Platform development environment is now set up. Happy coding! 🚀
