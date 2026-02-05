// lib/battle.ts
// Battle system — matchmaking + resolution with RNG variance and ranking points

import { prisma } from "./prisma";
import { applyBuzzwordBoost, type BuzzwordEffect } from "./buzzwords";

// --- Constants ---

/** RNG variance range: each side rolls between -MAX_VARIANCE and +MAX_VARIANCE percent */
const MAX_VARIANCE_PERCENT = 5;

/** Base ranking points exchanged per battle */
const BASE_RANKING_POINTS = 25;

/** Minimum ranking points a loser can lose (never goes below 0 total) */
const MIN_RANKING_CHANGE = 10;

/** Maximum ranking points exchanged in a single battle */
const MAX_RANKING_CHANGE = 50;

/** Minimum time between battles for the same attacker (ms) */
const BATTLE_COOLDOWN_MS = 30_000; // 30 seconds

/** Matchmaking: how far in ranking points to search for opponents */
const MATCHMAKING_RANGE = 500;

/** Matchmaking: max opponents to consider (pick random from pool) */
const MATCHMAKING_POOL_SIZE = 10;

/** Minimum characters required to battle */
const MIN_CHARACTERS_TO_BATTLE = 1;

// --- Types ---

export interface BattleResult {
  success: true;
  battleId: string;
  attacker: {
    id: string;
    name: string;
    basePower: number;
    boostedPower: number;
    roll: number;
    finalPower: number;
    rankingPointsBefore: number;
    rankingPointsAfter: number;
  };
  defender: {
    id: string;
    name: string;
    basePower: number;
    boostedPower: number;
    roll: number;
    finalPower: number;
    rankingPointsBefore: number;
    rankingPointsAfter: number;
  };
  winnerId: string;
  rankingPointsChange: number;
  attackerWon: boolean;
  buzzwordUsed: string | null;
}

export interface BattleError {
  success: false;
  error: string;
}

// --- Helper functions ---

/** Calculate a user's total power across all owned characters */
export async function getUserTotalPower(userId: string): Promise<number> {
  const characters = await prisma.userCharacter.findMany({
    where: { userId },
    include: { character: { select: { basePower: true } } },
  });

  return characters.reduce(
    (sum, uc) => sum + uc.character.basePower + uc.fedPower,
    0,
  );
}

/** Roll RNG variance: returns a value between -MAX_VARIANCE and +MAX_VARIANCE (as integer power modifier) */
function rollVariance(basePower: number): number {
  const percent = (Math.random() * 2 - 1) * MAX_VARIANCE_PERCENT; // -5 to +5
  return Math.round((basePower * percent) / 100);
}

/**
 * Calculate ranking points exchanged based on rating difference.
 * Underdog wins = more points. Favorite wins = fewer points.
 */
function calculateRankingPointsChange(
  winnerRanking: number,
  loserRanking: number,
): number {
  const diff = loserRanking - winnerRanking;
  // If winner had lower ranking (underdog), they get more points
  // If winner had higher ranking (favorite), they get fewer points
  const modifier = Math.round(diff / 50);
  const points = Math.max(
    MIN_RANKING_CHANGE,
    Math.min(MAX_RANKING_CHANGE, BASE_RANKING_POINTS + modifier),
  );
  return points;
}

/** Find an opponent near the attacker's ranking */
async function findOpponent(
  attackerId: string,
  attackerRanking: number,
): Promise<{ id: string; name: string | null; rankingPoints: number } | null> {
  // Search for opponents within range, excluding attacker
  const candidates = await prisma.user.findMany({
    where: {
      id: { not: attackerId },
      rankingPoints: {
        gte: attackerRanking - MATCHMAKING_RANGE,
        lte: attackerRanking + MATCHMAKING_RANGE,
      },
      characters: { some: {} }, // Must own at least 1 character
    },
    select: { id: true, name: true, rankingPoints: true },
    take: MATCHMAKING_POOL_SIZE,
    orderBy: {
      // Prefer opponents closer in ranking
      rankingPoints: attackerRanking > 0 ? "desc" : "asc",
    },
  });

  if (candidates.length === 0) {
    // Fallback: find ANY user with characters (excluding attacker)
    const fallback = await prisma.user.findMany({
      where: {
        id: { not: attackerId },
        characters: { some: {} },
      },
      select: { id: true, name: true, rankingPoints: true },
      take: MATCHMAKING_POOL_SIZE,
      orderBy: { rankingPoints: "desc" },
    });

    if (fallback.length === 0) return null;
    return fallback[Math.floor(Math.random() * fallback.length)];
  }

  // Pick a random opponent from the pool
  return candidates[Math.floor(Math.random() * candidates.length)];
}

// --- Core battle execution ---

