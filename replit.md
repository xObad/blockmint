# CryptoMine - Mobile Crypto Mining App

## Overview

CryptoMine is a mobile-first cryptocurrency mining simulation app built as a web application with iOS-inspired design. The app provides a polished, native-feeling experience for users to simulate crypto mining, manage wallets, view transactions, and configure mining pools. It uses a modern React frontend with glassmorphism UI effects and a Node.js/Express backend with PostgreSQL database support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **Styling**: Tailwind CSS with custom design tokens for iOS-like appearance
- **UI Components**: shadcn/ui component library (Radix UI primitives)
- **State Management**: TanStack Query (React Query) for server state
- **Animations**: Framer Motion for fluid, physics-based animations
- **Charts**: Recharts for data visualization

The frontend follows a component-based architecture with:
- Page components in `client/src/pages/` (Dashboard, Wallet, Mining, Settings)
- Reusable UI components in `client/src/components/`
- Custom hooks in `client/src/hooks/` for data fetching and mobile detection
- Shared type definitions in `client/src/lib/types.ts`

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript compiled with tsx
- **API Pattern**: RESTful JSON API under `/api/*` routes
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Schema Validation**: Zod with drizzle-zod integration

The server uses a simple storage abstraction (`IStorage` interface) in `server/storage.ts` that currently implements in-memory storage but is designed to easily swap to database persistence.

### API Routes
- `GET /api/mining/stats` - Get current mining statistics
- `POST /api/mining/toggle` - Toggle mining on/off
- `GET /api/wallet/balances` - Get wallet cryptocurrency balances
- `GET /api/wallet/transactions` - Get transaction history
- `GET /api/pools` - Get available mining pools
- `POST /api/pools/:id/select` - Select a mining pool
- `GET /api/chart` - Get chart data for hash rate visualization
- `GET /api/settings` - Get user settings
- `PATCH /api/settings` - Update user settings

### Database Schema
Located in `shared/schema.ts`:
- `users` table with id, username, password fields
- TypeScript interfaces for in-memory data: MiningStats, WalletBalance, Transaction, MiningPool, ChartDataPoint, UserSettings

### Design System
The app follows iOS 17 design patterns with:
- Dark mode by default with glassmorphism effects
- Custom CSS variables for theming in `client/src/index.css`
- Border radius tokens matching iOS card styles (16px for cards)
- Touch-optimized tap targets (minimum 44pt)
- Safe area padding for notch devices

## External Dependencies

### Database
- **PostgreSQL**: Primary database configured via `DATABASE_URL` environment variable
- **Drizzle Kit**: Database migration tool (`npm run db:push`)

### Frontend Libraries
- **@tanstack/react-query**: Server state management with automatic refetching
- **framer-motion**: Animation library for iOS-like transitions
- **recharts**: Charting library for hash rate visualization
- **react-icons**: Cryptocurrency icons (Bitcoin, Ethereum, etc.)
- **lucide-react**: General UI icons

### Backend Libraries
- **express**: Web server framework
- **drizzle-orm**: Type-safe database ORM
- **connect-pg-simple**: PostgreSQL session store (available but not currently used)
- **zod**: Runtime type validation

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Backend bundling for production
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-***: Replit-specific development tools

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required for database operations)