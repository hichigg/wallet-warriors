"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { PullResult } from "@/lib/gacha";

interface PullAnimationProps {
  results: PullResult[];
  onComplete: () => void;
  isFreePull?: boolean;
}

const RARITY_CONFIG = {
  5: {
    label: "LEGENDARY",
    stars: "★★★★★",
    bgGradient: "from-amber-600 via-yellow-500 to-orange-500",
    cardBg: "from-amber-900 via-yellow-900 to-orange-900",
    border: "border-yellow-400",
    glow: "rgba(251, 191, 36, 1)",
    glowIntense: "rgba(255, 215, 0, 1)",
    text: "text-yellow-300",
    textShadow: "0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6)",
    particle: ["#ffd700", "#ffec8b", "#ffa500", "#ff6347", "#fff", "#ffdf00"],
    chestGlow: "shadow-[0_0_100px_30px_rgba(255,215,0,0.8)]",
    shakeIntensity: 20,
    confettiCount: 200,
    confettiWaves: 3,
  },
  4: {
    label: "SUPER RARE",
    stars: "★★★★☆",
    bgGradient: "from-purple-600 via-fuchsia-500 to-pink-500",
    cardBg: "from-purple-900 via-fuchsia-900 to-pink-900",
    border: "border-purple-400",
    glow: "rgba(168, 85, 247, 0.9)",
    glowIntense: "rgba(192, 132, 252, 1)",
    text: "text-purple-300",
    textShadow: "0 0 15px rgba(168, 85, 247, 0.8)",
    particle: ["#a855f7", "#c084fc", "#e879f9", "#f0abfc", "#fff", "#d946ef"],
    chestGlow: "shadow-[0_0_80px_25px_rgba(168,85,247,0.7)]",
    shakeIntensity: 15,
    confettiCount: 150,
    confettiWaves: 2,
  },
  3: {
    label: "RARE",
    stars: "★★★☆☆",
    bgGradient: "from-blue-600 via-cyan-500 to-teal-500",
    cardBg: "from-blue-900 via-cyan-900 to-teal-900",
    border: "border-cyan-400",
    glow: "rgba(34, 211, 238, 0.8)",
    glowIntense: "rgba(103, 232, 249, 1)",
    text: "text-cyan-300",
    textShadow: "0 0 10px rgba(34, 211, 238, 0.6)",
    particle: ["#22d3ee", "#67e8f9", "#06b6d4", "#0891b2", "#fff"],
    chestGlow: "shadow-[0_0_60px_20px_rgba(34,211,238,0.6)]",
    shakeIntensity: 10,
    confettiCount: 80,
    confettiWaves: 1,
  },
  2: {
    label: "UNCOMMON",
    stars: "★★☆☆☆",
    bgGradient: "from-green-600 via-emerald-500 to-lime-500",
    cardBg: "from-green-900 via-emerald-900 to-lime-900",
    border: "border-emerald-400",
    glow: "rgba(52, 211, 153, 0.7)",
    glowIntense: "rgba(110, 231, 183, 1)",
    text: "text-emerald-300",
    textShadow: "0 0 8px rgba(52, 211, 153, 0.5)",
    particle: ["#34d399", "#6ee7b7", "#10b981", "#059669"],
    chestGlow: "shadow-[0_0_40px_15px_rgba(52,211,153,0.5)]",
    shakeIntensity: 5,
    confettiCount: 40,
    confettiWaves: 1,
  },
  1: {
    label: "COMMON",
    stars: "★☆☆☆☆",
    bgGradient: "from-slate-500 via-gray-400 to-slate-500",
    cardBg: "from-slate-800 via-gray-800 to-slate-800",
    border: "border-slate-400",
    glow: "rgba(148, 163, 184, 0.5)",
    glowIntense: "rgba(203, 213, 225, 0.8)",
    text: "text-slate-300",
    textShadow: "none",
    particle: ["#94a3b8", "#cbd5e1", "#64748b", "#475569"],
    chestGlow: "shadow-[0_0_20px_10px_rgba(148,163,184,0.3)]",
    shakeIntensity: 0,
    confettiCount: 15,
    confettiWaves: 1,
  },
} as const;

