import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "hichigg@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default async function AdminPage() {
  const session = await getSession();

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email.toLowerCase())) {
    redirect("/");
  }

  // Fetch all stats in parallel
  const [
    totalUsers,
    totalBots,
    totalHumans,
    totalCharAssignments,
    botCharAssignments,
    totalBattles,
    botBattles,
    totalTransactions,
    botTransactions,
    tierBreakdown,
    topBotsByRP,
    recentBotBattles,
    botSpendingAgg,
    botRPAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isBot: true } }),
    prisma.user.count({ where: { isBot: false } }),
    prisma.userCharacter.count(),
    prisma.userCharacter.count({ where: { user: { isBot: true } } }),
    prisma.battle.count(),
    prisma.battle.count({
      where: {
        OR: [
          { attacker: { isBot: true } },
          { defender: { isBot: true } },
        ],
      },
    }),
    prisma.transaction.count(),
    prisma.transaction.count({ where: { user: { isBot: true } } }),
    // Tier breakdown by spending ranges
    Promise.all([
      prisma.user.count({ where: { isBot: true, totalSpent: { equals: 0 } } }),
      prisma.user.count({ where: { isBot: true, totalSpent: { gt: 0, lte: 30 } } }),
      prisma.user.count({ where: { isBot: true, totalSpent: { gt: 30, lte: 150 } } }),
      prisma.user.count({ where: { isBot: true, totalSpent: { gt: 150, lte: 500 } } }),
      prisma.user.count({ where: { isBot: true, totalSpent: { gt: 500 } } }),
    ]),
    // Top 10 bots by RP
    prisma.user.findMany({
      where: { isBot: true },
      orderBy: { rankingPoints: "desc" },
      take: 10,
      select: { id: true, name: true, username: true, rankingPoints: true, totalSpent: true },
    }),
    // Recent 10 bot battles
    prisma.battle.findMany({
      where: {
        OR: [
          { attacker: { isBot: true } },
          { defender: { isBot: true } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        attackerPower: true,
        defenderPower: true,
        rankingPointsChange: true,
        attacker: { select: { name: true, isBot: true } },
        defender: { select: { name: true, isBot: true } },
        winner: { select: { name: true } },
      },
    }),
    // Aggregate bot spending
    prisma.user.aggregate({
      where: { isBot: true },
      _sum: { totalSpent: true },
      _avg: { totalSpent: true, rankingPoints: true, crunchCoin: true },
    }),
    // Aggregate bot RP
    prisma.user.aggregate({
      where: { isBot: true },
      _max: { rankingPoints: true },
      _min: { rankingPoints: true },
    }),
  ]);

  const tierLabels = ["Free2Play", "Minnow", "Dolphin", "Whale", "Megawhale"];
  const tierEmojis = ["\uD83C\uDD93", "\uD83D\uDC1F", "\uD83D\uDC2C", "\uD83D\uDC0B", "\uD83D\uDC33"];

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <PageHeader
          tag="Admin"
          title="Bot Control Center"
          subtitle="Monitor the artificial population. They don't know they're not real."
        />

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <OverviewCard label="Total Users" value={totalUsers} sub={`${totalHumans} human / ${totalBots} bot`} accent="text-slate-100" />
          <OverviewCard label="Characters" value={totalCharAssignments} sub={`${botCharAssignments} bot-owned`} accent="text-crunch" />
          <OverviewCard label="Battles" value={totalBattles} sub={`${botBattles} bot-involved`} accent="text-purple-400" />
          <OverviewCard label="Transactions" value={totalTransactions} sub={`${botTransactions} bot-generated`} accent="text-trickle" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bot Aggregate Stats */}
            <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-6">
              <SectionHeader title="Bot Aggregates" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <MiniStat
                  label="Total Bot Spend"
                  value={`$${Number(botSpendingAgg._sum.totalSpent ?? 0).toFixed(2)}`}
                  accent="text-red-400"
                />
                <MiniStat
                  label="Avg Spend"
                  value={`$${Number(botSpendingAgg._avg.totalSpent ?? 0).toFixed(2)}`}
                  accent="text-red-400"
                />
                <MiniStat
                  label="Avg RP"
                  value={Math.round(Number(botSpendingAgg._avg.rankingPoints ?? 0)).toLocaleString()}
                  accent="text-purple-400"
                />
                <MiniStat
                  label="RP Range"
                  value={`${botRPAgg._min.rankingPoints ?? 0} - ${botRPAgg._max.rankingPoints ?? 0}`}
                  accent="text-purple-400"
                />
              </div>
            </div>

            {/* Recent Bot Battles */}
            <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-6">
              <SectionHeader title="Recent Bot Battles" />
              {recentBotBattles.length === 0 ? (
                <p className="text-[11px] text-slate-600 font-mono text-center py-6">
                  No bot battles yet. Run db:sim-battles to generate some.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentBotBattles.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-3 px-3 sm:px-4 py-2.5 bg-[#0a0a14] rounded-lg border border-[#141428]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-[11px] font-mono text-slate-400 truncate">
                          <span className={b.winner?.name === b.attacker.name ? "text-trickle font-bold" : ""}>
                            {b.attacker.name ?? "?"}
                          </span>
                          {" vs "}
                          <span className={b.winner?.name === b.defender.name ? "text-trickle font-bold" : ""}>
                            {b.defender.name ?? "?"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <span className="text-[10px] font-mono text-slate-600 hidden sm:inline">
                          {b.attackerPower} vs {b.defenderPower}
                        </span>
                        <span className="text-[10px] font-mono text-crunch">
                          +{b.rankingPointsChange} RP
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Tier Breakdown */}
            <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-6">
              <SectionHeader title="Tier Breakdown" />
              <div className="space-y-3">
                {tierBreakdown.map((count, i) => {
                  const pct = totalBots > 0 ? Math.round((count / totalBots) * 100) : 0;
                  return (
                    <div key={tierLabels[i]}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-mono text-slate-400">
                          {tierEmojis[i]} {tierLabels[i]}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {count} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#0a0a14] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-crunch/60 to-crunch/30 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Bots */}
            <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-6">
              <SectionHeader title="Top 10 Bots by RP" />
              <div className="space-y-2">
                {topBotsByRP.map((bot, i) => (
                  <div
                    key={bot.id}
                    className="flex items-center justify-between px-3 py-2 bg-[#0a0a14] rounded-lg border border-[#141428]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[11px] font-mono font-bold ${i < 3 ? "text-crunch" : "text-slate-600"}`}>
                        #{i + 1}
                      </span>
                      <span className="text-[11px] font-mono text-slate-300 truncate">
                        {bot.name ?? bot.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono text-purple-400 font-bold">
                        {bot.rankingPoints} RP
                      </span>
                      <span className="text-[9px] font-mono text-red-400/60">
                        ${Number(bot.totalSpent).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-6">
              <SectionHeader title="Scripts" />
              <div className="space-y-2">
                <CodeBlock label="Seed bots" cmd="npm run db:seed-bots" />
                <CodeBlock label="Sim battles" cmd="npm run db:sim-battles" />
                <CodeBlock label="Custom count" cmd="npm run db:sim-battles -- --count 500" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-xl mx-auto text-center border-t border-[#1a1a2e] pt-8 mt-10">
          <p className="text-[10px] text-slate-700 font-mono leading-loose tracking-wide uppercase">
            Bot Control Center &middot; For authorized personnel only &middot; Gated by ADMIN_EMAILS env var
          </p>
        </div>
      </div>
    </div>
  );
}

function OverviewCard({ label, value, sub, accent }: { label: string; value: number; sub: string; accent: string }) {
  return (
    <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-5">
      <p className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className={`text-2xl font-black font-display ${accent}`}>{value.toLocaleString()}</p>
      <p className="text-[9px] font-mono text-slate-700 mt-1">{sub}</p>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="text-center">
      <p className="text-[9px] text-slate-600 font-mono uppercase tracking-[0.2em] mb-1">{label}</p>
      <p className={`text-lg font-black font-display ${accent}`}>{value}</p>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] font-mono">{title}</h3>
      <div className="h-px flex-1 bg-[#1a1a2e]" />
    </div>
  );
}

function CodeBlock({ label, cmd }: { label: string; cmd: string }) {
  return (
    <div className="px-3 py-2 bg-[#0a0a14] rounded-lg border border-[#141428]">
      <p className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mb-1">{label}</p>
      <code className="text-[11px] font-mono text-crunch/80">{cmd}</code>
    </div>
  );
}
