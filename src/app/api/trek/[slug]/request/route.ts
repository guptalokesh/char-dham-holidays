import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTrekBySlug, submitTrekRequest } from "@/lib/trek";
import { getClientIp } from "@/lib/request-ip";
import { RateLimiter } from "@/lib/rate-limit";

const requestRateLimiter = new RateLimiter(10, 15 * 60 * 1000);

export async function POST(
  request: NextRequest,
  context: RouteContext<"/api/trek/[slug]/request">
) {
  const rateLimit = requestRateLimiter.consume(getClientIp(request));
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { slug } = await context.params;
  const trek = await getTrekBySlug(slug);
  if (!trek) {
    return NextResponse.json({ error: "Trek not found." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const result = await submitTrekRequest(trek.id, body as never);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Please check the form and try again.", issues: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}
