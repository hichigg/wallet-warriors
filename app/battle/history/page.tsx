import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";

export default async function BattleHistoryPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/battle/history");
  }

  const userId = session.user.id;

  const [battles, user] = await Promise.all([
    prisma.battle.findMany({
      where: {
        OR: [{ attackerId: userId }, { defenderId: userId }],
      },
      include: {
        attacker: { select: { id: true, name: true } },
        defender: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        rankingPoints: true,
        _count: {
          select: {
            battlesAsAttacker: true,
            battlesWon: true,
          },
        },
      },
    }),
  ]);

  const totalBattles = battles.length;
  const wins = battles.filter((b) => b.winnerId === userId).length;
  const losses = totalBattles - wins;
  const winRate = totalBattles > 0 ? Math.round((wins / totalBattles) * 100) : 0;

  // Calculate best win streak
  let bestStreak = 0;
  let currentStreak = 0;
  // Iterate oldest-first for streak calc
  for (let i = battles.length - 1; i >= 0; i--) {
    if (battles[i].winnerId === userId) {
      currentStreak++;
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  // Net RP from all battles
  const netRP = battles.reduce((sum, b) => {
    const won = b.winnerId === userId;
    return sum + (won ? b.rankingPointsChange : -b.rankingPointsChange);
  }, 0);

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        <PageHeader
          tag="Battle Log"
          title="Combat Ledger"
          subtitle="A permanent record of every hostile takeover attempt."
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <StatBox label="Battles" value={totalBattles.toString()} subtext="Total fights" accent="text-sky-400" />
          <StatBox label="Wins" value={wins.toString()} subtext={`${winRate}% rate`} accent="text-emerald-400" />
          <StatBox label="Losses" value={losses.toString()} subtext="Hostile rejections" accent="text-red-400" />
          <StatBox label="Best Streak" value={bestStreak.toString()} subtext="Consecutive wins" accent="text-crunch" />
          <StatBox
            label="Net RP"
            value={`${netRP >= 0 ? "+" : ""}${netRP}`}
            subtext="Ranking earned"
            accent={netRP >= 0 ? "text-emerald-400" : "text-red-400"}
          />
        </div>

        {/* Battle List */}
        {battles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[#1a1a2e]">
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider w-8" />
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider">Opponent</span>
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider">Power Breakdown</span>
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider text-right w-20">Result</span>
            </div>

            {battles.map((b, i) => {
              const isAttacker = b.attackerId === userId;
              const won = b.winnerId === userId;
              const opponentName = isAttacker
                ? (b.defender.name ?? "Unknown")
                : (b.attacker.name ?? "Unknown");
              const myPower = isAttacker ? b.attackerPower : b.defenderPower;
              const theirPower = isAttacker ? b.defenderPower : b.attackerPower;
              const myRoll = isAttacker ? b.attackerRoll : b.defenderRoll;
              const theirRoll = isAttacker ? b.defenderRoll : b.attackerRoll;
              const myFinal = myPower + (myRoll ?? 0);
              const theirFinal = theirPower + (theirRoll ?? 0);

              return (
                <div
                  key={b.id}
                  className={`flex flex-col md:grid md:grid-cols-[auto_1fr_1fr_auto] gap-2 md:gap-4 md:items-center px-5 py-4 ${
                    i < battles.length - 1 ? "border-b border-[#1a1a2e]" : ""
                  } hover:bg-white/[0.01] transition-colors`}
                >
                  {/* W/L badge */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    won ? "bg-emerald-500/10" : "bg-red-500/10"
                  }`}>
                    <span className={`text-sm font-bold font-mono ${
                      won ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {won ? "W" : "L"}
                    </span>
                  </div>

                  {/* Opponent info */}
                  <div>
                    <p className="text-sm text-slate-200 font-display font-bold">
                      vs {opponentName}
                    </p>
                    <p className="text-[10px] text-slate-600 font-mono">
                      {b.createdAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" "}&middot;{" "}
                      {isAttacker ? "Attacked" : "Defended"}
                    </p>
                  </div>

                  {/* Power breakdown */}
                  <div className="pl-10 md:pl-0">
                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-slate-400">{myPower.toLocaleString()}</span>
                      <span className={`${(myRoll ?? 0) >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>
                        ({(myRoll ?? 0) >= 0 ? "+" : ""}{myRoll ?? "?"})
                      </span>
                      <span className="text-slate-700">=</span>
                      <span className="text-slate-200 font-bold">{myFinal.toLocaleString()}</span>
                      <span className="text-slate-700">vs</span>
                      <span className="text-slate-200 font-bold">{theirFinal.toLocaleString()}</span>
                      <span className={`${(theirRoll ?? 0) >= 0 ? "text-emerald-400/70" : "text-red-400/70"}`}>
                        ({(theirRoll ?? 0) >= 0 ? "+" : ""}{theirRoll ?? "?"})
                      </span>
                    </div>
                  </div>

                  {/* RP change */}
                  <div className="pl-10 md:pl-0 md:text-right md:w-20">
                    <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-md border ${
                      won
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {won ? `+${b.rankingPointsChange}` : `-${b.rankingPointsChange}`} RP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <Link
            href="/battle"
            className="inline-block text-[10px] font-mono text-slate-600 hover:text-slate-400 uppercase tracking-wider transition-colors"
          >
            &larr; Back to Arena
          </Link>
        </div>

        <div className="max-w-xl mx-auto text-center border-t border-[#1a1a2e] pt-8 mt-8">
          <p className="text-[10px] text-slate-800 font-mono mt-1">
            &ldquo;In the arena of capitalism, every loss is a learning opportunity you paid for.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, subtext, accent }: { label: string; value: string; subtext: string; accent: string }) {
  return (
    <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-5 text-center hover:border-[#2a2a3e] transition-colors">
      <p className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-2">
        {label}
      </p>
      <p className={`text-2xl font-black font-display ${accent}`}>{value}</p>
      <p className="text-[10px] text-slate-700 font-mono">{subtext}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-dashed border-[#2a2a3e] rounded-2xl px-10 py-20 text-center">
      <div className="text-6xl mb-5">&#9876;&#65039;</div>
      <h3 className="text-xl font-bold text-slate-200 font-display mb-2">
        No Battles Yet
      </h3>
      <p className="text-sm text-slate-600 font-body mb-6 max-w-md mx-auto">
        Your combat record is spotless. Either you&apos;re cautious or you just got here.
      </p>
      <Link
        href="/battle"
        className="inline-block px-6 py-3 bg-gradient-to-r from-crunch to-crunch-dark text-amber-950 font-bold rounded-xl transition-all duration-200 font-display uppercase tracking-wider text-sm shadow-lg shadow-amber-500/20"
      >
        Enter the Arena
      </Link>
    </div>
  );
}
