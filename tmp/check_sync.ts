
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      email: {
        startsWith: 'damienrenier',
      },
    },
    include: {
      league: true,
      _count: {
        select: { sessions: true }
      }
    }
  });

  console.log('--- Users ---');
  for (const user of users) {
    console.log(`ID: ${user.id}, Email: ${user.email}, League: ${user.league.name} (${user.league.accessCode}), Sessions: ${user._count.sessions}, XP: ${user.totalXP}`);
    
    const lastSession = await prisma.exerciseSession.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    
    if (lastSession) {
      console.log(`  Last Session: ${lastSession.type} - Value: ${lastSession.value} - XP: ${lastSession.xpGained} - Date: ${lastSession.date.toISOString()} - CreatedAt: ${lastSession.createdAt.toISOString()}`);
    } else {
      console.log('  No sessions found.');
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
