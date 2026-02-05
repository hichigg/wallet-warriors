import type { Metadata } from "next";
import { Suspense } from "react";
import { getSession } from "@/lib/auth-helpers";
import { getLeaderboard, type LeaderboardCategory } from "@/lib/leaderboard";
import { PageHeader } from "@/components/ui/PageHeader";
import { LeaderboardTabs } from "@/components/LeaderboardTabs";

export const metadata: Metadata = {
  title: "Leaderboard | Wallet Warriors",
  description: "The leaderboard of regret. Rankings by power, spending, and collection size.",
};

const VALID_CATEGORIES: LeaderboardCategory[] = ["ranking", "spending", "power", "collection"];

const CATEGORY_CONFIG: Record<LeaderboardCategory, {
  title: string;
  valueLabel: string;
  secondaryLabel: string;
  valuePrefix: string;
  secondaryPrefix: string;
  emptyMessage: string;
}> = {
  ranking: {
    title: "Battle Rankings",
    valueLabel: "RP",
    secondaryLabel: "Spent",
    valuePrefix: "",
    secondaryPrefix: "$",
    emptyMessage: "No one has earned ranking points yet. The arena awaits.",
  },
  spending: {
    title: "Whale Watch",
    valueLabel: "Spent",
    secondaryLabel: "RP",
    valuePrefix: "$",
    secondaryPrefix: "",
    emptyMessage: "No one has spent any money yet. Remarkable restraint.",
  },
  power: {
    title: "Power Index",
    valueLabel: "Power",
    secondaryLabel: "Spent",
    valuePrefix: "",
    secondaryPrefix: "$",
    emptyMessage: "No one has any power yet. Pull some characters first.",
  },
  collection: {
    title: "Portfolio Size",
    valueLabel: "Chars",
    secondaryLabel: "Spent",
    valuePrefix: "",
    secondaryPrefix: "$",
    emptyMessage: "No one owns any characters yet. The gacha is waiting.",
  },
};

const RANK_MEDALS: Record<number, string> = {
  1: "\uD83E\uDD47",
  2: "\uD83E\uDD48",
  3: "\uD83E\uDD49",
};

