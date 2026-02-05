import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { CRUNCHCOIN_PACKAGES } from "@/lib/stripe";

export const metadata: Metadata = {
  title: "Transactions | Wallet Warriors",
  description: "Your complete spending history. A paper trail of questionable decisions.",
};
import { PageHeader } from "@/components/ui/PageHeader";

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  COMPLETED: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Completed" },
  PENDING: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Pending" },
  FAILED: { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", label: "Failed" },
  REFUNDED: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", label: "Refunded" },
};

const FALLBACK_STATUS = { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20", label: "Unknown" };

export default async function TransactionsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/transactions");
  }

  const [transactions, user] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { crunchCoin: true, totalSpent: true },
    }),
  ]);

  const completed = transactions.filter((tx) => tx.status === "COMPLETED");
  const totalSpent = Number(user?.totalSpent ?? 0);
  const totalCCEarned = completed.reduce((sum, tx) => sum + tx.crunchCoinGranted, 0);
  const avgCoinsPerDollar = totalSpent > 0 ? Math.round(totalCCEarned / totalSpent) : 0;

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        <PageHeader
          tag="Ledger"
          title="Transaction History"
          subtitle="A complete record of every questionable financial decision."
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatBox
            label="Total Spent"
            value={`$${totalSpent.toFixed(2)}`}
            subtext="Real money"
            accent="text-crunch"
          />
          <StatBox
            label="CC Earned"
            value={totalCCEarned.toLocaleString()}
            subtext="Fake money"
            accent="text-amber-400"
          />
          <StatBox
            label="Transactions"
            value={transactions.length.toString()}
            subtext={`${completed.length} completed`}
            accent="text-purple-400"
          />
          <StatBox
            label="Avg CC/$"
            value={avgCoinsPerDollar.toString()}
            subtext="Diminishing returns"
            accent="text-sky-400"
          />
        </div>

        {/* Transaction List */}
        {transactions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-[#1a1a2e]">
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider">Package</span>
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider text-right w-24">CC Granted</span>
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider text-right w-20">Amount</span>
              <span className="text-[9px] font-mono text-slate-700 uppercase tracking-wider text-right w-24">Status</span>
            </div>

            {transactions.map((tx, i) => {
              const pkg = CRUNCHCOIN_PACKAGES[tx.packageType];
              const statusCfg = STATUS_CONFIG[tx.status] ?? FALLBACK_STATUS;

              return (
                <div
                  key={tx.id}
                  className={`flex flex-col md:grid md:grid-cols-[1fr_auto_auto_auto] gap-2 md:gap-4 md:items-center px-5 py-4 ${
                    i < transactions.length - 1 ? "border-b border-[#1a1a2e]" : ""
                  } hover:bg-white/[0.01] transition-colors`}
                >
                  {/* Package info */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-crunch/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-crunch text-sm font-bold font-mono">$</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-200 font-display font-bold">
                        {pkg?.name ?? tx.packageType}
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

                  {/* CC granted */}
                  <div className="md:text-right md:w-24 pl-11 md:pl-0">
                    <p className="text-sm font-mono font-bold text-crunch">
                      +{tx.crunchCoinGranted.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-slate-700 font-mono md:hidden">CC granted</p>
                  </div>

                  {/* Amount */}
                  <div className="md:text-right md:w-20 pl-11 md:pl-0">
                    <p className="text-sm font-mono text-slate-400">
                      ${Number(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-[9px] text-slate-700 font-mono md:hidden">USD</p>
                  </div>

                  {/* Status */}
                  <div className="md:text-right md:w-24 pl-11 md:pl-0">
                    <span className={`inline-block text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded-md ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border} border`}>
                      {statusCfg.label}
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
            href="/shop"
            className="inline-block text-[10px] font-mono text-slate-600 hover:text-slate-400 uppercase tracking-wider transition-colors"
          >
            &larr; Back to Shop
          </Link>
        </div>

        <div className="max-w-xl mx-auto text-center border-t border-[#1a1a2e] pt-8 mt-8">
          <p className="text-[10px] text-slate-700 font-mono leading-loose tracking-wide uppercase">
            All transactions processed via Stripe &middot; Refunds within 14 days &middot; Shame is non-refundable
          </p>
          <p className="text-[10px] text-slate-800 font-mono mt-1">
            &ldquo;Past performance is not indicative of future results. Neither is present performance.&rdquo;
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
      <div className="text-6xl mb-5">🧾</div>
      <h3 className="text-xl font-bold text-slate-200 font-display mb-2">
        No Transactions Yet
      </h3>
      <p className="text-sm text-slate-600 font-body mb-6 max-w-md mx-auto">
        Your ledger is clean. That&apos;s either admirable restraint or a missed opportunity.
      </p>
      <Link
        href="/shop"
        className="inline-block px-6 py-3 bg-crunch hover:bg-crunch-dark text-amber-950 font-bold rounded-xl transition-all duration-200 font-display uppercase tracking-wider text-sm shadow-lg shadow-amber-500/20"
      >
        Visit the Shop
      </Link>
    </div>
  );
}
