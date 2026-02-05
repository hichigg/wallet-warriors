// lib/stripe.ts
// Stripe client singleton + CrunchCoin package definitions

import Stripe from "stripe";

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined;
};

export function getStripe(): Stripe {
  if (globalForStripe.stripe) return globalForStripe.stripe;

  const client = new Stripe(process.env.STRIPE_SECRET_KEY!);

  if (process.env.NODE_ENV !== "production") {
    globalForStripe.stripe = client;
  }

  return client;
}

// ============================================
// CrunchCoin Packages
// ============================================

export interface CrunchCoinPackage {
  id: string;
  name: string;
  priceInCents: number;
  crunchCoin: number;
  tagline: string;
}

export const CRUNCHCOIN_PACKAGES: Record<string, CrunchCoinPackage> = {
  seed_round: {
    id: "seed_round",
    name: "Seed Round",
    priceInCents: 499,
    crunchCoin: 500,
    tagline: "Your first bad decision.",
  },
  series_a: {
    id: "series_a",
    name: "Series A",
    priceInCents: 999,
    crunchCoin: 900,
    tagline: "Now with institutional backing (yours).",
  },
  series_b: {
    id: "series_b",
    name: "Series B",
    priceInCents: 2499,
    crunchCoin: 2000,
    tagline: "Throwing good money after bad.",
  },
  ipo: {
    id: "ipo",
    name: "IPO",
    priceInCents: 4999,
    crunchCoin: 3500,
    tagline: "Going public with your poor choices.",
  },
  hostile_takeover: {
    id: "hostile_takeover",
    name: "Hostile Takeover",
    priceInCents: 9999,
    crunchCoin: 6000,
    tagline: "You just acquired nothing of value.",
  },
};
