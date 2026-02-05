import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "shine": "shine 2s ease-in-out infinite",
        "card-flip": "card-flip 0.8s ease-out forwards",
        "card-glow": "card-glow 1.5s ease-in-out infinite",
        "particle-float": "particle-float 2s ease-out forwards",
        "shake": "shake 0.5s ease-in-out",
        "legendary-burst": "legendary-burst 1s ease-out forwards",
        "rarity-pulse": "rarity-pulse 0.6s ease-out",
        "slide-up": "slide-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "spin-slow": "spin 3s linear infinite",
        "rainbow-border": "rainbow-border 3s linear infinite",
        "clash-left": "clash-left 0.4s ease-out forwards",
        "clash-right": "clash-right 0.4s ease-out forwards",
        "slam": "slam 0.3s ease-out forwards",
        "number-tick": "number-tick 0.15s ease-out",
        "winner-glow": "winner-glow 1.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(251, 191, 36, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(251, 191, 36, 0.6)" },
        },
        "shine": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "card-flip": {
          "0%": { transform: "perspective(1000px) rotateY(180deg) scale(0.8)", opacity: "0" },
          "50%": { transform: "perspective(1000px) rotateY(90deg) scale(1.1)" },
          "100%": { transform: "perspective(1000px) rotateY(0deg) scale(1)", opacity: "1" },
        },
        "card-glow": {
          "0%, 100%": { filter: "drop-shadow(0 0 10px var(--glow-color, rgba(251, 191, 36, 0.5)))" },
          "50%": { filter: "drop-shadow(0 0 30px var(--glow-color, rgba(251, 191, 36, 0.8)))" },
        },
        "particle-float": {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "100%": { transform: "translateY(-100px) scale(0)", opacity: "0" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
        "legendary-burst": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "50%": { transform: "scale(1.5)", opacity: "0.8" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        "rarity-pulse": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "rainbow-border": {
          "0%": { borderColor: "#f59e0b" },
          "17%": { borderColor: "#ef4444" },
          "33%": { borderColor: "#ec4899" },
          "50%": { borderColor: "#a855f7" },
          "67%": { borderColor: "#3b82f6" },
          "83%": { borderColor: "#22c55e" },
          "100%": { borderColor: "#f59e0b" },
        },
        "clash-left": {
          "0%": { transform: "translateX(-80px) scale(0.9)", opacity: "0" },
          "60%": { transform: "translateX(10px) scale(1.05)" },
          "100%": { transform: "translateX(0) scale(1)", opacity: "1" },
        },
        "clash-right": {
          "0%": { transform: "translateX(80px) scale(0.9)", opacity: "0" },
          "60%": { transform: "translateX(-10px) scale(1.05)" },
          "100%": { transform: "translateX(0) scale(1)", opacity: "1" },
        },
        "slam": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "60%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
        "number-tick": {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "winner-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(52, 211, 153, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(52, 211, 153, 0.6)" },
        },
      },
      colors: {
        // Brand
        crunch: {
          DEFAULT: "#fbbf24",
          dark: "#f59e0b",
          bg: "rgba(251, 191, 36, 0.08)",
          border: "rgba(251, 191, 36, 0.2)",
          subtle: "rgba(251, 191, 36, 0.06)",
        },
        trickle: {
          DEFAULT: "#a3e635",
          dark: "#84cc16",
          bg: "rgba(163, 230, 53, 0.06)",
          border: "rgba(163, 230, 53, 0.15)",
        },
        // Surfaces
        ww: {
          bg: "#0c0c16",
          surface: "#0f0f19",
          elevated: "#13131f",
          border: "#1a1a2e",
          "border-hover": "#2a2a3e",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
