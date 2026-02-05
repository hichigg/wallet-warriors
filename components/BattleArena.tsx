"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type Phase =
  | "idle"
  | "matchmaking"
  | "reveal"
  | "rolling"
  | "clash"
  | "result";

interface BattleSide {
  id: string;
  name: string;
  basePower: number;
  roll: number;
  finalPower: number;
  rankingPointsBefore: number;
  rankingPointsAfter: number;
}

interface BattleData {
  battleId: string;
  attacker: BattleSide;
  defender: BattleSide;
  winnerId: string;
  rankingPointsChange: number;
  attackerWon: boolean;
}

interface BattleArenaProps {
  userName: string;
  userPower: number;
  userRanking: number;
  hasCharacters: boolean;
}

export function BattleArena({
  userName,
  userPower,
  userRanking,
  hasCharacters,
}: BattleArenaProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [displayPowerL, setDisplayPowerL] = useState(0);
  const [displayPowerR, setDisplayPowerR] = useState(0);
  const [rollTickL, setRollTickL] = useState(0);
  const [rollTickR, setRollTickR] = useState(0);

  // Animated number counter
  const animateNumber = useCallback(
    (
      target: number,
      setter: (n: number) => void,
      duration: number,
    ) => {
      const steps = 20;
      const increment = target / steps;
      let current = 0;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        current = Math.min(Math.round(increment * step), target);
        setter(current);
        if (step >= steps) clearInterval(interval);
      }, duration / steps);
    },
    [],
  );

  // Phase sequencer
  useEffect(() => {
    if (!battle) return;

    if (phase === "reveal") {
      // Animate base power numbers counting up
      animateNumber(battle.attacker.basePower, setDisplayPowerL, 800);
      animateNumber(battle.defender.basePower, setDisplayPowerR, 800);
      const timer = setTimeout(() => setPhase("rolling"), 1200);
      return () => clearTimeout(timer);
    }

    if (phase === "rolling") {
      // Show rolls ticking
      let ticks = 0;
      const interval = setInterval(() => {
        setRollTickL(Math.round((Math.random() * 2 - 1) * battle.attacker.basePower * 0.05));
        setRollTickR(Math.round((Math.random() * 2 - 1) * battle.defender.basePower * 0.05));
        ticks++;
        if (ticks >= 12) {
          clearInterval(interval);
          setRollTickL(battle.attacker.roll);
          setRollTickR(battle.defender.roll);
          setTimeout(() => setPhase("clash"), 400);
        }
      }, 80);
      return () => clearInterval(interval);
    }

    if (phase === "clash") {
      setDisplayPowerL(battle.attacker.finalPower);
      setDisplayPowerR(battle.defender.finalPower);
      const timer = setTimeout(() => setPhase("result"), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, battle, animateNumber]);

  async function handleFight() {
    setPhase("matchmaking");
    setError(null);
    setBattle(null);
    setDisplayPowerL(0);
    setDisplayPowerR(0);
    setRollTickL(0);
    setRollTickR(0);

    try {
      const res = await fetch("/api/battle", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Battle failed.");
        setPhase("idle");
        return;
      }

      setBattle(data);
      // Brief matchmaking pause then reveal
      setTimeout(() => setPhase("reveal"), 1200);
    } catch {
      setError("Network error. Try again.");
      setPhase("idle");
    }
  }

  function handleReset() {
    setPhase("idle");
    setBattle(null);
    setError(null);
    router.refresh();
  }

  const isAnimating = phase !== "idle" && phase !== "result";

  return (
    <div className="relative">
      {/* Arena Container */}
      <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl overflow-hidden">
        {/* Arena Header */}
        <div className="px-6 py-4 border-b border-[#1a1a2e] flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-[0.2em]">
            Arena Floor
          </span>
          {phase !== "idle" && phase !== "result" && (
            <span className="text-[10px] font-mono text-crunch/70 uppercase tracking-wider animate-pulse">
              {phase === "matchmaking" && "Finding opponent..."}
              {phase === "reveal" && "Calculating power..."}
              {phase === "rolling" && "RNG variance applied..."}
              {phase === "clash" && "Resolving..."}
            </span>
          )}
        </div>

        {/* Battle Stage */}
        <div className="px-6 py-10">
          {/* Idle State */}
          {phase === "idle" && !battle && (
            <div className="text-center">
              <div className="text-7xl mb-6">&#9876;&#65039;</div>
              <h2 className="text-xl font-display font-bold text-slate-200 mb-2">
                Ready for Battle
              </h2>
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-[9px] font-mono text-slate-700 uppercase tracking-wider">Your Power</p>
                  <p className="text-2xl font-black font-mono text-crunch">{userPower.toLocaleString()}</p>
                </div>
                <div className="w-px h-10 bg-[#1a1a2e]" />
                <div className="text-center">
                  <p className="text-[9px] font-mono text-slate-700 uppercase tracking-wider">Ranking</p>
                  <p className="text-2xl font-black font-mono text-purple-400">{userRanking.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 font-body mb-8 max-w-sm mx-auto">
                Matchmaking finds an opponent near your ranking. Both sides get &plusmn;5% RNG variance.
                May the biggest wallet win.
              </p>
            </div>
          )}

          {/* Matchmaking Phase */}
          {phase === "matchmaking" && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4 animate-spin-slow">&#128269;</div>
              <p className="text-lg font-display font-bold text-slate-300 animate-pulse">
                Scanning the market for victims...
              </p>
            </div>
          )}

          {/* Battle Animation Phases */}
          {battle && phase !== "idle" && phase !== "matchmaking" && (
            <div className="flex items-center justify-between gap-4">
              {/* Attacker Side */}
              <div className={`flex-1 text-center ${phase === "reveal" || phase === "rolling" || phase === "clash" || phase === "result" ? "animate-clash-left" : ""}`}>
                <div className={`
                  inline-block rounded-2xl border p-6 transition-all duration-500
                  ${phase === "result" && battle.attackerWon
                    ? "border-emerald-500/40 animate-winner-glow bg-emerald-500/[0.04]"
                    : phase === "result" && !battle.attackerWon
                    ? "border-red-500/20 bg-red-500/[0.03] opacity-60"
                    : "border-[#2a2a3e] bg-[#0f0f19]"
                  }
                `}>
                  <p className="text-[9px] font-mono text-crunch/70 uppercase tracking-wider mb-1">You</p>
                  <p className="text-sm font-display font-bold text-slate-200 mb-3 truncate max-w-[140px]">
                    {battle.attacker.name}
                  </p>
                  <div className="text-3xl font-black font-mono text-slate-100 mb-1 animate-number-tick">
                    {displayPowerL.toLocaleString()}
                  </div>
                  <p className="text-[9px] font-mono text-slate-700 uppercase">Power</p>

                  {/* Roll display */}
                  {(phase === "rolling" || phase === "clash" || phase === "result") && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <span className={`text-sm font-mono font-bold ${rollTickL >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {rollTickL >= 0 ? "+" : ""}{rollTickL}
                      </span>
                      <p className="text-[8px] font-mono text-slate-700 uppercase">RNG Roll</p>
                    </div>
                  )}

                  {/* Result ranking change */}
                  {phase === "result" && (
                    <div className="mt-2">
                      <span className={`text-xs font-mono font-bold ${battle.attackerWon ? "text-emerald-400" : "text-red-400"}`}>
                        {battle.attackerWon ? "+" : "-"}{battle.rankingPointsChange} RP
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* VS / Clash */}
              <div className="flex-shrink-0 w-16 text-center">
                {phase === "clash" ? (
                  <div className="animate-slam">
                    <span className="text-4xl font-black font-display text-crunch">&#9889;</span>
                  </div>
                ) : phase === "result" ? (
                  <div className="animate-fade-in">
                    <span className="text-2xl font-black font-display text-slate-600">VS</span>
                  </div>
                ) : (
                  <span className="text-2xl font-black font-display text-slate-700">VS</span>
                )}
              </div>

              {/* Defender Side */}
              <div className={`flex-1 text-center ${phase === "reveal" || phase === "rolling" || phase === "clash" || phase === "result" ? "animate-clash-right" : ""}`}>
                <div className={`
                  inline-block rounded-2xl border p-6 transition-all duration-500
                  ${phase === "result" && !battle.attackerWon
                    ? "border-emerald-500/40 animate-winner-glow bg-emerald-500/[0.04]"
                    : phase === "result" && battle.attackerWon
                    ? "border-red-500/20 bg-red-500/[0.03] opacity-60"
                    : "border-[#2a2a3e] bg-[#0f0f19]"
                  }
                `}>
                  <p className="text-[9px] font-mono text-red-400/70 uppercase tracking-wider mb-1">Opponent</p>
                  <p className="text-sm font-display font-bold text-slate-200 mb-3 truncate max-w-[140px]">
                    {battle.defender.name}
                  </p>
                  <div className="text-3xl font-black font-mono text-slate-100 mb-1 animate-number-tick">
                    {displayPowerR.toLocaleString()}
                  </div>
                  <p className="text-[9px] font-mono text-slate-700 uppercase">Power</p>

                  {(phase === "rolling" || phase === "clash" || phase === "result") && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06]">
                      <span className={`text-sm font-mono font-bold ${rollTickR >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {rollTickR >= 0 ? "+" : ""}{rollTickR}
                      </span>
                      <p className="text-[8px] font-mono text-slate-700 uppercase">RNG Roll</p>
                    </div>
                  )}

                  {phase === "result" && (
                    <div className="mt-2">
                      <span className={`text-xs font-mono font-bold ${!battle.attackerWon ? "text-emerald-400" : "text-red-400"}`}>
                        {!battle.attackerWon ? "+" : "-"}{battle.rankingPointsChange} RP
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Result Banner */}
          {phase === "result" && battle && (
            <div className="mt-8 text-center animate-slide-up">
              <div className={`inline-block rounded-xl px-8 py-4 ${
                battle.attackerWon
                  ? "bg-emerald-500/[0.08] border border-emerald-500/20"
                  : "bg-red-500/[0.08] border border-red-500/20"
              }`}>
                <p className={`text-2xl font-display font-black mb-1 ${
                  battle.attackerWon ? "text-emerald-400" : "text-red-400"
                }`}>
                  {battle.attackerWon ? "HOSTILE TAKEOVER SUCCESSFUL" : "ACQUISITION FAILED"}
                </p>
                <p className="text-[11px] font-mono text-slate-500">
                  {battle.attacker.finalPower.toLocaleString()} vs {battle.defender.finalPower.toLocaleString()}
                  {" "}&#x2022;{" "}
                  {battle.attackerWon ? "+" : "-"}{battle.rankingPointsChange} ranking points
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-4">
              <p className="text-sm font-mono text-red-400/80">{error}</p>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="px-6 py-5 border-t border-[#1a1a2e] flex justify-center">
          {phase === "result" ? (
            <div className="flex gap-3">
              <button
                onClick={handleFight}
                className="px-8 py-3 bg-crunch/10 border border-crunch-border text-crunch font-display font-bold uppercase tracking-wider text-sm rounded-xl hover:bg-crunch/20 hover:border-crunch/40 active:scale-[0.98] transition-all"
              >
                Fight Again
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-[#1a1a2e] border border-[#2a2a3e] text-slate-500 font-mono text-xs uppercase tracking-wider rounded-xl hover:text-slate-400 hover:border-[#3a3a4e] transition-all"
              >
                Done
              </button>
            </div>
          ) : (
            <button
              onClick={handleFight}
              disabled={isAnimating || !hasCharacters}
              className={`
                px-10 py-4 rounded-xl font-display font-black uppercase tracking-wider text-base
                transition-all duration-200
                ${hasCharacters && !isAnimating
                  ? "bg-gradient-to-r from-crunch to-crunch-dark text-amber-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-[#1a1a2e] text-slate-700 cursor-not-allowed"
                }
                ${isAnimating ? "animate-pulse" : ""}
              `}
            >
              {isAnimating ? "Battle in Progress..." : !hasCharacters ? "Need Characters to Battle" : "Launch Hostile Takeover"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
