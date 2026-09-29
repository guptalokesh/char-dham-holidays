import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitFarmBookingRequest } from "@/lib/farm";
import { UserFacingError } from "@/lib/errors";
import { getClientIp } from "@/lib/request-ip";
import { RateLimiter } from "@/lib/rate-limit";

const bookingRateLimiter = new RateLimiter(10, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  const rateLimit = bookingRateLimiter.consume(getClientIp(request));
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
    const result = await submitFarmBookingRequest(body as never);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please check the form and try again.", issues: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof UserFacingError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
