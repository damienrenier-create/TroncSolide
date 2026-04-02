const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { startOfDay, subDays } = require('date-fns');

// Mock getBrusselsDate logic from lib/date-utils.ts
function getBrusselsDate(date = new Date()) {
    const brusselsStr = date.toLocaleString("en-US", { timeZone: "Europe/Brussels" });
    return new Date(brusselsStr);
}

function getBrusselsToday() {
    return startOfDay(getBrusselsDate());
}

async function debugStreakLogic() {
  const email = "damienrenier+lescopains@hotmail.com";
  const user = await prisma.user.findUnique({
    where: { email },
    include: { sessions: { orderBy: { date: 'desc' } } }
  });

  if (!user) return console.log("User not found");

  const sessions = user.sessions;
  
  // Logic from updateUserStreak.ts
  const uniqueDates = Array.from(new Set(sessions.map(s => {
      const bd = getBrusselsDate(s.date);
      bd.setHours(0, 0, 0, 0);
      return bd.getTime();
  }))).sort((a,b)=>b-a);

  console.log("Unique dates found by logic (UTC):");
  uniqueDates.forEach(d => console.log(new Date(d).toISOString()));

  let currentStreak = 0;
  let todayDate = getBrusselsToday();
  console.log("\nToday according to logic (UTC):", todayDate.toISOString());

  for (let i = 0; i < 10; i++) {
      const checkDate = subDays(todayDate, i).getTime();
      const checkDateStr = new Date(checkDate).toISOString();
      const found = uniqueDates.includes(checkDate);
      console.log(`Checking Day -${i} (${checkDateStr}): ${found ? 'FOUND' : 'NOT FOUND'}`);
      
      if (found) {
          currentStreak++;
      } else if (i === 0) {
          continue;
      } else {
          break;
      }
  }

  console.log("\nCalculated Streak:", currentStreak);
}

debugStreakLogic()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
