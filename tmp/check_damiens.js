const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDamiens() {
  const damienEmails = ["damienrenier@hotmail.com", "damienrenier+lescopains@hotmail.com", "damienrenier+clone@hotmail.com", "damienrenier+clone2@hotmail.com"];
  const users = await prisma.user.findMany({
    where: { email: { in: damienEmails } },
    select: { id: true, email: true, joinedAt: true, totalXP: true, level: true, currentStreak: true }
  });
  console.log(JSON.stringify(users, null, 2));
}

checkDamiens()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
