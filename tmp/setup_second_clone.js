const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const original = await prisma.user.findUnique({ where: { email: 'damienrenier@hotmail.com' } });
        if (!original) throw new Error("Original not found");

        const clone1 = await prisma.user.findUnique({ where: { email: 'damienrenier+clone@hotmail.com' } });

        // 1. Create the new League
        const leagueName = "CLAN PRIGNON";
        const accessCode = "CLANPRIGNON";

        let league = await prisma.league.findUnique({ where: { accessCode } });
        if (!league) {
            league = await prisma.league.create({
                data: {
                    name: leagueName,
                    accessCode: accessCode,
                }
            });
            console.log("League created:", league.id);
        } else {
            console.log("League already exists:", league.id);
        }

        // 2. Create the second Clone
        const clone2Payload = {
            email: 'damienrenier+clone2@hotmail.com',
            password: original.password,
            nickname: 'Dam (Clan)',
            birthday: original.birthday,
            role: 'USER',
            leagueId: league.id,
            inCagnotte: true,
            active: true
        };

        const existingClone2 = await prisma.user.findUnique({ where: { email: clone2Payload.email } });
        let clone2;
        if (existingClone2) {
            console.log("Clone 2 already exists with ID:", existingClone2.id);
            clone2 = existingClone2;
        } else {
            clone2 = await prisma.user.create({ data: clone2Payload });
            console.log("Clone 2 created with ID:", clone2.id);
        }

        console.log("---- SUMMARY ----");
        console.log("Original ID:", original.id);
        if (clone1) console.log("Clone 1 ID:", clone1.id);
        console.log("Clone 2 ID:", clone2.id);
        console.log("League ID (CLANPRIGNON):", league.id);

    } catch (e) {
        console.error(e);
    }
}

main().finally(() => prisma.$disconnect());
