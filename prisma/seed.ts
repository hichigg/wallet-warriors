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
    name: "Hustle Culture Guru",
    rarity: 1,
    bio: "Wakes up at 3 AM to meditate about money. Sells courses about selling courses. Has never held a real job but calls themselves a 'serial entrepreneur.'",
  },
  {
    name: "Crypto Bro",
    rarity: 1,
    bio: "Diamond hands through a 99% loss. Still believes the flippening is coming. Profile picture is a pixelated ape they bought for $50,000.",
  },
  {
    name: "LinkedIn Thought Leader",
    rarity: 1,
    bio: "Agrees. Posts 'humbled and honored' weekly. Turned getting fired into a viral post about resilience. Actually just works in middle management.",
  },
  {
    name: "Gig Economy Warrior",
    rarity: 1,
    bio: "Works 4 delivery apps simultaneously. The algorithm is their only friend. Technically a 'small business owner' for tax purposes.",
  },

  // ============ 2★ UNCOMMON ============
  {
    name: "Angel Investor",
    rarity: 2,
    bio: "Inherited $2M and put $25k into 40 startups. One succeeded by accident. Now gives keynotes about their 'investment philosophy.'",
  },
  {
    name: "Growth Hacker",
    rarity: 2,
    bio: "Made one thing go viral in 2016 and has been coasting ever since. Actually just knows how to buy Facebook ads. Charges $500/hour.",
  },
  {
    name: "Productivity Podcaster",
    rarity: 2,
    bio: "Has 47 morning routine steps and 3 hours of actual work per day. Sponsors include every nootropic company that exists.",
  },
  {
    name: "NFT Artist",
    rarity: 2,
    bio: "Right-clicked their way to the top. Sells procedurally generated variations of the same image. Art school professors weep.",
  },
  {
    name: "Startup Founder",
    rarity: 2,
    bio: "Disrupting an industry that didn't need disruption. Has pivoted 12 times. Current burn rate: $400k/month on ping pong tables.",
  },

  // ============ 3★ RARE ============
  {
    name: "Series A Survivor",
    rarity: 3,
    bio: "Successfully raised money by saying 'AI' and 'blockchain' in the same sentence. Product still doesn't exist but valuation is $50M.",
  },
  {
    name: "Tech Conference Speaker",
    rarity: 3,
    bio: "Same TED talk for 8 years straight. Collects speaker fees like Pokémon. Actually wrote one medium article in 2015 that got lucky.",
  },
  {
    name: "Wellness CEO",
    rarity: 3,
    bio: "Sells $200 vitamins and $80 water bottles. Company valued at $500M despite negative unit economics. Gwyneth Paltrow vibes.",
  },
  {
    name: "VC Partner",
    rarity: 3,
    bio: "Failed upward from three startups. Now judges others with other people's money. Bio says 'helping founders' but mostly just takes board seats.",
  },
  {
    name: "DeFi Degen",
    rarity: 3,
    bio: "Yield farms 23 hours a day. Has been 'rugged' 17 times but keeps coming back. Speaks exclusively in incomprehensible acronyms.",
  },

  // ============ 4★ SUPER RARE ============
  {
    name: "Unicorn Founder",
    rarity: 4,
    bio: "Built a $1B company on the backs of underpaid workers and regulatory arbitrage. Featured in Forbes 30 Under 30 (Fraud edition coming soon).",
  },
  {
    name: "Corporate Raider",
    rarity: 4,
    bio: "Buys companies, fires everyone, sells the parts. Calls it 'unlocking shareholder value.' Has a yacht named 'Synergy.'",
  },
  {
    name: "Hedge Fund Manager",
    rarity: 4,
    bio: "2 and 20, baby. Underperforms index funds 80% of the time but charges like they're a genius. Summer in the Hamptons is non-negotiable.",
  },
  {
    name: "Tech Evangelist",
    rarity: 4,
    bio: "Gets paid millions to tweet about products they don't use. 'Web3 is the future' while cashing checks in Web2 dollars.",
  },

  // ============ 5★ LEGENDARY ============
  {
    name: "Rocket Billionaire",
    rarity: 5,
    bio: "So rich they're bored of Earth. Launches cars into space while employees use bottles. Posts memes instead of paying taxes. The SEC is just a suggestion.",
  },
  {
    name: "Social Media Overlord",
    rarity: 5,
    bio: "Knows everything about everyone. Testified before Congress with a booster seat. 'Move fast and break things' including democracy.",
  },
  {
    name: "E-Commerce Emperor",
    rarity: 5,
    bio: "Delivers packages faster than employees can use the bathroom. Went to space for 4 minutes. Divorce cost more than most countries' GDP.",
  },
  {
    name: "Software Sovereign",
    rarity: 5,
    bio: "Ctrl+C, Ctrl+V'd their way to $100B. Embrace, extend, extinguish. Now does philanthropy for the tax benefits and PR rehabilitation.",
  },
  {
    name: "The Index Fund",
    rarity: 5,
    bio: "Not a person, just money. Owns a piece of literally everything. The final boss of capitalism. Passive income achieved sentience.",
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
