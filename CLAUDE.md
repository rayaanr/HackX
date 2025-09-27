# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HackX is a decentralized hackathon platform built with Next.js 15, React 19, and Thirdweb for Web3 integration. The platform operates on the Base Sepolia testnet and stores metadata on IPFS using Pinata.

## Essential Commands

### Development
- `bun dev` - Start development server
- `bun build` - Build for production
- `bun start` - Start production server

### Code Quality
- `bun run lint` - Run Biome linting
- `bun run format` - Format code with Biome

Note: This project uses Biome instead of ESLint/Prettier for both linting and formatting.

## Architecture

### Core Technologies
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Blockchain**: Thirdweb SDK, Base Sepolia testnet
- **Storage**: IPFS via Pinata for metadata
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation

### Key Architecture Patterns

#### Blockchain-First Data Model
The platform uses a hybrid approach:
- **On-chain**: Core hackathon and project data, user registrations, scoring
- **Off-chain (IPFS)**: Rich metadata, descriptions, images, team details

#### Smart Contract Integration
- Main contract: `HackathonPlatform.sol` deployed on Base Sepolia
- Contract interaction via Thirdweb SDK in `src/providers/web3-provider.tsx`
- Contract ABI located at `src/constants/abi.json`

#### Type System Architecture
- **Contract types**: Raw blockchain data (`src/types/blockchain.ts`)
- **Metadata types**: IPFS-stored rich data structures
- **UI types**: Frontend-friendly transformed data (`src/types/hackathon.ts`)

### Directory Structure

```
src/
├── app/                    # Next.js app router
│   ├── (platform)/        # Protected platform routes
│   └── providers.tsx       # Root providers
├── components/             # React components
│   ├── ui/                # shadcn/ui base components
│   ├── layout/            # Layout components
│   ├── hackathon/         # Hackathon-specific components
│   ├── projects/          # Project-specific components
│   └── dashboard/         # Dashboard components
├── hooks/                  # Custom React hooks
│   ├── blockchain/        # Web3/contract interaction hooks
│   └── queries/           # TanStack Query hooks
├── lib/                    # Utilities and helpers
│   ├── helpers/           # Business logic helpers
│   └── schemas/           # Zod validation schemas
├── providers/              # React context providers
├── types/                  # TypeScript type definitions
└── constants/              # App constants and config
```

## Component Patterns

### Form Components
All forms use React Hook Form with Zod validation:
- Schemas defined in `src/lib/schemas/`
- Multi-step forms use `@stepperize/react`
- File uploads handled via custom hook `useFileUpload`

### Blockchain Components
Components that interact with the blockchain:
- Use `useWeb3()` hook for contract access
- Handle loading states and transaction errors
- Store metadata on IPFS before contract calls

### Data Fetching
- Use TanStack Query for caching and state management
- Blockchain data hooks in `src/hooks/blockchain/`
- Transform raw contract data to UI-friendly formats

## Environment Variables

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - Thirdweb client ID
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Deployed contract address
- `NEXT_PUBLIC_PINATA_JWT` - Pinata JWT for IPFS uploads

## Development Workflow

### Adding New Features
1. Define types in `src/types/` if needed
2. Create Zod schemas for validation in `src/lib/schemas/`
3. Implement blockchain hooks in `src/hooks/blockchain/`
4. Build UI components following existing patterns
5. Add routes in `app/(platform)/`

### Smart Contract Changes
When updating the smart contract:
1. Update `contract.sol`
2. Regenerate ABI and update `src/constants/abi.json`
3. Update types in `src/types/blockchain.ts`
4. Update contract interaction hooks

### Styling Guidelines
- Use Tailwind utility classes
- Follow shadcn/ui design system
- Use CSS variables for theming (dark/light mode support)
- Responsive design with mobile-first approach

## Key Hooks

### Blockchain Hooks
- `useBlockchainHackathons()` - Fetch hackathons from contract
- `useBlockchainProjects()` - Fetch projects from contract
- `useCreateHackathon()` - Create new hackathon
- `useJudge()` - Judge functionality for scoring projects

### Utility Hooks
- `useFileUpload()` - Handle file uploads to IPFS
- `useHackathonForm()` - Multi-step hackathon creation
- `usePrizeCohorts()` - Manage prize cohort data
- `useENS()` - ENS name resolution

## Data Flow

1. **Creation**: Form data → Zod validation → IPFS upload → Contract transaction
2. **Reading**: Contract query → IPFS metadata fetch → Data transformation → UI display
3. **Updates**: Similar to creation but with update contract calls

This architecture ensures data integrity while providing rich user experiences through IPFS metadata storage.