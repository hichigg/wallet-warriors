"use client";

// --- TICKER DATA ---
// Each entry gets color-coded: green for ▲, red for bearish/zero values, gray for neutral
const TICKER_ITEMS = [
  { text: "CC/USD +2.4% ▲", sentiment: "bull" },
  { text: "DIGNITY INDEX: 0.00", sentiment: "bear" },
  { text: "WHALE ALERT: $4,200 SPENT", sentiment: "neutral" },
  { text: "TRICKLE SUPPLY: DWINDLING", sentiment: "bear" },
  { text: "MARKET CAP: YOUR SAVINGS", sentiment: "neutral" },
  { text: "PITY COUNTER: 77/100", sentiment: "neutral" },
  { text: "BAILOUT PROBABILITY: 0%", sentiment: "bear" },
  { text: "SYNERGY FUTURES: BULLISH", sentiment: "bull" },
  { text: "INTERN MORALE: N/A", sentiment: "bear" },
  { text: "IPO STATUS: IMMINENT(LY NEVER)", sentiment: "neutral" },
  { text: "DISRUPTION YIELD: ∞", sentiment: "bull" },
  { text: "F2P SATISFACTION: PENDING", sentiment: "neutral" },
  { text: "PIVOT VELOCITY: MAXIMUM", sentiment: "bull" },
  { text: "ETHICS BUDGET: $0.00", sentiment: "bear" },
] as const;

type Sentiment = "bull" | "bear" | "neutral";

const SENTIMENT_COLORS: Record<Sentiment, string> = {
  bull: "text-green-400",
  bear: "text-red-400",
  neutral: "text-slate-500",
};

// --- SEPARATOR DOT ---
function Dot() {
  return <span className="text-slate-700 text-[8px] mx-2">●</span>;
}

// --- TICKER ---
export function Ticker() {
  // Double the items so the loop is seamless
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="overflow-hidden bg-gradient-to-r from-[#0d0d14] via-[#111119] to-[#0d0d14] border-b border-[#1e1e2e] py-1.5">
      <div className="animate-ticker flex items-center w-max gap-0">
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            <span
              className={`text-[11px] font-mono tracking-wider whitespace-nowrap ${
                SENTIMENT_COLORS[item.sentiment]
              }`}
            >
              {item.text}
            </span>
            <Dot />
          </span>
        ))}
      </div>
    </div>
  );
}
