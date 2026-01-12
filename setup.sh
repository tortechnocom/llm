#!/bin/bash

# LLM Platform - Quick Setup Script
# This script automates the initial setup process

set -e

echo "🚀 LLM Platform - Quick Setup"
echo "=============================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ All prerequisites are installed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

# Setup environment files
echo "⚙️  Setting up environment files..."

if [ ! -f "apps/api/.env" ]; then
    cp apps/api/.env.example apps/api/.env
    echo "✅ Created apps/api/.env"
else
    echo "⚠️  apps/api/.env already exists, skipping"
fi

if [ ! -f "apps/web/.env" ]; then
    cp apps/web/.env.example apps/web/.env
    echo "✅ Created apps/web/.env"
else
    echo "⚠️  apps/web/.env already exists, skipping"
fi

if [ ! -f "apps/contracts/.env" ]; then
    cp apps/contracts/.env.example apps/contracts/.env
    echo "✅ Created apps/contracts/.env"
else
    echo "⚠️  apps/contracts/.env already exists, skipping"
fi

echo ""

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d
echo "✅ Docker services started"
echo ""

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Setup database
echo "🗄️  Setting up database..."
cd packages/database
pnpm generate
pnpm migrate
cd ../..
echo "✅ Database setup complete"
echo ""

# Pull Ollama models
echo "🤖 Pulling Ollama embedding model..."
docker exec llm-ollama ollama pull nomic-embed-text
echo "✅ Ollama model downloaded"
echo ""

echo "=============================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit environment files in apps/api/.env and apps/web/.env"
echo "2. Get a WalletConnect Project ID from https://cloud.walletconnect.com/"
echo "3. Run 'pnpm dev' to start development servers"
echo ""
echo "Frontend: http://localhost:3001"
echo "Backend:  http://localhost:3000"
echo "GraphQL:  http://localhost:3000/graphql"
echo ""
echo "Happy coding! 🚀"
