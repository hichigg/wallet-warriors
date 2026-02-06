// lib/stripe.ts
// Stripe client singleton + CrunchCoin package definitions

import Stripe from "stripe";
import { STRIPE_SECRET_KEY } from "./env";

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined;
};

export function getStripe(): Stripe {
  if (globalForStripe.stripe) return globalForStripe.stripe;

  const client = new Stripe(STRIPE_SECRET_KEY());

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
  pocket_change: {
    id: "pocket_change",
    name: "Pocket Change",
    priceInCents: 499,
    crunchCoin: 400,
    tagline: "Buying in small lots is like picking up pennies in front of a steamroller.",
  },
  value_play: {
    id: "value_play",
    name: "Value Play",
    priceInCents: 999,
    crunchCoin: 900,
    tagline: "Price is what you pay. Value is what you get. This is... okay value.",
  },
  smart_money: {
    id: "smart_money",
    name: "Smart Money",
    priceInCents: 2499,
    crunchCoin: 2500,
    tagline: "Be greedy when others are fearful. Like right now.",
  },
  compound_interest: {
    id: "compound_interest",
    name: "Compound Interest",
    priceInCents: 4999,
    crunchCoin: 5500,
    tagline: "The eighth wonder of the world. You're welcome.",
  },
  buffett_special: {
    id: "buffett_special",
    name: "The Buffett Special",
    priceInCents: 9999,
    crunchCoin: 13000,
    tagline: "Our favorite holding period is forever. Especially for your money.",
  },
};
