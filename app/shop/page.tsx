import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { CRUNCHCOIN_PACKAGES } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "CrunchCoin Shop | Wallet Warriors",
  description: "Buy CrunchCoin with real money. Every package is a bad investment.",
};
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";
import { PackageCard } from "@/components/shop/PackageCard";

interface ShopPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/shop");
  }

  const [user, recentTransactions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        crunchCoin: true,
        trickleTokens: true,
        totalSpent: true,
      },
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!user) {
    redirect("/auth/signin?callbackUrl=/shop");
  }

  const packages = Object.values(CRUNCHCOIN_PACKAGES);
  const coinsPerDollar = packages.map((pkg) =>
    Math.round(pkg.crunchCoin / (pkg.priceInCents / 100))
  );
  const bestValue = Math.max(...coinsPerDollar);
  const worstValue = Math.min(...coinsPerDollar);

  const params = await searchParams;
  const status = params.status;

  return (
    <div className="relative min-h-screen">
      {/* Background texture — subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.03)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.02)_0%,transparent_40%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Header — asymmetric, editorial layout */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 max-w-[40px] bg-crunch/40" />
            <span className="font-mono text-[10px] text-crunch/70 tracking-[0.25em] uppercase">
              The Trading Floor
            </span>
            <div className="h-px flex-1 max-w-[40px] bg-crunch/40" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-slate-50 tracking-tight leading-[0.95] mb-4">
            Acquire<br />
            <span className="text-crunch">CrunchCoin</span>
          </h1>

          <p className="text-base text-slate-500 font-body max-w-md leading-relaxed">
            Convert real money into fake money. The value gets worse the more you spend.
            This is <span className="text-slate-400 italic">intentional</span>.
          </p>
        </div>

        {/* Post-checkout banners */}
        {status === "success" && (
          <div className="mb-10 p-5 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-2xl animate-fade-in backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-display font-bold text-emerald-400 mb-0.5">
                  Transaction Complete
                </p>
                <p className="text-[13px] text-emerald-400/60 font-body">
                  Your CrunchCoin have been deposited. Go make questionable decisions with your new digital wealth.
                </p>
              </div>
            </div>
          </div>
        )}
        {status === "cancelled" && (
          <div className="mb-10 p-5 bg-slate-500/[0.04] border border-slate-700/30 rounded-2xl animate-fade-in backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-display font-bold text-slate-400 mb-0.5">
                  Checkout Cancelled
                </p>
                <p className="text-[13px] text-slate-500 font-body">
                  Your wallet breathes a sigh of relief. For now.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio stats bar */}
        <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-12">
          <div className="flex-1 p-4 rounded-2xl bg-gradient-to-br from-[#111120] to-[#0d0d1a] border border-[#1a1a30]">
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-2">
              Current Holdings
            </p>
            <CurrencyDisplay
              crunchCoin={user.crunchCoin}
              trickleTokens={user.trickleTokens}
            />
          </div>
          <div className="sm:w-48 p-4 rounded-2xl bg-gradient-to-br from-[#111120] to-[#0d0d1a] border border-[#1a1a30]">
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-2">
              Total Burned
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-mono font-black text-red-400">
                ${Number(user.totalSpent).toFixed(2)}
              </span>
              <span className="text-[10px] font-mono text-red-400/40">USD</span>
            </div>
          </div>
          <div className="sm:w-40 p-4 rounded-2xl bg-gradient-to-br from-[#111120] to-[#0d0d1a] border border-[#1a1a30]">
            <p className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em] mb-2">
              Value Trend
            </p>
            <div className="flex items-center gap-2">
              {/* Mini degradation sparkline */}
              <div className="flex items-end gap-[3px] h-6">
                {coinsPerDollar.map((cpd, i) => (
                  <div
                    key={i}
                    className="w-[6px] rounded-sm bg-gradient-to-t from-red-500 to-emerald-500 transition-all"
                    style={{ height: `${(cpd / bestValue) * 100}%`, opacity: 0.4 + (cpd / bestValue) * 0.6 }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-mono text-red-400">
                -40%
              </span>
            </div>
          </div>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">
            Investment Rounds
          </h2>
          <div className="h-px flex-1 bg-[#1a1a2e]" />
          <span className="text-[10px] font-mono text-slate-600">
            {packages.length} available
          </span>
        </div>

        {/* Package grid — 5 cards, asymmetric on large screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {packages.map((pkg, i) => {
            const cpd = coinsPerDollar[i];
            const valuePercent = Math.round((cpd / bestValue) * 100);
            return (
              <PackageCard
                key={pkg.id}
                id={pkg.id}
                name={pkg.name}
                priceInCents={pkg.priceInCents}
                crunchCoin={pkg.crunchCoin}
                tagline={pkg.tagline}
                coinsPerDollar={cpd}
                valuePercent={valuePercent}
                tier={i}
                isBestValue={cpd === bestValue}
                isWorstValue={cpd === worstValue}
              />
            );
          })}
        </div>

        {/* Transaction History */}
        {recentTransactions.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">
                Transaction Ledger
              </h2>
              <div className="h-px flex-1 bg-[#1a1a2e]" />
              <Link
                href="/transactions"
                className="text-[10px] font-mono text-slate-600 hover:text-slate-400 transition-colors"
              >
                View all &rarr;
              </Link>
            </div>

            <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl overflow-hidden">
              {recentTransactions.map((tx, i) => {
                const pkg = CRUNCHCOIN_PACKAGES[tx.packageType];
                const statusConfig = {
                  COMPLETED: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Completed" },
                  PENDING: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Pending" },
                  FAILED: { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", label: "Failed" },
                  REFUNDED: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Refunded" },
                }[tx.status] || { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", label: tx.status };

                return (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between px-5 py-4 ${
                      i < recentTransactions.length - 1 ? "border-b border-[#1a1a2e]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-crunch/10 flex items-center justify-center">
                        <span className="text-crunch text-sm font-bold font-mono">$</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-200 font-display font-bold">
                          {pkg?.name || tx.packageType}
                        </p>
                        <p className="text-[10px] text-slate-600 font-mono">
                          {tx.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-mono font-bold text-crunch">
                          +{tx.crunchCoinGranted.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-600 font-mono">
                          ${Number(tx.amount).toFixed(2)}
                        </p>
                      </div>
                      <span className={`text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-md ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer disclaimer — editorial style */}
        <div className="max-w-xl mx-auto text-center border-t border-[#1a1a2e] pt-8">
          <p className="text-[10px] text-slate-700 font-mono leading-loose tracking-wide uppercase">
            All transactions processed via Stripe &middot; Refunds within 14 days &middot; Shame is non-refundable
          </p>
          <p className="text-[10px] text-slate-800 font-mono mt-1">
            &ldquo;The house always wins. Especially when the house sells imaginary currency.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
