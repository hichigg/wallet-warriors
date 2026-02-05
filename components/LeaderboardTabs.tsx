"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  { id: "ranking", label: "Battle Rank", icon: "&#9876;&#65039;" },
  { id: "spending", label: "Whale Watch", icon: "&#128179;" },
  { id: "power", label: "Power Index", icon: "&#9889;" },
  { id: "collection", label: "Portfolio", icon: "&#127183;" },
] as const;

export function LeaderboardTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "ranking";

  function handleSelect(category: string) {
    router.push(`/leaderboard?category=${category}`);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => handleSelect(cat.id)}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-mono uppercase tracking-wider
            transition-all duration-200 border
            ${active === cat.id
              ? "bg-crunch/10 border-crunch-border text-crunch"
              : "bg-[#0f0f19] border-[#1a1a2e] text-slate-600 hover:text-slate-400 hover:border-[#2a2a3e]"
            }
          `}
        >
          <span dangerouslySetInnerHTML={{ __html: cat.icon }} />
          {cat.label}
        </button>
      ))}
    </div>
  );
}
