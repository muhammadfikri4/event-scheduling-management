const { Client } = require("pg");
const { randomBytes } = require("crypto");
const bcrypt = require("bcryptjs");
require("dotenv").config();

function cuid() {
  return "c" + randomBytes(12).toString("hex");
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const now = new Date().toISOString();

  // Seed Users
  const users = [
    { username: "admin", password: "admin123", name: "Administrator" },
    { username: "operator", password: "operator123", name: "Operator" },
  ];

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    await client.query(
      `INSERT INTO "User" (id, username, password, name, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (username) DO NOTHING`,
      [cuid(), u.username, hashedPassword, u.name, now, now]
    );
  }

  // Seed Teams
  const teams = [
    { name: "Berau Coal", color: "#3B82F6" },
    { name: "Bayan Group", color: "#EF4444" },
    { name: "HPU", color: "#F59E0B" },
    { name: "KPC", color: "#10B981" },
    { name: "Amman", color: "#8B5CF6" },
    { name: "Mifa Berasauda", color: "#EC4899" },
    { name: "CK", color: "#06B6D4" },
    { name: "NSR", color: "#F97316" },
    { name: "Kideco", color: "#14B8A6" },
    { name: "Adaro", color: "#6366F1" },
    { name: "BIB", color: "#84CC16" },
    { name: "Indexim", color: "#A855F7" },
    { name: "Petrosa", color: "#D946EF" },
    { name: "BAS", color: "#0EA5E9" },
    { name: "Bukit Asam", color: "#78716C" },
  ];

  for (const t of teams) {
    await client.query(
      `INSERT INTO "Team" (id, name, color, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (name) DO NOTHING`,
      [cuid(), t.name, t.color, now, now]
    );
  }

  // Seed Competition Types
  const competitionTypes = [
    { name: "Road Crash Rescue", code: "RCR", color: "#DC2626" },
    { name: "Under Water Rescue", code: "UWRR", color: "#2563EB" },
    { name: "High Angle Rescue", code: "VR", color: "#D97706" },
    { name: "Confined Space Rescue", code: "CSR", color: "#7C3AED" },
    { name: "Structural Fire Fighting", code: "SFF", color: "#059669" },
  ];

  for (const ct of competitionTypes) {
    await client.query(
      `INSERT INTO "CompetitionType" (id, name, code, color, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (code) DO NOTHING`,
      [cuid(), ct.name, ct.code, ct.color, now, now]
    );
  }

  // Seed Time Slots
  const timeSlots = [
    { startTime: "08:00", endTime: "09:30", order: 1 },
    { startTime: "09:45", endTime: "11:15", order: 2 },
    { startTime: "11:30", endTime: "13:00", order: 3 },
    { startTime: "13:15", endTime: "14:45", order: 4 },
    { startTime: "15:00", endTime: "16:30", order: 5 },
  ];

  for (const ts of timeSlots) {
    await client.query(
      `INSERT INTO "TimeSlot" (id, "startTime", "endTime", "order", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT ("startTime", "endTime") DO NOTHING`,
      [cuid(), ts.startTime, ts.endTime, ts.order, now, now]
    );
  }

  console.log("Seed completed successfully!");
  console.log("Users created:");
  console.log("  - admin / admin123");
  console.log("  - operator / operator123");
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
