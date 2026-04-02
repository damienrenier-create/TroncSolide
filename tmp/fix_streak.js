const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { subDays, startOfDay } = require('date-fns');

function getBrusselsDate(date = new Date()) {
    const brusselsStr = date.toLocaleString("en-US", { timeZone: "Europe/Brussels" });
    return new Date(brusselsStr);
}

async function runFix() {
  const email = "damienrenier+lescopains@hotmail.com";
  const user = await prisma.user.findUnique({ where: { email }, include: { sessions: true } });
  if (!user) return console.log("User not found");

  const uniqueDates = Array.from(new Set(user.sessions.map(s => {
      const bd = getBrusselsDate(s.date);
      bd.setHours(0, 0, 0, 0);
      return bd.getTime();
  }))).sort((a,b)=>b-a);

  let currentStreak = 0;
  let todayDate = startOfDay(getBrusselsDate());

  for (let i = 0; i < 1000; i++) {
      const checkDate = subDays(todayDate, i).getTime();
      if (uniqueDates.includes(checkDate)) {
          currentStreak++;
      } else if (i === 0) {
          continue;
      } else {
          break;
      }
  }

  const highestStreak = Math.max(currentStreak, user.highestStreak || 0);

  await prisma.user.update({
      where: { id: user.id },
      data: { currentStreak, highestStreak }
  });

  console.log(`Updated ${email}: Streak = ${currentStreak}, Highest = ${highestStreak}`);
}

runFix().catch(console.error).finally(() => prisma.$disconnect());
