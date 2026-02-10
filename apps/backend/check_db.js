const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkDuplicates() {
    try {
        const summaries = await prisma.dailySummary.findMany({
            orderBy: { date: 'asc' }
        });

        console.log("--- Daily Summaries ---");
        summaries.forEach(s => {
            console.log(`ID: ${s.id}, Date: ${s.date.toISOString()}, User: ${s.userId}`);
        });

        const counts = await prisma.dailySummary.groupBy({
            by: ['userId', 'date'],
            _count: {
                id: true
            }
        });

        console.log("\n--- Duplicate Check ---");
        const duplicates = counts.filter(c => c._count.id > 1);
        if (duplicates.length === 0) {
            console.log("No duplicates found in the database.");
        } else {
            console.log("Found duplicates!");
            duplicates.forEach(d => {
                console.log(`User: ${d.userId}, Date: ${d.date.toISOString()}, Count: ${d._count.id}`);
            });
        }
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDuplicates();