const CHARACTER_PORTRAITS: Record<string, { emoji: string; title: string }> = {
  "Unpaid Intern": { emoji: "👨‍💻", title: "Code Monkey" },
  "Hustle Culture Guru": { emoji: "🧘", title: "Rise & Grind" },
  "Crypto Bro": { emoji: "🦍", title: "Diamond Hands" },
  "LinkedIn Thought Leader": { emoji: "💼", title: "Synergy Expert" },
  "Gig Economy Warrior": { emoji: "🚗", title: "Side Hustler" },
  "Angel Investor": { emoji: "😇", title: "Money Angel" },
  "Growth Hacker": { emoji: "📈", title: "Viral Genius" },
  "Productivity Podcaster": { emoji: "🎙️", title: "Time Lord" },
  "NFT Artist": { emoji: "🎨", title: "JPEG Dealer" },
  "Startup Founder": { emoji: "🚀", title: "Disruptor" },
  "Series A Survivor": { emoji: "💰", title: "Funded" },
  "Tech Conference Speaker": { emoji: "🎤", title: "Keynote King" },
  "Wellness CEO": { emoji: "🧴", title: "Goop Guru" },
  "VC Partner": { emoji: "🦈", title: "Shark" },
  "DeFi Degen": { emoji: "🎰", title: "Yield Farmer" },
  "Unicorn Founder": { emoji: "🦄", title: "Billionaire" },
  "Corporate Raider": { emoji: "🏴‍☠️", title: "Hostile" },
  "Hedge Fund Manager": { emoji: "🎩", title: "Overlord" },
  "Tech Evangelist": { emoji: "📣", title: "Believer" },
  "Rocket Billionaire": { emoji: "🚀", title: "Space Baron" },
  "Social Media Overlord": { emoji: "👁️", title: "Data Lord" },
  "E-Commerce Emperor": { emoji: "📦", title: "Prime" },
  "Software Sovereign": { emoji: "🪟", title: "Monopolist" },
  "The Index Fund": { emoji: "📊", title: "Passive Income" },
};

type Phase = "chest" | "opening" | "reveal" | "card" | "result";
type ConfettiShape = "rect" | "circle" | "star" | "streamer";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  shape: ConfettiShape;
  delay: number;
  duration: number;
  angle: number; // Direction to shoot (in degrees)
  distance: number; // How far to travel
  type: "burst" | "fall"; // Burst outward or fall from top
}

