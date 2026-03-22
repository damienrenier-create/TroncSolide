const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const existing = await prisma.league.findUnique({
            where: { accessCode: "060488" }
        });

        if (existing) {
            console.log("League already exists:", existing);
            return;
        }

        const league = await prisma.league.create({
            data: {
                name: "Nouvelle Ligue",
                accessCode: "060488"
            }
        });
        console.log("League successfully created:", league);
    } catch (e) {
        console.error(e);
    }
}

main().finally(async () => {
    await prisma.$disconnect();
});
