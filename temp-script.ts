import prisma from './lib/prisma';

async function main() {
    const dam = await prisma.user.findFirst({
        where: { nickname: 'Dam', league: { name: 'Ligue Principale' } },
        include: { badges: { include: { badge: true } } }
    });
    if(!dam) return;
    
    for(const ub of dam.badges.slice(0, 5)) {
        console.log(ub.badge.name, ub.baseXP);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
