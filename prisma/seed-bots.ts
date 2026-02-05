// prisma/seed-bots.ts
// Generate fake bot users to populate leaderboards and provide battle opponents
// Run: npm run db:seed-bots

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// --- Bot name generation ---

const FIRST_NAMES = [
  "Chad", "Brock", "Sterling", "Trent", "Blake", "Preston", "Holden",
  "Chip", "Reginald", "Montgomery", "Ashton", "Brantley", "Colton",
  "Drake", "Everett", "Fletcher", "Grayson", "Hunter", "Jasper",
  "Knox", "Landon", "Maxwell", "Nolan", "Pierce", "Quinn",
  "Sloane", "Vivian", "Kennedy", "Harper", "Ainsley", "Briar",
  "Chandler", "Delaney", "Emerson", "Finley", "Greer", "Haven",
  "Arden", "Blair", "Campbell", "Darcy", "Ellis", "Fallon",
  "Hadley", "Ione", "Jules", "Kendall", "Leighton", "Monroe",
];

const LAST_NAMES = [
  "Worthington III", "Vanderbilt", "Blackwell", "Chadwick", "Pemberton",
  "Kensington", "Ashworth", "Beaumont", "Carmichael", "Davenport",
  "Ellsworth", "Foxworth", "Goldstein", "Harrington", "Ives",
  "Jameson", "Kingsley", "Langford", "Montague", "Northcott",
  "Ogilvy", "Prescott", "Quinby", "Rothschild", "Sinclair",
  "Thornton", "Underwood", "Villanova", "Whitmore", "Yarborough",
  "Wellington", "Stratton", "Bancroft", "Wexler", "Aldridge",
  "Covington", "Fitzgerald", "Hampton", "Lexington", "Pennington",
];

const USERNAMES_PREFIX = [
  "alpha", "sigma", "bull", "bear", "whale", "diamond", "moon",
  "rocket", "degen", "yield", "pump", "hodl", "ape", "chad",
  "gm", "wagmi", "ngmi", "ser", "anon", "based",
];

const USERNAMES_SUFFIX = [
  "capital", "ventures", "labs", "dao", "fund", "maxi",
  "whale", "trader", "vc", "ceo", "king", "lord",
  "boss", "chief", "god", "guru", "pro", "elite",
];

// --- Helpers ---

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateBotName(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}

function generateUsername(): string {
  return `${pick(USERNAMES_PREFIX)}_${pick(USERNAMES_SUFFIX)}${randInt(1, 999)}`;
}

// Bot tier determines their "whale level"
type BotTier = "free2play" | "minnow" | "dolphin" | "whale" | "megawhale";

interface BotConfig {
  tier: BotTier;
  count: number;
  spending: [number, number];       // totalSpent range (dollars)
  crunchCoin: [number, number];     // current CC balance
  ranking: [number, number];        // ranking points range
  charCount: [number, number];      // how many characters they own
  fedPowerPct: [number, number];    // % of max fedPower on each char (0-100)
}

const BOT_TIERS: BotConfig[] = [
  {
    tier: "free2play",
    count: 107,
    spending: [0, 0],
    crunchCoin: [0, 200],
    ranking: [0, 100],
    charCount: [1, 4],
    fedPowerPct: [0, 10],
  },
  {
    tier: "minnow",
    count: 107,
    spending: [5, 30],
    crunchCoin: [50, 500],
    ranking: [50, 300],
    charCount: [3, 8],
    fedPowerPct: [5, 25],
  },
  {
    tier: "dolphin",
    count: 72,
    spending: [30, 150],
    crunchCoin: [200, 2000],
    ranking: [200, 600],
    charCount: [6, 14],
    fedPowerPct: [15, 50],
  },
  {
    tier: "whale",
    count: 50,
    spending: [150, 500],
    crunchCoin: [1000, 5000],
    ranking: [400, 1000],
    charCount: [10, 20],
    fedPowerPct: [30, 70],
  },
  {
    tier: "megawhale",
    count: 22,
    spending: [500, 2000],
    crunchCoin: [3000, 15000],
    ranking: [800, 2000],
    charCount: [15, 24],
    fedPowerPct: [60, 95],
  },
];

