import { NextResponse, type NextRequest } from "next/server";
import { isBlockedCrossOriginRequest } from "@/lib/csrf";

export function proxy(request: NextRequest) {
  if (isBlockedCrossOriginRequest(request)) {
    return NextResponse.json(
      { error: "Cross-origin request blocked." },
      { status: 403 }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/admin/:path*",
};
