"use client";

// NOTE: In later tasks, this will pull from your Zustand store or session.
// For now it accepts props with hardcoded fallbacks.

interface CurrencyDisplayProps {
  crunchCoin?: number;
  trickleTokens?: number;
}

export function CurrencyDisplay({
  crunchCoin = 0,
  trickleTokens = 0,
}: CurrencyDisplayProps) {
  return (
    <div className="flex items-center gap-3">
      {/* CrunchCoin */}
      <div className="flex items-center gap-1.5 bg-crunch-bg border border-crunch-border rounded-lg px-2.5 py-1.5">
        <CrunchCoinIcon />
        <span className="font-mono text-[13px] font-semibold text-crunch">
          {crunchCoin.toLocaleString()}
        </span>
      </div>

      {/* Trickle Tokens */}
      <div className="flex items-center gap-1.5 bg-trickle-bg border border-trickle-border rounded-lg px-2.5 py-1.5">
        <TrickleTokenIcon />
        <span className="font-mono text-[13px] font-semibold text-trickle">
          {trickleTokens.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// --- Inline SVG Icons ---

function CrunchCoinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="#78350f"
        fontSize="12"
        fontWeight="bold"
        fontFamily="monospace"
      >
        C
      </text>
    </svg>
  );
}

function TrickleTokenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="#a3e635" stroke="#84cc16" strokeWidth="1.5" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fill="#365314"
        fontSize="12"
        fontWeight="bold"
        fontFamily="monospace"
      >
        T
      </text>
    </svg>
  );
}
