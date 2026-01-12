# Quick Start Commands

## Initial Setup (First Time)

```bash
# Install dependencies
pnpm install

# Start Docker services
pnpm docker:up

# Generate Prisma client and run migrations
cd packages/database
pnpm generate
pnpm migrate
cd ../..

# Pull Ollama embedding model
docker exec llm-ollama ollama pull nomic-embed-text

# Optional: Pull LLM model
docker exec llm-ollama ollama pull llama2
```

## Development

```bash
# Start all development servers
pnpm dev

# Or start individually:
cd apps/api && pnpm dev      # Backend on :3000
cd apps/web && pnpm dev      # Frontend on :3001
```

## Access Points

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api
- **GraphQL Playground**: http://localhost:3000/graphql
- **Prisma Studio**: `cd packages/database && pnpm studio`

## Smart Contracts

```bash
cd apps/contracts

# Compile contracts
pnpm compile

# Run tests
pnpm test

# Deploy to local network
npx hardhat node                    # Terminal 1
pnpm deploy:local                   # Terminal 2

# Deploy to Base Sepolia testnet
pnpm deploy:testnet
```

## Useful Commands

```bash
# View Docker logs
docker-compose logs -f

# Restart a service
docker restart llm-postgres
docker restart llm-ollama

# Stop all services
pnpm docker:down

# Clean and reinstall
pnpm clean
pnpm install

# Format code
pnpm format

# Lint code
pnpm lint
```

## Testing the API

1. Open GraphQL Playground: http://localhost:3000/graphql

2. Register a user:
```graphql
mutation {
  register(input: {
    email: "test@example.com"
    password: "password123"
    firstName: "Test"
  }) {
    token
    user { id email }
  }
}
```

3. Copy the token and add to HTTP Headers:
```json
{
  "Authorization": "Bearer <your-token>"
}
```

4. Create an agent:
```graphql
mutation {
  createAgent(input: {
    name: "Test Agent"
    domain: "test"
    description: "A test agent"
    isPublic: true
  }) {
    id
    name
  }
}
```

## Troubleshooting

**Port already in use:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Database connection error:**
```bash
# Restart PostgreSQL
docker restart llm-postgres

# Check if it's running
docker ps | grep postgres
```

**Prisma client not found:**
```bash
cd packages/database
pnpm generate
```
