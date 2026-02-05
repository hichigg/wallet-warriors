import Link from "next/link";

const MOCK_STATS = [
  {
    label: "Net Worth",
    value: "$0.00*",
    note: "*Real dollars spent: $0.00",
    accent: "text-crunch",
  },
  {
    label: "Characters",
    value: "0",
    note: "20 more until you feel something",
    accent: "text-purple-400",
  },
  {
    label: "Battles Won",
    value: "0",
    note: "Losses: redacted for morale",
    accent: "text-sky-400",
  },
  {
    label: "Rank",
    value: "—",
    note: "∞ dollars to next rank",
    accent: "text-red-400",
  },
];

const QUICK_ACTIONS = [
  { href: "/gacha", icon: "🎰", label: "Pull Characters", desc: "Allocate capital" },
  { href: "/battle", icon: "⚔️", label: "Battle", desc: "Destroy value" },
  { href: "/shop", icon: "💳", label: "Buy CrunchCoin", desc: "The trading floor" },
  { href: "/leaderboard", icon: "📊", label: "Rankings", desc: "Shame index" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Background atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(251,191,36,0.04)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.03)_0%,transparent_40%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 max-w-[40px] bg-crunch/40" />
            <span className="font-mono text-[10px] text-crunch/70 tracking-[0.25em] uppercase">
              Dashboard
            </span>
            <div className="h-px flex-1 max-w-[40px] bg-crunch/40" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-slate-50 tracking-tight leading-[0.95] mb-4">
            Welcome Back,<br />
            <span className="text-crunch">Valued Asset</span>
          </h1>

          <p className="text-base text-slate-500 font-body max-w-md leading-relaxed">
            Your portfolio of fictional billionaires awaits.
            The market is open. Your wallet is not safe.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-14">
          {MOCK_STATS.map(({ label, value, note, accent }) => (
            <div
              key={label}
              className="group relative overflow-hidden rounded-2xl border border-[#1a1a2e] bg-gradient-to-b from-[#111120] to-[#0c0c18] p-6 transition-all duration-300 hover:border-[#2a2a3e] hover:translate-y-[-1px]"
            >
              <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#2a2a3e] to-transparent absolute top-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-[9px] uppercase tracking-[0.2em] text-slate-600 mb-3 font-mono">
                {label}
              </div>
              <div className={`text-3xl font-black font-display mb-1.5 ${accent}`}>
                {value}
              </div>
              <div className="text-[11px] text-slate-700 font-body italic">
                {note}
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions section */}
        <div className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">
              Quick Actions
            </h2>
            <div className="h-px flex-1 bg-[#1a1a2e]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(({ href, icon, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="
                  group flex items-center gap-4 px-5 py-4 rounded-xl
                  bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e]
                  hover:border-crunch/20 hover:shadow-[0_0_20px_rgba(251,191,36,0.05)]
                  transition-all duration-300 no-underline hover:translate-y-[-1px]
                "
              >
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                  {icon}
                </span>
                <div>
                  <div className="text-sm font-bold text-slate-200 font-display group-hover:text-crunch transition-colors">
                    {label}
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono uppercase tracking-wider">
                    {desc}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-2xl mx-auto text-center border-t border-[#1a1a2e] pt-8">
          <p className="text-[10px] text-slate-800 font-mono leading-loose tracking-wide">
            DISCLAIMER: Wallet Warriors is a satirical experience. Any resemblance
            to actual predatory monetization practices is entirely intentional.
            CrunchCoin&trade; has no real-world value, much like the promises
            of most Series A pitch decks.
          </p>
        </div>
      </div>
    </div>
  );
}
