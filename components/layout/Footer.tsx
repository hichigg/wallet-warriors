import Link from "next/link";

// --- FOOTER LINK COLUMNS ---
const FOOTER_SECTIONS = [
  {
    title: "Company",
    links: [
      { label: "Investor Relations", href: "#" },
      { label: "Quarterly Losses", href: "#" },
      { label: "Ethics Committee (Pending)", href: "#" },
      { label: "Whistleblower Suppression", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Surrender", href: "/terms" },
      { label: "Privacy (lol)", href: "/privacy" },
      { label: "Refund Policy (No)", href: "#" },
      { label: "Cookie Confession", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Whale Support Group", href: "#" },
      { label: "F2P Copium Forum", href: "#" },
      { label: "Bug Bounty (In Exposure™)", href: "#" },
      { label: "Career Opportunities", href: "#" },
    ],
  },
] as const;

// --- FOOTER ---
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0a0a12] border-t border-ww-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        {/* Grid: Brand + Link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-xl">💸</span>
              <span className="text-[15px] font-extrabold tracking-[0.1em] uppercase text-slate-200 font-display">
                Wallet Warriors
              </span>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed max-w-[260px] font-body">
              In a world where money talks, we let it scream. The world&apos;s
              first self-aware predatory monetization experience.
            </p>

            {/* Fake stock ticker badge */}
            <div className="mt-4 inline-block px-2.5 py-1 bg-red-500/[0.08] border border-red-500/20 rounded-md">
              <span className="font-mono text-[10px] text-red-400 tracking-[0.1em] uppercase">
                NASDAQ: WALL • -99.8%
              </span>
            </div>
          </div>

          {/* Link columns */}
          {FOOTER_SECTIONS.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-[11px] font-bold tracking-[0.15em] uppercase text-slate-500 mb-4 font-mono">
                {title}
              </h4>
              <ul className="list-none p-0 m-0 space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="footer-link font-body">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-6" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-[11px] text-slate-700 font-mono tracking-wide">
            © {year} Wallet Warriors Inc. All rights reserved. Your money
            isn&apos;t.
          </p>
          <p className="text-[11px] text-[#1e293b] font-mono italic">
            &ldquo;We&apos;re not a real financial institution, but neither is
            your savings account at this point.&rdquo;
          </p>
        </div>
      </div>
    </footer>
  );
}
