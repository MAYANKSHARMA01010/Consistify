**📚 Documentation:** [🏠 README](../README.md) • [🏗️ Architecture](./ARCHITECTURE.md) • [🚀 Setup](./SETUP.md) • [🔌 API](./API.md) • [🗄️ Database](./DATABASE.md) • [✅ Features](./FEATURES.md) • [🗺️ Roadmap](./ROADMAP.md) • [🛠️ Development](./DEVELOPMENT.md) • [🐛 Issues](./ISSUES.md)

---

# Architecture

## 🏗️ Monorepo Structure

```
Consistify/
├── apps/
│   ├── frontend/          # Next.js 16 + React 19 + TypeScript
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── DailyHistory.tsx
│   │   │   │   │   │   ├── DailyStatus.tsx
│   │   │   │   │   │   ├── StatsCard.tsx
│   │   │   │   │   │   └── TaskList.tsx
│   │   │   │   │   ├── hooks/
│   │   │   │   │   │   └── useDashboardData.ts
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── page.tsx (Landing)
│   │   │   ├── components/
│   │   │   │   └── layouts/Navbar.tsx
│   │   │   ├── context/
│   │   │   │   └── AuthContext.tsx
│   │   │   └── utils/
│   │   │       └── api.ts
│   │   └── package.json
│   │
│   └── backend/           # Express.js + Prisma
│       ├── src/
│       │   ├── configs/
│       │   │   ├── cors.js
│       │   │   └── prisma.js
│       │   ├── controllers/
│       │   │   ├── auth.controller.js
│       │   │   ├── dailyStatus.controller.js
│       │   │   ├── googleAuth.controller.js
│       │   │   ├── summary.controller.js
│       │   │   └── tasks.controller.js
│       │   ├── middlewares/
│       │   │   ├── auth.middleware.js
│       │   │   └── error.middleware.js
│       │   ├── routes/
│       │   │   ├── auth.routes.js
│       │   │   ├── dailyStatus.routes.js
│       │   │   ├── summary.routes.js
│       │   │   └── tasks.routes.js
│       │   ├── utils/
│       │   │   └── ApiError.js
│       │   └── server.js
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
└── package.json (root)
```

## 🔧 Tech Stack Breakdown

### Frontend

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** TailwindCSS 4
- **HTTP Client:** Axios 1.13.5
- **State Management:** React Context API + Custom Hooks
- **Notifications:** react-hot-toast 2.6.0
- **Validation:** Zod 4.3.6

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js 5
- **ORM:** Prisma 6.19.2
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken 9.0.3)
- **Password Hashing:** bcrypt 6.0.0
- **OAuth:** Google Auth Library 10.5.0
- **Environment:** dotenv 17.2.3
- **CORS:** cors 2.8.6

### Development Tools

- **Package Manager:** pnpm
- **Dev Server:** nodemon (backend), next dev (frontend)
- **Linting:** ESLint

## 🎨 Design Patterns

### Frontend Architecture

- **App Router Pattern:** Next.js App Router for file-based routing
- **Context + Custom Hooks:** Centralized state management for auth and dashboard data
- **Component Composition:** Reusable components with clear separation of concerns
- **API Abstraction:** Centralized API client with interceptors

### Backend Architecture

- **MVC Pattern:** Separation of routes, controllers, and data models
- **Middleware Chain:** Authentication, error handling, and CORS middleware
- **Repository Pattern:** Prisma ORM for database abstraction
- **Error Handling:** Centralized error middleware with custom ApiError class

### Data Flow

```
User Action → Frontend Component → API Client (Axios)
                                      ↓
                               Express Router
                                      ↓
                              Auth Middleware
                                      ↓
                                 Controller
                                      ↓
                              Prisma ORM
                                      ↓
                               PostgreSQL
                                      ↓
                              Response → Frontend
```

---

[← Back to README](../README.md)
