import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guard";
import { setRoomAvailability } from "@/lib/farm";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/farm/rooms/[id]/availability">
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

  try {
    const availability = await setRoomAvailability({ ...(body as object), roomId: id } as never);
    return NextResponse.json({
      availability,
      message: "Availability updated successfully.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid availability data.", issues: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}
