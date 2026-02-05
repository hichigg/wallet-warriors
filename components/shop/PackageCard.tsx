"use client";

import { useState } from "react";

interface PackageCardProps {
  id: string;
  name: string;
  priceInCents: number;
  crunchCoin: number;
  tagline: string;
  coinsPerDollar: number;
  valuePercent: number;
  tier: number;
  isBestValue: boolean;
  isWorstValue: boolean;
}

const TIER_ACCENTS = [
  { border: "border-emerald-500/30", glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]", badge: "bg-emerald-500", badgeText: "text-emerald-950", bar: "bg-emerald-500", label: "SEED" },
  { border: "border-sky-500/30", glow: "hover:shadow-[0_0_30px_rgba(14,165,233,0.15)]", badge: "bg-sky-500", badgeText: "text-sky-950", bar: "bg-sky-500", label: "SERIES A" },
  { border: "border-violet-500/30", glow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]", badge: "bg-violet-500", badgeText: "text-violet-950", bar: "bg-violet-500", label: "SERIES B" },
  { border: "border-amber-500/30", glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]", badge: "bg-amber-500", badgeText: "text-amber-950", bar: "bg-amber-500", label: "IPO" },
  { border: "border-red-500/30", glow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]", badge: "bg-red-500", badgeText: "text-red-950", bar: "bg-red-500", label: "HOSTILE" },
];

export function PackageCard({
  id,
  name,
  priceInCents,
  crunchCoin,
  tagline,
  coinsPerDollar,
  valuePercent,
  tier,
  isBestValue,
  isWorstValue,
}: PackageCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);

  const price = (priceInCents / 100).toFixed(2);
  const accent = TIER_ACCENTS[tier] || TIER_ACCENTS[0];

  async function handlePurchase() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { checkoutUrl } = await res.json();
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-out
        bg-gradient-to-b from-[#111120] to-[#0c0c18]
        ${accent.border} ${accent.glow}
        ${hovered ? "translate-y-[-2px] scale-[1.01]" : ""}
        ${isBestValue ? "ring-1 ring-emerald-500/20" : ""}
        ${isWorstValue ? "ring-1 ring-red-500/10" : ""}
      `}
      style={{ animationDelay: `${tier * 80}ms` }}
    >
      {/* Top accent line */}
      <div className={`h-[2px] w-full ${accent.bar} opacity-60`} />

      {/* Header strip */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-[0.2em] ${accent.badge} ${accent.badgeText}`}>
          {accent.label}
        </span>
        {isBestValue && (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Best ROI
          </span>
        )}
        {isWorstValue && (
          <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
            Worst ROI
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 px-5 pb-5">
        {/* Name */}
        <h3 className="text-xl font-display font-extrabold text-slate-50 tracking-tight mb-0.5">
          {name}
        </h3>

        {/* Tagline */}
        <p className="text-[11px] text-slate-500 font-body leading-relaxed mb-5 min-h-[2rem]">
          {tagline}
        </p>

        {/* Coin amount — the hero number */}
        <div className="flex items-baseline gap-2.5 mb-1">
          <div className="relative">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className={`transition-transform duration-300 ${hovered ? "rotate-12 scale-110" : ""}`}>
              <circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="12" y="16" textAnchor="middle" fill="#78350f" fontSize="11" fontWeight="bold" fontFamily="monospace">C</text>
            </svg>
          </div>
          <span className="text-3xl font-mono font-black text-crunch tracking-tight">
            {crunchCoin.toLocaleString()}
          </span>
        </div>

        {/* Value degradation bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">
              Value Rating
            </span>
            <span className={`text-[11px] font-mono font-semibold ${isBestValue ? "text-emerald-400" : isWorstValue ? "text-red-400" : "text-slate-400"}`}>
              {coinsPerDollar} coins/$
            </span>
          </div>
          <div className="h-1.5 w-full bg-[#1a1a2e] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${accent.bar}`}
              style={{
                width: `${valuePercent}%`,
                opacity: 0.7 + (valuePercent / 100) * 0.3,
              }}
            />
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-mono font-black text-slate-100">
            ${price}
          </span>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className={`
              flex-1 py-2.5 rounded-xl font-display font-bold text-[13px] uppercase tracking-wider
              transition-all duration-200 cursor-pointer
              ${loading ? "opacity-50 cursor-not-allowed" : ""}
              ${isBestValue
                ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                : "bg-white/[0.06] text-slate-300 border border-white/[0.08] hover:bg-white/[0.1] hover:text-white hover:border-white/[0.15]"
              }
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Processing
              </span>
            ) : (
              "Invest"
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-[11px] text-red-400 font-mono text-center animate-shake bg-red-500/5 rounded-lg py-1.5 px-2 border border-red-500/10">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
