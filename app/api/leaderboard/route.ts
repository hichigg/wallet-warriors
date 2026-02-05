import { NextRequest, NextResponse } from "next/server";
import { getLeaderboard, type LeaderboardCategory } from "@/lib/leaderboard";

const VALID_CATEGORIES: LeaderboardCategory[] = [
  "ranking",
  "spending",
  "power",
  "collection",
];

// Public endpoint — no auth required
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const categoryParam = searchParams.get("category") ?? "ranking";
  const limitParam = searchParams.get("limit");

  if (!VALID_CATEGORIES.includes(categoryParam as LeaderboardCategory)) {
    return NextResponse.json(
      { error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}` },
      { status: 400 },
    );
  }

  const category = categoryParam as LeaderboardCategory;
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  if (isNaN(limit) || limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: "Limit must be between 1 and 100." },
      { status: 400 },
    );
  }

  const data = await getLeaderboard(category, limit);

  const categoryMeta: Record<LeaderboardCategory, { title: string; valueLabel: string; secondaryLabel: string }> = {
    ranking: { title: "Battle Rankings", valueLabel: "Ranking Points", secondaryLabel: "Total Spent ($)" },
    spending: { title: "Whale Watch", valueLabel: "Total Spent ($)", secondaryLabel: "Ranking Points" },
    power: { title: "Power Rankings", valueLabel: "Total Power", secondaryLabel: "Total Spent ($)" },
    collection: { title: "Portfolio Size", valueLabel: "Characters Owned", secondaryLabel: "Total Spent ($)" },
  };

  return NextResponse.json({
    ...data,
    meta: categoryMeta[category],
    disclaimer: "This leaderboard is a monument to sunk cost fallacy. Congratulations to all participants.",
  });
}
