const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findFirst({where: {nickname: 'Dam'}}).then(console.log).finally(()=>prisma.$disconnect());
