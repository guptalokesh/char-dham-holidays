import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guard";
import { UserFacingError } from "@/lib/errors";
import { setPackageItinerary } from "@/lib/packages";

const itinerarySchema = z.object({ mediaId: z.string().nullable() });

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/packages/[id]/itinerary">
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

  const parsed = itinerarySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "A mediaId is required." }, { status: 400 });
  }

  try {
    const chardhamPackage = await setPackageItinerary(id, parsed.data.mediaId);
    return NextResponse.json({ chardhamPackage, message: "Itinerary updated successfully." });
  } catch (error) {
    if (error instanceof UserFacingError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Yatra not found." }, { status: 404 });
    }
    throw error;
  }
}