const MAX_FED_POWER: Record<number, number> = {
  1: 100,
  2: 200,
  3: 400,
  4: 800,
  5: 1500,
};

// --- Package data (mirrors lib/stripe.ts CRUNCHCOIN_PACKAGES) ---

const PACKAGES = [
  { id: "seed_round",       price: 4.99,  crunchCoin: 500 },
  { id: "series_a",         price: 9.99,  crunchCoin: 900 },
  { id: "series_b",         price: 24.99, crunchCoin: 2000 },
  { id: "ipo",              price: 49.99, crunchCoin: 3500 },
  { id: "hostile_takeover", price: 99.99, crunchCoin: 6000 },
];

// Pick packages that plausibly sum to totalSpent
function generateTransactions(totalSpent: number, userId: string): {
  userId: string;
  amount: number;
  crunchCoinGranted: number;
  packageType: string;
  status: "COMPLETED";
  createdAt: Date;
}[] {
  if (totalSpent <= 0) return [];

  const txns: ReturnType<typeof generateTransactions> = [];
  let remaining = totalSpent;

  // Work from largest package down
  while (remaining >= PACKAGES[0].price - 0.01) {
    // Pick the largest package that fits, with some randomness
    const affordable = PACKAGES.filter((p) => p.price <= remaining + 0.50);
    const pkg = pick(affordable);

    remaining -= pkg.price;
    txns.push({
      userId,
      amount: pkg.price,
      crunchCoinGranted: pkg.crunchCoin,
      packageType: pkg.id,
      status: "COMPLETED",
      createdAt: new Date(Date.now() - randInt(1, 30) * 24 * 60 * 60 * 1000 - randInt(0, 86400000)),
    });

    // Safety valve
    if (txns.length > 50) break;
  }

  return txns;
}

