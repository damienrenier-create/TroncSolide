const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const original = await prisma.user.findUnique({ where: { email: 'damienrenier@hotmail.com' } });
        if (!original) throw new Error("Original not found");

        const targetLeagueId = 'cmn2dqdus00001j6j7k62wbhf'; // Nouvelle Ligue

        const clonePayload = {
            email: 'damienrenier+clone@hotmail.com',
            password: original.password,
            nickname: 'Dam',
            birthday: original.birthday,
            role: 'USER',
            leagueId: targetLeagueId,
            inCagnotte: true,
            active: true
        };

        const existingClone = await prisma.user.findUnique({ where: { email: clonePayload.email } });
        let clone;
        if (existingClone) {
            console.log("Clone already exists with ID:", existingClone.id);
            clone = existingClone;
        } else {
            clone = await prisma.user.create({ data: clonePayload });
            console.log("Clone created with ID:", clone.id);
        }

        console.log("Original ID:", original.id);
        console.log("Clone ID:", clone.id);

    } catch (e) {
        console.error(e);
    }
}

main().finally(() => prisma.$disconnect());
