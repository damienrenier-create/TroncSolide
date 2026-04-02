import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getBrusselsToday } from '@/lib/date-utils';
import { getLevelInfo } from '@/lib/constants/levels';

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const today = getBrusselsToday();
        
        // Find all active users and their badges to distribute XP
        const users = await prisma.user.findMany({
            where: { active: true },
            include: { badges: true }
        });

        let distributions = 0;

        for (const user of users) {
            // Check if rent already paid today (Idempotency)
            const paidToday = await prisma.xpTransaction.findFirst({
                where: {
                    userId: user.id,
                    source: "RENT_DAILY",
                    date: today
                }
            });

            if (paidToday) continue;

            const nightlyRent = user.badges.reduce((acc, b) => acc + (b.rateXP || 0), 0);
            
            if (nightlyRent > 0) {
                await prisma.$transaction(async (tx) => {
                    const newTotal = user.totalXP + nightlyRent;
                    const newLevelInfo = getLevelInfo(newTotal);

                    await tx.user.update({
                        where: { id: user.id },
                        data: {
                            totalXP: newTotal,
                            level: newLevelInfo.level
                        }
                    });

                    await tx.xpTransaction.create({
                        data: {
                            userId: user.id,
                            amount: nightlyRent,
                            source: "RENT_DAILY",
                            date: today
                        }
                    });

                    // If level evolved due to rent
                    if (newLevelInfo.level > user.level) {
                        for(let l = user.level + 1; l <= newLevelInfo.level; l++) {
                            await tx.feedItem.create({
                                data: {
                                    leagueId: user.leagueId,
                                    userId: user.id,
                                    type: "LEVEL_UP",
                                    level: l
                                }
                            });
                        }
                    }
                });
                
                distributions++;
            }
        }

        return NextResponse.json({ success: true, distributions, date: today });
    } catch (error) {
        console.error("Nightly Cron Error:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
