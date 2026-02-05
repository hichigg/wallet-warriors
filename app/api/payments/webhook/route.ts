import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutExpired(session);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      await handleChargeRefunded(charge);
      break;
    }
    default:
      // Ignore unhandled event types
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const transactionId = session.metadata?.transactionId;
  if (!transactionId) {
    console.error("Webhook: checkout.session.completed missing transactionId in metadata");
    return;
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    console.error(`Webhook: Transaction ${transactionId} not found`);
    return;
  }

  // Idempotency — skip if already processed
  if (transaction.status !== "PENDING") {
    return;
  }

  // Atomic update: mark completed + grant coins + increment totalSpent
  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: "COMPLETED",
        stripePaymentId: session.payment_intent as string,
      },
    }),
    prisma.user.update({
      where: { id: transaction.userId },
      data: {
        crunchCoin: { increment: transaction.crunchCoinGranted },
        totalSpent: { increment: transaction.amount },
      },
    }),
  ]);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const transactionId = session.metadata?.transactionId;
  if (!transactionId) return;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction || transaction.status !== "PENDING") return;

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { status: "FAILED" },
  });
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  // Look up transaction by Stripe payment intent
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) return;

  const transaction = await prisma.transaction.findFirst({
    where: { stripePaymentId: paymentIntentId },
  });

  if (!transaction || transaction.status !== "COMPLETED") return;

  // Atomic update: mark refunded + deduct coins + decrement totalSpent
  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "REFUNDED" },
    }),
    prisma.user.update({
      where: { id: transaction.userId },
      data: {
        crunchCoin: { decrement: transaction.crunchCoinGranted },
        totalSpent: { decrement: transaction.amount },
      },
    }),
  ]);
}
