import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guard";
import { updateEnquiryStatus } from "@/lib/enquiries-admin";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/enquiries/[id]">
) {
  const admin = await requireAdminSession(await cookies());
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const schema = z.object({ status: z.enum(["NEW", "CONTACTED", "CLOSED"]) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A valid status is required." }, { status: 400 });
  }

  try {
    const enquiry = await updateEnquiryStatus(id, parsed.data.status);
    return NextResponse.json({ enquiry, message: "Enquiry updated successfully." });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    }
    throw error;
  }
}
