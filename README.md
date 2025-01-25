# WalPay - Modern Wallet Payment Platform

WalPay is a cutting-edge payment solution that enables seamless transactions between users and merchants through digital wallets. Built as a monorepo using Turborepo it combines the power of Next.js Prisma and modern web technologies to deliver a scalable and maintainable payment ecosystem.

## Key Features
- Instant wallet-to-wallet transactions
- Merchant payment processing
- Secure authentication with NextAuth
- Real-time balance tracking
- Modular architecture for easy extensibility

## Technology Stack
- **Frontend**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Jotai atoms
- **Authentication**: NextAuth.js
- **Monorepo**: Turborepo for build optimization
- **Styling**: Tailwind CSS

## Architecture Highlights
- **Monorepo Structure**: Shared code between web apps
- **Type Safety**: End-to-end TypeScript
- **API Layer**: Route handlers for backend logic
- **UI Components**: Reusable component library
- **Database Client**: Shared Prisma client across apps

## Development Principles
1. **Modularity**: Independent apps and packages
2. **Type Safety**: Strict TypeScript enforcement
3. **Performance**: Optimized builds with Turborepo
4. **Security**: Secure authentication and data handling
5. **Scalability**: Designed for growth

## Before Getting Started

### System Requirements
- Node.js v18+ installed
- PostgreSQL server running locally
- Git installed

### Recommended Tools
- VS Code (with recommended extensions)
- Postman/Insomnia for API testing
- TablePlus/Beekeeper Studio for database management

### Initial Setup
1. Clone this repository
2. Create `.env` file from `.env.example`
3. Install dependencies: `npm install`
4. Set up database connection in `DATABASE_URL`
5. Run initial migrations: `npx prisma migrate dev`

### Development Workflow
- Use `npm run dev` for local development
- Create feature branches for new work
- Follow commit message conventions

## Project Structure

```
WALPAY/
├── apps/
│   └── web/                # Main Next.js application
│       ├── pages/         # Next.js page routes
│       ├── public/        # Static assets
│       ├── styles/        # Global styles
│       └── components/    # Reusable components
│
├── packages/
│   ├── db/                # Database package
│   │   ├── prisma/       # Prisma schema and migrations
│   │   └── index.ts      # Database client export
│   │
│   └── ui/               # Shared UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
│
├── node_modules/         # Dependencies
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── package.json         # Root project dependencies
├── turbo.json           # Turborepo configuration
└── README.md            # Project documentation
```

### Key Files
- `apps/web/next.config.js` - Next.js configuration
- `packages/db/prisma/schema.prisma` - Database schema
- `turbo.json` - Turborepo build pipeline
- `.env.example` - Environment variables template

## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- npm (recommended)

### Installation
1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Set up environment variables (see .env.example)
4. Run database migrations

## Configuration

### Environment Variables
Create a `.env` file with:
```
DATABASE_URL="postgresql://user:password@localhost:5432/walpay"
NEXTAUTH_SECRET="your-secret-here"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Database Setup
1. Start PostgreSQL
2. Run migrations:
```bash
npx prisma migrate dev
```

## Running the Project

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```
