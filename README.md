<div align="center">
    <img src="https://github.com/user-attachments/assets/aa4fac2b-a225-407a-b9f7-42318ed2719c" alt="Logo" width="350">
</div>


# OpenEdu

OpenEdu is the unified interface to access the EDU Chain ecosystem. It seamlessly integrates with leading EDU Chain applications including Sailfish Finance, Grasp Academy, ED3, and DailyWiser, providing a centralized hub for all educational needs within the ecosystem.

## 🏁 DEMO

DEMO_LINK

## 🌟 Key Features

- **Integrated Platform**: One centralized interface to access various educational applications in the EDU Chain ecosystem.
- **Natural Language Interface**: Dynamic interface that invokes the app you need using natural language commands.
- **Extensive Knowledge Base**: Comprehensive EDU Chain knowledge repository.
- **Mainnet Ready**: Fully compatible with production blockchain environment.
- **Token-Gated Access**: The entire platform is token-gated, exclusively accessible to early adopters of EDU Chain.
- **Educational Tools**: Notes, flashcards, and AI-powered quiz generation for effective learning.
- **Growing Ecosystem**: Upcoming collaborations to integrate more protocols with co-marketing initiatives.

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
- **EDU Chain**: Native integration with the educational blockchain ecosystem

### Education Infrastructure
- **Notes System**: Structured note-taking with database persistence
- **Flashcards**: Spaced repetition learning tools
- **Quiz Generation**: AI-powered quiz creation based on topics
- **Integration Layer**: Unified API to connect with partner applications

## 🚶‍♂️ User Flow

1. **Onboarding**
   - Connect wallet to access the EDU Chain ecosystem
   - Access personalized educational content

2. **Learning Management**
   - Create and organize educational notes
   - Generate flashcards for effective memorization
   - Create AI-powered quizzes on any topic
   - Track learning progress across different subjects

3. **Ecosystem Navigation**
   - Seamlessly switch between integrated applications
   - Use natural language to invoke specific tools and features
   - Access token-gated content for early adopters

4. **Knowledge Expansion**
   - Access comprehensive EDU Chain knowledge base
   - Utilize AI tools to enhance learning experience
   - Engage with community learning resources

## 💻 Technology Stack

- **Frontend**:
  - React
  - TanStack Router
  - Tailwind CSS
  - Shadcn UI Components
  - Recharts (for data visualization)

- **Blockchain**:
  - Wagmi (React hooks for Ethereum)
  - Viem (TypeScript interface for Ethereum)
  - EDU Chain integration

- **Development Tools**:
  - TypeScript
  - Vinxi (Build & Dev Server)
  - Biome (Linting)
  - Drizzle ORM with PostgreSQL
  - Playwright (Testing)

- **APIs & Integrations**:
  - Wallet Connect
  - TRPC
  - AI integrations via AI SDK (Groq, Anthropic, etc.)
  - Partner application APIs (Sailfish Finance, Grasp Academy, etc.)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm
- PostgreSQL

### Installation

```bash
# Clone the repository
git clone https://github.com/aeither/openedu.git
cd openedu

# Install dependencies
pnpm install

# Set up your environment variables
cp .env.example .env
# Edit .env with your database and API credentials

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
