import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { loginAdmin } from "@/lib/auth/login";
import { getClientIp } from "@/lib/request-ip";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email and password." },
      { status: 400 }
    );
  }

  const rateLimitKey = `${getClientIp(request)}:${parsed.data.email.toLowerCase()}`;

  const result = await loginAdmin({
    email: parsed.data.email,
    password: parsed.data.password,
    cookieStore: await cookies(),
    rateLimitKey,
  });

  if (!result.success) {
    if (result.reason === "locked") {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(result.retryAfterSeconds) },
        }
      );
    }
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 }
    );
  }

  return NextResponse.json({ success: true });
}
