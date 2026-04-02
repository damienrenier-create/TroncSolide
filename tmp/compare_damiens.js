const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function compareDamiens() {
  const emails = ["damienrenier@hotmail.com", "damienrenier+lescopains@hotmail.com"];
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    include: {
      sessions: {
        orderBy: { date: 'desc' },
        select: { date: true, type: true, value: true }
      }
    }
  });

  users.forEach(u => {
    console.log(`User: ${u.email}`);
    console.log(`JoinedAt: ${u.joinedAt}`);
    console.log(`CurrentStreak: ${u.currentStreak}`);
    console.log(`Session count: ${u.sessions.length}`);
    const uniqueDates = [...new Set(u.sessions.map(s => s.date.toISOString().split('T')[0]))];
    console.log(`Unique dates: ${uniqueDates.slice(0, 5).join(', ')}...`);
    console.log('---');
  });
}

compareDamiens()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
