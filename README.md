  # WALPAY

WalPay is a modern, wallet-based payment platform designed for seamless transactions between users and merchants. Built as a monorepo using Turborepo, it leverages Next.js, Prisma, and a modular package structure for scalability and maintainability.

## Project Structure

```
.
├── apps/
│   ├── user-app/          # Next.js application for end users
│   │   ├── app/           # App router directory
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Business logic and utilities
│   │   └── ...
│   └── merchant-app/      # Next.js application for merchants
│
├── packages/
│   ├── db/                # Shared database schema and Prisma client
│   ├── ui/                # Shared UI components library
│   └── utils/             # Shared utility functions
│
├── turbo.json             # Turborepo configuration
└── package.json           # Root package configuration
```

## Prerequisites
- Node.js v16+
- PostgreSQL
- Docker (optional)

## Setup Instructions

1. **Clone repository**
```bash
git clone git@github.com:shatadalsamui/WALPAY.git
cd WALPAY
```

2. **Install dependencies**
```bash
npm install
```

3. **Database Setup** (Choose one option)

**Option A: Local PostgreSQL with Docker**
```bash
docker run -e POSTGRES_PASSWORD=mysecretpassword -d -p 5432:5432 postgres
```

**Option B: Cloud PostgreSQL (e.g., Neon.tech)**
- Create account and database
- Get connection string

4. **Environment Configuration**
```bash
cp .env.example .env
# Update .env with your database credentials
```

5. **Database Migrations**
```bash
cd packages/db
npx prisma migrate dev
npx prisma db seed
```

6. **Run Application**
```bash
cd apps/user-app
npm run dev
```

## Bank API Payment Confirmation

When receiving payment confirmation from the bank API, the payload will have the following structure:

```json
{
    "token": "970.4572088875194",
    "user_identifier": 1,
    "amount": "210"
}
```

This structure is used for both on-ramping transactions and payment confirmations.

### Testing with Postman
To test the payment confirmation webhook:
1. Open Postman
2. Create a new POST request to: `http://localhost:3003/hdfcWebhook`
3. Set Headers:
   - `Content-Type: application/json`
4. Send accordingly the data in the below format:

```json
{
    "token": "970.4572088875194",
    "user_identifier": 1,
    "amount": "210"
}
```

## Development Scripts
- `npm test` - Run tests
- `npm run build` - Build production version