interface LeaderboardPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const params = await searchParams;
  const categoryParam = params.category ?? "ranking";
  const category: LeaderboardCategory = VALID_CATEGORIES.includes(categoryParam as LeaderboardCategory)
    ? (categoryParam as LeaderboardCategory)
    : "ranking";

  const [data, session] = await Promise.all([
    getLeaderboard(category, 500),
    getSession(),
  ]);

  const config = CATEGORY_CONFIG[category];
  const currentUserId = session?.user?.id;

  // Find current user's position
  const userEntry = currentUserId
    ? data.entries.find((e) => e.userId === currentUserId)
    : null;

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(168,85,247,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        <PageHeader
          tag="The Fortune 500"
          title="Board of Directors"
          subtitle="Ranked by a totally fair algorithm that definitely doesn't factor in spending."
        />

        {/* Category Tabs */}
        <Suspense fallback={null}>
          <LeaderboardTabs />
        </Suspense>

        {/* Category Title + Count */}
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">
            {config.title}
          </h2>
          <div className="h-px flex-1 bg-[#1a1a2e]" />
          <span className="text-[10px] font-mono text-slate-600">
            {data.totalPlayers} {data.totalPlayers === 1 ? "player" : "players"}
          </span>
        </div>

        {/* User's own rank callout */}
        {userEntry && (
          <div className="mb-6 p-4 bg-crunch-subtle border border-crunch-border rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-crunch/70 uppercase tracking-wider">Your Rank</span>
              <span className="text-xl font-black font-display text-crunch">#{userEntry.rank}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-mono font-bold text-crunch">
                  {config.valuePrefix}{userEntry.value.toLocaleString()}
                </p>
                <p className="text-[9px] font-mono text-slate-600">{config.valueLabel}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-mono text-slate-500">
                  {config.secondaryPrefix}{userEntry.secondary.toLocaleString()}
                </p>
                <p className="text-[9px] font-mono text-slate-700">{config.secondaryLabel}</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        {data.entries.length === 0 ? (
          <EmptyState message={config.emptyMessage} />
        ) : (
          <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[60px_1fr_auto_auto] gap-4 px-5 py-3 border-b border-[#1a1a2e]">
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider">Rank</span>
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider">Player</span>
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider text-right w-28">{config.valueLabel}</span>
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider text-right w-24">{config.secondaryLabel}</span>
            </div>

            {data.entries.map((entry, i) => {
              const isCurrentUser = entry.userId === currentUserId;
              const medal = RANK_MEDALS[entry.rank];
              const isTop3 = entry.rank <= 3;

              return (
                <div
                  key={entry.userId}
                  className={`
                    flex flex-col md:grid md:grid-cols-[60px_1fr_auto_auto] gap-2 md:gap-4 md:items-center px-5 py-3.5
                    ${i < data.entries.length - 1 ? "border-b border-[#1a1a2e]" : ""}
                    ${isCurrentUser ? "bg-crunch/[0.03]" : "hover:bg-white/[0.01]"}
                    transition-colors
                  `}
                >
                  {/* Rank */}
                  <div className="flex items-center gap-2">
                    {medal ? (
                      <span className="text-lg">{medal}</span>
                    ) : (
                      <span className={`text-sm font-mono font-bold ${isTop3 ? "text-crunch" : "text-slate-600"}`}>
                        #{entry.rank}
                      </span>
                    )}
                  </div>

                  {/* Player */}
                  <div className="flex items-center gap-3">
                    {entry.image ? (
                      <img
                        src={entry.image}
                        alt=""
                        className="w-7 h-7 rounded-full border border-[#1a1a2e]"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-[#1a1a2e] flex items-center justify-center">
                        <span className="text-[10px] font-mono text-slate-600">
                          {(entry.name ?? "?")[0]?.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className={`text-sm font-display font-bold ${isCurrentUser ? "text-crunch" : "text-slate-200"}`}>
                        {entry.username ?? entry.name ?? "Anonymous"}
                        {isCurrentUser && (
                          <span className="ml-2 text-[9px] font-mono text-crunch/60 uppercase tracking-wider">(You)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Primary Value */}
                  <div className="md:text-right md:w-28 pl-9 md:pl-0">
                    <p className={`text-sm font-mono font-bold ${isTop3 ? "text-crunch" : "text-slate-300"}`}>
                      {config.valuePrefix}{entry.value.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-mono text-slate-700 md:hidden">{config.valueLabel}</p>
                  </div>

                  {/* Secondary Value */}
                  <div className="md:text-right md:w-24 pl-9 md:pl-0">
                    <p className="text-[11px] font-mono text-slate-600">
                      {config.secondaryPrefix}{entry.secondary.toLocaleString()}
                    </p>
                    <p className="text-[9px] font-mono text-slate-700 md:hidden">{config.secondaryLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="max-w-xl mx-auto text-center border-t border-[#1a1a2e] pt-8 mt-10">
          <p className="text-[10px] text-slate-700 font-mono leading-loose tracking-wide uppercase">
            The Fortune 500 &middot; Updated in real time &middot; Shame included at no extra cost
          </p>
          <p className="text-[10px] text-slate-800 font-mono mt-1">
            &ldquo;If you&apos;re not on this list, you&apos;re either smart or not trying hard enough.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-dashed border-[#2a2a3e] rounded-2xl px-10 py-20 text-center">
      <div className="text-6xl mb-5">&#128202;</div>
      <h3 className="text-xl font-bold text-slate-200 font-display mb-2">
        No Rankings Yet
      </h3>
      <p className="text-sm text-slate-600 font-body max-w-md mx-auto">
        {message}
      </p>
    </div>
  );
}
