import { NextResponse } from "next/server";
import { CRUNCHCOIN_PACKAGES } from "@/lib/stripe";

// Public endpoint — no auth required
export async function GET() {
  const packages = Object.values(CRUNCHCOIN_PACKAGES).map((pkg) => ({
    id: pkg.id,
    name: pkg.name,
    priceInCents: pkg.priceInCents,
    priceDisplay: `$${(pkg.priceInCents / 100).toFixed(2)}`,
    crunchCoin: pkg.crunchCoin,
    coinsPerDollar: Math.round(pkg.crunchCoin / (pkg.priceInCents / 100)),
    tagline: pkg.tagline,
  }));

  return NextResponse.json({
    packages,
    disclaimer:
      "The value gets worse as you spend more. This is intentional. You're welcome.",
  });
}