// Royal trumpet fanfare using Web Audio API
function playRoyalFanfare(rarity: number) {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    // Create a more complex "brass" sound with multiple oscillators
    const playBrassNote = (freq: number, startTime: number, duration: number, volume: number) => {
      // Main tone
      const osc1 = audioContext.createOscillator();
      const osc2 = audioContext.createOscillator();
      const osc3 = audioContext.createOscillator();

      const gainNode = audioContext.createGain();
      const masterGain = audioContext.createGain();

      // Brass-like harmonics
      osc1.type = "sawtooth";
      osc1.frequency.value = freq;

      osc2.type = "square";
      osc2.frequency.value = freq * 2; // Octave up

      osc3.type = "triangle";
      osc3.frequency.value = freq * 3; // 5th harmonic

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      osc3.connect(gainNode);
      gainNode.connect(masterGain);
      masterGain.connect(audioContext.destination);

      // Mix levels
      gainNode.gain.value = 0.15;

      // Brass attack envelope - quick attack, sustain, decay
      masterGain.gain.setValueAtTime(0, startTime);
      masterGain.gain.linearRampToValueAtTime(volume * 0.3, startTime + 0.05);
      masterGain.gain.setValueAtTime(volume * 0.25, startTime + duration * 0.7);
      masterGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      osc1.start(startTime);
      osc2.start(startTime);
      osc3.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
      osc3.stop(startTime + duration);
    };

    // Timpani/drum hit for impact
    const playDrumHit = (startTime: number, volume: number) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(150, startTime);
      osc.frequency.exponentialRampToValueAtTime(50, startTime + 0.2);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      gain.gain.setValueAtTime(volume * 0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    };

    // Cymbal shimmer
    const playCymbal = (startTime: number, duration: number, volume: number) => {
      const bufferSize = audioContext.sampleRate * duration;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioContext.sampleRate * 0.5));
      }

      const noise = audioContext.createBufferSource();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();

      noise.buffer = buffer;
      filter.type = "highpass";
      filter.frequency.value = 7000;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);

      gain.gain.setValueAtTime(volume * 0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      noise.start(startTime);
    };

    const now = audioContext.currentTime;

    if (rarity === 5) {
      // LEGENDARY - Full royal fanfare! "Hail to the King!"
      // Opening drum hit
      playDrumHit(now, 1);
      playCymbal(now, 2, 0.8);

      // First trumpet call - attention!
      playBrassNote(392, now + 0.1, 0.3, 0.8); // G4
      playBrassNote(392, now + 0.45, 0.15, 0.6); // G4 short
      playBrassNote(392, now + 0.65, 0.15, 0.6); // G4 short

      // Rising fanfare
      playBrassNote(523, now + 0.9, 0.25, 0.9); // C5
      playBrassNote(659, now + 1.2, 0.25, 0.9); // E5
      playBrassNote(784, now + 1.5, 0.4, 1); // G5

      // Triumphant finale - hold the high note!
      playBrassNote(1047, now + 2.0, 0.8, 1); // C6 - THE KING!
      playBrassNote(784, now + 2.0, 0.8, 0.7); // Harmony
      playBrassNote(523, now + 2.0, 0.8, 0.5); // Bass

      // Final drum
      playDrumHit(now + 2.0, 1);
      playCymbal(now + 2.0, 1.5, 1);

    } else if (rarity === 4) {
      // SUPER RARE - Noble fanfare
      playDrumHit(now, 0.8);
      playCymbal(now, 1.5, 0.6);

      playBrassNote(440, now + 0.1, 0.25, 0.7); // A4
      playBrassNote(554, now + 0.4, 0.25, 0.8); // C#5
      playBrassNote(659, now + 0.7, 0.35, 0.9); // E5
      playBrassNote(880, now + 1.1, 0.5, 1); // A5

      playDrumHit(now + 1.1, 0.8);

    } else if (rarity === 3) {
      // RARE - Pleasant herald
      playCymbal(now, 1, 0.4);

      playBrassNote(523, now + 0.1, 0.2, 0.6); // C5
      playBrassNote(659, now + 0.35, 0.2, 0.7); // E5
      playBrassNote(784, now + 0.6, 0.35, 0.8); // G5

    } else if (rarity === 2) {
      // UNCOMMON - Simple announcement
      playBrassNote(440, now, 0.25, 0.5);
      playBrassNote(523, now + 0.3, 0.3, 0.6);

    } else {
      // COMMON - Basic tone
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = "triangle";
      osc.frequency.value = 330;
      osc.connect(gain);
      gain.connect(audioContext.destination);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // Audio not supported, fail silently
  }
}

function playChestOpen(rarity: number) {
  if (typeof window === "undefined") return;

  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const now = audioContext.currentTime;

    // Magical whoosh
    const noise = audioContext.createBufferSource();
    const bufferSize = audioContext.sampleRate * 0.5;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(500, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.3);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    noise.start(now);

    // Add sparkle for higher rarities
    if (rarity >= 4) {
      const sparkle = audioContext.createOscillator();
      const sparkleGain = audioContext.createGain();
      sparkle.type = "sine";
      sparkle.frequency.setValueAtTime(2000, now);
      sparkle.frequency.exponentialRampToValueAtTime(4000, now + 0.2);
      sparkle.connect(sparkleGain);
      sparkleGain.connect(audioContext.destination);
      sparkleGain.gain.setValueAtTime(0.1, now);
      sparkleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      sparkle.start(now);
      sparkle.stop(now + 0.3);
    }
  } catch {
    // Audio not supported
  }
}

