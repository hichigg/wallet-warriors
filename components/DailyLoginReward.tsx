"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface RewardState {
  show: boolean;
  reward: number;
  streak: number;
  isStreakReset: boolean;
}

export function DailyLoginReward() {
  const { data: session, status } = useSession();
  const [rewardState, setRewardState] = useState<RewardState | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const claimReward = async () => {
      try {
        const res = await fetch("/api/user/daily-login", { method: "POST" });
        const data = await res.json();

        if (data.claimed) {
          setRewardState({
            show: true,
            reward: data.reward,
            streak: data.streak,
            isStreakReset: data.isStreakReset,
          });
        }
      } catch (error) {
        console.error("Failed to claim daily reward:", error);
      }
    };

    const timer = setTimeout(claimReward, 1000);
    return () => clearTimeout(timer);
  }, [status, session]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setRewardState(null);
      setIsClosing(false);
    }, 300);
  };

  if (!rewardState?.show) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative overflow-hidden bg-gradient-to-b from-[#111120] to-[#0a0a14] border border-amber-500/20 rounded-2xl p-8 max-w-sm w-full shadow-2xl shadow-amber-500/10 transition-transform duration-300 ${
          isClosing ? "scale-95" : "scale-100"
        }`}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />

        {/* Glow orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative text-center">
          {/* Icon */}
          <div className="text-5xl mb-5 animate-bounce">💧</div>

          {/* Tag */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-8 bg-trickle/30" />
            <span className="font-mono text-[9px] text-trickle/60 tracking-[0.25em] uppercase">
              Daily Reward
            </span>
            <div className="h-px w-8 bg-trickle/30" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-slate-50 font-display tracking-tight mb-2">
            Welcome Back
          </h2>

          {/* Streak info */}
          {rewardState.isStreakReset ? (
            <p className="text-xs text-red-400 font-mono mb-5">
              Streak reset — starting fresh
            </p>
          ) : (
            <p className="text-xs text-slate-500 font-mono mb-5">
              Day {rewardState.streak} streak
              {rewardState.streak >= 7 && " — Max bonus!"}
            </p>
          )}

          {/* Reward amount */}
          <div className="bg-trickle-bg border border-trickle-border rounded-xl p-5 mb-6">
            <p className="text-4xl font-black text-trickle font-mono tracking-tight">
              +{rewardState.reward}
            </p>
            <p className="text-[11px] text-trickle/50 font-mono mt-1 uppercase tracking-wider">
              Trickle Tokens
            </p>
          </div>

          {/* Streak preview */}
          <div className="flex justify-center gap-1.5 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map((day) => (
              <div
                key={day}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-mono font-bold transition-all ${
                  day <= rewardState.streak
                    ? "bg-amber-500 text-amber-950 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    : "bg-[#1a1a2e] text-slate-700 border border-[#222236]"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Satirical text */}
          <p className="text-[10px] text-slate-700 font-mono mb-5">
            Keep logging in daily. We need the engagement metrics.
          </p>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold font-display rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 uppercase tracking-wider text-sm"
          >
            Collect
          </button>
        </div>
      </div>
    </div>
  );
}
