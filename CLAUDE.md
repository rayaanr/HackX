# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun run dev` - Start development server with Next.js
- `bun run build` - Build the application for production
- `bun start` - Start production server
- `bun run lint` - Run Biome linting checks
- `bun run format` - Format code using Biome

## Code Architecture & Structure

This is a Next.js 15 blockchain-based hackathon management application using smart contracts for data storage.

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Blockchain**: Ethereum-compatible smart contract with Thirdweb SDK
- **Storage**: IPFS via Pinata for metadata storage
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS 4 with CSS variables for theming
- **UI Components**: shadcn/ui (Radix UI primitives) with "new-york" style
- **Icons**: Lucide React and Tabler Icons
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)
- **State Management**: Custom blockchain hooks with TanStack Query for data caching
- **Authentication**: Thirdweb wallet-based authentication
- **Form Handling**: react-hook-form with Zod validation
- **Rich Text**: Lexical editor with HTML/Markdown support

### Key Architectural Patterns

**Provider Architecture**:
- `Web3Provider` - Blockchain integration and wallet state management
- `ThemeProvider` - Dark/light mode theming
- `SidebarProvider` - Sidebar state management

**Layout System**: Conditional layout based on route:
- `ConditionalLayout` - Wraps children with sidebar layout except for auth/home pages
- `AppSidebar` - Main navigation sidebar with user context
- `SiteHeader` - Top header component
- Auth pages (`/login`, `/signup`) and home page (`/`) use full-width layout

**Blockchain Integration**:
- Smart contract integration with Thirdweb SDK (`contract.sol`)
- Contract deployment and interaction in `src/lib/helpers/blockchain.ts`
- IPFS metadata storage with Pinata integration for hackathon/project data
- Comprehensive type mapping between blockchain and UI types in `src/types/blockchain.ts`
- Date/timestamp conversion utilities in `src/lib/helpers/date.ts` for Unix timestamps from contract

**Form & Validation System**:
- Complex multi-step forms using react-hook-form
- Zod schemas in `src/lib/schemas/` with cross-field validation
- `hackathon-schema.ts` includes comprehensive validation for hackathon creation with date consistency checks

**Code Organization Rules**:
- Components: `src/components/{feature}/` - Group by feature with creation/display subdirectories
- Hooks: `src/hooks/blockchain/` for blockchain operations, `src/hooks/queries/` for data transformations
- Utils: `src/lib/helpers/` for transformations, `src/lib/schemas/` for Zod validation
- Types: `src/types/blockchain.ts` (smart contract types), `src/types/hackathon.ts` (UI mappings)
- Constants: `src/constants/` for static data and configuration options

**Routing Structure**:
- `/` - Landing page (no sidebar)
- `/dashboard` - Main dashboard with stats and recent hackathons
- `/hackathons/` - Hackathon listing and individual hackathon pages
- `/hackathons/create` - Multi-step hackathon creation form
- `/hackathons/[id]/judge` - Judge dashboard for evaluating projects in a hackathon
- `/hackathons/[id]/judge/[projectId]` - Individual project evaluation page for judges
- `/judge` - Judge overview page showing all hackathons available for judging
- `/projects/` - Project management pages
- Authentication is wallet-based (no traditional auth pages)

### Configuration Files

- **biome.json**: Configured for Next.js/React with 2-space indentation, import organization
- **components.json**: shadcn/ui using "new-york" style, Lucide icons, CSS variables
- **tsconfig.json**: Path aliases (`@/*` maps to `./src/*`)

### Type System

The application uses a multi-type system:
- **Blockchain types**: Smart contract data structures (`BlockchainHackathon`, `BlockchainProject`, etc.)
- **UI types**: Application-specific interfaces (`UIHackathon`, `UIProject`, etc.)
- **Form types**: Zod-inferred types from schemas (`HackathonFormData`, etc.)
- **Contract types**: Solidity event and struct mappings for blockchain interactions

### Key Features

- Multi-step hackathon creation with complex validation
- Rich text editing with Lexical
- File upload with drag-and-drop
- Responsive design with container queries
- Toast notifications with Sonner
- Date/time pickers with validation
- Multi-select components for tech stacks
- Avatar lists for team displays

### Critical Implementation Details

**Status Calculation**:
- Use shared `getUIHackathonStatus` helper from `src/lib/helpers/date.ts` for consistent status display
- Always convert `votingPeriod: null` to `undefined` when calling status functions:
  ```typescript
  const status = getUIHackathonStatus({
    ...hackathon,
    votingPeriod: hackathon.votingPeriod || undefined,
  });
  ```

**Environment Variables**:
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - Thirdweb client configuration
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Smart contract deployment address
- `PINATA_API_KEY` / `PINATA_SECRET_API_KEY` - IPFS storage credentials

**Data Flow**:
- All data comes from smart contract events and IPFS metadata
- No traditional database - blockchain is the source of truth
- Timestamps from contract are Unix format and need conversion via `safeToDate`

When making changes:
- Use existing Zod schemas for validation and extend them as needed
- Follow the blockchain/UI type mapping patterns in `src/lib/helpers/blockchain-transforms.ts`
- Maintain the provider hierarchy in `src/app/providers.tsx`
- Use blockchain hooks for contract interactions and TanStack Query for data caching
- Follow shadcn/ui component patterns with class-variance-authority
- Always handle type conversion between blockchain and UI data consistently