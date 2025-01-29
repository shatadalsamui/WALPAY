# WALPAY Project

## Project Structure
```
packages/
  db/         - Database schema and Prisma configuration
apps/
  user-app/   - Main application
``

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

## Development Scripts
- `npm test` - Run tests
- `npm run build` - Build production version