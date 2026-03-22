const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const code = '405364';

  // Check if exists
  const existing = await prisma.league.findUnique({ where: { accessCode: code } });
  if (existing) {
    console.log(`Ligue déjà existante: ${existing.name}`);
    return;
  }

  const league = await prisma.league.create({
    data: {
      name: 'Ligue Principale',
      accessCode: code,
    }
  });

  console.log(`Ligue créée avec succès: ${league.name} avec le code ${league.accessCode}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
