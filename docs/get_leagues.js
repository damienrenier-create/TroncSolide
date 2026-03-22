const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const leagues = await prisma.league.findMany({
        select: { name: true, accessCode: true }
    });
    console.log(JSON.stringify(leagues, null, 2));
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
