# Contributing to Consistify

Thank you for your interest in contributing to Consistify! We welcome contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)

---

## Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Screenshots** (if applicable)
- **Environment details** (OS, Node version, browser)
- **Error messages** or console logs

### 💡 Suggesting Features

Feature suggestions are welcome! Please:

- Check if the feature has already been suggested
- Provide a clear description of the feature
- Explain why this feature would be useful
- Include mockups or examples if possible

### 🔧 Code Contributions

1. **Fork the repository**
2. **Create a feature branch** from `main`
3. **Make your changes**
4. **Test thoroughly**
5. **Submit a pull request**

---

## Development Setup

### Prerequisites

- Node.js v18 or higher
- PostgreSQL database
- pnpm (recommended) or npm

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Consistify.git
cd Consistify

# Install backend dependencies
cd apps/backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install

# Setup environment variables
# Create .env in apps/backend (see docs/SETUP.md)
# Create .env.local in apps/frontend

# Run database migrations
cd apps/backend
npx prisma migrate dev
npx prisma generate

# Start development servers
# Terminal 1: Backend
cd apps/backend
pnpm dev

# Terminal 2: Frontend
cd apps/frontend
pnpm dev
```

For detailed setup instructions, see [docs/SETUP.md](./docs/SETUP.md).

---

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] Self-review of your code
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] No new warnings or errors
- [ ] Tested on multiple browsers (for frontend changes)
- [ ] Database migrations tested (if applicable)

### Submitting Your PR

1. **Update your fork** with the latest from `main`
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-feature-branch
   git rebase main
   ```

2. **Push your changes**
   ```bash
   git push origin your-feature-branch
   ```

3. **Create the PR**
   - Use a clear, descriptive title
   - Reference any related issues (#issue-number)
   - Describe what changed and why
   - Include screenshots for UI changes
   - List any breaking changes

4. **Respond to feedback**
   - Address reviewer comments
   - Push additional commits if needed
   - Request re-review when ready

### PR Review Criteria

Your PR will be reviewed for:

- **Code quality** - Clean, readable, maintainable
- **Functionality** - Works as intended, no bugs
- **Performance** - No significant performance degradation
- **Security** - No security vulnerabilities
- **Documentation** - Adequate comments and docs
- **Testing** - Proper test coverage (when applicable)

---

## Coding Guidelines

### General Principles

- **Keep it simple** - KISS principle
- **Don't repeat yourself** - DRY principle
- **Single responsibility** - Each function/component does one thing well
- **Consistent naming** - Use descriptive, meaningful names
- **Comments** - Explain "why", not "what"

### TypeScript/JavaScript

```typescript
// ✅ Good
const calculateDailyPoints = (tasks: Task[]): number => {
  return tasks.reduce((total, task) => {
    if (task.isCompleted) {
      return total + getPriorityPoints(task.priority);
    }
    return total;
  }, 0);
};

// ❌ Avoid
const calc = (t: any) => {
  let p = 0;
  for(let i = 0; i < t.length; i++) {
    if(t[i].c) p += t[i].p === 'H' ? 15 : t[i].p === 'M' ? 10 : 5;
  }
  return p;
};
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use TypeScript for type safety
- Follow naming conventions:
  - Components: `PascalCase` (e.g., `TaskList.tsx`)
  - Hooks: `camelCase` starting with `use` (e.g., `useDashboardData.ts`)
  - Utilities: `camelCase` (e.g., `formatDate.ts`)

### CSS/Styling

- Use TailwindCSS utility classes
- Follow mobile-first approach
- Maintain dark mode compatibility
- Use consistent spacing (Tailwind spacing scale)

### Backend (Express/Prisma)

- Use async/await (avoid callbacks)
- Proper error handling with try-catch
- Validate input data
- Use Prisma transactions for multiple operations
- Follow RESTful API conventions

---

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic changes)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(tasks): add task categories and filtering

Implemented task categorization with color-coded tags.
Users can now filter tasks by category in the dashboard.

Closes #42

---

fix(auth): resolve token refresh race condition

Fixed issue where multiple refresh requests could cause
authentication to fail unexpectedly.

Fixes #87

---

docs(readme): update installation instructions

Added troubleshooting section for common setup issues.
```

### Commit Best Practices

- Keep commits atomic (one logical change per commit)
- Write clear, concise commit messages
- Reference issue numbers when applicable
- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")

---

## Questions?

- 📖 Check the [documentation](./docs/)
- 💬 Open a [discussion](https://github.com/MAYANKSHARMA01010/Consistify/discussions)
- 🐛 Review [known issues](./docs/ISSUES.md)

---

**Thank you for contributing to Consistify!** 🎉
