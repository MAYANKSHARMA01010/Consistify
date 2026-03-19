FROM node:20-alpine

# Install pnpm and pm2 globally
RUN npm install -g pnpm pm2

WORKDIR /app

# Copy the entire project
COPY . .

# Install dependencies for both apps
# (Assuming they are not in a pnpm workspace, so we install in each directory)
RUN cd apps/backend && pnpm install
RUN cd apps/frontend && pnpm install

# Build the applications
RUN cd apps/backend && npx prisma generate
RUN cd apps/frontend && pnpm build

# Expose ports for both services
EXPOSE 3000
EXPOSE 5000

# Start both services using pm2
CMD ["pm2-runtime", "ecosystem.config.js"]
