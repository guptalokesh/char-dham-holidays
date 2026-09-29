import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guard";
import { setChardhamItinerary } from "@/lib/chardham";
import { UserFacingError } from "@/lib/errors";

const itinerarySchema = z.object({ mediaId: z.string().nullable() });

export async function PATCH(request: NextRequest) {
  const admin = await requireAdminSession(await cookies());
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

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
    const chardhamPackage = await setChardhamItinerary(parsed.data.mediaId);
    return NextResponse.json({
      chardhamPackage,
      message: "Itinerary updated successfully.",
    });
  } catch (error) {
    if (error instanceof UserFacingError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
