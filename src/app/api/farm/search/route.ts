import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { searchAvailableRooms } from "@/lib/farm";
import { getClientIp } from "@/lib/request-ip";
import { RateLimiter } from "@/lib/rate-limit";

const searchRateLimiter = new RateLimiter(30, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  const rateLimit = searchRateLimiter.consume(getClientIp(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const rooms = await searchAvailableRooms(body as never);
    return NextResponse.json({ rooms });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please check the dates and guest count and try again.", issues: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}
