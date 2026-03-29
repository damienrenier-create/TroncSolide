const { logBatchExercises } = require('./lib/actions/exercise');
// Note: This won't work directly because logBatchExercises is a 'use server' action and uses getServerSession.
// I need a way to simulate the environment or just run the logic manually.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('node:crypto');

async function testLog(userId) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, leagueId: true, email: true }
        });
        
        if (!user) {
            console.error("User not found");
            return;
        }

        console.log(`Testing for user: ${user.email}`);

        const damienEmails = ["damienrenier@hotmail.com", "damienrenier+lescopains@hotmail.com"];
        console.log("Sync check:", damienEmails.includes(user.email));

        if (damienEmails.includes(user.email)) {
            const otherDamiens = await prisma.user.findMany({ 
                where: { 
                    email: { in: damienEmails },
                    id: { not: user.id } 
                } 
            });
            console.log("Other damiens found:", otherDamiens.map(d => d.email));
        }

        console.log("Check complete. If no error above, the logic itself doesn't crash on query.");
    } catch (e) {
        console.error("DEBUG ERROR:", e);
    } finally {
        await prisma.$disconnect();
    }
}

// Target the ID from the previous run
testLog('cmnan6yv30002jx7fbfy7mlj4'); // Dam (Copains)
