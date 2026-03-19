FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma

RUN pnpm install

COPY . .

RUN npx prisma generate

EXPOSE 5000

# 👇 IMPORTANT
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]