const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const summaries = await prisma.dailySummary.findMany({
            orderBy: { date: 'desc' },
            take: 20
        });

        console.log("Found " + summaries.length + " summaries.");
        summaries.forEach(s => {
            console.log(`ID: ${s.id} | Date: ${s.date} | User: ${s.userId} | Tasks: ${s.completedTasks}/${s.totalTasks}`);
        });

        const users = await prisma.user.findMany();
        console.log("\nUsers:", users.map(u => ({ id: u.id, email: u.email })));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
