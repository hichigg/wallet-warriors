"use client";

import { useEffect, useState } from "react";

interface EventBannerProps {
  event: {
    id: string;
    name: string;
    description: string;
    type: string;
    value: number;
    endDate: Date;
  };
}

function getEventEmoji(type: string): string {
  switch (type) {
    case "double_tokens": return "💧";
    case "rate_boost": return "🌟";
    case "purchase_bonus": return "💰";
    default: return "🎉";
  }
}

function getEventColor(type: string): { border: string; bg: string; text: string } {
  switch (type) {
    case "double_tokens":
      return { border: "border-trickle/40", bg: "from-trickle/15 to-trickle/5", text: "text-trickle" };
    case "rate_boost":
      return { border: "border-amber-500/40", bg: "from-amber-500/15 to-amber-600/5", text: "text-amber-400" };
    case "purchase_bonus":
      return { border: "border-crunch/40", bg: "from-crunch/15 to-crunch/5", text: "text-crunch" };
    default:
      return { border: "border-purple-500/40", bg: "from-purple-500/15 to-purple-600/5", text: "text-purple-400" };
  }
}

function getCountdown(endDate: Date): string {
  const now = new Date();
  const diff = new Date(endDate).getTime() - now.getTime();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export function EventBanner({ event }: EventBannerProps) {
  const [countdown, setCountdown] = useState(getCountdown(event.endDate));
  const colors = getEventColor(event.type);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(event.endDate));
    }, 60_000);
    return () => clearInterval(interval);
  }, [event.endDate]);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-r ${colors.bg} border ${colors.border} rounded-xl p-4`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getEventEmoji(event.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`text-sm font-bold font-display ${colors.text}`}>
              {event.name}
            </h4>
            <span className="text-[9px] font-mono text-red-400 uppercase tracking-wider">
              {countdown}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono truncate">
            {event.description}
          </p>
        </div>
      </div>
    </div>
  );
}
