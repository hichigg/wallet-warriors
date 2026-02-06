// lib/gacha.ts
// Gacha pull logic with rates, pity, banners, 50/50, and duplicate handling

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

// Multi-pull (10x) discount costs
export const MULTI_PULL_COST_CRUNCHCOIN = 900;  // 10% discount
export const MULTI_PULL_COST_TRICKLE = 4500;     // 10% discount

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
  isBannerRateUp?: boolean;
  isGuaranteedBanner?: boolean;
  error?: string;
}

/**
 * Get the currently active gacha banner (if any)
 */
export async function getActiveBanner() {
  const now = new Date();
  return prisma.gachaBanner.findFirst({
    where: {
      startDate: { lte: now },
      endDate: { gt: now },
    },
    include: {
      featuredChar: true,
    },
  });
}

/**
 * Determine the rarity of a pull based on rates, pity, and optional event boost
 */
export function rollRarity(pityCounter: number, rateBoostPercent: number = 0): number {
  const roll = Math.random() * 100;

  // Hard pity: guarantee 5★ at threshold
  if (pityCounter >= PITY_THRESHOLD - 1) {
    return 5;
  }

  // Soft pity: increase 5★ chance after soft pity threshold
  let fiveStarRate = GACHA_RATES[5] + rateBoostPercent;
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
 * Select a random character of the given rarity, with optional banner rate-up
 * Returns { character, isBannerRateUp, isGuaranteedBanner }
 */
export async function selectCharacter(
  rarity: number,
  options?: {
    bannerId?: string;
    userId?: string;
  }
): Promise<{
  character: { id: string; name: string; rarity: number; basePower: number; bio: string };
  isBannerRateUp: boolean;
  isGuaranteedBanner: boolean;
  guaranteedBannerChanged?: boolean; // true if we toggled the user's guaranteedBanner
  newGuaranteedBannerValue?: boolean;
}> {
  const characters = await prisma.character.findMany({
    where: { rarity },
  });

  if (characters.length === 0) {
    throw new Error(`No characters found for rarity ${rarity}`);
  }

  let isBannerRateUp = false;
  let isGuaranteedBanner = false;
  let guaranteedBannerChanged = false;
  let newGuaranteedBannerValue = false;

  // Check banner rate-up for 5★ pulls
  if (rarity === 5 && options?.bannerId && options?.userId) {
    const banner = await prisma.gachaBanner.findUnique({
      where: { id: options.bannerId },
      include: { featuredChar: true },
    });

    if (banner && banner.featuredChar.rarity === rarity) {
      const user = await prisma.user.findUnique({
        where: { id: options.userId },
        select: { guaranteedBanner: true },
      });

      if (user?.guaranteedBanner) {
        // Guaranteed banner character (lost 50/50 last time)
        isGuaranteedBanner = true;
        isBannerRateUp = true;
        guaranteedBannerChanged = true;
        newGuaranteedBannerValue = false;
        return {
          character: banner.featuredChar,
          isBannerRateUp,
          isGuaranteedBanner,
          guaranteedBannerChanged,
          newGuaranteedBannerValue,
        };
      } else {
        // 50/50: coin flip for banner character
        const won5050 = Math.random() * 100 < 50;
        if (won5050) {
          isBannerRateUp = true;
          return {
            character: banner.featuredChar,
            isBannerRateUp,
            isGuaranteedBanner,
            guaranteedBannerChanged,
            newGuaranteedBannerValue,
          };
        } else {
          // Lost 50/50 — set guaranteed for next time
          guaranteedBannerChanged = true;
          newGuaranteedBannerValue = true;
          // Fall through to random selection below
        }
      }
    }
  }

  // Check banner rate-up for non-5★ pulls (standard rateUpPercent, no 50/50)
  if (rarity !== 5 && options?.bannerId) {
    const banner = await prisma.gachaBanner.findUnique({
      where: { id: options.bannerId },
      include: { featuredChar: true },
    });

    if (banner && banner.featuredChar.rarity === rarity) {
      const rateUpRoll = Math.random() * 100;
      if (rateUpRoll < banner.rateUpPercent) {
        isBannerRateUp = true;
        return {
          character: banner.featuredChar,
          isBannerRateUp,
          isGuaranteedBanner,
          guaranteedBannerChanged,
          newGuaranteedBannerValue,
        };
      }
    }
  }

  const randomIndex = Math.floor(Math.random() * characters.length);
  return {
    character: characters[randomIndex],
    isBannerRateUp,
    isGuaranteedBanner,
    guaranteedBannerChanged,
    newGuaranteedBannerValue,
  };
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
 * Check if user has a weekly free pull available
 */
export async function checkWeeklyFreePull(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { weeklyFreePull: true },
  });
  return user?.weeklyFreePull ?? false;
}

