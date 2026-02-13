# Consistify - Year Tracker Project Documentation

**Project Name:** Consistify  
**Type:** Daily Task Tracker & Productivity Management System  
**Tech Stack:** Next.js (Frontend) + Express.js (Backend) + PostgreSQL (Database)  
**Last Updated:** February 13, 2026  
**Project Status:** ✅ **Core Features Implemented** | 🚧 **UI/UX Enhancements In Progress**

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [What Has Been Completed](#what-has-been-completed)
3. [What Is Left To Do](#what-is-left-to-do)
4. [Technical Architecture](#technical-architecture)
5. [Setup & Installation](#setup--installation)
6. [Feature Documentation](#feature-documentation)
7. [API Endpoints](#api-endpoints)
8. [Database Schema](#database-schema)
9. [How To Complete Remaining Tasks](#how-to-complete-remaining-tasks)
10. [Known Issues & Resolutions](#known-issues--resolutions)

---

## 🎯 Project Overview

**Consistify** is a year-long daily task tracking application designed to help users:

- Track daily tasks and their completion status
- Monitor productivity through streaks and points
- View historical performance data
- Set daily focus areas and mood tracking
- Build consistency through gamification (points, streaks)

### Key Objectives

✅ **Consistency Tracking:** Daily task completion with streak monitoring  
✅ **Gamification:** Point system based on task completion  
✅ **Historical Data:** Preserve task snapshots even after modifications  
✅ **User Experience:** Clean, modern interface with dark mode support  
✅ **Authentication:** Secure JWT-based auth + Google OAuth integration

---

## ✅ What Has Been Completed

### 🎨 **Frontend (Next.js with TypeScript)**

#### Authentication System

- ✅ User registration with validation
- ✅ Login/logout functionality
- ✅ Google OAuth integration (sign in with Google)
- ✅ JWT-based authentication with refresh tokens
- ✅ Protected routes with auth context
- ✅ Persistent login state across page refreshes

#### Dashboard Interface

- ✅ Main dashboard with user greeting and motivational quotes
- ✅ **Stats Cards Display:**
  - Completed tasks today
  - Pending tasks count
  - Current streak & max streak
  - Points earned (last 7 days)
- ✅ **Daily Status Component:**
  - Set daily focus
  - Mood tracking (LOW, NORMAL, HIGH)
  - Personal notes
  - Date selection
- ✅ **Task List Component:**
  - Add new tasks with title, priority (LOW/MEDIUM/HIGH), start/end dates
  - View all active tasks
  - Toggle task completion (checkbox)
  - Edit task details (inline editing)
  - Delete tasks (soft delete)
  - Tasks sorted by completion status (pending first, then completed)
- ✅ **Daily History Component:**
  - Calendar view of past performance
  - Click on dates to view historical data
  - Display task audit logs (tasks as they were on that day)
  - View points, completion rates, and streaks for past days

#### UI/UX Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark mode support
- ✅ Loading states and error handling
- ✅ Toast notifications for user feedback
- ✅ Modern gradient-based design
- ✅ Smooth animations and transitions

### 🔧 **Backend (Express.js with Prisma ORM)**

#### Authentication & Authorization

- ✅ User registration with bcrypt password hashing
- ✅ Login with JWT access & refresh tokens
- ✅ Token refresh endpoint
- ✅ Google OAuth callback handling
- ✅ Protected route middleware
- ✅ Cookie-based token management

#### Task Management

- ✅ Create tasks with validation (duplicate prevention)
- ✅ Get all active tasks with completion status
- ✅ Update task details (title, priority, dates)
- ✅ Soft delete tasks (isActive flag)
- ✅ Task title uniqueness validation (case-insensitive)

#### Daily Status Tracking

- ✅ Toggle task completion for specific dates
- ✅ Automatic summary recalculation on status change
- ✅ Historical task snapshots (denormalized data in DailyTaskStatus)
- ✅ Date normalization to avoid duplicate entries

#### Summary & Analytics

- ✅ **Automatic Daily Summary Calculation:**
  - Total tasks for the day
  - Completed tasks count
  - Completion percentage
  - Points calculation (weighted by priority)
  - Consistency score
  - Streak tracking (current & max)
  - Cumulative points
- ✅ **Summary Endpoints:**
  - Get today's summary
  - Get summary by date range
  - Update daily focus, mood, and notes
  - Get detailed summary with task audit logs
- ✅ **Task Audit Logs:**
  - Snapshot of tasks as they existed on a specific day
  - Preserves task title and priority even after modifications
  - Prevents data loss when tasks are renamed/deleted

#### Points System

- ✅ **Priority-Based Scoring:**
  - LOW priority: 5 points
  - MEDIUM priority: 10 points
  - HIGH priority: 15 points
- ✅ Weekly points aggregation (last 7 days)
- ✅ Cumulative points tracking

#### Streak System

- ✅ Daily streak calculation based on consecutive days with 100% completion
- ✅ Current streak tracking
- ✅ Max streak (best streak) tracking
- ✅ Automatic streak reset on non-completion days

### 🗄️ **Database (PostgreSQL with Prisma)**

#### Models Implemented

- ✅ **User:** id, name, username, email, password, role
- ✅ **Task:** id, userId, title, priority, isActive, startDate, endDate
- ✅ **DailyTaskStatus:** id, userId, taskId, date, isCompleted, taskTitle, taskPriority
- ✅ **DailySummary:** id, userId, date, completedTasks, totalTasks, points, cumulativePoints, consistency, focus, mood, notes, currentStreak, maxStreak
- ✅ **TaskAuditLog:** id, summaryId, taskId, title, priority, completed

#### Database Features

- ✅ Cascading deletes (user deletion removes all related data)
- ✅ Unique constraints (userId + date for summaries, taskId + date for status)
- ✅ Indexes for performance optimization
- ✅ Soft delete implementation for tasks
- ✅ Data denormalization for historical accuracy

### 🛡️ **Security & Best Practices**

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ HTTP-only cookies for token storage
- ✅ CORS configuration
- ✅ Environment variable management
- ✅ Input validation and sanitization
- ✅ Error handling middleware
- ✅ SQL injection prevention (Prisma ORM)

---

## 🚧 What Is Left To Do

### High Priority Features

#### 1. **Admin Dashboard** 🔴

**Status:** Not Started  
**Description:** Create an admin panel to manage users and view system-wide analytics
**Tasks:**

- [ ] Create admin authentication check
- [ ] Build admin layout component
- [ ] User management page (view all users, delete users, change roles)
- [ ] System analytics dashboard (total users, tasks, active users)
- [ ] Audit logs viewer

#### 2. **Enhanced Data Visualization** 🟡

**Status:** Partially Complete  
**Description:** Improve analytics and charts for better insights
**Tasks:**

- [ ] Add chart library (Chart.js or Recharts)
- [ ] Weekly/Monthly completion trend graph
- [ ] Points progression chart
- [ ] Streak history visualization
- [ ] Pie chart for task distribution by priority
- [ ] Heatmap for yearly task completion

#### 3. **Task Categories/Tags** 🟡

**Status:** Not Started  
**Description:** Allow users to categorize tasks for better organization
**Tasks:**

- [ ] Update Prisma schema to add Category model
- [ ] Create category management UI
- [ ] Add category field to task creation
- [ ] Filter tasks by category
- [ ] Category-wise analytics

#### 4. **Notifications System** 🟠

**Status:** Not Started  
**Description:** Remind users about pending tasks
**Tasks:**

- [ ] In-app notifications component
- [ ] Email notification setup (SendGrid/Nodemailer)
- [ ] Daily task reminder emails
- [ ] Streak at risk notifications
- [ ] Task deadline alerts

#### 5. **Export Data** 🟢

**Status:** Not Started  
**Description:** Allow users to export their data
**Tasks:**

- [ ] CSV export for task history
- [ ] PDF report generation (monthly/yearly)
- [ ] JSON data export (backup)
- [ ] Integration with Google Sheets API (optional)

### Medium Priority Features

#### 6. **Profile Management** 🟡

**Status:** Basic Implementation  
**Current:** User data is displayed on dashboard  
**Needed:**

- [ ] Create dedicated profile page
- [ ] Edit profile (name, username, email)
- [ ] Change password functionality
- [ ] Profile picture upload
- [ ] Account deletion option

#### 7. **Task Recurrence** 🟠

**Status:** Not Started  
**Description:** Support for recurring tasks (daily, weekly, monthly)
**Tasks:**

- [ ] Update Task model with recurrence pattern
- [ ] Recurrence UI in task creation
- [ ] Auto-generate recurring task instances
- [ ] Edit/delete recurrence options (single instance vs all)

#### 8. **Subtasks** 🟠

**Status:** Not Started  
**Description:** Break down tasks into smaller actionable items
**Tasks:**

- [ ] Create Subtask model
- [ ] UI for adding/managing subtasks
- [ ] Subtask completion tracking
- [ ] Parent task auto-completion when all subtasks done

#### 9. **Search & Filters** 🟢

**Status:** Basic sorting implemented  
**Needed:**

- [ ] Search tasks by title
- [ ] Filter by priority
- [ ] Filter by date range
- [ ] Filter by completion status
- [ ] Advanced search (multi-criteria)

### Low Priority / Nice-to-Have

#### 10. **Social Features** 🔵

- [ ] Add friends/accountability partners
- [ ] Share progress with friends
- [ ] Leaderboard (optional, privacy-respecting)
- [ ] Public achievements

#### 11. **Theming** 🔵

- [ ] Multiple theme options (not just dark/light)
- [ ] Custom color schemes
- [ ] Theme marketplace

#### 12. **Mobile App** 🔵

- [ ] React Native version
- [ ] Push notifications on mobile

#### 13. **Integrations** 🔵

- [ ] Google Calendar sync
- [ ] Notion integration
- [ ] Todoist import
- [ ] API for third-party integrations

---

## 🏗️ Technical Architecture

### **Monorepo Structure**

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

### **Tech Stack Breakdown**

#### Frontend

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript 5
- **Styling:** TailwindCSS 4
- **HTTP Client:** Axios 1.13.5
- **State Management:** React Context API + Custom Hooks
- **Notifications:** react-hot-toast 2.6.0
- **Validation:** Zod 4.3.6

#### Backend

- **Runtime:** Node.js
- **Framework:** Express.js 5
- **ORM:** Prisma 6.19.2
- **Database:** PostgreSQL
- **Authentication:** JWT (jsonwebtoken 9.0.3)
- **Password Hashing:** bcrypt 6.0.0
- **OAuth:** Google Auth Library 10.5.0
- **Environment:** dotenv 17.2.3
- **CORS:** cors 2.8.6

#### Development Tools

- **Package Manager:** pnpm
- **Dev Server:** nodemon (backend), next dev (frontend)
- **Linting:** ESLint

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- pnpm (recommended) or npm
- Google OAuth credentials (optional, for Google sign-in)

### Step-by-Step Setup

#### 1. **Clone the Repository**

```bash
git clone <repository-url>
cd Consistify
```

#### 2. **Install Dependencies**

```bash
# Install backend dependencies
cd apps/backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

#### 3. **Configure Environment Variables**

**Backend (.env):**
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

**Frontend (.env):**
Create `/apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

#### 4. **Setup Database**

```bash
cd apps/backend

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init

# (Optional) Seed database
pnpm prisma db seed
```

#### 5. **Run the Application**

**Backend:**

```bash
cd apps/backend
pnpm dev
# Server runs on http://localhost:5001
```

**Frontend:**

```bash
cd apps/frontend
pnpm dev
# App runs on http://localhost:3000
```

#### 6. **Access the Application**

- Open browser: `http://localhost:3000`
- Register a new account or sign in with Google
- Start tracking your tasks!

---

## 📚 Feature Documentation

### Authentication Flow

#### Registration

1. User submits name, username, email, password
2. Backend validates input (unique email/username)
3. Password is hashed with bcrypt
4. User record created in database
5. JWT tokens generated and returned
6. Tokens stored in HTTP-only cookies
7. User redirected to dashboard

#### Login

1. User submits email/username and password
2. Backend finds user and compares password hash
3. If valid, JWT tokens generated
4. Tokens stored in cookies
5. User data returned to frontend
6. Auth context updated

#### Google OAuth

1. User clicks "Sign in with Google"
2. Redirected to Google consent screen
3. Google calls backend callback URL
4. Backend verifies token with Google
5. User created/found in database
6. JWT tokens generated
7. Redirected back to frontend with tokens

### Task Management

#### Creating a Task

- Required: Title, Start Date
- Optional: End Date, Priority (defaults to MEDIUM)
- Validation: No duplicate active tasks with same title (case-insensitive)
- On creation: Task is automatically added to today's task list

#### Completing a Task

- User clicks checkbox in task list
- Frontend calls `/api/daily-status/toggle`
- Backend creates/updates DailyTaskStatus record
- Denormalized data (taskTitle, taskPriority) stored
- Summary is automatically recalculated
- Points, streak, and stats updated in real-time

#### Editing a Task

- User clicks edit icon, makes changes
- Title uniqueness validated
- Task record updated
- Historical DailyTaskStatus records remain unchanged (data preservation)

#### Deleting a Task

- Soft delete: `isActive` set to false
- Task hidden from active task list
- Historical records preserved
- Summary recalculated to exclude deleted task from today's count

### Daily Summary Calculation

The summary is automatically calculated whenever:

- A task is marked as complete/incomplete
- A task is deleted
- User manually triggers recalculation

**Calculation Logic:**

```javascript
totalTasks = count of active tasks with startDate <= today and (no endDate or endDate >= today)
completedTasks = count of completed tasks for today
points = sum of (priority points for each completed task)
  - HIGH: 15 points
  - MEDIUM: 10 points
  - LOW: 5 points
consistency = (completedTasks / totalTasks) * 100
cumulativePoints = sum of all points from beginning
currentStreak = consecutive days with 100% completion ending today
maxStreak = highest streak ever achieved
```

### Historical Data Preservation

**Problem Solved:**
When a user renames or deletes a task, historical data should reflect the task as it existed on past days.

**Solution:**

- **DailyTaskStatus** table stores denormalized data:
  - `taskTitle`: Snapshot of task title on that day
  - `taskPriority`: Snapshot of task priority on that day
- **TaskAuditLog** table stores complete task snapshots per day
- When displaying history, the app uses these snapshots instead of current task data

**Example:**

- Jan 1: Task "Morning Jog" (HIGH priority) completed ✅
- Jan 15: User renames to "Morning Run"
- When viewing Jan 1 history: Still shows "Morning Jog" ✅

---

## 🔌 API Endpoints

### **Authentication**

#### POST `/api/auth/register`

Register a new user

```json
Request:
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: (201 Created)
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER"
  },
  "accessToken": "jwt-token",
  "refreshToken": "jwt-refresh-token"
}
```

#### POST `/api/auth/login`

Login existing user

```json
Request:
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response: (200 OK)
{
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

#### POST `/api/auth/logout`

Logout user (clears cookies)

#### POST `/api/auth/refresh`

Refresh access token using refresh token

#### GET `/api/auth/google`

Initiate Google OAuth flow

#### GET `/api/auth/google/callback`

Google OAuth callback handler

---

### **Tasks** (Protected Routes)

#### POST `/api/tasks`

Create a new task

```json
Request:
{
  "title": "Complete Project Documentation",
  "priority": "HIGH",
  "startDate": "2026-02-13",
  "endDate": "2026-02-20"
}

Response: (201 Created)
{
  "id": "uuid",
  "userId": "uuid",
  "title": "Complete Project Documentation",
  "priority": "HIGH",
  "isActive": true,
  "startDate": "2026-02-13T00:00:00.000Z",
  "endDate": "2026-02-20T00:00:00.000Z",
  "createdAt": "2026-02-13T10:30:00.000Z",
  "updatedAt": "2026-02-13T10:30:00.000Z"
}
```

#### GET `/api/tasks`

Get all active tasks with today's completion status

```json
Response: (200 OK)
[
  {
    "id": "uuid",
    "title": "Complete Project Documentation",
    "priority": "HIGH",
    "isActive": true,
    "startDate": "2026-02-13T00:00:00.000Z",
    "endDate": "2026-02-20T00:00:00.000Z",
    "completed": false,
    "taskTitle": "Complete Project Documentation",
    "taskPriority": "HIGH"
  }
]
```

#### PUT `/api/tasks/:id`

Update a task

```json
Request:
{
  "title": "Updated Title",
  "priority": "MEDIUM"
}

Response: (200 OK)
{ updated task object }
```

#### DELETE `/api/tasks/:id`

Soft delete a task

```json
Response: (200 OK)
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

### **Daily Status** (Protected Routes)

#### POST `/api/daily-status/toggle`

Toggle task completion for a specific date

```json
Request:
{
  "taskId": "uuid",
  "date": "2026-02-13",
  "taskTitle": "Complete Project Documentation",
  "taskPriority": "HIGH"
}

Response: (200 OK)
{
  "id": "uuid",
  "userId": "uuid",
  "taskId": "uuid",
  "date": "2026-02-13T00:00:00.000Z",
  "isCompleted": true,
  "taskTitle": "Complete Project Documentation",
  "taskPriority": "HIGH"
}
```

---

### **Summary** (Protected Routes)

#### GET `/api/summary/today`

Get today's summary with stats

```json
Response: (200 OK)
{
  "id": "uuid",
  "userId": "uuid",
  "date": "2026-02-13T00:00:00.000Z",
  "completedTasks": 5,
  "totalTasks": 8,
  "points": 50,
  "cumulativePoints": 1250,
  "consistency": 62.5,
  "focus": "Finish documentation and fix bugs",
  "mood": "HIGH",
  "notes": "Productive morning!",
  "currentStreak": 7,
  "maxStreak": 15,
  "pointsLastWeek": 380
}
```

#### GET `/api/summary/range?startDate=2026-02-01&endDate=2026-02-13`

Get summary data for a date range

```json
Response: (200 OK)
[
  {
    "date": "2026-02-01T00:00:00.000Z",
    "completedTasks": 6,
    "totalTasks": 8,
    "points": 60,
    "consistency": 75,
    "currentStreak": 1
  },
  ...
]
```

#### PUT `/api/summary/update`

Update daily focus, mood, and notes

```json
Request:
{
  "focus": "Complete all high-priority tasks",
  "mood": "HIGH",
  "notes": "Feeling motivated today!"
}

Response: (200 OK)
{ updated summary object }
```

#### GET `/api/summary/details/:date`

Get detailed summary with task audit logs

```json
Response: (200 OK)
{
  "id": "uuid",
  "date": "2026-02-13T00:00:00.000Z",
  "completedTasks": 5,
  "totalTasks": 8,
  "points": 50,
  "focus": "...",
  "mood": "HIGH",
  "currentStreak": 7,
  "auditLogs": [
    {
      "id": "uuid",
      "taskId": "uuid",
      "title": "Morning Workout",
      "priority": "HIGH",
      "completed": true
    },
    ...
  ]
}
```

---

## 🗃️ Database Schema

### User

```prisma
model User {
  id       String  @id @default(uuid())
  name     String
  username String  @unique
  email    String  @unique
  password String?  // Null for Google OAuth users
  role     Role    @default(USER)  // USER | ADMIN

  tasks        Task[]
  dailyStatus  DailyTaskStatus[]
  dailySummary DailySummary[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Task

```prisma
model Task {
  id       String   @id @default(uuid())
  userId   String
  title    String
  isActive Boolean  @default(true)  // Soft delete flag
  priority Priority @default(MEDIUM)  // LOW | MEDIUM | HIGH

  startDate DateTime
  endDate   DateTime?

  user        User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  dailyStatus DailyTaskStatus[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

### DailyTaskStatus

```prisma
model DailyTaskStatus {
  id           String    @id @default(uuid())
  userId       String
  taskId       String
  date         DateTime
  isCompleted  Boolean   @default(false)

  // Denormalized fields for historical accuracy
  taskTitle    String?
  taskPriority Priority?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([taskId, date])  // One status per task per day
  @@index([userId, date])
}
```

### DailySummary

```prisma
model DailySummary {
  id     String   @id @default(uuid())
  userId String
  date   DateTime

  completedTasks   Int
  totalTasks       Int
  points           Int
  cumulativePoints Int     @default(0)
  consistency      Float

  focus            String?
  mood             Mood?    // LOW | NORMAL | HIGH
  notes            String?

  currentStreak    Int     @default(0)
  maxStreak        Int     @default(0)

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  auditLogs TaskAuditLog[]

  createdAt DateTime @default(now())

  @@unique([userId, date])  // One summary per user per day
  @@index([userId, date])
}
```

### TaskAuditLog

```prisma
model TaskAuditLog {
  id        String   @id @default(uuid())
  summaryId String
  taskId    String
  title     String
  priority  Priority
  completed Boolean  @default(false)

  summary DailySummary @relation(fields: [summaryId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([summaryId])
}
```

---

## 🛠️ How To Complete Remaining Tasks

### **1. Implementing Admin Dashboard**

#### Step 1: Update User Model (if needed)

Already has `role` field (USER | ADMIN), so no schema changes needed.

#### Step 2: Create Admin Middleware

```javascript
// apps/backend/src/middlewares/admin.middleware.js
const ApiError = require("../utils/ApiError");

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    throw new ApiError(403, "Admin access required");
  }
  next();
};

module.exports = requireAdmin;
```

#### Step 3: Create Admin Controller

```javascript
// apps/backend/src/controllers/admin.controller.js
const prisma = require("../configs/prisma");

const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { tasks: true },
        },
      },
    });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Add more functions: deleteUser, updateUserRole, getSystemStats
module.exports = { getAllUsers };
```

#### Step 4: Create Admin Routes

```javascript
// apps/backend/src/routes/admin.routes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/admin.middleware");
const { getAllUsers } = require("../controllers/admin.controller");

router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/users", getAllUsers);
// Add more routes

module.exports = router;
```

#### Step 5: Add Route to Server

```javascript
// In apps/backend/src/server.js
const adminRouter = require("./routes/admin.routes");
app.use("/api/admin", adminRouter);
```

#### Step 6: Create Frontend Admin Pages

```bash
cd apps/frontend/src/app
mkdir admin
cd admin
touch page.tsx layout.tsx
```

```tsx
// apps/frontend/src/app/admin/page.tsx
"use client";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../utils/api";

export default function AdminDashboard() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "ADMIN") {
      router.push("/dashboard");
    } else {
      fetchUsers();
    }
  }, [isLoggedIn, user]);

  const fetchUsers = async () => {
    const response = await api.get("/admin/users");
    setUsers(response.data);
  };

  // Build your admin UI here
  return <div>Admin Dashboard</div>;
}
```

---

### **2. Adding Data Visualization (Charts)**

#### Step 1: Install Chart Library

```bash
cd apps/frontend
pnpm add recharts
```

#### Step 2: Create Chart Component

```tsx
// apps/frontend/src/app/dashboard/components/PointsChart.tsx
"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Props {
  data: { date: string; points: number }[];
}

export function PointsChart({ data }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Points Progression</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="points"
            stroke="#8b5cf6"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

#### Step 3: Fetch Data in Dashboard Hook

```typescript
// In apps/frontend/src/app/dashboard/hooks/useDashboardData.ts
// Add this to the returned data:
const [chartData, setChartData] = useState([]);

useEffect(() => {
  if (enabled) {
    // Fetch last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    api.get(`/summary/range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
      .then(res => {
        const formatted = res.data.map(d => ({
          date: new Date(d.date).toLocaleDateString(),
          points: d.points
        }));
        setChartData(formatted);
      });
  }
}, [enabled]);

return { ..., chartData };
```

#### Step 4: Add to Dashboard

```tsx
// In apps/frontend/src/app/dashboard/page.tsx
import { PointsChart } from "./components/PointsChart";

// In the return JSX:
<section>
  <PointsChart data={chartData} />
</section>;
```

---

### **3. Adding Task Categories**

#### Step 1: Update Prisma Schema

```prisma
// apps/backend/prisma/schema.prisma

model Category {
  id     String @id @default(uuid())
  userId String
  name   String
  color  String  // Hex color code

  user  User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks Task[]

  createdAt DateTime @default(now())

  @@unique([userId, name])
}

model Task {
  // ... existing fields
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
}

model User {
  // ... existing relations
  categories Category[]
}
```

#### Step 2: Run Migration

```bash
cd apps/backend
npx prisma migrate dev --name add_categories
npx prisma generate
```

#### Step 3: Create Category Controller

```javascript
// apps/backend/src/controllers/category.controller.js
const prisma = require("../configs/prisma");

const createCategory = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    const category = await prisma.category.create({
      data: { name, color, userId: req.user.id },
    });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
    });
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

module.exports = { createCategory, getCategories };
```

#### Step 4: Add Routes & Update Task Creation

Update task creation to accept `categoryId`, and create category routes.

#### Step 5: Update Frontend

Add category selector in task creation form and category management UI.

---

### **4. Export to CSV**

#### Backend Endpoint

```javascript
// apps/backend/src/controllers/export.controller.js
const prisma = require("../configs/prisma");

const exportTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      include: { dailyStatus: true },
    });

    // Convert to CSV format
    const csv = [
      "Title,Priority,Start Date,End Date,Completion Count",
      ...tasks.map(
        (t) =>
          `"${t.title}",${t.priority},${t.startDate},${t.endDate || ""},${t.dailyStatus.filter((d) => d.isCompleted).length}`,
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=tasks.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = { exportTasks };
```

#### Frontend Button

```tsx
const handleExport = async () => {
  const response = await api.get("/export/tasks", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "tasks.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
};

<button onClick={handleExport}>Export to CSV</button>;
```

---

## 🐛 Known Issues & Resolutions

### Past Issues (Resolved)

#### 1. **Duplicate DailySummary Records**

**Issue:** Multiple summaries created for the same day  
**Cause:** Date normalization inconsistency  
**Solution:** Implemented proper UTC date normalization in backend:

```javascript
const today = new Date();
today.setUTCHours(0, 0, 0, 0);
```

#### 2. **Task Completion Not Reflecting in History**

**Issue:** Renaming tasks broke historical data  
**Cause:** No data denormalization  
**Solution:** Added `taskTitle` and `taskPriority` to `DailyTaskStatus` model

#### 3. **Prisma Constraint Errors (P2002)**

**Issue:** Race condition creating duplicate status entries  
**Cause:** Multiple simultaneous toggle requests  
**Solution:** Implemented `upsert` strategy in dailyStatus controller

#### 4. **AuditLog Validation Error**

**Issue:** Enum values not recognized after schema update  
**Cause:** Prisma client not regenerated  
**Solution:** Run `npx prisma generate` after schema changes

#### 5. **Axios Proto Key Vulnerability (CVE)**

**Issue:** Denial-of-service vulnerability in Axios  
**Cause:** Axios mergeConfig processing `__proto__` property  
**Solution:** Updated Axios to version 1.13.5 (patched)

---

## 📝 Development Notes

### Running Migrations

Whenever you change `schema.prisma`:

```bash
cd apps/backend
npx prisma migrate dev --name description_of_change
npx prisma generate
```

### Debugging Tips

- Check Prisma Studio to inspect database:
  ```bash
  cd apps/backend
  npx prisma studio
  ```
- View server logs for backend errors
- Use React DevTools for frontend state debugging
- Check browser console for API errors

### Code Quality Guidelines

- ✅ Always validate user input
- ✅ Use TypeScript types for frontend
- ✅ Handle errors gracefully with try-catch
- ✅ Use meaningful variable names
- ✅ Comment complex logic
- ✅ Keep functions small and focused
- ✅ Use environment variables for secrets
- ✅ Write modular, reusable components

---

## 🎯 Priority Roadmap

### Immediate (This Week)

1. ✅ ~~Core CRUD operations~~ (Done)
2. ✅ ~~Authentication system~~ (Done)
3. 🚧 Admin dashboard (In Progress)
4. 🚧 Enhanced data visualization (Next)

### Short-term (This Month)

1. Task categories/tags
2. Profile management page
3. Export functionality (CSV, PDF)
4. Search and advanced filters

### Medium-term (Next 3 Months)

1. Notifications system
2. Recurring tasks
3. Subtasks feature
4. Mobile responsiveness improvements

### Long-term (Future)

1. Mobile app (React Native)
2. Social features
3. Third-party integrations
4. Advanced analytics

---

## 🤝 Contributing

To contribute to this project:

1. Create a feature branch from main
2. Make your changes
3. Test thoroughly
4. Submit a pull request with clear description

---

## 📞 Support

For issues or questions:

- Check this documentation first
- Review [Known Issues](#known-issues--resolutions)
- Check conversation history in project artifacts

---

## 📄 License

[Your License Here]

---

**Last Updated:** February 13, 2026  
**Version:** 1.0.0  
**Maintainer:** [Your Name]
