
const { differenceInCalendarDays, startOfDay } = require('date-fns');

// Mock getBrusselsDate and getBrusselsToday (simple version for the script)
function getBrusselsDate(date = new Date()) {
    const brusselsStr = date.toLocaleString("en-US", { timeZone: "Europe/Brussels" });
    return new Date(brusselsStr);
}

function getBrusselsToday() {
    return startOfDay(getBrusselsDate());
}

function calculateTarget(joinedAt, checkDate) {
    const today = startOfDay(getBrusselsDate(checkDate));
    const joinedDay = getBrusselsDate(joinedAt);
    const daysSince = differenceInCalendarDays(today, joinedDay);
    return daysSince + 1;
}

const now = new Date("2026-03-29T10:00:00Z"); // Today 10 AM UTC

const cases = [
    { name: "Joined yesterday evening", joinedAt: new Date("2026-03-28T20:00:00Z") },
    { name: "Joined yesterday morning", joinedAt: new Date("2026-03-28T08:00:00Z") },
    { name: "Joined today early morning", joinedAt: new Date("2026-03-29T01:00:00Z") },
    { name: "Joined 2 days ago", joinedAt: new Date("2026-03-27T12:00:00Z") }
];

console.log("Evaluation for today:", now.toISOString());
cases.forEach(c => {
    const target = calculateTarget(c.joinedAt, now);
    console.log(`${c.name.padEnd(30)} | Joined: ${c.joinedAt.toISOString().slice(0, 16)} | Target: ${target}`);
});
