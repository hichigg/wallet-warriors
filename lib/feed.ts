// lib/feed.ts
// Feed system — spend CrunchCoin to increase a character's fedPower
// Cost escalates linearly: each feed costs more than the last. Deliberately absurd at high rarities.

import { prisma } from "./prisma";

// --- Constants keyed by rarity (1–5) ---

export const BASE_FEED_COST: Record<number, number> = {
  1: 25,
  2: 50,
  3: 100,
  4: 200,
  5: 500,
};

export const POWER_PER_FEED: Record<number, number> = {
  1: 5,
  2: 8,
  3: 12,
  4: 18,
  5: 25,
};

export const MAX_FED_POWER: Record<number, number> = {
  1: 100,
  2: 200,
  3: 400,
  4: 800,
  5: 1500,
};

// Satirical feed-level names (index = feedLevel bracket)
export const FEED_LEVEL_NAMES: string[] = [
  "Unfed",
  "Angel Snack",
  "Seed Nibble",
  "Pre-Series Bite",
  "Series A Lunch",
  "Growth Meal",
  "Late-Stage Feast",
  "Pre-IPO Gorge",
  "Unicorn Banquet",
  "Fully Fed",
];

// --- Helper functions ---

export function getFeedLevel(currentFedPower: number, rarity: number): number {
  const perFeed = POWER_PER_FEED[rarity] ?? 5;
  return Math.floor(currentFedPower / perFeed);
}

export function getNextFeedCost(currentFedPower: number, rarity: number): number {
  const feedLevel = getFeedLevel(currentFedPower, rarity);
  const baseCost = BASE_FEED_COST[rarity] ?? 25;
  return baseCost * (feedLevel + 1);
}

export function isMaxFedPower(currentFedPower: number, rarity: number): boolean {
  const max = MAX_FED_POWER[rarity] ?? 100;
  return currentFedPower >= max;
}

export function getFeedLevelName(currentFedPower: number, rarity: number): string {
  if (isMaxFedPower(currentFedPower, rarity)) {
    return FEED_LEVEL_NAMES[FEED_LEVEL_NAMES.length - 1];
  }
  const feedLevel = getFeedLevel(currentFedPower, rarity);
  const maxFeeds = Math.ceil((MAX_FED_POWER[rarity] ?? 100) / (POWER_PER_FEED[rarity] ?? 5));
  // Map feedLevel to a name index (0..8 for non-max)
  const nameIndex = Math.min(
    Math.floor((feedLevel / maxFeeds) * (FEED_LEVEL_NAMES.length - 2)) + (feedLevel > 0 ? 1 : 0),
    FEED_LEVEL_NAMES.length - 2
  );
  return FEED_LEVEL_NAMES[nameIndex];
}

// --- Core feed execution ---

export interface FeedResult {
  success: true;
  cost: number;
  powerGained: number;
  newFedPower: number;
  newCrunchCoin: number;
  feedLevel: number;
  maxedOut: boolean;
}

export interface FeedError {
  success: false;
  error: string;
}

export async function executeFeed(
  userId: string,
  userCharacterId: string,
): Promise<FeedResult | FeedError> {
  // 1. Fetch UserCharacter with character data, verify ownership
  const userCharacter = await prisma.userCharacter.findUnique({
    where: { id: userCharacterId },
    include: { character: true },
  });

  if (!userCharacter) {
    return { success: false, error: "Character not found." };
  }

  if (userCharacter.userId !== userId) {
    return { success: false, error: "You don't own this character." };
  }

  const { rarity } = userCharacter.character;

  // 2. Check max cap
  if (isMaxFedPower(userCharacter.fedPower, rarity)) {
    return { success: false, error: "Character is already fully fed." };
  }

  // 3. Calculate cost
  const cost = getNextFeedCost(userCharacter.fedPower, rarity);
  const powerGain = POWER_PER_FEED[rarity] ?? 5;
  const maxPower = MAX_FED_POWER[rarity] ?? 100;
  const newFedPower = Math.min(userCharacter.fedPower + powerGain, maxPower);
  const actualPowerGained = newFedPower - userCharacter.fedPower;

  // 4. Check user balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { crunchCoin: true },
  });

  if (!user) {
    return { success: false, error: "User not found." };
  }

  if (user.crunchCoin < cost) {
    return { success: false, error: `Not enough CrunchCoin. Need ${cost}, have ${user.crunchCoin}.` };
  }

  // 5. Atomic transaction: decrement CC + increment fedPower
  const [updatedUser, updatedCharacter] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { crunchCoin: { decrement: cost } },
      select: { crunchCoin: true },
    }),
    prisma.userCharacter.update({
      where: { id: userCharacterId },
      data: { fedPower: { increment: actualPowerGained } },
      select: { fedPower: true },
    }),
  ]);

  return {
    success: true,
    cost,
    powerGained: actualPowerGained,
    newFedPower: updatedCharacter.fedPower,
    newCrunchCoin: updatedUser.crunchCoin,
    feedLevel: getFeedLevel(updatedCharacter.fedPower, rarity),
    maxedOut: isMaxFedPower(updatedCharacter.fedPower, rarity),
  };
}
