module.exports = {
  apps: [
    {
      name: 'backend',
      cwd: './apps/backend',
      script: 'sh',
      args: '-c "npx prisma migrate deploy && node src/server.js"',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'frontend',
      cwd: './apps/frontend',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
