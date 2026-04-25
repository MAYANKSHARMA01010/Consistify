const { PrismaClient } = require("@prisma/client");

const dbUrl = process.env.DATABASE_SERVER_URL || process.env.DATABASE_LOCAL_URL || process.env.DATABASE_URL;

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});

module.exports = prisma;
