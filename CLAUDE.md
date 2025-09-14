# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun run dev` - Start development server with Next.js
- `bun run build` - Build the application for production
- `bun start` - Start production server
- `bun run lint` - Run Biome linting checks
- `bun run format` - Format code using Biome
- `bun run db:types` - Generate TypeScript types from Supabase database

## Code Architecture & Structure

This is a Next.js 15 hackathon management application with Supabase backend integration.

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL) with SSR support
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS 4 with CSS variables for theming
- **UI Components**: shadcn/ui (Radix UI primitives) with "new-york" style
- **Icons**: Lucide React and Tabler Icons
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)
- **State Management**: Blockchain hooks with TanStack Query for contract data, React Context for client state
- **Authentication**: Thirdweb Auth with wallet-based authentication
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
- Smart contract integration with Thirdweb SDK
- Contract deployment and interaction in `src/lib/helpers/blockchain.ts`
- IPFS metadata storage with Pinata integration
- Comprehensive type mapping between blockchain and UI types in `src/types/blockchain.ts`

**Form & Validation System**:
- Complex multi-step forms using react-hook-form
- Zod schemas in `src/lib/schemas/` with cross-field validation
- `hackathon-schema.ts` includes comprehensive validation for hackathon creation with date consistency checks

**Code Organization Rules**:
- Components: `src/components/{feature}/` - Group by feature with creation/display subdirectories
- Hooks: `src/hooks/blockchain/` for blockchain operations, `src/hooks/queries/` for data transformations
- Utils: `src/lib/helpers/` for transformations, `src/lib/schemas/` for Zod validation
- Types: `src/types/blockchain.ts` (blockchain), `src/types/hackathon.ts` (UI mappings)
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
- `/(auth)/login` and `/(auth)/signup` - Authentication pages (no sidebar)

### Configuration Files

- **biome.json**: Configured for Next.js/React with 2-space indentation, import organization
- **components.json**: shadcn/ui using "new-york" style, Lucide icons, CSS variables
- **tsconfig.json**: Path aliases (`@/*` maps to `./src/*`)

### Type System

The application uses a multi-type system:
- **Blockchain types**: Smart contract data structures (`BlockchainHackathon`, `BlockchainProject`, etc.)
- **UI types**: Application-specific interfaces (`UIHackathon`, `UIProject`, etc.)
- **Form types**: Zod-inferred types from schemas (`HackathonFormData`, etc.)
- **Legacy types**: Backward compatibility types (`HackathonWithRelations`, etc.)

### Key Features

- Multi-step hackathon creation with complex validation
- Rich text editing with Lexical
- File upload with drag-and-drop
- Responsive design with container queries
- Toast notifications with Sonner
- Date/time pickers with validation
- Multi-select components for tech stacks
- Avatar lists for team displays

When making changes:
- Use existing Zod schemas for validation and extend them as needed
- Follow the blockchain/UI type mapping patterns
- Maintain the provider hierarchy in `src/app/providers.tsx`
- Use blockchain hooks for contract interactions and TanStack Query for data caching
- Follow shadcn/ui component patterns with class-variance-authority