
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({ where: { nickname: 'Dam (Clan)' } });
    if (!user) return;

    const badges = await prisma.userBadge.findMany({
        where: { userId: user.id },
        include: {
            badge: true
        }
    });

    console.log(JSON.stringify(badges, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
