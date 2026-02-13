**📚 Documentation:** [🏠 README](../README.md) • [🏗️ Architecture](./ARCHITECTURE.md) • [🚀 Setup](./SETUP.md) • [🔌 API](./API.md) • [🗄️ Database](./DATABASE.md) • [✅ Features](./FEATURES.md) • [🗺️ Roadmap](./ROADMAP.md) • [🛠️ Development](./DEVELOPMENT.md) • [🐛 Issues](./ISSUES.md)

---

# Development Guide

## 🛠️ How To Implement Features

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

## 📝 Development Best Practices

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

[← Back to README](../README.md) | [View Known Issues →](./ISSUES.md)
