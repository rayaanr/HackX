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
- **State Management**: TanStack Query for server state, React Context for client state
- **Authentication**: Supabase Auth with custom AuthProvider
- **Form Handling**: react-hook-form with Zod validation
- **Rich Text**: Lexical editor with HTML/Markdown support

### Key Architectural Patterns

**Provider Architecture**: 
- `AuthProvider` - Authentication state management
- `QueryProvider` - TanStack Query configuration
- `ThemeProvider` - Dark/light mode theming
- `SidebarProvider` - Sidebar state management

**Layout System**: Conditional layout based on route:
- `ConditionalLayout` - Wraps children with sidebar layout except for auth/home pages
- `AppSidebar` - Main navigation sidebar with user context
- `SiteHeader` - Top header component
- Auth pages (`/login`, `/signup`) and home page (`/`) use full-width layout

**Database Integration**:
- Supabase client/server setup in `src/lib/supabase/`
- Database types generated in `src/types/supabase.ts`
- Comprehensive type mapping between database and UI types in `src/types/hackathon.ts`
- API middleware for authentication in `src/lib/api/auth-middleware.ts`

**Form & Validation System**:
- Complex multi-step forms using react-hook-form
- Zod schemas in `src/lib/schemas/` with cross-field validation
- `hackathon-schema.ts` includes comprehensive validation for hackathon creation with date consistency checks

**Component Organization**:
- `src/components/ui/` - shadcn/ui base components
- `src/components/layout/` - Layout and navigation components
- `src/components/forms/` - Form components with stepper patterns
- `src/components/hackathon/` - Hackathon-specific components
- `src/components/dashboard/` - Dashboard-specific components
- `src/hooks/` - Custom React hooks including TanStack Query hooks

**Routing Structure**:
- `/` - Landing page (no sidebar)
- `/dashboard` - Main dashboard with stats and recent hackathons
- `/hackathons/` - Hackathon listing and individual hackathon pages
- `/hackathons/create` - Multi-step hackathon creation form
- `/projects/` - Project management pages
- `/(auth)/login` and `/(auth)/signup` - Authentication pages (no sidebar)

### Configuration Files

- **biome.json**: Configured for Next.js/React with 2-space indentation, import organization
- **components.json**: shadcn/ui using "new-york" style, Lucide icons, CSS variables
- **tsconfig.json**: Path aliases (`@/*` maps to `./src/*`)

### Type System

The application uses a dual-type system:
- **Database types**: Generated from Supabase (`DatabaseHackathon`, `DatabaseProject`, etc.)
- **UI types**: Application-specific interfaces (`UIHackathon`, `UIProject`, etc.)
- **Form types**: Zod-inferred types from schemas (`HackathonFormData`, etc.)
- **API types**: Response wrappers (`HackathonsResponse`, `CreateHackathonResponse`, etc.)

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
- Follow the database/UI type mapping patterns
- Maintain the provider hierarchy in `src/app/providers.tsx`
- Use TanStack Query for server state management
- Follow shadcn/ui component patterns with class-variance-authority