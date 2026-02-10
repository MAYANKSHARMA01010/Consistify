const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanup() {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        console.log("Cleaning up historical summaries (records NOT for today)...");

        const deleted = await prisma.dailySummary.deleteMany({
            where: {
                date: {
                    lt: today
                }
            }
        });

        console.log(`Successfully deleted ${deleted.count} historical records.`);

        const remaining = await prisma.dailySummary.findMany();
        console.log("\n--- Remaining Summaries ---");
        remaining.forEach(s => {
            console.log(`ID: ${s.id}, Date: ${s.date.toISOString()}, User: ${s.userId}`);
        });

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
