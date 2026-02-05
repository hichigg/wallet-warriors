"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { CurrencyDisplay } from "@/components/ui/CurrencyDisplay";

// --- NAV ITEMS ---
const navItems = [
  { name: "Home", href: "/", icon: HomeIcon },
  { name: "Collection", href: "/collection", icon: CollectionIcon },
  { name: "Gacha", href: "/gacha", icon: GachaIcon },
  { name: "Shop", href: "/shop", icon: ShopIcon },
  { name: "Battle", href: "/battle", icon: BattleIcon },
  { name: "Leaderboard", href: "/leaderboard", icon: LeaderboardIcon },
] as const;

// --- NAVBAR ---
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const isLoading = status === "loading";

  return (
    <>
      <nav className="bg-[rgba(13,13,20,0.95)] backdrop-blur-xl border-b border-ww-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* --- Logo --- */}
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <span className="text-[22px] group-hover:scale-110 transition-transform duration-200">
              💸
            </span>
            <div>
              <div className="text-[16px] font-extrabold tracking-[0.12em] uppercase text-slate-100 leading-tight font-display">
                Wallet Warriors
              </div>
              <div className="text-[9px] tracking-[0.25em] uppercase text-slate-600 font-mono">
                A Wealth Experience™
              </div>
            </div>
          </Link>

          {/* --- Desktop Nav Links --- */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navItems.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                className={`nav-link ${isActive(href) ? "nav-link--active" : ""}`}
              >
                <Icon />
                {name}
              </Link>
            ))}
          </div>

          {/* --- Desktop Right: Auth State --- */}
          <div className="hidden lg:flex items-center gap-4">
            {isLoading ? (
              <div className="w-20 h-9 bg-slate-800 rounded-lg animate-pulse" />
            ) : session ? (
              <>
                <CurrencyDisplay
                  crunchCoin={session.user.crunchCoin ?? 0}
                  trickleTokens={session.user.trickleTokens ?? 0}
                />
                <div className="flex items-center gap-2">
                  <Link
                    href="/profile"
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 border-2 overflow-hidden
                      ${
                        isActive("/profile")
                          ? "border-amber-400"
                          : "border-slate-700 hover:border-slate-500"
                      }
                    `}
                  >
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "Profile"}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ProfileIcon />
                    )}
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="px-3 py-1.5 text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => signIn()}
                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
              >
                Sign In
              </button>
            )}
          </div>

          {/* --- Mobile Hamburger --- */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden bg-transparent border-none text-slate-400 cursor-pointer p-1 hover:text-slate-200 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      {/* --- Mobile Menu Overlay --- */}
      {mobileOpen && (
        <div className="fixed top-16 inset-x-0 bottom-0 bg-[rgba(7,7,12,0.97)] backdrop-blur-2xl z-40 p-6 flex flex-col gap-2 animate-fade-in-down lg:hidden overflow-y-auto">
          {session ? (
            <>
              <div className="mb-4 flex items-center gap-3">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Profile"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {session.user.name}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <CurrencyDisplay
                  crunchCoin={session.user.crunchCoin ?? 0}
                  trickleTokens={session.user.trickleTokens ?? 0}
                />
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                setMobileOpen(false);
                signIn();
              }}
              className="mb-4 w-full px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-semibold text-sm rounded-xl"
            >
              Sign In to Start
            </button>
          )}

          {[...navItems, ...(session ? [{ name: "Profile" as const, href: "/profile", icon: ProfileIcon }] : [])].map(
            ({ name, href, icon: Icon }) => (
              <Link
                key={name}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-xl text-[16px] no-underline transition-all duration-200 font-display
                  ${
                    isActive(href)
                      ? "font-semibold text-amber-400 bg-amber-400/10"
                      : "font-normal text-slate-400 bg-transparent active:bg-white/[0.04]"
                  }
                `}
              >
                <Icon />
                {name}
              </Link>
            )
          )}

          {session && (
            <button
              onClick={() => {
                setMobileOpen(false);
                signOut();
              }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[16px] font-display text-red-400 active:bg-red-400/10"
            >
              <LogoutIcon />
              Sign Out
            </button>
          )}

          {/* Satirical mobile footer */}
          <div className="mt-auto pt-6 border-t border-ww-border">
            <p className="text-[11px] text-slate-700 font-mono text-center">
              You&apos;re spending data just by having this menu open.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// --- SVG ICONS ---
// Kept inline to avoid external icon library dependency.
// These can be swapped for lucide-react icons later if desired.

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CollectionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function GachaIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function BattleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function LeaderboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
