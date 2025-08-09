# WALPAY

WalPay is a modern, wallet-based payment platform designed for seamless transactions between users and merchants. Built as a monorepo using Turborepo, it leverages Next.js, Prisma, and a modular package structure for scalability and maintainability.

## Project Structure

Here's how the code is organized:

```
.
├── apps/
│   ├── user-app/                  # Customer-facing Next.js application
│   │   ├── app/
│   │   │   ├── (auth)/            # Authentication pages (error, otp, signin, signup)
│   │   │   ├── (dashboard)/       # User dashboard (dashboard, p2p, transactions, transfer, withdraw)
│   │   │   ├── api/               # API routes (auth, signup, user)
│   │   │   ├── error.tsx, layout.tsx, page.tsx, etc.
│   │   ├── components/            # UI components (AddMoneyCard, AuthForm, etc.)
│   │   ├── lib/                   # Business logic (actions, next-auth.d.ts, etc.)
│   │   ├── public/                # Static assets
│   │   ├── provider.tsx, tailwind.config.js, etc.
│   ├── merchant-app/              # Merchant portal (Next.js)
│   │   ├── app/
│   │   ├── lib/
│   │   ├── public/
│   │   ├── provider.tsx, tailwind.config.js, etc.
│   ├── bank-webhook/              # Bank integration service
│   │   ├── src/ (index.ts)
│   │   ├── package.json, tsconfig.json, etc.
│
├── packages/
│   ├── db/                        # Database models (Prisma)
│   │   ├── prisma/ (schema.prisma, migrations, seed.ts)
│   │   ├── index.ts, package.json, etc.
│   ├── ui/                        # Shared UI components (Appbar, card, button, etc.)
│   │   ├── src/
│   │   ├── turbo/generators/
│   ├── store/                     # Global state management (atoms, hooks)
│   ├── eslint-config/             # Shared ESLint config
│   ├── typescript-config/         # Shared TS config
│
├── docker/
│   └── dockerfile.user            # Custom Dockerfile
├── .github/                       # GitHub workflows
├── .eslintrc.js, .gitignore, etc.
├── Dockerfile                     # Main Dockerfile
├── package.json                   # Root dependencies
├── turbo.json                     # Turborepo config
├── tsconfig.json                  # Root TS config
```

## Prerequisites

- Node.js v16+
- PostgreSQL
- Docker (optional)

## Setup Instructions

**Clone repository**

```bash
git clone git@github.com:shatadalsamui/WALPAY-NEW.git
cd WALPAY-NEW
```

**Install dependencies**

```bash
npm install
```

**Database Setup (Choose one option)**

*Option A: Local PostgreSQL with Docker*

```bash
docker run -d \
   --name walpay_postgres \
   -e POSTGRES_USER=walpay_user \
   -e POSTGRES_PASSWORD=walpay_password \
   -e POSTGRES_DB=walpay_db \
   -p 5432:5432 \
   -v postgres_data:/var/lib/postgresql/data \
   postgres:latest
```

*Option B: Cloud PostgreSQL (e.g., Neon.tech)*
- Create account and database
- Get connection string

**Environment Configuration**

```bash
cp .env.example .env
# Update .env with your database credentials
```

**Database Migrations**

```bash
cd packages/db
npx prisma migrate dev
npx prisma db seed
```

**Run Application**

```bash
cd apps/user-app
npm run dev
```

## CI/CD Workflow

- **Build on PR:** Runs `npm run build` on every pull request to `main`
- **Verifies**: Project builds successfully, runs in Ubuntu with Node.js 20
- **Location**: `.github/workflows/build.yml`
- **Branch Strategy**:  
  - `main`: Production-ready code (protected)  
  - `development`: Active development
- **Pre-Merge Validation**:  
  - Triggers on PR creation/update  
  - Runs tests, build, code quality checks  
  - Required for merge approval
- **Production Deployment**:  
  - Triggers on merge to `main`  
  - Builds Docker image, pushes to Docker Hub, verifies deployment

**Manual Steps**
- PR reviews required before merging to `main`
- Version tagging triggers production deployments

**To manually trigger the workflow:**
- Create a pull request to `main`
- The build will run automatically
- Check the "Actions" tab in GitHub for results

## Docker Support

**userapp-walpay Container**

```bash
# Build the container
docker build -t userapp-walpay -f docker/dockerfile.user .

# Run the container
docker run userapp-walpay
```

- Uses Node.js 20.x
- Includes auto DB migration

## Authentication System

<<<<<<< HEAD
WalPay supports multiple authentication methods:

1. **Phone/Email + Password**
   - Secure signin/signup with phone number and password
   - Email is verified with OTP only during signup
   - Password requirements: 8+ chars, uppercase, lowercase, special char
   - Phone number validation (10 digits)

## Key Features

- **Deposit to Wallet from Bank**: Instantly add funds to your wallet via bank transfer
- **Withdrawal from Wallet to Bank**: Withdraw funds from your wallet directly to your bank account
- **P2P Transfer**: Send money to other users via phone number
- **Transactions**: View all transfers, deposits, and withdrawals in one place
- **Secure Authentication**: Dual validation for signin/signup flows
- **Balance Management**: Track and manage wallet balance with locked amount support
=======
- Phone/Email + Password
- Secure signin/signup with phone number and password
- Email is verified with OTP only during signup
- Password requirements: 8+ chars, uppercase, lowercase, special char
- Phone number validation (10 digits)

## Key Features

- Deposit to Wallet from Bank: Instantly add funds to your wallet via bank transfer
- Withdrawal from Wallet to Bank: Withdraw funds from your wallet directly to your bank account
- P2P Transfer: Send money to other users via phone number
- Transactions: View all transfers, deposits, and withdrawals in one place
- Secure Authentication: Dual validation for signin/signup flows
- Balance Management: Track and manage wallet balance with locked amount support
>>>>>>> 6f868d1 (Updated Readme)

## Bank Integration

**1. Deposit Webhook**  
Endpoint: `POST /hdfcWebhook`  
Request Format:
```json
{
    "token": "970.4572088875194",
    "user_identifier": 1,
    "amount": "210"
}
```

**2. Withdrawal Webhook**  
Endpoint: `POST /hdfcWithdrawalWebhook`  
Request Format:
```json
{
    "token": "wth_f745c384-b095-421b-afd5-e29103486338",
    "status": "SUCCESS",
    "bankReferenceId": "BANK_REF_123",
    "amount": 10000
}
```
- Status Values:  
  - `SUCCESS`: Withdrawal processed successfully  
  - `FAILED`: Withdrawal failed (include failureReason)
- Amount: Always in paisa (e.g., 10000 = ₹100.00)

## Testing with Postman

**Test Deposit Webhook:**
- POST: `http://localhost:3003/hdfcWebhook`
- Headers: `Content-Type: application/json`
- Send test payload

**Test Withdrawal Webhook:**
- POST: `http://localhost:3003/hdfcWithdrawalWebhook`
- Headers: `Content-Type: application/json`, `x-webhook-secret: your_webhook_secret_here`
- Send test payload

## Withdrawal Flow

1. **Create Withdrawal**
   - User initiates withdrawal with amount and bank details
   - System generates unique withdrawal token
   - Amount is locked in user's balance
2. **Bank Processing**
   - Bank processes the withdrawal request
   - Sends webhook notification with status
3. **Status Updates**
   - On SUCCESS: Locked amount is deducted
   - On FAILED: Locked amount is returned to available balance

## Development Scripts

- `npm test` - Run tests
- `npm run build` - Build production version
- `npm run dev` - Run in development mode
- `npm run lint` - Run linter


