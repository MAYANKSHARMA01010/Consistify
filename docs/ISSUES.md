**📚 Documentation:** [🏠 README](../README.md) • [🏗️ Architecture](./ARCHITECTURE.md) • [🚀 Setup](./SETUP.md) • [🔌 API](./API.md) • [🗄️ Database](./DATABASE.md) • [✅ Features](./FEATURES.md) • [🗺️ Roadmap](./ROADMAP.md) • [🛠️ Development](./DEVELOPMENT.md) • [🐛 Issues](./ISSUES.md)

---

# Known Issues & Resolutions

## 🐛 Past Issues (Resolved)

### 1. **Duplicate DailySummary Records**

**Issue:** Multiple summaries created for the same day  
**Cause:** Date normalization inconsistency  
**Solution:** Implemented proper UTC date normalization in backend:

```javascript
const today = new Date();
today.setUTCHours(0, 0, 0, 0);
```

**Status:** ✅ Resolved

---

### 2. **Task Completion Not Reflecting in History**

**Issue:** Renaming tasks broke historical data  
**Cause:** No data denormalization  
**Solution:** Added `taskTitle` and `taskPriority` to `DailyTaskStatus` model

**Status:** ✅ Resolved

---

### 3. **Prisma Constraint Errors (P2002)**

**Issue:** Race condition creating duplicate status entries  
**Cause:** Multiple simultaneous toggle requests  
**Solution:** Implemented `upsert` strategy in dailyStatus controller

```javascript
const dailyStatus = await prisma.dailyTaskStatus.upsert({
  where: {
    taskId_date: {
      taskId: taskId,
      date: normalizedDate,
    },
  },
  update: {
    isCompleted: !existingStatus.isCompleted,
  },
  create: {
    userId: req.user.id,
    taskId: taskId,
    date: normalizedDate,
    isCompleted: true,
    taskTitle: taskTitle,
    taskPriority: taskPriority,
  },
});
```

**Status:** ✅ Resolved

---

### 4. **AuditLog Validation Error**

**Issue:** Enum values not recognized after schema update  
**Cause:** Prisma client not regenerated  
**Solution:** Run `pnpx prisma generate` after schema changes

**Checklist:**
```bash
cd apps/backend
pnpx prisma migrate dev --name description
pnpx prisma generate
# Restart server
```

**Status:** ✅ Resolved

---

### 5. **Prisma 7.5.0 Connection URL Error**

**Issue:** Render deployment failed with `Error code: P1012`.  
**Cause:** Prisma 7.0+ deprecated the `url` property inside `schema.prisma`. Dependabot upgraded `@prisma/client` and `prisma` to `7.5.0` which broke the build.  
**Solution:** Downgraded Prisma back to `~6.19.2`. Added an ignore rule in `.github/dependabot.yml` to prevent Dependabot from installing Prisma `7.x.x` updates until the codebase connection logic is refactored.

**Status:** ✅ Resolved

---


### 5. **Axios Proto Key Vulnerability (CVE)**

**Issue:** Denial-of-service vulnerability in Axios  
**Cause:** Axios mergeConfig processing `__proto__` property  
**Solution:** Updated Axios to version 1.13.5 (patched)

```bash
cd apps/frontend
pnpm update axios@1.13.5
```

**Status:** ✅ Resolved

---

## 🔍 Debugging Strategies

### Database Issues

1. **Check Prisma Studio:**
   ```bash
   cd apps/backend
   pnpx prisma studio
   ```
   - Inspect data directly
   - Verify relationships
   - Check for duplicate records

2. **View Database Logs:**
   - Enable Prisma query logging in development
   - Check PostgreSQL logs

3. **Reset Database (Development Only):**
   ```bash
   cd apps/backend
   pnpx prisma migrate reset
   pnpx prisma migrate dev
   pnpx prisma generate
   ```

### Authentication Issues

1. **Token Errors:**
   - Check JWT secrets in `.env`
   - Verify token expiry settings
   - Clear browser cookies
   - Check HTTP-only cookie configuration

2. **Google OAuth Issues:**
   - Verify callback URL matches Google Cloud Console
   - Check client ID and secret
   - Ensure redirect URI is authorized

### Frontend Issues

1. **State Not Updating:**
   - Check React DevTools for context state
   - Verify API calls are completing
   - Check for stale closures in useEffect

2. **API Errors:**
   - Open browser console
   - Check Network tab for failed requests
   - Verify backend is running
   - Check CORS configuration

### Backend Issues

1. **Server Crashes:**
   - Check server logs
   - Verify environment variables
   - Check database connection
   - Ensure all dependencies are installed

2. **Route Not Found:**
   - Verify route is registered in server.js
   - Check middleware order
   - Ensure authentication middleware is applied

---

## 💡 Common Pitfalls

### 1. **Forgetting to Regenerate Prisma Client**

After any schema change:
```bash
pnpx prisma generate
```

### 2. **Environment Variables Not Loading**

- Restart server after `.env` changes
- Check for typos in variable names
- Ensure `.env` file is in correct directory

### 3. **Date/Time Inconsistencies**

- Always normalize dates to UTC midnight
- Use ISO strings for API communication
- Be aware of timezone differences

### 4. **CORS Errors**

- Verify frontend URL in backend CORS config
- Check credentials: 'include' in API calls
- Ensure both frontend and backend URLs match

### 5. **Soft Delete Issues**

- Remember to filter `isActive: true` in queries
- Don't hard delete tasks to preserve history
- Consider cascade behavior on soft deletes

---

## 📞 Support & Resources

### Internal Resources

- [Setup Guide](./SETUP.md) - Installation and configuration
- [API Documentation](./API.md) - Endpoint reference
- [Database Schema](./DATABASE.md) - Data model reference
- [Development Guide](./DEVELOPMENT.md) - Implementation examples

### External Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

---

[← Back to README](../README.md)
