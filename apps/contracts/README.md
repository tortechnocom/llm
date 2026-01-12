# Smart Contracts

Solidity smart contracts for the LLM Platform, built with Hardhat and OpenZeppelin.

## Contracts

### LLMPlatformToken.sol
ERC-20 token used for platform payments and revenue sharing.

**Features:**
- Initial supply: 1 billion tokens
- Max supply: 10 billion tokens
- Burnable
- Mintable (owner only)

### RevenueSharing.sol
Manages automatic revenue distribution between agent creators and platform.

**Features:**
- Configurable platform fee (default 10%, max 30%)
- Automatic payment splitting
- Creator earnings withdrawal
- Platform treasury management

## Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your values

# Compile contracts
pnpm compile
```

## Testing

```bash
# Run tests
pnpm test

# Run tests with gas reporting
REPORT_GAS=true pnpm test

# Run coverage
pnpm coverage
```

## Deployment

### Local Network

```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network (in another terminal)
pnpm deploy:local
```

### Base Sepolia Testnet

```bash
# Deploy to testnet
pnpm deploy:testnet

# Verify contracts
pnpm verify --network baseSepolia <CONTRACT_ADDRESS>
```

### Base Mainnet

```bash
# Deploy to mainnet
pnpm deploy:mainnet

# Verify contracts
pnpm verify --network base <CONTRACT_ADDRESS>
```

## Contract Addresses

Deployment addresses are saved in `deployments.json` after each deployment.

## Security

- Contracts use OpenZeppelin's audited implementations
- ReentrancyGuard protects against reentrancy attacks
- Ownable pattern for admin functions
- Platform fee capped at 30%

## License

MIT
