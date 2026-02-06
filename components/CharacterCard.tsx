"use client";

import { useState } from "react";
import Link from "next/link";
import type { Character } from "@prisma/client";
import { getCharacterEmoji } from "@/lib/character-meta";

interface CharacterCardProps {
  character: Character;
  fedPower?: number;
  acquiredAt?: Date;
  showBio?: boolean;
  children?: React.ReactNode;
  href?: string;
}

const RARITY_CONFIG = {
  5: {
    label: "LEGENDARY",
    stars: "★★★★★",
    gradient: "from-amber-500/20 via-yellow-500/5 to-amber-600/20",
    border: "border-amber-500/40",
    hoverBorder: "hover:border-amber-400/60",
    glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    text: "text-amber-400",
    bg: "bg-gradient-to-r from-amber-500 to-yellow-500",
    barBg: "bg-amber-500",
    accentLine: "bg-amber-500",
  },
  4: {
    label: "SUPER RARE",
    stars: "★★★★☆",
    gradient: "from-purple-500/20 via-fuchsia-500/5 to-purple-600/20",
    border: "border-purple-500/40",
    hoverBorder: "hover:border-purple-400/60",
    glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
    text: "text-purple-400",
    bg: "bg-gradient-to-r from-purple-500 to-fuchsia-500",
    barBg: "bg-purple-500",
    accentLine: "bg-purple-500",
  },
  3: {
    label: "RARE",
    stars: "★★★☆☆",
    gradient: "from-blue-500/15 via-cyan-500/5 to-blue-600/15",
    border: "border-blue-500/30",
    hoverBorder: "hover:border-blue-400/50",
    glow: "hover:shadow-[0_0_25px_rgba(59,130,246,0.12)]",
    text: "text-blue-400",
    bg: "bg-gradient-to-r from-blue-500 to-cyan-500",
    barBg: "bg-blue-500",
    accentLine: "bg-blue-500",
  },
  2: {
    label: "UNCOMMON",
    stars: "★★☆☆☆",
    gradient: "from-green-500/15 via-emerald-500/5 to-green-600/15",
    border: "border-green-500/30",
    hoverBorder: "hover:border-green-400/50",
    glow: "hover:shadow-[0_0_20px_rgba(34,197,94,0.1)]",
    text: "text-green-400",
    bg: "bg-gradient-to-r from-green-500 to-emerald-500",
    barBg: "bg-green-500",
    accentLine: "bg-green-500",
  },
  1: {
    label: "COMMON",
    stars: "★☆☆☆☆",
    gradient: "from-slate-500/15 via-slate-400/5 to-slate-600/15",
    border: "border-slate-500/25",
    hoverBorder: "hover:border-slate-400/40",
    glow: "",
    text: "text-slate-400",
    bg: "bg-gradient-to-r from-slate-500 to-slate-400",
    barBg: "bg-slate-500",
    accentLine: "bg-slate-500",
  },
} as const;

export function CharacterCard({
  character,
  fedPower = 0,
  acquiredAt,
  showBio = false,
  children,
  href,
}: CharacterCardProps) {
  const [expanded, setExpanded] = useState(showBio);
  const config = RARITY_CONFIG[character.rarity as keyof typeof RARITY_CONFIG];
  const totalPower = character.basePower + fedPower;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border
        bg-gradient-to-b from-[#111120] to-[#0c0c18]
        ${config.border} ${config.hoverBorder} ${config.glow}
        transition-all duration-300 hover:translate-y-[-2px]
      `}
    >
      {/* Top accent line */}
      <div className={`h-[2px] w-full ${config.accentLine} opacity-60`} />

      {/* Rarity strip */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className={`text-[9px] font-mono font-bold tracking-[0.2em] uppercase ${config.text}`}>
          {config.label}
        </span>
        <span className={`text-[11px] ${config.text} opacity-70`}>{config.stars}</span>
      </div>

      {/* Character Content */}
      <div className="px-4 pb-4">
        {/* Avatar */}
        <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${config.gradient} border border-white/[0.06] mb-3 flex items-center justify-center`}>
          <span className="text-5xl opacity-70 group-hover:scale-110 transition-transform duration-300">
            {getCharacterEmoji(character.name)}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-base font-bold text-slate-100 font-display leading-tight mb-2">
          {href ? (
            <Link href={href} className="hover:text-white transition-colors">
              {character.name}
            </Link>
          ) : (
            character.name
          )}
        </h3>

        {/* Power Stats */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider">PWR</span>
            <span className={`text-lg font-black font-mono ${config.text}`}>
              {totalPower.toLocaleString()}
            </span>
          </div>
          {fedPower > 0 && (
            <span className="text-[10px] text-crunch/80 font-mono bg-crunch-bg px-1.5 py-0.5 rounded border border-crunch-border">
              +{fedPower}
            </span>
          )}
        </div>

        {/* Bio Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full text-left text-[10px] text-slate-600 hover:text-slate-400 font-mono transition-colors uppercase tracking-wider"
        >
          {expanded ? "▼ Hide bio" : "▶ Show bio"}
        </button>

        {/* Bio */}
        {expanded && (
          <p className="mt-2 text-[11px] text-slate-400/80 font-body leading-relaxed border-t border-white/[0.06] pt-2">
            {character.bio}
          </p>
        )}

        {/* Acquired Date */}
        {acquiredAt && (
          <p className="mt-3 text-[9px] text-slate-700 font-mono uppercase tracking-wider">
            Acquired {formatDate(acquiredAt)}
          </p>
        )}

        {/* Detail link */}
        {href && (
          <Link
            href={href}
            className="mt-3 block text-center text-[10px] font-mono text-slate-600 hover:text-slate-400 uppercase tracking-wider transition-colors"
          >
            View Details &rarr;
          </Link>
        )}

        {/* Action slot */}
        {children}
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

