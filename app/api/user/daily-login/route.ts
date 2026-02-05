import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// Trickle Token rewards based on streak day (1-7, then repeats)
// Designed to total ~$10 USD worth over 1 year of perfect daily logins
// 1 Trickle Token ≈ $0.01 → ~1000 tokens/year → ~20 tokens/week
const STREAK_REWARDS = [
  2,  // Day 1
  2,  // Day 2
  3,  // Day 3
  3,  // Day 4
  3,  // Day 5
  3,  // Day 6
  5,  // Day 7 (weekly bonus)
];
// Weekly total: 21 tokens × 52 weeks = 1,092 tokens ≈ $10.92/year

function getRewardForStreak(streak: number): number {
  // Cycle through rewards, day 7+ gets the max reward
  const index = Math.min(streak - 1, STREAK_REWARDS.length - 1);
  return STREAK_REWARDS[Math.max(0, index)];
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isConsecutiveDay(lastLogin: Date, today: Date): boolean {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(lastLogin, yesterday);
}

export async function POST() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        lastLoginAt: true,
        loginStreak: true,
        trickleTokens: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const lastLogin = user.lastLoginAt;

    // Already claimed today
    if (lastLogin && isSameDay(lastLogin, now)) {
      return NextResponse.json({
        claimed: false,
        alreadyClaimed: true,
        streak: user.loginStreak,
        trickleTokens: user.trickleTokens,
        message: "Already claimed today's reward",
      });
    }

    // Calculate new streak
    let newStreak: number;
    if (!lastLogin) {
      // First login ever
      newStreak = 1;
    } else if (isConsecutiveDay(lastLogin, now)) {
      // Consecutive day - increment streak
      newStreak = user.loginStreak + 1;
    } else {
      // Missed a day - reset streak
      newStreak = 1;
    }

    const reward = getRewardForStreak(newStreak);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        lastLoginAt: now,
        loginStreak: newStreak,
        trickleTokens: { increment: reward },
      },
      select: {
        loginStreak: true,
        trickleTokens: true,
      },
    });

    return NextResponse.json({
      claimed: true,
      alreadyClaimed: false,
      reward,
      streak: updatedUser.loginStreak,
      trickleTokens: updatedUser.trickleTokens,
      isStreakReset: newStreak === 1 && user.loginStreak > 0,
      message: `+${reward} Trickle Tokens! Day ${newStreak} streak`,
    });
  } catch (error) {
    console.error("Daily login error:", error);
    return NextResponse.json(
      { error: "Failed to process daily login" },
      { status: 500 }
    );
  }
}

// GET to check status without claiming
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        lastLoginAt: true,
        loginStreak: true,
        trickleTokens: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const now = new Date();
    const canClaim = !user.lastLoginAt || !isSameDay(user.lastLoginAt, now);

    // Preview what they'd get
    let previewStreak = user.loginStreak;
    if (canClaim) {
      if (!user.lastLoginAt) {
        previewStreak = 1;
      } else if (isConsecutiveDay(user.lastLoginAt, now)) {
        previewStreak = user.loginStreak + 1;
      } else {
        previewStreak = 1;
      }
    }

    return NextResponse.json({
      canClaim,
      currentStreak: user.loginStreak,
      nextReward: canClaim ? getRewardForStreak(previewStreak) : null,
      nextStreakDay: canClaim ? previewStreak : null,
      trickleTokens: user.trickleTokens,
    });
  } catch (error) {
    console.error("Daily login check error:", error);
    return NextResponse.json(
      { error: "Failed to check daily login status" },
      { status: 500 }
    );
  }
}