/**
 * Execute a gacha pull
 * @param isWeeklyFreePull - weekly free pull uses normal rates (not forced 1★)
 */
export async function executePull(
  userId: string,
  currency: PullCurrency,
  isFreePull: boolean = false,
  options?: {
    bannerId?: string;
    isWeeklyFreePull?: boolean;
    rateBoostPercent?: number;
  }
): Promise<PullResult> {
  const isWeeklyFreePull = options?.isWeeklyFreePull ?? false;
  const bannerId = options?.bannerId;
  const rateBoostPercent = options?.rateBoostPercent ?? 0;

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

  const actuallyFree = isFreePull || isWeeklyFreePull;

  // Check currency (skip for free pull)
  if (!actuallyFree) {
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

  if (isFreePull && !isWeeklyFreePull) {
    // First-time free pull is always common
    rarity = 1;
  } else {
    // Normal pull (paid or weekly free) — use standard rates
    isGuaranteedPity = user.pityCounter >= PITY_THRESHOLD - 1;
    rarity = rollRarity(user.pityCounter, rateBoostPercent);
  }

  // Select character (with banner support)
  const selection = await selectCharacter(rarity, { bannerId, userId });
  const character = selection.character;

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
  const newPityCounter = pityReset ? 0 : (isFreePull && !isWeeklyFreePull ? user.pityCounter : user.pityCounter + 1);

  // Execute the transaction
  await prisma.$transaction(async (tx) => {
    // Deduct currency (skip for free pulls)
    if (!actuallyFree) {
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

    // Clear weekly free pull flag if used
    if (isWeeklyFreePull) {
      await tx.user.update({
        where: { id: userId },
        data: { weeklyFreePull: false },
      });
    }

    // Update pity counter + guaranteed banner if changed
    const userUpdate: Record<string, unknown> = { pityCounter: newPityCounter };
    if (selection.guaranteedBannerChanged) {
      userUpdate.guaranteedBanner = selection.newGuaranteedBannerValue;
    }
    await tx.user.update({
      where: { id: userId },
      data: userUpdate,
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
    isFreePull: actuallyFree,
    isGuaranteedPity,
    isBannerRateUp: selection.isBannerRateUp,
    isGuaranteedBanner: selection.isGuaranteedBanner,
  };
}

/**
 * Execute a 10-pull with discount and guaranteed 3★+
 */
export async function executeMultiPull(
  userId: string,
  currency: PullCurrency,
  options?: {
    bannerId?: string;
    rateBoostPercent?: number;
  }
): Promise<PullResult[]> {
  const bannerId = options?.bannerId;
  const rateBoostPercent = options?.rateBoostPercent ?? 0;

  // Check if user can afford the discounted cost
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      crunchCoin: true,
      trickleTokens: true,
      pityCounter: true,
      guaranteedBanner: true,
    },
  });

  if (!user) {
    return [{ success: false, isDuplicate: false, powerGained: 0, newTotalPower: 0, pityCounter: 0, pityReset: false, isFreePull: false, isGuaranteedPity: false, error: "User not found" }];
  }

  const cost = currency === "crunchCoin" ? MULTI_PULL_COST_CRUNCHCOIN : MULTI_PULL_COST_TRICKLE;
  const balance = currency === "crunchCoin" ? user.crunchCoin : user.trickleTokens;

  if (balance < cost) {
    return [{
      success: false,
      isDuplicate: false,
      powerGained: 0,
      newTotalPower: 0,
      pityCounter: user.pityCounter,
      pityReset: false,
      isFreePull: false,
      isGuaranteedPity: false,
      error: `Insufficient ${currency === "crunchCoin" ? "CrunchCoin" : "Trickle Tokens"}`,
    }];
  }

  // Deduct the full cost upfront
  if (currency === "crunchCoin") {
    await prisma.user.update({
      where: { id: userId },
      data: { crunchCoin: { decrement: cost } },
    });
  } else {
    await prisma.user.update({
      where: { id: userId },
      data: { trickleTokens: { decrement: cost } },
    });
  }

  // Generate 10 pull results (execute individually, cost already deducted)
  const results: PullResult[] = [];
  for (let i = 0; i < 10; i++) {
    // Re-fetch user pity for each pull since it changes
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { pityCounter: true },
    });

    const pityCounter = currentUser?.pityCounter ?? 0;
    const isGuaranteedPity = pityCounter >= PITY_THRESHOLD - 1;
    const rarity = rollRarity(pityCounter, rateBoostPercent);

    const selection = await selectCharacter(rarity, { bannerId, userId });
    const character = selection.character;

    const existingOwnership = await prisma.userCharacter.findUnique({
      where: {
        userId_characterId: { userId, characterId: character.id },
      },
    });

    const isDuplicate = !!existingOwnership;
    const powerGained = isDuplicate ? DUPLICATE_POWER_BONUS[rarity as keyof typeof DUPLICATE_POWER_BONUS] : 0;
    const pityReset = rarity === 5;
    const newPityCounter = pityReset ? 0 : pityCounter + 1;

    await prisma.$transaction(async (tx) => {
      // Update pity + guaranteed banner
      const userUpdate: Record<string, unknown> = { pityCounter: newPityCounter };
      if (selection.guaranteedBannerChanged) {
        userUpdate.guaranteedBanner = selection.newGuaranteedBannerValue;
      }
      await tx.user.update({ where: { id: userId }, data: userUpdate });

      if (isDuplicate) {
        await tx.userCharacter.update({
          where: { userId_characterId: { userId, characterId: character.id } },
          data: { fedPower: { increment: powerGained } },
        });
      } else {
        await tx.userCharacter.create({
          data: { userId, characterId: character.id },
        });
      }
    });

    const updatedOwnership = await prisma.userCharacter.findUnique({
      where: { userId_characterId: { userId, characterId: character.id } },
    });

    results.push({
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
      newTotalPower: character.basePower + (updatedOwnership?.fedPower ?? 0),
      pityCounter: newPityCounter,
      pityReset,
      isFreePull: false,
      isGuaranteedPity,
      isBannerRateUp: selection.isBannerRateUp,
      isGuaranteedBanner: selection.isGuaranteedBanner,
    });
  }

  // Guaranteed 3★+: if none of the 10 are rarity ≥ 3, re-roll the last one
  const hasThreeStar = results.some((r) => r.character && r.character.rarity >= 3);
  if (!hasThreeStar) {
    const lastResult = results[results.length - 1];
    const oldCharId = lastResult.character!.id;

    // Select a random 3★ character
    const threeStarSelection = await selectCharacter(3, { bannerId, userId });
    const newChar = threeStarSelection.character;

    // Undo the old character acquisition, add the new one
    await prisma.$transaction(async (tx) => {
      // Remove old character if it was newly added (not a duplicate at the time)
      if (!lastResult.isDuplicate) {
        await tx.userCharacter.delete({
          where: { userId_characterId: { userId, characterId: oldCharId } },
        });
      } else {
        // Was a duplicate power-up — reverse it
        const oldRarity = lastResult.character!.rarity;
        const oldBonus = DUPLICATE_POWER_BONUS[oldRarity as keyof typeof DUPLICATE_POWER_BONUS];
        await tx.userCharacter.update({
          where: { userId_characterId: { userId, characterId: oldCharId } },
          data: { fedPower: { decrement: oldBonus } },
        });
      }

      // Add new 3★ character
      const existingNew = await tx.userCharacter.findUnique({
        where: { userId_characterId: { userId, characterId: newChar.id } },
      });

      if (existingNew) {
        await tx.userCharacter.update({
          where: { userId_characterId: { userId, characterId: newChar.id } },
          data: { fedPower: { increment: DUPLICATE_POWER_BONUS[3] } },
        });
      } else {
        await tx.userCharacter.create({
          data: { userId, characterId: newChar.id },
        });
      }
    });

    const updatedNew = await prisma.userCharacter.findUnique({
      where: { userId_characterId: { userId, characterId: newChar.id } },
    });

    const isDuplicateNew = !!(await prisma.userCharacter.count({
      where: { userId, characterId: newChar.id },
    })) && lastResult.isDuplicate; // approximate

    results[results.length - 1] = {
      ...lastResult,
      character: {
        id: newChar.id,
        name: newChar.name,
        rarity: 3,
        basePower: newChar.basePower,
        bio: newChar.bio,
      },
      isDuplicate: isDuplicateNew,
      powerGained: isDuplicateNew ? DUPLICATE_POWER_BONUS[3] : 0,
      newTotalPower: newChar.basePower + (updatedNew?.fedPower ?? 0),
    };
  }

  return results;
}
