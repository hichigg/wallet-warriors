import Link from "next/link";
import { getLeaderboard, type LeaderboardCategory } from "@/lib/leaderboard";

interface YourRankProps {
  userId: string;
}

const CATEGORIES: {
  id: LeaderboardCategory;
  label: string;
  icon: string;
  valuePrefix: string;
  valueLabel: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
}[] = [
  {
    id: "ranking",
    label: "Battle Rank",
    icon: "\u2694\uFE0F",
    valuePrefix: "",
    valueLabel: "RP",
    accent: "text-purple-400",
    accentBg: "bg-purple-500/10",
    accentBorder: "border-purple-500/20",
  },
  {
    id: "spending",
    label: "Whale Watch",
    icon: "\uD83D\uDCB3",
    valuePrefix: "$",
    valueLabel: "spent",
    accent: "text-red-400",
    accentBg: "bg-red-500/10",
    accentBorder: "border-red-500/20",
  },
  {
    id: "power",
    label: "Power Index",
    icon: "\u26A1",
    valuePrefix: "",
    valueLabel: "PWR",
    accent: "text-crunch",
    accentBg: "bg-crunch-bg",
    accentBorder: "border-crunch-border",
  },
  {
    id: "collection",
    label: "Portfolio",
    icon: "\uD83C\uDFB0",
    valuePrefix: "",
    valueLabel: "chars",
    accent: "text-sky-400",
    accentBg: "bg-sky-500/10",
    accentBorder: "border-sky-500/20",
  },
];

export async function YourRank({ userId }: YourRankProps) {
  // Fetch all 4 leaderboards in parallel
  const results = await Promise.all(
    CATEGORIES.map((cat) => getLeaderboard(cat.id, 500)),
  );

  const rankings = CATEGORIES.map((cat, i) => {
    const entry = results[i].entries.find((e) => e.userId === userId);
    return {
      ...cat,
      rank: entry?.rank ?? null,
      value: entry?.value ?? 0,
      totalPlayers: results[i].totalPlayers,
    };
  });

  const hasAnyRank = rankings.some((r) => r.rank !== null);

  if (!hasAnyRank) {
    return (
      <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">
            Your Rankings
          </h3>
          <div className="h-px flex-1 bg-[#1a1a2e]" />
        </div>
        <p className="text-[11px] text-slate-600 font-body text-center py-4">
          Not ranked yet. Start battling and spending to appear on the Fortune 500.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-6">
      <div className="flex items-center gap-4 mb-5">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">
          Your Rankings
        </h3>
        <div className="h-px flex-1 bg-[#1a1a2e]" />
        <Link
          href="/leaderboard"
          className="text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors"
        >
          Fortune 500 &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {rankings.map((r) => (
          <Link
            key={r.id}
            href={`/leaderboard?category=${r.id}`}
            className={`
              group relative rounded-xl border p-4 transition-all duration-200
              ${r.rank !== null
                ? `${r.accentBg} ${r.accentBorder} hover:border-opacity-60`
                : "bg-[#0f0f19] border-[#1a1a2e] opacity-50"
              }
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{r.icon}</span>
              <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">
                {r.label}
              </span>
            </div>

            {r.rank !== null ? (
              <>
                <p className={`text-2xl font-black font-display ${r.accent} mb-0.5`}>
                  #{r.rank}
                </p>
                <p className="text-[10px] font-mono text-slate-600">
                  {r.valuePrefix}{r.value.toLocaleString()} {r.valueLabel}
                </p>
                <p className="text-[9px] font-mono text-slate-700 mt-1">
                  of {r.totalPlayers} players
                </p>
              </>
            ) : (
              <p className="text-sm font-mono text-slate-700">Unranked</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