export function PullAnimation({ results, onComplete, isFreePull }: PullAnimationProps) {
  const [phase, setPhase] = useState<Phase>("chest");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [lightRays, setLightRays] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [showBanner, setShowBanner] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isSinglePull = results.length === 1;
  const currentResult = results[currentIndex];
  const config = currentResult?.character
    ? RARITY_CONFIG[currentResult.character.rarity as keyof typeof RARITY_CONFIG]
    : RARITY_CONFIG[1];

  // Spawn epic confetti explosion - BURSTING from center around the character!
  const spawnConfetti = useCallback((rarity: number) => {
    const rarityConfig = RARITY_CONFIG[rarity as keyof typeof RARITY_CONFIG];
    const shapes: ConfettiShape[] = ["rect", "circle", "star", "streamer"];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Spawn multiple waves
    for (let wave = 0; wave < rarityConfig.confettiWaves; wave++) {
      const waveDelay = wave * 200;

      setTimeout(() => {
        // BURST confetti - shoots outward from center
        const burstCount = Math.floor(rarityConfig.confettiCount * 0.7);
        const burstConfetti: ConfettiPiece[] = Array.from(
          { length: burstCount },
          (_, i) => {
            const angle = (i / burstCount) * 360 + Math.random() * 30; // Spread evenly with randomness
            return {
              id: Date.now() + i + wave * 10000,
              x: centerX,
              y: centerY,
              color: rarityConfig.particle[Math.floor(Math.random() * rarityConfig.particle.length)],
              rotation: Math.random() * 360,
              scale: 0.6 + Math.random() * 1.2,
              shape: shapes[Math.floor(Math.random() * shapes.length)],
              delay: Math.random() * 0.3,
              duration: 2 + Math.random() * 1.5,
              angle: angle,
              distance: 300 + Math.random() * 400, // How far to shoot
              type: "burst" as const,
            };
          }
        );

        // FALL confetti - traditional falling from top
        const fallCount = Math.floor(rarityConfig.confettiCount * 0.3);
        const fallConfetti: ConfettiPiece[] = Array.from(
          { length: fallCount },
          (_, i) => ({
            id: Date.now() + i + wave * 10000 + 5000,
            x: Math.random() * window.innerWidth,
            y: -20 - Math.random() * 100,
            color: rarityConfig.particle[Math.floor(Math.random() * rarityConfig.particle.length)],
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 1,
            shape: shapes[Math.floor(Math.random() * shapes.length)],
            delay: Math.random() * 1,
            duration: 3 + Math.random() * 2,
            angle: 0,
            distance: 0,
            type: "fall" as const,
          })
        );

        const newConfetti = [...burstConfetti, ...fallConfetti];
        setConfetti(prev => [...prev, ...newConfetti]);

        // Clean up after animation
        setTimeout(() => {
          setConfetti(prev => prev.filter(c => !newConfetti.some(nc => nc.id === c.id)));
        }, 6000);
      }, waveDelay);
    }
  }, []);

  // Skip to end
  const handleSkip = useCallback(() => {
    setPhase("result");
    setShowBanner(false);
  }, []);

  // Handle click progression
  const handleClick = useCallback(() => {
    if (phase === "chest") {
      setPhase("opening");
    } else if (phase === "result") {
      if (!isSinglePull && currentIndex < results.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setPhase("chest");
        setConfetti([]);
        setShowBanner(false);
      } else {
        onComplete();
      }
    } else {
      handleSkip();
    }
  }, [phase, isSinglePull, currentIndex, results.length, onComplete, handleSkip]);

  // Phase: Chest anticipation
  useEffect(() => {
    if (phase === "chest") {
      const shakeTimer = setInterval(() => {
        setShakeIntensity(prev => Math.min(prev + 2, config.shakeIntensity));
      }, 100);

      const timer = setTimeout(() => {
        clearInterval(shakeTimer);
        setPhase("opening");
      }, 2000);

      return () => {
        clearTimeout(timer);
        clearInterval(shakeTimer);
      };
    }
  }, [phase, config.shakeIntensity]);

  // Phase: Opening burst
  useEffect(() => {
    if (phase === "opening" && currentResult?.character) {
      playChestOpen(currentResult.character.rarity);
      setLightRays(true);
      setShakeIntensity(config.shakeIntensity * 2);

      const timer = setTimeout(() => {
        setPhase("reveal");
        setShakeIntensity(0);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [phase, config.shakeIntensity, currentResult]);

  // Phase: Reveal with fanfare
  useEffect(() => {
    if (phase === "reveal" && currentResult?.character) {
      // Play the royal fanfare!
      playRoyalFanfare(currentResult.character.rarity);

      // Spawn confetti
      spawnConfetti(currentResult.character.rarity);

      // Show rarity banner for high rarity
      if (currentResult.character.rarity >= 4) {
        setShowBanner(true);
      }

      const timer = setTimeout(() => {
        setPhase("card");
        setLightRays(false);
      }, currentResult.character.rarity >= 4 ? 2500 : 1500);

      return () => clearTimeout(timer);
    }
  }, [phase, currentResult, spawnConfetti]);

  // Phase: Card display
  useEffect(() => {
    if (phase === "card") {
      setShowBanner(false);
      const timer = setTimeout(() => setPhase("result"), 800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black cursor-pointer overflow-hidden"
      onClick={handleClick}
      style={{
        transform: shakeIntensity > 0
          ? `translate(${(Math.random() - 0.5) * shakeIntensity}px, ${(Math.random() - 0.5) * shakeIntensity}px)`
          : undefined,
      }}
    >
      {/* Animated background */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${phase !== "chest" ? "opacity-100" : "opacity-0"}`}
        style={{
          background: `radial-gradient(ellipse at center, ${config.glow} 0%, transparent 50%, black 100%)`,
        }}
      />

      {/* Light rays burst */}
      {lightRays && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-4 origin-center animate-pulse"
              style={{
                height: "200vh",
                background: `linear-gradient(to top, transparent, ${config.glowIntense}40, ${config.glowIntense}80, ${config.glowIntense}40, transparent)`,
                transform: `rotate(${i * 22.5}deg)`,
                transformOrigin: "center center",
              }}
            />
          ))}
        </div>
      )}

      {/* CONFETTI */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute pointer-events-none"
          style={{
            left: c.x,
            top: c.y,
            animation: c.type === "burst"
              ? `confetti-burst ${c.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${c.delay}s forwards`
              : `confetti-fall-${c.shape} ${c.duration}s ease-out ${c.delay}s forwards`,
            ["--angle" as string]: `${c.angle}deg`,
            ["--distance" as string]: `${c.distance}px`,
            ["--rotation" as string]: `${c.rotation}deg`,
          }}
        >
          {c.shape === "rect" && (
            <div
              style={{
                width: 10 * c.scale,
                height: 20 * c.scale,
                backgroundColor: c.color,
                transform: `rotate(${c.rotation}deg)`,
                boxShadow: `0 0 10px ${c.color}`,
              }}
            />
          )}
          {c.shape === "circle" && (
            <div
              style={{
                width: 12 * c.scale,
                height: 12 * c.scale,
                backgroundColor: c.color,
                borderRadius: "50%",
                boxShadow: `0 0 10px ${c.color}`,
              }}
            />
          )}
          {c.shape === "star" && (
            <div
              style={{
                fontSize: 16 * c.scale,
                color: c.color,
                textShadow: `0 0 10px ${c.color}`,
                transform: `rotate(${c.rotation}deg)`,
              }}
            >
              ★
            </div>
          )}
          {c.shape === "streamer" && (
            <div
              style={{
                width: 4 * c.scale,
                height: 40 * c.scale,
                background: `linear-gradient(to bottom, ${c.color}, transparent)`,
                borderRadius: 2,
                transform: `rotate(${c.rotation}deg)`,
              }}
            />
          )}
        </div>
      ))}

      {/* Skip hint */}
      <div className="absolute top-6 right-6 text-white/50 text-sm font-mono z-50">
        {phase === "result"
          ? (isSinglePull || currentIndex >= results.length - 1 ? "Tap to close" : `Tap for next (${currentIndex + 1}/${results.length})`)
          : "Tap to skip"
        }
      </div>

      {/* Free pull badge */}
      {isFreePull && (
        <div className="absolute top-6 left-6 px-4 py-2 bg-gradient-to-r from-trickle to-green-400 rounded-full z-50 animate-bounce">
          <span className="text-black font-bold text-sm">FREE PULL!</span>
        </div>
      )}

      {/* RARITY BANNER - For 4★ and 5★ */}
      {showBanner && currentResult?.character && currentResult.character.rarity >= 4 && (
        <div className="absolute top-1/4 left-0 right-0 z-40 animate-banner-slide pointer-events-none">
          <div
            className={`mx-auto w-fit px-16 py-4 bg-gradient-to-r ${config.bgGradient} transform -skew-x-6`}
            style={{
              boxShadow: `0 0 60px ${config.glow}, inset 0 0 30px rgba(255,255,255,0.3)`,
            }}
          >
            <div className="transform skew-x-6">
              <p className="text-3xl font-black text-white tracking-[0.3em] text-center drop-shadow-lg">
                {currentResult.character.rarity === 5 ? "⚜️ LEGENDARY ⚜️" : "✦ SUPER RARE ✦"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CHEST PHASE */}
      {phase === "chest" && (
        <div className="relative flex flex-col items-center animate-fade-in">
          <div
            className={`relative transition-all duration-300 ${config.chestGlow}`}
            style={{
              animation: shakeIntensity > 0 ? `chest-shake ${0.1 - shakeIntensity * 0.002}s infinite` : undefined,
            }}
          >
            {/* Chest */}
            <div className="relative">
              <div className="w-72 h-44 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 rounded-lg border-4 border-amber-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-px bg-amber-950 my-5" />
                  ))}
                </div>
                <div className="absolute top-4 left-0 right-0 h-4 bg-gradient-to-b from-yellow-600 to-yellow-800 border-y border-yellow-500" />
                <div className="absolute bottom-4 left-0 right-0 h-4 bg-gradient-to-b from-yellow-600 to-yellow-800 border-y border-yellow-500" />
                <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 w-14 h-16 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-b-lg border-2 border-yellow-400 flex items-center justify-center">
                  <div className="w-5 h-7 bg-black/60 rounded-full" />
                </div>
              </div>
              <div className="w-72 h-20 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-800 rounded-t-2xl border-4 border-b-0 border-amber-500 -mb-1 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-yellow-600 to-yellow-800 border-y border-yellow-500" />
              </div>
            </div>

            <div
              className="absolute inset-0 rounded-lg animate-pulse pointer-events-none"
              style={{
                boxShadow: `0 0 ${30 + shakeIntensity * 5}px ${15 + shakeIntensity * 2}px ${config.glow}`,
              }}
            />
          </div>

          <p className="mt-10 text-2xl font-display text-white animate-pulse">
            Something legendary awaits...
          </p>
          <p className="mt-2 text-sm font-mono text-white/50">
            Tap to open faster
          </p>
        </div>
      )}

      {/* OPENING PHASE */}
      {phase === "opening" && (
        <div className="relative flex flex-col items-center">
          <div className="animate-chest-burst">
            <span className="text-9xl">📦</span>
          </div>
        </div>
      )}

      {/* REVEAL PHASE */}
      {phase === "reveal" && currentResult?.character && (
        <div className="relative flex flex-col items-center animate-character-rise">
          <div
            className="absolute w-[500px] h-[500px] rounded-full animate-pulse pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${config.glowIntense} 0%, ${config.glow} 30%, transparent 70%)`,
              filter: "blur(30px)",
            }}
          />

          <div className="relative z-10">
            <span
              className="text-[200px] block animate-bounce"
              style={{
                filter: `drop-shadow(0 0 40px ${config.glow}) drop-shadow(0 0 80px ${config.glow}) drop-shadow(0 0 120px ${config.glowIntense})`,
              }}
            >
              {CHARACTER_PORTRAITS[currentResult.character.name]?.emoji || "💸"}
            </span>
          </div>

          <h2
            className="text-5xl font-display font-black text-white mt-6 animate-slide-up"
            style={{ textShadow: config.textShadow }}
          >
            {currentResult.character.name}
          </h2>

          <p className={`text-2xl font-mono ${config.text} mt-2 animate-slide-up`} style={{ animationDelay: "0.2s" }}>
            &ldquo;{CHARACTER_PORTRAITS[currentResult.character.name]?.title || "Mystery"}&rdquo;
          </p>

          <div className={`mt-4 text-3xl ${config.text} animate-slide-up`} style={{ animationDelay: "0.4s" }}>
            {config.stars}
          </div>
        </div>
      )}

      {/* CARD PHASE */}
      {phase === "card" && currentResult?.character && (
        <div className="animate-card-slam">
          <CharacterCard result={currentResult} config={config} />
        </div>
      )}

      {/* RESULT PHASE */}
      {phase === "result" && currentResult?.character && (
        <div className="animate-fade-in">
          <CharacterCard result={currentResult} config={config} showDetails />
        </div>
      )}

      {/* Animation styles */}
      <style jsx global>{`
        /* BURST - Shoots outward from center in all directions! */
        @keyframes confetti-burst {
          0% {
            transform: rotate(var(--angle)) translateX(0) rotate(var(--rotation));
            opacity: 1;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: rotate(var(--angle)) translateX(var(--distance)) rotate(calc(var(--rotation) + 720deg)) translateY(200px);
            opacity: 0;
          }
        }

        @keyframes confetti-fall-rect {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(120vh) translateX(100px) rotate(1080deg);
            opacity: 0;
          }
        }

        @keyframes confetti-fall-circle {
          0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(-50px) scale(0.5);
            opacity: 0;
          }
        }

        @keyframes confetti-fall-star {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) translateX(80px) rotate(720deg) scale(0.3);
            opacity: 0;
          }
        }

        @keyframes confetti-fall-streamer {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(130vh) translateX(-60px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes chest-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-8px) rotate(-3deg); }
          75% { transform: translateX(8px) rotate(3deg); }
        }

        @keyframes chest-burst {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.8) rotate(10deg); opacity: 0.6; }
          100% { transform: scale(2.5) rotate(20deg); opacity: 0; }
        }

        @keyframes character-rise {
          0% { transform: translateY(150px) scale(0.3); opacity: 0; }
          40% { transform: translateY(-30px) scale(1.15); }
          70% { transform: translateY(10px) scale(0.95); }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        @keyframes card-slam {
          0% { transform: translateY(-300px) rotateX(60deg) scale(1.8); opacity: 0; }
          60% { transform: translateY(20px) rotateX(-5deg) scale(1.05); }
          80% { transform: translateY(-5px) rotateX(2deg) scale(0.98); }
          100% { transform: translateY(0) rotateX(0deg) scale(1); opacity: 1; }
        }

        @keyframes banner-slide {
          0% { transform: translateX(-100%) skewX(-6deg); opacity: 0; }
          20% { transform: translateX(0) skewX(-6deg); opacity: 1; }
          80% { transform: translateX(0) skewX(-6deg); opacity: 1; }
          100% { transform: translateX(100%) skewX(-6deg); opacity: 0; }
        }

        .animate-chest-burst {
          animation: chest-burst 0.6s ease-out forwards;
        }

        .animate-character-rise {
          animation: character-rise 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-card-slam {
          animation: card-slam 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .animate-banner-slide {
          animation: banner-slide 2.5s ease-in-out forwards;
        }
      `}</style>
    </div>
  );
}

interface CharacterCardProps {
  result: PullResult;
  config: typeof RARITY_CONFIG[keyof typeof RARITY_CONFIG];
  showDetails?: boolean;
}

function CharacterCard({ result, config, showDetails }: CharacterCardProps) {
  const character = result.character;
  if (!character) return null;

  const portrait = CHARACTER_PORTRAITS[character.name] || { emoji: "💸", title: "Unknown" };

  return (
    <div className="relative">
      {/* Outer glow */}
      <div
        className="absolute -inset-6 rounded-3xl opacity-70 blur-2xl animate-pulse"
        style={{ background: `linear-gradient(135deg, ${config.glow}, ${config.glowIntense}, ${config.glow})` }}
      />

      {/* Card */}
      <div
        className={`relative w-80 rounded-2xl border-4 ${config.border} overflow-hidden`}
        style={{
          boxShadow: `0 0 50px ${config.glow}, 0 0 100px ${config.glow}50, inset 0 0 50px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Rarity banner */}
        <div className={`bg-gradient-to-r ${config.bgGradient} px-4 py-3 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shine"
               style={{ backgroundSize: "200% 100%" }} />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-sm font-black tracking-widest text-white drop-shadow-lg">
              {config.label}
            </span>
            <span className="text-xl text-white drop-shadow-lg tracking-wider">{config.stars}</span>
          </div>
        </div>

        {/* Card body */}
        <div className={`bg-gradient-to-b ${config.cardBg} p-6`}>
          {/* Character portrait */}
          <div
            className="relative w-full aspect-square rounded-xl mb-4 flex items-center justify-center overflow-hidden"
            style={{
              background: `radial-gradient(ellipse at center, ${config.glowIntense}60 0%, ${config.glow}30 40%, rgba(0,0,0,0.9) 100%)`,
              boxShadow: `inset 0 0 40px ${config.glow}`,
            }}
          >
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`,
              }} />
            </div>

            <span
              className="text-[130px] relative z-10"
              style={{
                filter: `drop-shadow(0 0 30px ${config.glow}) drop-shadow(0 0 60px ${config.glowIntense})`,
              }}
            >
              {portrait.emoji}
            </span>

            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />
          </div>

          {/* Name */}
          <h3
            className="text-2xl font-black text-white font-display text-center mb-1"
            style={{ textShadow: config.textShadow }}
          >
            {character.name}
          </h3>

          {/* Title */}
          <p className={`text-base font-mono ${config.text} text-center mb-4`}>
            &ldquo;{portrait.title}&rdquo;
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className="bg-black/50 rounded-xl px-6 py-3 border-2"
              style={{ borderColor: config.glow }}
            >
              <span className="text-xs text-slate-400 block text-center">POWER</span>
              <span
                className={`text-3xl font-black font-mono ${config.text} block text-center`}
                style={{ textShadow: `0 0 20px ${config.glow}` }}
              >
                {result.newTotalPower.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Duplicate/New indicator */}
          {result.isDuplicate ? (
            <div className="bg-amber-500/30 border-2 border-amber-500 rounded-xl px-4 py-3 text-center mb-3">
              <span className="text-amber-300 font-black text-lg">
                DUPLICATE! +{result.powerGained} PWR
              </span>
            </div>
          ) : (
            <div className="bg-trickle/30 border-2 border-trickle rounded-xl px-4 py-3 text-center mb-3">
              <span className="text-trickle font-black text-lg">
                NEW CHARACTER!
              </span>
            </div>
          )}

          {/* Bio */}
          {showDetails && (
            <div className="border-t-2 border-white/20 pt-4 mt-2">
              <p className="text-sm text-slate-300 text-center italic leading-relaxed">
                &ldquo;{character.bio}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
