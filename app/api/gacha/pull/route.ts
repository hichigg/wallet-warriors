import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import {
  executePull,
  checkFreePullEligibility,
  PULL_COST_CRUNCHCOIN,
  PULL_COST_TRICKLE,
  GACHA_RATES,
  PITY_THRESHOLD,
  type PullCurrency,
} from "@/lib/gacha";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currency, count = 1 } = body as { currency?: PullCurrency; count?: number };

    // Validate count (1 or 10 pulls)
    if (count !== 1 && count !== 10) {
      return NextResponse.json(
        { error: "Invalid pull count. Must be 1 or 10." },
        { status: 400 }
      );
    }

    // Check for free pull eligibility first
    const isEligibleForFreePull = await checkFreePullEligibility(session.user.id);

    if (isEligibleForFreePull) {
      // Execute free first pull
      const result = await executePull(session.user.id, "crunchCoin", true);
      return NextResponse.json({
        pulls: [result],
        isFreePull: true,
        message: "Welcome bonus! Here's your first character.",
      });
    }

    // Validate currency for paid pulls
    if (!currency || !["crunchCoin", "trickleTokens"].includes(currency)) {
      return NextResponse.json(
        { error: "Invalid currency. Use 'crunchCoin' or 'trickleTokens'." },
        { status: 400 }
      );
    }

    // Execute pulls
    const results = [];
    for (let i = 0; i < count; i++) {
      const result = await executePull(session.user.id, currency, false);

      if (!result.success) {
        // If first pull fails, return error
        if (i === 0) {
          return NextResponse.json(
            { error: result.error },
            { status: 400 }
          );
        }
        // If subsequent pull fails (ran out of currency), return what we got
        break;
      }

      results.push(result);
    }

    return NextResponse.json({
      pulls: results,
      isFreePull: false,
      totalPulls: results.length,
    });
  } catch (error) {
    console.error("Gacha pull error:", error);
    return NextResponse.json(
      { error: "Failed to execute pull" },
      { status: 500 }
    );
  }
}

// GET endpoint to check pull status/eligibility
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const isEligibleForFreePull = await checkFreePullEligibility(session.user.id);

    return NextResponse.json({
      freePullAvailable: isEligibleForFreePull,
      costs: {
        crunchCoin: PULL_COST_CRUNCHCOIN,
        trickleTokens: PULL_COST_TRICKLE,
      },
      rates: GACHA_RATES,
      pityThreshold: PITY_THRESHOLD,
    });
  } catch (error) {
    console.error("Gacha status error:", error);
    return NextResponse.json(
      { error: "Failed to get gacha status" },
      { status: 500 }
    );
  }
}
