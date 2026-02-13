# Database Schema

## Overview

Consistify uses **PostgreSQL** with **Prisma ORM** for type-safe database access. The database schema is designed to support:

- User authentication and management
- Task creation and tracking
- Daily task completion status
- Historical data preservation (snapshots)
- Points and streak calculations

## Models

### User

Stores user account information.

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

**Key Points:**
- `password` is nullable for OAuth users
- `role` supports USER and ADMIN roles
- Cascading deletes ensure cleanup of all user data

---

### Task

Represents a user's task.

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

**Key Points:**
- Soft delete via `isActive` flag preserves historical data
- `endDate` is optional for ongoing tasks
- Priority affects points calculation

---

### DailyTaskStatus

Tracks whether a task was completed on a specific day. Includes **denormalized** task data for historical accuracy.

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

**Key Points:**
- Unique constraint: one record per task per day
- **Denormalized data** (`taskTitle`, `taskPriority`) preserves snapshots
- If a task is renamed/deleted, historical records remain accurate

---

### DailySummary

Aggregated daily statistics for a user.

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

**Key Points:**
- Automatically calculated when tasks are toggled
- Unique constraint: one summary per user per day
- Tracks streaks and cumulative points

---

### TaskAuditLog

Complete snapshot of tasks as they existed on a specific day. Used for historical reporting.

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

**Key Points:**
- Linked to `DailySummary` for a specific date
- Preserves task details even after task deletion

---

## Enums

### Priority

```prisma
enum Priority {
  LOW     // 5 points
  MEDIUM  // 10 points
  HIGH    // 15 points
}
```

### Mood

```prisma
enum Mood {
  LOW
  NORMAL
  HIGH
}
```

### Role

```prisma
enum Role {
  USER
  ADMIN
}
```

---

## Relationships

```
User
 ├── tasks (1:N) → Task
 ├── dailyStatus (1:N) → DailyTaskStatus
 └── dailySummary (1:N) → DailySummary

Task
 └── dailyStatus (1:N) → DailyTaskStatus

DailySummary
 └── auditLogs (1:N) → TaskAuditLog
```

---

## Indexes

- `Task.userId` - Fast task lookups per user
- `DailyTaskStatus.[userId, date]` - Efficient daily status queries
- `DailySummary.[userId, date]` - Fast summary retrieval
- `TaskAuditLog.summaryId` - Quick audit log fetching

---

## Migration Guide

### Running Migrations

After modifying `schema.prisma`:

```bash
cd apps/backend

# Create and apply migration
npx prisma migrate dev --name description_of_change

# Regenerate Prisma Client
npx prisma generate
```

### Inspecting Database

Use Prisma Studio to visualize data:

```bash
cd apps/backend
npx prisma studio
```

This opens a web interface at `http://localhost:5555` where you can browse and edit data.

---

## Data Preservation Strategy

### Problem

When a user renames or deletes a task, historical reports should show the task **as it existed** on past days, not the current state.

### Solution

**Denormalization in `DailyTaskStatus`:**
- `taskTitle` and `taskPriority` are copied from `Task` when the status is created
- These fields never change, even if the original task is updated

**Audit Logs in `TaskAuditLog`:**
- Complete snapshot of all tasks for a given day
- Linked to `DailySummary` for date-specific historical views

**Example:**
- **Jan 1**: Task "Morning Jog" (HIGH) completed ✅
- **Jan 15**: User renames task to "Morning Run"
- **Viewing Jan 1 history**: Still shows "Morning Jog" ✅

---

[← Back to README](../README.md) | [View Features →](./FEATURES.md)
