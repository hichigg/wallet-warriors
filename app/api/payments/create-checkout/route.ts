import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { getStripe, CRUNCHCOIN_PACKAGES } from "@/lib/stripe";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { packageId } = body;

  const pkg = CRUNCHCOIN_PACKAGES[packageId];
  if (!pkg) {
    return NextResponse.json(
      { error: "Invalid package ID" },
      { status: 400 }
    );
  }

  // Create PENDING transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      amount: pkg.priceInCents / 100,
      crunchCoinGranted: pkg.crunchCoin,
      packageType: pkg.id,
      status: "PENDING",
    },
  });

  // Create Stripe Checkout Session
  const origin = request.headers.get("origin") || process.env.NEXTAUTH_URL;

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: pkg.priceInCents,
          product_data: {
            name: `${pkg.name} — ${pkg.crunchCoin} CrunchCoin`,
            description: pkg.tagline,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      transactionId: transaction.id,
      userId: session.user.id,
      packageId: pkg.id,
    },
    success_url: `${origin}/shop?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop?status=cancelled`,
  });

  // Store Stripe session ID on our transaction
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return NextResponse.json({
    checkoutUrl: checkoutSession.url,
    sessionId: checkoutSession.id,
    transactionId: transaction.id,
  });
}
