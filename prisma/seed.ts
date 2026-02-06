// prisma/seed.ts
// Seed the database with satirical billionaire characters

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// Base power scales with rarity
const RARITY_POWER: Record<number, number> = {
  1: 100,   // Common
  2: 200,   // Uncommon
  3: 400,   // Rare
  4: 800,   // Super Rare
  5: 1600,  // Ultra Rare (Legendary)
};

const characters = [
  // ============ 1★ COMMON ============
  {
    name: "Unpaid Intern",
    rarity: 1,
    bio: "Fresh out of college with $200k in student debt. Works 80-hour weeks for 'exposure' and LinkedIn recommendations. Their equity package vests never.",
  },
  {
    name: "LinkedIn Larry",
    rarity: 1,
    bio: "Agrees. Posts 'humbled and honored' weekly. Turned getting fired into a viral post about resilience. Actually just works in middle management.",
  },
  {
    name: "Crypto Kyle",
    rarity: 1,
    bio: "Diamond hands through a 99% loss. Still believes the flippening is coming. Profile picture is a pixelated ape he bought for $50,000. Down bad.",
  },
  {
    name: "Hustle Hannah",
    rarity: 1,
    bio: "Wakes up at 3 AM to meditate about money. Sells courses about selling courses. Has never held a real job but calls herself a 'serial entrepreneur.'",
  },
  {
    name: "Gig Greg",
    rarity: 1,
    bio: "Works 4 delivery apps simultaneously. The algorithm is his only friend. Technically a 'small business owner' for tax purposes.",
  },

  // ============ 2★ UNCOMMON ============
  {
    name: "Gwyneth Grifrow",
    rarity: 2,
    bio: "Sells $200 jade eggs and candles that smell like her audacity. Company valued at $500M despite negative unit economics. Goop is a lifestyle.",
  },
  {
    name: "Gary Vee-Nah",
    rarity: 2,
    bio: "Screams motivational advice at a camera for 16 hours a day. Bought every NFT. Sells wine, sneakers, empathy, and whatever else pays. Hustle never sleeps.",
  },
  {
    name: "Joe Rogaine",
    rarity: 2,
    bio: "Has 47 morning routine steps including elk meat and cold plunges. Interviews aliens, scientists, and conspiracy theorists with equal credulity.",
  },
  {
    name: "Logan Pall",
    rarity: 2,
    bio: "Made a crypto zoo that turned out to be a regular zoo (without animals). YouTube apology video has more views than the scandal. Keeps failing upward.",
  },
  {
    name: "Jack Dorsal",
    rarity: 2,
    bio: "Built two social networks, then abandoned both to meditate in Myanmar. Now posts about Bitcoin from a cabin. Eats once per day. Decentralize everything.",
  },

  // ============ 3★ RARE ============
  {
    name: "Travis Kaladick",
    rarity: 3,
    bio: "Disrupted the taxi industry by ignoring every regulation. Surge pricing during emergencies is a 'feature.' Got fired from his own company for being too much.",
  },
  {
    name: "Elizabeth Bones",
    rarity: 3,
    bio: "Claimed to revolutionize blood testing with a machine that didn't work. Faked a deep voice. Fooled Henry Kissinger somehow. Currently unavailable.",
  },
  {
    name: "Adam Newmann",
    rarity: 3,
    bio: "Turned office subletting into a $47B 'tech company.' Walked away with $1.7B after it imploded. Now selling apartment living as the next big thing.",
  },
  {
    name: "Marc Handreessen",
    rarity: 3,
    bio: "Invented the web browser then spent decades trying to burn it down. Wrote 'Why Software Is Eating the World' then ate all the software. a16z everything.",
  },
  {
    name: "Vitality Butterkin",
    rarity: 3,
    bio: "Created a blockchain at 19 and accidentally became a billionaire. Wears cat-ear hoodies to financial summits. Gas fees are a feature, not a bug.",
  },

  // ============ 4★ SUPER RARE ============
  {
    name: "Jensen Wrong",
    rarity: 4,
    bio: "Sold graphics cards to gamers, then pivoted to selling the same cards to AI companies at 10x the price. Leather jacket is permanently bonded to his skin.",
  },
  {
    name: "Sham Bankman-Fraud",
    rarity: 4,
    bio: "Ran a crypto exchange from a Bahamas penthouse with his ex-girlfriend. $8 billion vanished. Played League of Legends during meetings. Currently in timeout.",
  },
  {
    name: "Peter Teal",
    rarity: 4,
    bio: "PayPal mafia don turned venture vampire. Wants to live forever, move to New Zealand, and build floating libertarian cities. Funded everything sketchy.",
  },
  {
    name: "Tim Apple",
    rarity: 4,
    bio: "Renamed by a former president. Sells the same phone every year for $200 more. Courage is removing features and charging for dongles. One more thing.",
  },

  // ============ 5★ LEGENDARY ============
  {
    name: "Melon Husk",
    rarity: 5,
    bio: "So rich he bought a social network to post memes. Launches cars into space while employees use bottles. The SEC is just a suggestion. Chief Twit.",
  },
  {
    name: "Mark Zuckerborg",
    rarity: 5,
    bio: "Knows everything about everyone. Testified before Congress with a booster seat. Spent $10B building a metaverse nobody asked for. Sweet Baby Ray's.",
  },
  {
    name: "Jeff Brazos",
    rarity: 5,
    bio: "Delivers packages faster than employees can use the bathroom. Went to space for 4 minutes in a rocket shaped like that. Divorce cost more than most countries' GDP.",
  },
  {
    name: "Gill Bates",
    rarity: 5,
    bio: "Ctrl+C, Ctrl+V'd his way to $100B. Embrace, extend, extinguish. Now does philanthropy for the tax benefits and PR rehabilitation. Would like to talk to you about mosquitoes.",
  },
  {
    name: "Warren Muffett",
    rarity: 5,
    bio: "Has been 94 years old for the last 30 years. Lives in Omaha, eats McDonald's daily, and still outperforms every hedge fund. The Oracle of value investing and Cherry Coke.",
  },
];

