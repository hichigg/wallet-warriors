// lib/buzzwords.ts
// Buzzword powerups — consumable battle boosters bought with CrunchCoin

import { prisma } from "./prisma";

// --- Buzzword definitions (seed data) ---

export interface BuzzwordEffect {
  type: "power_boost_pct" | "opponent_debuff_pct";
  value: number; // percentage (e.g. 10 = +10%)
}

export interface BuzzwordDef {
  name: string;
  cost: number;
  effect: BuzzwordEffect;
  description: string;
}

export const BUZZWORD_DEFS: BuzzwordDef[] = [
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

// --- Buy logic ---

export interface BuyResult {
  success: true;
  buzzwordName: string;
  cost: number;
  newQuantity: number;
  newCrunchCoin: number;
}

export interface BuyError {
  success: false;
  error: string;
}

export async function buyBuzzword(
  userId: string,
  buzzwordId: string,
): Promise<BuyResult | BuyError> {
  // 1. Get buzzword
  const buzzword = await prisma.buzzword.findUnique({
    where: { id: buzzwordId },
  });

  if (!buzzword) {
    return { success: false, error: "Buzzword not found." };
  }

  // 2. Check balance
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { crunchCoin: true },
  });

  if (!user) {
    return { success: false, error: "User not found." };
  }

  if (user.crunchCoin < buzzword.cost) {
    return { success: false, error: `Not enough CrunchCoin. Need ${buzzword.cost}, have ${user.crunchCoin}.` };
  }

  // 3. Atomic: deduct CC + upsert inventory
  const [updatedUser, inventory] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { crunchCoin: { decrement: buzzword.cost } },
    }),
    prisma.userBuzzword.upsert({
      where: { userId_buzzwordId: { userId, buzzwordId } },
      update: { quantity: { increment: 1 } },
      create: { userId, buzzwordId, quantity: 1 },
    }),
  ]);

  return {
    success: true,
    buzzwordName: buzzword.name,
    cost: buzzword.cost,
    newQuantity: inventory.quantity,
    newCrunchCoin: updatedUser.crunchCoin,
  };
}

// --- Battle boost application ---

export function applyBuzzwordBoost(
  attackerPower: number,
  defenderPower: number,
  effect: BuzzwordEffect,
): { attackerPower: number; defenderPower: number } {
  if (effect.type === "power_boost_pct") {
    return {
      attackerPower: attackerPower + Math.round(attackerPower * effect.value / 100),
      defenderPower,
    };
  }

  if (effect.type === "opponent_debuff_pct") {
    return {
      attackerPower,
      defenderPower: Math.max(1, defenderPower - Math.round(defenderPower * effect.value / 100)),
    };
  }

  return { attackerPower, defenderPower };
}
