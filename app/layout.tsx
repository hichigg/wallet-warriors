import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Ticker } from "@/components/layout/Ticker";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { DailyLoginReward } from "@/components/DailyLoginReward";
import "./globals.css";

// --- FONTS ---
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// --- METADATA ---
export const metadata: Metadata = {
  title: "Wallet Warriors | A Wealth Experience™",
  description:
    "The world's first self-aware predatory monetization experience. Collect billionaire caricatures, feed them real money, and climb the leaderboard of regret.",
  keywords: [
    "gacha",
    "satire",
    "pay to win",
    "wallet warriors",
    "crunchcoin",
  ],
};

// --- ROOT LAYOUT ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-body antialiased">
        <SessionProvider>
          <DailyLoginReward />
          <div className="min-h-screen flex flex-col bg-ww-bg text-slate-200">
            <Navbar />
            <Ticker />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
