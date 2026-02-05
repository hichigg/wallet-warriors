import { PageHeader } from "@/components/ui/PageHeader";

// --- DASHBOARD STATS ---
// TODO: Replace with real data from session/database in later tasks
const MOCK_STATS = [
  {
    label: "Net Worth (In-Game)",
    value: "$0.00*",
    note: '*Real dollars spent: $0.00',
  },
  {
    label: "Characters Owned",
    value: "0",
    note: "20 more until you feel something",
  },
  {
    label: "Battles Won",
    value: "0",
    note: "Losses: redacted for morale",
  },
  {
    label: "Leaderboard Rank",
    value: "Unranked",
    note: "∞ dollars to next rank",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <PageHeader
        tag="Dashboard"
        title="Welcome Back, Valued Asset"
        subtitle="Your portfolio of fictional billionaires awaits."
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_STATS.map(({ label, value, note }) => (
          <div key={label} className="card-surface p-6">
            <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500 mb-2 font-mono">
              {label}
            </div>
            <div className="text-3xl font-extrabold text-slate-100 font-display mb-1.5">
              {value}
            </div>
            <div className="text-[12px] text-slate-600 font-body italic">
              {note}
            </div>
          </div>
        ))}
      </div>

      {/* Quick action buttons */}
      <div className="mt-10 flex flex-wrap gap-3">
        <QuickAction href="/gacha" emoji="🎰" label="Pull Characters" />
        <QuickAction href="/battle" emoji="⚔️" label="Enter Battle" />
        <QuickAction href="/shop" emoji="💳" label="Buy CrunchCoin" />
        <QuickAction href="/leaderboard" emoji="📊" label="View Rankings" />
      </div>

      {/* Satirical disclaimer */}
      <div className="mt-16 border-t border-ww-border pt-6">
        <p className="text-[11px] text-slate-700 font-mono leading-relaxed max-w-2xl">
          DISCLAIMER: Wallet Warriors is a satirical experience. Any resemblance
          to actual predatory monetization practices is entirely intentional.
          Past performance of fictional billionaires does not guarantee future
          returns. CrunchCoin™ has no real-world value, much like the promises
          of most Series A pitch decks. Please spend irresponsibly.
        </p>
      </div>
    </div>
  );
}

// --- QUICK ACTION BUTTON ---
function QuickAction({
  href,
  emoji,
  label,
}: {
  href: string;
  emoji: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="
        inline-flex items-center gap-2 px-5 py-3 rounded-xl
        bg-ww-surface border border-ww-border
        text-sm font-medium text-slate-300 font-display
        hover:border-ww-border-hover hover:text-slate-100
        transition-all duration-200 no-underline
        active:scale-[0.98]
      "
    >
      <span className="text-base">{emoji}</span>
      {label}
    </a>
  );
}
