📚 **Documentation:** [Architecture](./docs/ARCHITECTURE.md) • [Setup](./docs/SETUP.md) • [API](./docs/API.md) • [Database](./docs/DATABASE.md) • [Features](./docs/FEATURES.md) • [Roadmap](./docs/ROADMAP.md) • [Development](./docs/DEVELOPMENT.md) • [Issues](./docs/ISSUES.md)

---

<div align="center">

# 🎯 Consistify

**Daily Task Tracker & Productivity Management System**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)

</div>

---

## 📖 About

**Consistify** is a year-long daily task tracking application designed to help you build consistency through:

- 📝 **Daily Task Management** - Track tasks with priorities and completion status
- 🔥 **Streak Tracking** - Monitor consecutive days of 100% task completion
- 🎮 **Gamification** - Earn points based on task priority and completion
- 📊 **Historical Data** - View past performance with preserved task snapshots
- 🎯 **Focus & Mood Tracking** - Set daily focus areas and track your mood
- 🌙 **Modern UI** - Clean interface with dark mode support

---

## ✨ Key Features

### ✅ Completed

- **Authentication System** - JWT + Google OAuth integration
- **Task Management** - Create, edit, delete tasks with priority levels
- **Daily Tracking** - Toggle task completion by date
- **Points System** - Priority-based scoring (Low: 5, Medium: 10, High: 15)
- **Streak System** - Track current and maximum streaks
- **Historical Preservation** - Task snapshots remain accurate even after edits
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Dark Mode** - Full dark mode support

### 🚧 In Progress

- Admin Dashboard
- Enhanced Data Visualization (Charts & Analytics)

### 📋 Planned

- Task Categories/Tags
- Notifications & Reminders
- Export Data (CSV, PDF)
- Profile Management
- Recurring Tasks
- Search & Filters

[View Full Roadmap →](./docs/ROADMAP.md)

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18 or higher
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/MAYANKSHARMA01010/Consistify
cd Consistify

# Install backend dependencies
cd apps/backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install

# Setup environment variables (see docs/SETUP.md)
# Create .env files in apps/backend and apps/frontend

# Run database migrations
cd apps/backend
pnpx prisma migrate dev
pnpx prisma generate

# Start backend server
pnpm dev

# In a new terminal, start frontend
cd apps/frontend
pnpm dev
```

Visit `http://localhost:3000` to access the application!

📚 **Detailed setup instructions:** [docs/SETUP.md](./docs/SETUP.md)

---

## 🏗️ Tech Stack

**Frontend:**

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- TailwindCSS 4
- Axios

**Backend:**

- Express.js 5
- Prisma ORM 6
- PostgreSQL
- JWT Authentication
- bcrypt

**See full architecture:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## 📚 Documentation

| Document                                | Description                                   |
| --------------------------------------- | --------------------------------------------- |
| [Architecture](./docs/ARCHITECTURE.md)     | Tech stack, folder structure, design patterns |
| [Setup Guide](./docs/SETUP.md)             | Installation, configuration, troubleshooting  |
| [API Reference](./docs/API.md)             | Complete API endpoint documentation           |
| [Database Schema](./docs/DATABASE.md)      | Data models, relationships, migrations        |
| [Features](./docs/FEATURES.md)             | Completed features and workflows              |
| [Roadmap](./docs/ROADMAP.md)               | Future features and timeline                  |
| [Development Guide](./docs/DEVELOPMENT.md) | How to implement new features                 |
| [Known Issues](./docs/ISSUES.md)           | Resolved issues and debugging tips            |

---

## 🎯 Roadmap

### Current Focus

- [ ] Admin Dashboard - User management and system analytics
- [ ] Charts & Analytics - Interactive data visualization with Recharts

### Next Up

- [ ] Task Categories/Tags
- [ ] Notification System
- [ ] Data Export (CSV/PDF)
- [ ] Profile Management

[View detailed roadmap →](./docs/ROADMAP.md)

---

## 🛠️ Development

### Running Locally

```bash
# Backend (http://localhost:5001)
cd apps/backend
pnpm dev

# Frontend (http://localhost:3000)
cd apps/frontend
pnpm dev
```

### Database Management

```bash
# View database in Prisma Studio
cd apps/backend
pnpx prisma studio

# Create migration after schema changes
pnpx prisma migrate dev --name description

# Regenerate Prisma Client
pnpx prisma generate
```

### Code Structure

```
Consistify/
├── apps/
│   ├── frontend/    # Next.js React app
│   └── backend/     # Express API server
├── docs/            # Documentation
└── packages/        # Shared packages
```

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:

- Code follows existing style conventions
- All tests pass
- Documentation is updated if needed

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 📞 Support

- 📖 Check the [documentation](./docs/)
- 🐛 Review [known issues](./docs/ISSUES.md)
- 💬 Open an issue for bugs or feature requests

---

<div align="center">

**Built with ❤️ for productivity enthusiasts**

Last Updated: March 26, 2026 | Version: 1.0.0

</div>
