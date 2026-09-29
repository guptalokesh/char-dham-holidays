import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { submitGeneralEnquiry } from "@/lib/enquiry";
import { getClientIp } from "@/lib/request-ip";
import { RateLimiter } from "@/lib/rate-limit";

const enquiryRateLimiter = new RateLimiter(10, 15 * 60 * 1000);

export async function POST(request: NextRequest) {
  const rateLimit = enquiryRateLimiter.consume(getClientIp(request));
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
    const result = await submitGeneralEnquiry(body as never);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please check the form and try again.", issues: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