async function main() {
  console.log("\n🤖 Generating bot users...\n");

  // 1. Get all available characters
  const allCharacters = await prisma.character.findMany({
    orderBy: { rarity: "asc" },
  });

  if (allCharacters.length === 0) {
    console.error("❌ No characters found! Run `npm run db:seed` first.");
    process.exit(1);
  }

  console.log(`  Found ${allCharacters.length} characters to assign.\n`);

  // 2. Clean existing bots
  const existingBots = await prisma.user.count({ where: { isBot: true } });
  if (existingBots > 0) {
    console.log(`  Cleaning ${existingBots} existing bots...`);
    await prisma.user.deleteMany({ where: { isBot: true } });
    console.log(`  ✅ Cleaned.\n`);
  }

  // 3. Generate bots per tier (batched for performance)
  let totalCreated = 0;
  const usedUsernames = new Set<string>();
  const BATCH_SIZE = 50;

  for (const config of BOT_TIERS) {
    const tierEmoji = {
      free2play: "🆓",
      minnow: "🐟",
      dolphin: "🐬",
      whale: "🐋",
      megawhale: "🐳",
    }[config.tier];

    console.log(`  --- ${tierEmoji} ${config.tier.toUpperCase()} (${config.count} bots) ---`);

    // Build all bot data for this tier
    const botDataList: {
      name: string;
      username: string;
      crunchCoin: number;
      trickleTokens: number;
      totalSpent: number;
      rankingPoints: number;
      pityCounter: number;
      loginStreak: number;
      lastLoginAt: Date;
      charCount: number;
      fedPowerPct: [number, number];
    }[] = [];

    for (let i = 0; i < config.count; i++) {
      const name = generateBotName();
      let username = generateUsername();
      while (usedUsernames.has(username)) {
        username = generateUsername();
      }
      usedUsernames.add(username);

      const totalSpent = config.spending[0] === 0 && config.spending[1] === 0
        ? 0
        : parseFloat((Math.random() * (config.spending[1] - config.spending[0]) + config.spending[0]).toFixed(2));

      botDataList.push({
        name,
        username,
        crunchCoin: randInt(config.crunchCoin[0], config.crunchCoin[1]),
        trickleTokens: randInt(0, 50),
        totalSpent,
        rankingPoints: randInt(config.ranking[0], config.ranking[1]),
        pityCounter: randInt(0, 99),
        loginStreak: randInt(0, 30),
        lastLoginAt: new Date(Date.now() - randInt(0, 7 * 24 * 60 * 60 * 1000)),
        charCount: Math.min(randInt(config.charCount[0], config.charCount[1]), allCharacters.length),
        fedPowerPct: config.fedPowerPct,
      });
    }

    // Insert bots in batches
    for (let b = 0; b < botDataList.length; b += BATCH_SIZE) {
      const batch = botDataList.slice(b, b + BATCH_SIZE);

      // Create users in batch
      await prisma.user.createMany({
        data: batch.map((d) => ({
          name: d.name,
          username: d.username,
          isBot: true,
          crunchCoin: d.crunchCoin,
          trickleTokens: d.trickleTokens,
          totalSpent: d.totalSpent,
          rankingPoints: d.rankingPoints,
          pityCounter: d.pityCounter,
          loginStreak: d.loginStreak,
          lastLoginAt: d.lastLoginAt,
        })),
      });

      // Fetch created bots by username to get IDs
      const usernames = batch.map((d) => d.username);
      const createdBots = await prisma.user.findMany({
        where: { username: { in: usernames } },
        select: { id: true, username: true },
      });

      const usernameToId = new Map(createdBots.map((u) => [u.username, u.id]));

      // Build all character assignments for this batch
      const charAssignments: { userId: string; characterId: string; fedPower: number }[] = [];

      for (const d of batch) {
        const botId = usernameToId.get(d.username);
        if (!botId) continue;

        const shuffled = [...allCharacters].sort(() => Math.random() - 0.5);
        const assigned = shuffled.slice(0, d.charCount);

        for (const char of assigned) {
          const maxFed = MAX_FED_POWER[char.rarity] ?? 100;
          const fedPct = randInt(d.fedPowerPct[0], d.fedPowerPct[1]) / 100;
          charAssignments.push({
            userId: botId,
            characterId: char.id,
            fedPower: Math.floor(maxFed * fedPct),
          });
        }
      }

      // Batch insert character assignments
      if (charAssignments.length > 0) {
        await prisma.userCharacter.createMany({ data: charAssignments });
      }

      // Build and batch insert transaction history
      const allTxns: ReturnType<typeof generateTransactions> = [];
      for (const d of batch) {
        const botId = usernameToId.get(d.username);
        if (!botId || d.totalSpent <= 0) continue;
        allTxns.push(...generateTransactions(d.totalSpent, botId));
      }

      if (allTxns.length > 0) {
        await prisma.transaction.createMany({ data: allTxns });
      }

      totalCreated += batch.length;
      console.log(`    Batch ${Math.floor(b / BATCH_SIZE) + 1}: +${batch.length} bots, +${charAssignments.length} chars, +${allTxns.length} txns (${totalCreated} total)`);
    }

    console.log();
  }

  // 4. Summary
  const botCount = await prisma.user.count({ where: { isBot: true } });
  const botChars = await prisma.userCharacter.count({
    where: { user: { isBot: true } },
  });
  const botTxns = await prisma.transaction.count({
    where: { user: { isBot: true } },
  });

  console.log("📊 Bot Summary:");
  console.log(`  Total bots: ${botCount}`);
  console.log(`  Total character assignments: ${botChars}`);
  console.log(`  Total transactions: ${botTxns}`);

  for (const config of BOT_TIERS) {
    console.log(`  ${config.tier}: ${config.count} created`);
  }

  console.log(`\n✅ ${totalCreated} bots generated! The arena is populated.\n`);
}

main()
  .catch((e) => {
    console.error("❌ Bot generation failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
