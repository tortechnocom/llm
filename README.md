# LLM RAG Platform

A decentralized AI agent marketplace with RAG capabilities, blockchain-based monetization, and revenue sharing.

## 🏗️ Architecture

This is a monorepo managed by **Turborepo** and **pnpm workspaces**, containing:

- **apps/web** - Next.js frontend with Web3 integration
- **apps/api** - NestJS backend with GraphQL API
- **apps/contracts** - Hardhat smart contracts
- **packages/ui** - Shared UI components (HeroUI + Tailwind)
- **packages/database** - Prisma schema and migrations
- **packages/types** - Shared TypeScript types
- **packages/config** - Shared configurations
- **services/llm-mlx** - ML model training and serving

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Installation

```bash
# Install dependencies
pnpm install

# Start local services (PostgreSQL, Redis, Ollama)
pnpm docker:up

# Run development servers
pnpm dev
```

### Environment Setup

Copy `.env.example` to `.env` in each app directory and configure:

- Database connection strings
- API keys (OpenAI, etc.)
- Blockchain RPC URLs
- JWT secrets

## 📦 Tech Stack

### Frontend
- Next.js 15 (App Router)
- HeroUI + Tailwind CSS
- Wagmi v2 + Viem (Web3)
- RainbowKit (Wallet connection)
- TanStack Query

### Backend
- NestJS
- Prisma ORM
- PostgreSQL + pgvector
- Redis + BullMQ
- LangChain.js
- GraphQL (Apollo)

### Blockchain
- Solidity
- Hardhat
- Base L2
- OpenZeppelin Contracts

### ML/AI
- Ollama
- MLX (Apple Silicon)
- Hugging Face Transformers

## 🛠️ Development

```bash
# Run all apps in development mode
pnpm dev

# Build all apps
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format

# Clean all build artifacts
pnpm clean
```

## 📚 Documentation

- [Tech Stack Details](./TECH_STACK.md)
- [Project Context](./Context.md)
- [API Documentation](./apps/api/README.md)
- [Smart Contracts](./apps/contracts/README.md)

## 🔐 Security

- Smart contracts audited by [TBD]
- Regular dependency updates
- Environment variables for secrets
- Rate limiting and DDoS protection

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.
