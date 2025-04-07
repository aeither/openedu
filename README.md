<div align="center">
    <img src="https://github.com/user-attachments/assets/aa4fac2b-a225-407a-b9f7-42318ed2719c" alt="Logo" width="350">
</div>


# OpenEdu

OpenEdu is a modern DeFi application that empowers users to manage their crypto assets, make purchases from merchants, and automatically invest spare change in various DeFi protocols. The platform supports multiple blockchains and provides a seamless, user-friendly experience for crypto banking and investments.

## 🏁 DEMO

https://willowy-cuchufli-496051.netlify.app/

## 🌟 Key Features

- **Multi-chain Support**: Compatible with Rootstock, Flow Testnet, and Celo Alfajores.
- **Portfolio Management**: View your complete portfolio with asset allocations and performance metrics.
- **DeFi Integration**: Automatically invest in multiple DeFi protocols.
- **Merchant Payments**: Pay participating merchants and round up purchases to invest the spare change.
- **Learning Resources**: Educational content to help users understand DeFi concepts.
- **Personalized Risk Levels**: Choose your investment strategy with adjustable risk profiles.

## 🏗️ Architecture

OpenEdu follows a modern frontend architecture with blockchain integration:

### Frontend Architecture
- **React + Vinxi**: Core framework for building the UI
- **TanStack Router**: Type-safe routing solution
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn UI**: Component library for consistent design

### Blockchain Integration
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript interface for Ethereum
- **Multi-chain Support**: Configurable contract addresses for different blockchains

### Smart Contracts
- **Token Contract**: ERC20 token implementation
- **Money Market Contract**: DeFi protocol integration
- **NFT Contract**: Non-fungible token implementation

## 🚶‍♂️ User Flow

1. **Onboarding**
   - Connect wallet to the application
   - Choose risk level for investments

2. **Portfolio Management**
   - View total portfolio value
   - See allocation across different protocols
   - Track transaction history
   - Adjust risk level preferences

3. **Merchant Interaction**
   - Browse merchants and products
   - Add products to cart
   - Checkout with crypto
   - Automatically round up and invest spare change

4. **Learning & Earning**
   - Access educational resources about DeFi
   - Complete learning modules
   - Earn rewards for educational achievements

## 💻 Technology Stack

- **Frontend**:
  - React
  - TanStack Router
  - Tailwind CSS
  - Recharts (for data visualization)
  - Shadcn UI Components

- **Blockchain**:
  - Wagmi (React hooks for Ethereum)
  - Viem (TypeScript interface for Ethereum)
  - Multiple Chain Support (Rootstock, Flow, Celo)

- **Development Tools**:
  - TypeScript
  - Vinxi (Build & Dev Server)
  - Biome (Linting)
  - Drizzle ORM
  - Playwright (Testing)

- **APIs & Integrations**:
  - Wallet Connect
  - TRPC
  - AI integrations (via AI SDK)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/aeither/openedu.git
cd openedu

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

Visit `http://localhost:3000` to see the application in action.

### Building for Production

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

## 📱 Key Pages and Components

- **Portfolio**: Main dashboard showing your assets and allocations
- **Merchants**: Browse and purchase from partner merchants
- **Earn**: Educational content and earning opportunities
- **Balance**: View and manage your token balances
- **Chat**: Get help and insights about your account

<div align="center">
    <img src="https://github.com/user-attachments/assets/fcd01c05-eb88-4baa-b131-e1f990b76885" alt="Logo" width="600">
</div>
