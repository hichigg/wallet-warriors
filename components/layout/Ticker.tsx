"use client";

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
  bull: "text-emerald-400/80",
  bear: "text-red-400/80",
  neutral: "text-slate-600",
};

export function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="overflow-hidden bg-[#09090f] border-b border-[#141424] py-1.5">
      <div className="animate-ticker flex items-center w-max gap-0">
        {items.map((item, i) => (
          <span key={i} className="flex items-center">
            <span
              className={`text-[10px] font-mono tracking-[0.1em] whitespace-nowrap ${
                SENTIMENT_COLORS[item.sentiment]
              }`}
            >
              {item.text}
            </span>
            <span className="text-[#1a1a2e] text-[6px] mx-3">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}
