# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build the application with Turbopack
- `bun start` - Start production server
- `bun run lint` - Run Biome linting checks
- `bun run format` - Format code using Biome

## Code Architecture & Structure

This is a Next.js 15 hackathon management application built with modern React patterns and shadcn/ui components.

### Tech Stack
- **Framework**: Next.js 15 with App Router and Turbopack
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS 4 with CSS variables for theming
- **UI Components**: shadcn/ui (Radix UI primitives) with custom components
- **Icons**: Lucide React and Tabler Icons
- **Linting/Formatting**: Biome (replaces ESLint + Prettier)
- **State Management**: React hooks with context providers
- **Theming**: next-themes for dark/light mode

### Key Architectural Patterns

**Layout System**: Uses a sidebar-based layout with:
- `AppSidebar` - Main navigation sidebar
- `SiteHeader` - Top header component
- `SidebarProvider` - Context for sidebar state management

**Component Organization**:
- `src/components/ui/` - Reusable shadcn/ui components
- `src/components/layout/` - Layout-specific components
- `src/components/hackathon-*` - Domain-specific hackathon components
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions
- `src/providers/` - React context providers

**Data Layer**: 
- Static data in `src/data/hackathons.ts` with TypeScript interfaces
- Comprehensive `Hackathon` interface with nested types for prizes, judges, voting rules

**Routing**: Next.js App Router structure:
- `/` - Home page
- `/dashboard` - Dashboard page
- `/hackathons` - Hackathon listing
- `/hackathons/[id]` - Individual hackathon details with tabbed interface

### Configuration Files

- **biome.json**: Configured for Next.js and React with recommended rules, 2-space indentation, auto-import organization
- **components.json**: shadcn/ui configuration using "new-york" style with Lucide icons
- **tsconfig.json**: Path aliases configured (`@/*` maps to `./src/*`)

### Development Notes

- Uses Geist font family (sans and mono variants)
- Implements comprehensive theming system with CSS variables
- All UI components follow shadcn/ui patterns with class-variance-authority for styling
- Drag and drop functionality available via @dnd-kit
- Form handling with react-hook-form and Zod validation
- Data visualization with Recharts
- Toast notifications with Sonner

When making changes:
- Follow the existing component patterns in `src/components/ui/`
- Use TypeScript interfaces from `src/data/hackathons.ts` for type safety
- Maintain consistency with Biome formatting rules
- Utilize existing utility classes and design tokens