**📚 Documentation:** [🏠 README](../README.md) • [🏗️ Architecture](./ARCHITECTURE.md) • [🚀 Setup](./SETUP.md) • [🔌 API](./API.md) • [🗄️ Database](./DATABASE.md) • [✅ Features](./FEATURES.md) • [🗺️ Roadmap](./ROADMAP.md) • [🛠️ Development](./DEVELOPMENT.md) • [🐛 Issues](./ISSUES.md)

---

# API Documentation

All API endpoints are prefixed with the base URL: `http://localhost:5001/api` (development)

## Authentication Endpoints

### POST `/auth/register`

Register a new user

**Request:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** (201 Created)
```json
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

### POST `/auth/login`

Login existing user

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** (200 OK)
```json
{
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### POST `/auth/logout`

Logout user (clears cookies)

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST `/auth/refresh`

Refresh access token using refresh token

**Response:** (200 OK)
```json
{
  "accessToken": "new-jwt-token"
}
```

### GET `/auth/google`

Initiate Google OAuth flow

### GET `/auth/google/callback`

Google OAuth callback handler

---

## Task Endpoints (Protected)

All task endpoints require authentication via JWT token.

### POST `/tasks`

Create a new task

**Request:**
```json
{
  "title": "Complete Project Documentation",
  "priority": "HIGH",
  "startDate": "2026-02-13",
  "endDate": "2026-02-20"
}
```

**Response:** (201 Created)
```json
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

### GET `/tasks`

Get all active tasks with today's completion status

**Response:** (200 OK)
```json
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

### PUT `/tasks/:id`

Update a task

**Request:**
```json
{
  "title": "Updated Title",
  "priority": "MEDIUM"
}
```

**Response:** (200 OK)
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "priority": "MEDIUM",
  ...
}
```

### DELETE `/tasks/:id`

Soft delete a task

**Response:** (200 OK)
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

## Daily Status Endpoints (Protected)

### POST `/daily-status/toggle`

Toggle task completion for a specific date

**Request:**
```json
{
  "taskId": "uuid",
  "date": "2026-02-13",
  "taskTitle": "Complete Project Documentation",
  "taskPriority": "HIGH"
}
```

**Response:** (200 OK)
```json
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

## Summary Endpoints (Protected)

### GET `/summary/today`

Get today's summary with stats

**Response:** (200 OK)
```json
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

### GET `/summary/range`

Get summary data for a date range

**Query Parameters:**
- `startDate` (required): ISO date string (e.g., `2026-02-01`)
- `endDate` (required): ISO date string (e.g., `2026-02-13`)

**Example:** `/summary/range?startDate=2026-02-01&endDate=2026-02-13`

**Response:** (200 OK)
```json
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

### PUT `/summary/update`

Update daily focus, mood, and notes

**Request:**
```json
{
  "focus": "Complete all high-priority tasks",
  "mood": "HIGH",
  "notes": "Feeling motivated today!"
}
```

**Response:** (200 OK)
```json
{
  "id": "uuid",
  "focus": "Complete all high-priority tasks",
  "mood": "HIGH",
  "notes": "Feeling motivated today!",
  ...
}
```

### GET `/summary/details/:date`

Get detailed summary with task audit logs

**Example:** `/summary/details/2026-02-13`

**Response:** (200 OK)
```json
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

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid input data",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

[← Back to README](../README.md) | [View Database Schema →](./DATABASE.md)
