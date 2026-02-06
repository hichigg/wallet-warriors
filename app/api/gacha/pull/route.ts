import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import {
  executePull,
  executeMultiPull,
  checkFreePullEligibility,
  checkWeeklyFreePull,
  getActiveBanner,
  PULL_COST_CRUNCHCOIN,
  PULL_COST_TRICKLE,
  MULTI_PULL_COST_CRUNCHCOIN,
  MULTI_PULL_COST_TRICKLE,
  GACHA_RATES,
  PITY_THRESHOLD,
  type PullCurrency,
} from "@/lib/gacha";
import { getActiveEvents, getEventModifier } from "@/lib/events";
import { checkAchievements } from "@/lib/achievements";

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const limited = rateLimit(`gacha:${session.user.id}`, { maxRequests: 10, windowMs: 60_000 });
    if (limited) return limited;

    const body = await request.json();
    const { currency, count = 1, bannerId, weeklyFreePull: isWeeklyFreePullRequest } = body as {
      currency?: PullCurrency;
      count?: number;
      bannerId?: string;
      weeklyFreePull?: boolean;
    };

    // Validate count (1 or 10 pulls)
    if (count !== 1 && count !== 10) {
      return NextResponse.json(
        { error: "Invalid pull count. Must be 1 or 10." },
        { status: 400 }
      );
    }

    // Check for active events (rate boost)
    const activeEvents = await getActiveEvents();
    const rateBoostPercent = getEventModifier(activeEvents, "rate_boost");

    // Check for weekly free pull
    if (isWeeklyFreePullRequest) {
      const hasWeeklyFree = await checkWeeklyFreePull(session.user.id);
      if (!hasWeeklyFree) {
        return NextResponse.json(
          { error: "No weekly free pull available." },
          { status: 400 }
        );
      }

      const activeBanner = bannerId ? undefined : (await getActiveBanner());
      const result = await executePull(session.user.id, "crunchCoin", false, {
        isWeeklyFreePull: true,
        bannerId: bannerId || activeBanner?.id,
        rateBoostPercent,
      });

      const newAchievements = await checkAchievements(session.user.id);

      return NextResponse.json({
        pulls: [result],
        isFreePull: true,
        isWeeklyFreePull: true,
        message: "Weekly free pull claimed!",
        newAchievements,
      });
    }

    // Check for free first pull eligibility
    const isEligibleForFreePull = await checkFreePullEligibility(session.user.id);

    if (isEligibleForFreePull) {
      // Execute free first pull
      const result = await executePull(session.user.id, "crunchCoin", true);
      const newAchievements = await checkAchievements(session.user.id);
      return NextResponse.json({
        pulls: [result],
        isFreePull: true,
        message: "Welcome bonus! Here's your first character.",
        newAchievements,
      });
    }

    // Validate currency for paid pulls
    if (!currency || !["crunchCoin", "trickleTokens"].includes(currency)) {
      return NextResponse.json(
        { error: "Invalid currency. Use 'crunchCoin' or 'trickleTokens'." },
        { status: 400 }
      );
    }

    // Resolve banner
    const activeBanner = bannerId ? undefined : (await getActiveBanner());
    const effectiveBannerId = bannerId || activeBanner?.id;

    // Execute pulls
    if (count === 10) {
      // Multi-pull with discount + guaranteed 3★
      const results = await executeMultiPull(session.user.id, currency, {
        bannerId: effectiveBannerId,
        rateBoostPercent,
      });

      if (!results[0].success) {
        return NextResponse.json(
          { error: results[0].error },
          { status: 400 }
        );
      }

      const newAchievements = await checkAchievements(session.user.id);

      return NextResponse.json({
        pulls: results,
        isFreePull: false,
        totalPulls: results.length,
        newAchievements,
      });
    }

    // Single pull
    const result = await executePull(session.user.id, currency, false, {
      bannerId: effectiveBannerId,
      rateBoostPercent,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const newAchievements = await checkAchievements(session.user.id);

    return NextResponse.json({
      pulls: [result],
      isFreePull: false,
      totalPulls: 1,
      newAchievements,
    });
  } catch (error) {
    logger.error("Gacha pull error:", error);
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

    const [isEligibleForFreePull, weeklyFreePullAvailable, activeBanner] = await Promise.all([
      checkFreePullEligibility(session.user.id),
      checkWeeklyFreePull(session.user.id),
      getActiveBanner(),
    ]);

    return NextResponse.json({
      freePullAvailable: isEligibleForFreePull,
      weeklyFreePullAvailable,
      costs: {
        crunchCoin: PULL_COST_CRUNCHCOIN,
        trickleTokens: PULL_COST_TRICKLE,
      },
      multiPullCosts: {
        crunchCoin: MULTI_PULL_COST_CRUNCHCOIN,
        trickleTokens: MULTI_PULL_COST_TRICKLE,
      },
      rates: GACHA_RATES,
      pityThreshold: PITY_THRESHOLD,
      activeBanner: activeBanner ? {
        id: activeBanner.id,
        name: activeBanner.name,
        featuredChar: activeBanner.featuredChar,
        rateUpPercent: activeBanner.rateUpPercent,
        endDate: activeBanner.endDate,
      } : null,
    });
  } catch (error) {
    logger.error("Gacha status error:", error);
    return NextResponse.json(
      { error: "Failed to get gacha status" },
      { status: 500 }
    );
  }
}
