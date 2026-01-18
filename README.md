# Mining Club

A modern cryptocurrency mining and investment platform built with React, TypeScript, and Node.js.

## Features

- **Cloud Mining**: Purchase hashrate contracts for BTC mining
- **Solo Mining**: High-risk, high-reward independent mining
- **Yield Investment**: Stake USDT for fixed APR returns (up to 19% annually)
- **Multi-Currency Wallet**: Support for USDT, BTC, LTC, ETH and more
- **Real-time Earnings**: Live estimated earnings displays
- **Admin Dashboard**: Full control over users, deposits, withdrawals, and configurations

## Tech Stack

- **Frontend**: React 18, TypeScript, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, Drizzle ORM
- **Database**: PostgreSQL
- **Authentication**: Firebase Auth
- **Build**: Vite

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Firebase project (for authentication)

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
```

### Installation

```bash
npm install
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Currency, Theme, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   └── lib/            # Utilities and helpers
├── server/                 # Express backend
│   ├── services/           # Business logic services
│   ├── routes.ts           # API routes
│   └── admin-routes.ts     # Admin API routes
├── shared/                 # Shared types and schema
└── migrations/             # Database migrations
```

## Admin Dashboard

Access the admin panel at `/db-admin`. Features include:

- User management with balance adjustments
- Deposit/withdrawal approval workflow
- Broadcast notifications
- Article/content management
- Per-user earnings estimate controls
- App configuration (wallet addresses, pricing, etc.)

## Fonts

The app uses:
- **Sansation** - Main body text font
- **Enriqueta** - Headings and titles

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

For DigitalOcean App Platform:
- See [DIGITALOCEAN_DEPLOY.md](./DIGITALOCEAN_DEPLOY.md)
- Environment setup: [DIGITALOCEAN_ENV_SETUP.md](./DIGITALOCEAN_ENV_SETUP.md)

## License

Private - All rights reserved.
