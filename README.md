 
# WALPAY

WalPay is a modern, wallet-based payment platform designed for seamless transactions between users and merchants. Built as a monorepo using Turborepo, it leverages Next.js, Prisma, and a modular package structure for scalability and maintainability.

## Project Structure

Here's how the code is organized:

```
.
├── apps/
│   ├── user-app/          # Customer-facing Next.js application
│   │   ├── app/           # App router directory
│   │   │   ├── (auth)/    # Authentication pages
│   │   │   ├── (dashboard)/# User dashboard
│   │   │   └── api/       # API routes
│   │   ├── components/    # UI components (buttons, cards, forms)
│   │   ├── lib/           # Core business logic
│   │   │   ├── auth.ts    # Authentication config
│   │   │   └── actions/   # Server actions
│   │   └── ...
│   ├── merchant-app/      # Merchant portal
│   │   └── lib/auth.ts    # Merchant auth setup
│   └── bank-webhook/      # Bank integration service
│
├── packages/
│   ├── db/                # Database models (Prisma)
│   ├── ui/                # Shared UI components
│   ├── utils/             # Utility functions
│   └── store/             # Global state management
│
├── turbo.json             # Turborepo config
└── package.json           # Root dependencies
```

## Prerequisites
- Node.js v16+
- PostgreSQL
- Docker (optional)

## Setup Instructions

1. **Clone repository**
```bash
git clone git@github.com:shatadalsamui/WALPAY-NEW.git
cd WALPAY-NEW
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

## CI/CD Workflow

The project includes GitHub Actions for continuous integration:

- **Build on PR**: Automatically runs `npm run build` on every pull request to `main` branch
  - Verifies the project builds successfully
  - Runs in Ubuntu environment with Node.js 20
  - Located in `.github/workflows/build.yml`

Our automated deployment pipeline ensures safe and reliable releases:

### Branch Strategy
- `main`: Production-ready code (protected branch)
- `development`: Active development branch

### Workflow Automation

1. **Pre-Merge Validation** (build.yml)
   - Triggers on PR creation/update
   - Runs:
     - Test suite
     - Build verification
     - Code quality checks
   - Required for merge approval

2. **Production Deployment** (deploy.yml)
   - Triggers when code merges to `main`
   - Automated steps:
     - Docker image build
     - Push to Docker Hub
     - Deployment verification


### Manual Steps
- PR reviews required before merging to `main`
- Version tagging triggers production deployments

To manually trigger the workflow:
1. Create a pull request to `main` branch
2. The build will run automatically
3. Check the "Actions" tab in GitHub for results

## Docker Support

### userapp-walpay Container
```bash
# Build the container
docker build -t userapp-walpay -f docker/dockerfile.user .

# Run the container
docker run userapp-walpay
```

### Configuration
- Uses Node.js 20.x
- Includes auto DB migration

## Authentication System

WalPay supports multiple authentication methods:

1. **Phone + Password**
   - Secure signin/signup with phone number and password
   - Password requirements: 8+ chars, uppercase, lowercase, special char
   - Phone number validation (10 digits)

## Key Features

- **P2P Transfers**: Send money to other users via phone number
- **Transaction History**: View recent transfers and deposits
- **Secure Authentication**: Dual validation for signin/signup flows
- **Balance Management**: Track and manage wallet balance

## Recent Improvements

- Fixed authentication flow to properly handle both signin (2 fields) and signup (4 fields)
- Added transaction security with balance locking during transfers
- Improved error handling for authentication failures

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

### Development Scripts
- `npm test` - Run tests
- `npm run build` - Build production version
 
 
