// prisma/sim-battles.ts
// Simulate bot-vs-bot battles to populate leaderboards and battle history
// Run: npm run db:sim-battles
// Optional: npm run db:sim-battles -- --count 500

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// --- Battle constants (mirrors lib/battle.ts) ---

const MAX_VARIANCE_PERCENT = 5;
const BASE_RANKING_POINTS = 25;
const MIN_RANKING_CHANGE = 10;
const MAX_RANKING_CHANGE = 50;
const BATCH_SIZE = 25;

// --- Helpers ---

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollVariance(basePower: number): number {
  const percent = (Math.random() * 2 - 1) * MAX_VARIANCE_PERCENT;
  return Math.round((basePower * percent) / 100);
}

function calculateRankingPointsChange(
  winnerRanking: number,
  loserRanking: number,
): number {
  const diff = loserRanking - winnerRanking;
  const modifier = Math.round(diff / 50);
  return Math.max(
    MIN_RANKING_CHANGE,
    Math.min(MAX_RANKING_CHANGE, BASE_RANKING_POINTS + modifier),
  );
}

// --- Main ---

async function main() {
  // Parse --count from CLI args (default 200)
  const countArg = process.argv.find((a) => a.startsWith("--count"));
  const countIdx = process.argv.indexOf("--count");
  const battleCount =
    countIdx !== -1 && process.argv[countIdx + 1]
      ? parseInt(process.argv[countIdx + 1], 10)
      : 200;

  console.log(`\n⚔️  Simulating ${battleCount} bot battles...\n`);

  // 1. Load all bots with their characters and power
  const bots = await prisma.user.findMany({
    where: {
      isBot: true,
      characters: { some: {} },
    },
    select: {
      id: true,
      name: true,
      rankingPoints: true,
      characters: {
        select: {
          character: { select: { basePower: true } },
          fedPower: true,
        },
      },
    },
  });

  if (bots.length < 2) {
    console.error("❌ Need at least 2 bots with characters. Run db:seed-bots first.");
    process.exit(1);
  }

  console.log(`  Found ${bots.length} eligible bots.\n`);

  // Pre-calculate total power for each bot
  const botPower = new Map<string, number>();
  const botRanking = new Map<string, number>();

  for (const bot of bots) {
    const totalPower = bot.characters.reduce(
      (sum, uc) => sum + uc.character.basePower + uc.fedPower,
      0,
    );
    botPower.set(bot.id, totalPower);
    botRanking.set(bot.id, bot.rankingPoints);
  }

  // 2. Simulate battles in batches
  let totalBattles = 0;
  let attackerWins = 0;

  const battleRecords: {
    attackerId: string;
    defenderId: string;
    winnerId: string;
    attackerPower: number;
    defenderPower: number;
    attackerRoll: number;
    defenderRoll: number;
    rankingPointsChange: number;
    createdAt: Date;
  }[] = [];

  // Track ranking point deltas to apply in bulk
  const rpDeltas = new Map<string, number>();

  for (let i = 0; i < battleCount; i++) {
    // Pick two random different bots
    const attackerIdx = randInt(0, bots.length - 1);
    let defenderIdx = randInt(0, bots.length - 1);
    while (defenderIdx === attackerIdx) {
      defenderIdx = randInt(0, bots.length - 1);
    }

    const attacker = bots[attackerIdx];
    const defender = bots[defenderIdx];

    const atkPower = botPower.get(attacker.id)!;
    const defPower = botPower.get(defender.id)!;
    const atkRanking = botRanking.get(attacker.id)!;
    const defRanking = botRanking.get(defender.id)!;

    // Roll variance
    const atkRoll = rollVariance(atkPower);
    const defRoll = rollVariance(defPower);
    const atkFinal = Math.max(1, atkPower + atkRoll);
    const defFinal = Math.max(1, defPower + defRoll);

    // Determine winner (attacker wins ties)
    const attackerWon_ = atkFinal >= defFinal;
    const winnerId = attackerWon_ ? attacker.id : defender.id;
    const loserId = attackerWon_ ? defender.id : attacker.id;
    const winnerRanking = attackerWon_ ? atkRanking : defRanking;
    const loserRanking = attackerWon_ ? defRanking : atkRanking;

    // Ranking points
    const rpChange = calculateRankingPointsChange(winnerRanking, loserRanking);
    const loserCurrentRP = attackerWon_ ? defRanking : atkRanking;
    const actualLoss = Math.min(rpChange, loserCurrentRP);

    // Update in-memory rankings for subsequent battles
    botRanking.set(winnerId, (botRanking.get(winnerId) ?? 0) + rpChange);
    botRanking.set(loserId, Math.max(0, (botRanking.get(loserId) ?? 0) - actualLoss));

    // Track cumulative RP deltas for DB update
    rpDeltas.set(winnerId, (rpDeltas.get(winnerId) ?? 0) + rpChange);
    rpDeltas.set(loserId, (rpDeltas.get(loserId) ?? 0) - actualLoss);

    // Spread battle timestamps across the past 24 hours
    const createdAt = new Date(Date.now() - randInt(0, 24 * 60 * 60 * 1000));

    battleRecords.push({
      attackerId: attacker.id,
      defenderId: defender.id,
      winnerId,
      attackerPower: atkPower,
      defenderPower: defPower,
      attackerRoll: atkRoll,
      defenderRoll: defRoll,
      rankingPointsChange: rpChange,
      createdAt,
    });

    if (attackerWon_) attackerWins++;
    totalBattles++;
  }

  // 3. Batch insert battle records
  console.log(`  Inserting ${battleRecords.length} battle records...`);
  for (let b = 0; b < battleRecords.length; b += BATCH_SIZE) {
    const batch = battleRecords.slice(b, b + BATCH_SIZE);
    await prisma.battle.createMany({ data: batch });
    process.stdout.write(`    Batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(battleRecords.length / BATCH_SIZE)}\r`);
  }
  console.log(`  ✅ Battle records inserted.              `);

  // 4. Apply ranking point deltas to all affected bots
  const rpEntries = Array.from(rpDeltas.entries());
  console.log(`  Updating ranking points for ${rpEntries.length} bots...`);
  const rpUpdates: Promise<unknown>[] = [];
  for (const [botId, delta] of rpEntries) {
    if (delta === 0) continue;

    rpUpdates.push(
      prisma.user.update({
        where: { id: botId },
        data: {
          rankingPoints: Math.max(0, botRanking.get(botId) ?? 0),
        },
      }),
    );

    // Execute in batches to avoid overwhelming DB
    if (rpUpdates.length >= BATCH_SIZE) {
      await Promise.all(rpUpdates);
      rpUpdates.length = 0;
    }
  }
  if (rpUpdates.length > 0) {
    await Promise.all(rpUpdates);
  }
  console.log(`  ✅ Rankings updated.\n`);

  // 5. Summary
  const defenderWins = totalBattles - attackerWins;
  console.log("📊 Battle Simulation Summary:");
  console.log(`  Total battles: ${totalBattles}`);
  console.log(`  Attacker wins: ${attackerWins} (${Math.round((attackerWins / totalBattles) * 100)}%)`);
  console.log(`  Defender wins: ${defenderWins} (${Math.round((defenderWins / totalBattles) * 100)}%)`);
  console.log(`  Unique fighters: ${rpDeltas.size}`);

  // Top 5 by RP
  const topBots = bots
    .map((b) => ({ name: b.name, rp: botRanking.get(b.id) ?? 0 }))
    .sort((a, b) => b.rp - a.rp)
    .slice(0, 5);

  console.log(`\n  🏆 Top 5 after simulation:`);
  topBots.forEach((b, i) => {
    console.log(`    ${i + 1}. ${b.name} — ${b.rp} RP`);
  });

  console.log(`\n✅ Battle simulation complete!\n`);
}

main()
  .catch((e) => {
    console.error("❌ Battle simulation failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