export async function executeBattle(
  attackerId: string,
  buzzwordId?: string,
): Promise<BattleResult | BattleError> {
  // 1. Verify attacker exists and get their data
  const attacker = await prisma.user.findUnique({
    where: { id: attackerId },
    select: {
      id: true,
      name: true,
      rankingPoints: true,
      characters: { select: { id: true } },
    },
  });

  if (!attacker) {
    return { success: false, error: "User not found." };
  }

  if (attacker.characters.length < MIN_CHARACTERS_TO_BATTLE) {
    return { success: false, error: "You need at least one character to battle. Try pulling from the gacha first." };
  }

  // 2. Check cooldown
  const recentBattle = await prisma.battle.findFirst({
    where: { attackerId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  if (recentBattle) {
    const elapsed = Date.now() - recentBattle.createdAt.getTime();
    if (elapsed < BATTLE_COOLDOWN_MS) {
      const remaining = Math.ceil((BATTLE_COOLDOWN_MS - elapsed) / 1000);
      return { success: false, error: `Cooldown active. Wait ${remaining}s before your next battle.` };
    }
  }

  // 3. Calculate attacker power
  const attackerBasePower = await getUserTotalPower(attackerId);
  if (attackerBasePower === 0) {
    return { success: false, error: "Your total power is 0. Feed your characters first." };
  }

  // 3b. Validate and resolve buzzword (if provided)
  let buzzwordEffect: BuzzwordEffect | null = null;
  let buzzwordName: string | null = null;

  if (buzzwordId) {
    const userBuzzword = await prisma.userBuzzword.findUnique({
      where: { userId_buzzwordId: { userId: attackerId, buzzwordId } },
      include: { buzzword: true },
    });

    if (!userBuzzword || userBuzzword.quantity < 1) {
      return { success: false, error: "You don't own that buzzword." };
    }

    buzzwordEffect = userBuzzword.buzzword.effect as unknown as BuzzwordEffect;
    buzzwordName = userBuzzword.buzzword.name;

    // Consume one buzzword
    await prisma.userBuzzword.update({
      where: { id: userBuzzword.id },
      data: { quantity: { decrement: 1 } },
    });
  }

  // 4. Find opponent
  const opponent = await findOpponent(attackerId, attacker.rankingPoints);
  if (!opponent) {
    return { success: false, error: "No opponents found. The arena is empty." };
  }

  // 5. Calculate defender power
  const defenderBasePower = await getUserTotalPower(opponent.id);

  // 5b. Apply buzzword boost
  let attackerBoostedPower = attackerBasePower;
  let defenderBoostedPower = defenderBasePower;

  if (buzzwordEffect) {
    const boosted = applyBuzzwordBoost(attackerBasePower, defenderBasePower, buzzwordEffect);
    attackerBoostedPower = boosted.attackerPower;
    defenderBoostedPower = boosted.defenderPower;
  }

  // 6. Roll RNG variance for both sides (applied to boosted power)
  const attackerRoll = rollVariance(attackerBoostedPower);
  const defenderRoll = rollVariance(defenderBoostedPower);
  const attackerFinalPower = Math.max(1, attackerBoostedPower + attackerRoll);
  const defenderFinalPower = Math.max(1, defenderBoostedPower + defenderRoll);

  // 7. Determine winner (attacker wins ties — aggressor advantage)
  const attackerWon = attackerFinalPower >= defenderFinalPower;
  const winnerId = attackerWon ? attackerId : opponent.id;
  const loserId = attackerWon ? opponent.id : attackerId;
  const winnerRanking = attackerWon ? attacker.rankingPoints : opponent.rankingPoints;
  const loserRanking = attackerWon ? opponent.rankingPoints : attacker.rankingPoints;

  // 8. Calculate ranking points change
  const rankingPointsChange = calculateRankingPointsChange(winnerRanking, loserRanking);

  // 9. Ensure loser doesn't go below 0 ranking points
  const loserCurrentPoints = attackerWon ? opponent.rankingPoints : attacker.rankingPoints;
  const actualLoss = Math.min(rankingPointsChange, loserCurrentPoints);

  // 10. Atomic transaction: create battle record + update both users' ranking points
  const [battle] = await prisma.$transaction([
    prisma.battle.create({
      data: {
        attackerId,
        defenderId: opponent.id,
        winnerId,
        attackerPower: attackerBoostedPower,
        defenderPower: defenderBoostedPower,
        attackerRoll,
        defenderRoll,
        rankingPointsChange,
        buzzwordsUsed: buzzwordId ? [buzzwordId] : undefined,
      },
    }),
    prisma.user.update({
      where: { id: winnerId },
      data: { rankingPoints: { increment: rankingPointsChange } },
    }),
    prisma.user.update({
      where: { id: loserId },
      data: { rankingPoints: { decrement: actualLoss } },
    }),
  ]);

  // 11. Build result
  const attackerRPAfter = attackerWon
    ? attacker.rankingPoints + rankingPointsChange
    : Math.max(0, attacker.rankingPoints - actualLoss);
  const defenderRPAfter = attackerWon
    ? Math.max(0, opponent.rankingPoints - actualLoss)
    : opponent.rankingPoints + rankingPointsChange;

  return {
    success: true,
    battleId: battle.id,
    attacker: {
      id: attackerId,
      name: attacker.name ?? "Unknown",
      basePower: attackerBasePower,
      boostedPower: attackerBoostedPower,
      roll: attackerRoll,
      finalPower: attackerFinalPower,
      rankingPointsBefore: attacker.rankingPoints,
      rankingPointsAfter: attackerRPAfter,
    },
    defender: {
      id: opponent.id,
      name: opponent.name ?? "Unknown",
      basePower: defenderBasePower,
      boostedPower: defenderBoostedPower,
      roll: defenderRoll,
      finalPower: defenderFinalPower,
      rankingPointsBefore: opponent.rankingPoints,
      rankingPointsAfter: defenderRPAfter,
    },
    winnerId,
    rankingPointsChange,
    attackerWon,
    buzzwordUsed: buzzwordName,
  };
}