// --- Buzzword definitions ---

const buzzwords = [
  {
    name: "Synergy",
    cost: 50,
    effect: { type: "power_boost_pct", value: 10 },
    description: "Leveraging cross-functional alignment for a 10% power boost.",
  },
  {
    name: "Disruption",
    cost: 100,
    effect: { type: "power_boost_pct", value: 15 },
    description: "Move fast and break their portfolio. +15% power.",
  },
  {
    name: "Pivot",
    cost: 150,
    effect: { type: "opponent_debuff_pct", value: 12 },
    description: "Strategic repositioning. Opponent loses 12% power.",
  },
  {
    name: "Blockchain",
    cost: 200,
    effect: { type: "power_boost_pct", value: 20 },
    description: "Decentralized superiority. +20% power.",
  },
  {
    name: "AI-Powered",
    cost: 350,
    effect: { type: "power_boost_pct", value: 25 },
    description: "Our algorithm is literally just if-statements. +25% power.",
  },
  {
    name: "Growth Hack",
    cost: 500,
    effect: { type: "power_boost_pct", value: 30 },
    description: "One weird trick that actually works. +30% power.",
  },
];

async function main() {
  console.log("🌱 Seeding characters...\n");

  // Wipe existing characters (and their user assignments) for a clean reseed
  console.log("  Cleaning existing character data...");
  await prisma.userCharacter.deleteMany();
  await prisma.character.deleteMany();
  console.log("  ✅ Cleaned.\n");

  for (const char of characters) {
    const basePower = RARITY_POWER[char.rarity];

    const created = await prisma.character.upsert({
      where: { name: char.name },
      update: {
        rarity: char.rarity,
        basePower,
        bio: char.bio,
      },
      create: {
        name: char.name,
        rarity: char.rarity,
        basePower,
        bio: char.bio,
      },
    });

    const stars = "★".repeat(char.rarity) + "☆".repeat(5 - char.rarity);
    console.log(`  ${stars} ${created.name} (Power: ${basePower})`);
  }

  // Summary
  const counts = await prisma.character.groupBy({
    by: ["rarity"],
    _count: { id: true },
    orderBy: { rarity: "asc" },
  });

  console.log("\n📊 Character Summary:");
  for (const c of counts) {
    const stars = "★".repeat(c.rarity);
    console.log(`  ${stars}: ${c._count.id} characters`);
  }

  const total = await prisma.character.count();
  console.log(`\n✅ Total: ${total} characters seeded!\n`);

  // --- Seed buzzwords ---
  console.log("💬 Seeding buzzwords...\n");

  for (const bw of buzzwords) {
    const created = await prisma.buzzword.upsert({
      where: { name: bw.name },
      update: {
        cost: bw.cost,
        effect: bw.effect,
        description: bw.description,
      },
      create: {
        name: bw.name,
        cost: bw.cost,
        effect: bw.effect,
        description: bw.description,
      },
    });

    console.log(`  💬 ${created.name} — ${bw.cost} CC (${bw.effect.type}: ${bw.effect.value}%)`);
  }

  const bwTotal = await prisma.buzzword.count();
  console.log(`\n✅ Total: ${bwTotal} buzzwords seeded!\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
