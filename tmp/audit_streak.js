const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLescopainsStreak() {
  const email = "damienrenier+lescopains@hotmail.com";
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      sessions: {
        orderBy: { date: 'desc' },
      }
    }
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  console.log(`User: ${user.email}`);
  console.log(`CurrentStreak: ${user.currentStreak}`);
  console.log(`JoinedAt: ${user.joinedAt}`);
  
  console.log("\nSessions (Last 10):");
  user.sessions.slice(0, 10).forEach(s => {
    console.log(`- Date: ${s.date.toISOString()}, Value: ${s.value}, CreatedAt: ${s.createdAt.toISOString()}`);
  });

  // Manual streak calculation simulation
  const uniqueDates = Array.from(new Set(user.sessions.map(s => {
    const d = new Date(s.date);
    d.setHours(0,0,0,0);
    return d.getTime();
  }))).sort((a,b) => b-a);

  console.log("\nUnique Dates (Midnight UTC):");
  uniqueDates.forEach(d => console.log(new Date(d).toISOString()));
}

checkLescopainsStreak()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
