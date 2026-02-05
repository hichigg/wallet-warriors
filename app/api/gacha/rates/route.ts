import { NextResponse } from "next/server";
import {
  GACHA_RATES,
  PITY_THRESHOLD,
  SOFT_PITY_START,
  PULL_COST_CRUNCHCOIN,
  PULL_COST_TRICKLE,
  DUPLICATE_POWER_BONUS,
} from "@/lib/gacha";

// Public endpoint - no auth required
export async function GET() {
  return NextResponse.json({
    rates: {
      "5": { percent: GACHA_RATES[5], label: "Legendary" },
      "4": { percent: GACHA_RATES[4], label: "Super Rare" },
      "3": { percent: GACHA_RATES[3], label: "Rare" },
      "2": { percent: GACHA_RATES[2], label: "Uncommon" },
      "1": { percent: GACHA_RATES[1], label: "Common" },
    },
    pity: {
      hardPity: PITY_THRESHOLD,
      softPityStart: SOFT_PITY_START,
      description: `Guaranteed 5★ at ${PITY_THRESHOLD} pulls. Increased rates start at ${SOFT_PITY_START} pulls.`,
    },
    costs: {
      crunchCoin: {
        single: PULL_COST_CRUNCHCOIN,
        ten: PULL_COST_CRUNCHCOIN * 10,
      },
      trickleTokens: {
        single: PULL_COST_TRICKLE,
        ten: PULL_COST_TRICKLE * 10,
      },
    },
    duplicateBonuses: {
      "5": DUPLICATE_POWER_BONUS[5],
      "4": DUPLICATE_POWER_BONUS[4],
      "3": DUPLICATE_POWER_BONUS[3],
      "2": DUPLICATE_POWER_BONUS[2],
      "1": DUPLICATE_POWER_BONUS[1],
    },
    disclaimer: "These rates are real. The value proposition is not. Please gamble responsibly (or don't, we get paid either way).",
  });
}
