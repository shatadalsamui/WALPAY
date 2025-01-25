# WALPAY Project

A modern payment solution built with:
- Next.js frontend
- Prisma ORM for database
- Turborepo for monorepo management

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
3. Seed initial data (optional):
```bash
npx prisma db seed
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
