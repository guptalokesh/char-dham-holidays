import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/guard";
import { listEnquiries } from "@/lib/enquiries-admin";
import type { EnquiryStatus } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  const admin = await requireAdminSession(await cookies());
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const statusParam = request.nextUrl.searchParams.get("status");
  const status =
    statusParam && ["NEW", "CONTACTED", "CLOSED"].includes(statusParam)
      ? (statusParam as EnquiryStatus)
      : undefined;

  const enquiries = await listEnquiries({ status });
  return NextResponse.json({ enquiries });
}
