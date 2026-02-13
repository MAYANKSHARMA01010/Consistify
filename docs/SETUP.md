**📚 Documentation:** [🏠 README](../README.md) • [🏗️ Architecture](./ARCHITECTURE.md) • [🚀 Setup](./SETUP.md) • [🔌 API](./API.md) • [🗄️ Database](./DATABASE.md) • [✅ Features](./FEATURES.md) • [🗺️ Roadmap](./ROADMAP.md) • [🛠️ Development](./DEVELOPMENT.md) • [🐛 Issues](./ISSUES.md)

---

# Setup & Installation

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- pnpm (recommended) or npm
- Google OAuth credentials (optional, for Google sign-in)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Consistify
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd apps/backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### 3. Configure Environment Variables

#### Backend (.env)

Create `/apps/backend/.env` based on `.env.example`:

```env
# Server
SERVER_PORT=5001
NODE_ENV=development

# Frontend URLs
FRONTEND_LOCAL_URL=http://localhost:3000
FRONTEND_SERVER_URL=https://your-frontend-domain.com

# Backend URLs
BACKEND_LOCAL_URL=http://localhost:5001
BACKEND_SERVER_URL=https://your-backend-domain.com

# Database
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/consistify

# JWT
JWT_ACCESS_SECRET=your-random-access-secret
JWT_REFRESH_SECRET=your-random-refresh-secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
```

#### Frontend (.env)

Create `/apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4. Setup Database

```bash
cd apps/backend

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init

# (Optional) Seed database
pnpm prisma db seed
```

### 5. Run the Application

#### Backend

```bash
cd apps/backend
pnpm dev
# Server runs on http://localhost:5001
```

#### Frontend

```bash
cd apps/frontend
pnpm dev
# App runs on http://localhost:3000
```

### 6. Access the Application

- Open browser: `http://localhost:3000`
- Register a new account or sign in with Google
- Start tracking your tasks!

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Ensure PostgreSQL is running
2. Verify `DATABASE_URL` in `.env` is correct
3. Check database user has proper permissions
4. Try connecting manually: `psql postgresql://USER:PASSWORD@localhost:5432/consistify`

### Port Conflicts

If ports 3000 or 5001 are already in use:

1. Change `SERVER_PORT` in backend `.env`
2. Update `NEXT_PUBLIC_API_URL` in frontend `.env.local`
3. Update `FRONTEND_LOCAL_URL` in backend `.env`

### Prisma Issues

If you encounter Prisma errors after schema changes:

```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev
```

### Google OAuth Not Working

1. Verify Google OAuth credentials are correct
2. Ensure callback URL matches: `http://localhost:5001/api/auth/google/callback`
3. Add authorized redirect URI in Google Cloud Console
4. Check `GOOGLE_CLIENT_ID` is set in both backend and frontend `.env` files

---

[← Back to README](../README.md) | [View API Documentation →](./API.md)
