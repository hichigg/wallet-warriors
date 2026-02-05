// lib/gacha.ts
// Gacha pull logic with rates, pity, and duplicate handling

import { prisma } from "./prisma";

// Pull rates (must sum to 100)
export const GACHA_RATES = {
  1: 50,   // 50% - Common
  2: 30,   // 30% - Uncommon
  3: 15,   // 15% - Rare
  4: 4,    // 4%  - Super Rare
  5: 1,    // 1%  - Legendary
} as const;

// Pity system: guaranteed 5★ at this many pulls
export const PITY_THRESHOLD = 100;

// Soft pity: increased 5★ rates start here
export const SOFT_PITY_START = 75;
export const SOFT_PITY_RATE_INCREASE = 5; // +5% per pull after soft pity

// Cost per pull in CrunchCoin
export const PULL_COST_CRUNCHCOIN = 100;

// Cost per pull in Trickle Tokens (worse value)
export const PULL_COST_TRICKLE = 500;

// Power bonus when pulling duplicates (scales with rarity)
export const DUPLICATE_POWER_BONUS = {
  1: 10,   // Common dupe = +10 power
  2: 25,   // Uncommon dupe = +25 power
  3: 50,   // Rare dupe = +50 power
  4: 100,  // Super Rare dupe = +100 power
  5: 200,  // Legendary dupe = +200 power
} as const;

export type PullCurrency = "crunchCoin" | "trickleTokens";

export interface PullResult {
  success: boolean;
  character?: {
    id: string;
    name: string;
    rarity: number;
    basePower: number;
    bio: string;
  };
  isDuplicate: boolean;
  powerGained: number;
  newTotalPower: number;
  pityCounter: number;
  pityReset: boolean;
  isFreePull: boolean;
  isGuaranteedPity: boolean;
  error?: string;
}

/**
 * Determine the rarity of a pull based on rates and pity
 */
export function rollRarity(pityCounter: number): number {
  const roll = Math.random() * 100;

  // Hard pity: guarantee 5★ at threshold
  if (pityCounter >= PITY_THRESHOLD - 1) {
    return 5;
  }

  // Soft pity: increase 5★ chance after soft pity threshold
  let fiveStarRate = GACHA_RATES[5];
  if (pityCounter >= SOFT_PITY_START) {
    const extraPulls = pityCounter - SOFT_PITY_START + 1;
    fiveStarRate += extraPulls * SOFT_PITY_RATE_INCREASE;
  }

  // Calculate cumulative rates
  let cumulative = 0;

  // Check 5★ first (with potentially boosted rate)
  cumulative += fiveStarRate;
  if (roll < cumulative) return 5;

  // Then 4★
  cumulative += GACHA_RATES[4];
  if (roll < cumulative) return 4;

  // Then 3★
  cumulative += GACHA_RATES[3];
  if (roll < cumulative) return 3;

  // Then 2★
  cumulative += GACHA_RATES[2];
  if (roll < cumulative) return 2;

  // Default to 1★
  return 1;
}

/**
 * Select a random character of the given rarity
 */
export async function selectCharacter(rarity: number) {
  const characters = await prisma.character.findMany({
    where: { rarity },
  });

  if (characters.length === 0) {
    throw new Error(`No characters found for rarity ${rarity}`);
  }

  const randomIndex = Math.floor(Math.random() * characters.length);
  return characters[randomIndex];
}

/**
 * Check if user is eligible for free first pull
 */
export async function checkFreePullEligibility(userId: string): Promise<boolean> {
  const characterCount = await prisma.userCharacter.count({
    where: { userId },
  });
  return characterCount === 0;
}

/**
 * Execute a gacha pull
 */
export async function executePull(
  userId: string,
  currency: PullCurrency,
  isFreePull: boolean = false
): Promise<PullResult> {
  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      crunchCoin: true,
      trickleTokens: true,
      pityCounter: true,
    },
  });

  if (!user) {
    return { success: false, isDuplicate: false, powerGained: 0, newTotalPower: 0, pityCounter: 0, pityReset: false, isFreePull: false, isGuaranteedPity: false, error: "User not found" };
  }

  // Check currency (skip for free pull)
  if (!isFreePull) {
    const cost = currency === "crunchCoin" ? PULL_COST_CRUNCHCOIN : PULL_COST_TRICKLE;
    const balance = currency === "crunchCoin" ? user.crunchCoin : user.trickleTokens;

    if (balance < cost) {
      return {
        success: false,
        isDuplicate: false,
        powerGained: 0,
        newTotalPower: 0,
        pityCounter: user.pityCounter,
        pityReset: false,
        isFreePull: false,
        isGuaranteedPity: false,
        error: `Insufficient ${currency === "crunchCoin" ? "CrunchCoin" : "Trickle Tokens"}`,
      };
    }
  }

  // Determine rarity
  let rarity: number;
  let isGuaranteedPity = false;

  if (isFreePull) {
    // Free first pull is always common
    rarity = 1;
  } else {
    // Check if this is a guaranteed pity
    isGuaranteedPity = user.pityCounter >= PITY_THRESHOLD - 1;
    rarity = rollRarity(user.pityCounter);
  }

  // Select random character of that rarity
  const character = await selectCharacter(rarity);

  // Check if user already owns this character
  const existingOwnership = await prisma.userCharacter.findUnique({
    where: {
      userId_characterId: {
        userId,
        characterId: character.id,
      },
    },
  });

  const isDuplicate = !!existingOwnership;
  const powerGained = isDuplicate ? DUPLICATE_POWER_BONUS[rarity as keyof typeof DUPLICATE_POWER_BONUS] : 0;

  // Calculate new pity counter
  const pityReset = rarity === 5;
  const newPityCounter = pityReset ? 0 : (isFreePull ? user.pityCounter : user.pityCounter + 1);

  // Execute the transaction
  await prisma.$transaction(async (tx) => {
    // Deduct currency (skip for free pull)
    if (!isFreePull) {
      const cost = currency === "crunchCoin" ? PULL_COST_CRUNCHCOIN : PULL_COST_TRICKLE;
      if (currency === "crunchCoin") {
        await tx.user.update({
          where: { id: userId },
          data: { crunchCoin: { decrement: cost } },
        });
      } else {
        await tx.user.update({
          where: { id: userId },
          data: { trickleTokens: { decrement: cost } },
        });
      }
    }

    // Update pity counter
    await tx.user.update({
      where: { id: userId },
      data: { pityCounter: newPityCounter },
    });

    // Add character or power up existing
    if (isDuplicate) {
      await tx.userCharacter.update({
        where: {
          userId_characterId: {
            userId,
            characterId: character.id,
          },
        },
        data: { fedPower: { increment: powerGained } },
      });
    } else {
      await tx.userCharacter.create({
        data: {
          userId,
          characterId: character.id,
        },
      });
    }
  });

  // Get updated total power for the character
  const updatedOwnership = await prisma.userCharacter.findUnique({
    where: {
      userId_characterId: {
        userId,
        characterId: character.id,
      },
    },
  });

  const newTotalPower = character.basePower + (updatedOwnership?.fedPower ?? 0);

  return {
    success: true,
    character: {
      id: character.id,
      name: character.name,
      rarity: character.rarity,
      basePower: character.basePower,
      bio: character.bio,
    },
    isDuplicate,
    powerGained,
    newTotalPower,
    pityCounter: newPityCounter,
    pityReset,
    isFreePull,
    isGuaranteedPity,
  };
}
