import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function PATCH(request: Request) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { username } = await request.json();

    // Validate username
    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const trimmed = username.trim().toLowerCase();

    // Check format
    if (!/^[a-z0-9_]{3,20}$/.test(trimmed)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters, letters, numbers, and underscores only" },
        { status: 400 }
      );
    }

    // Check if username is taken (by someone else)
    const existing = await prisma.user.findUnique({
      where: { username: trimmed },
      select: { id: true },
    });

    if (existing && existing.id !== session.user.id) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Update username
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { username: trimmed },
      select: { username: true },
    });

    return NextResponse.json({ username: user.username });
  } catch (error) {
    logger.error("Username update error:", error);
    return NextResponse.json(
      { error: "Failed to update username" },
      { status: 500 }
    );
  }
}
