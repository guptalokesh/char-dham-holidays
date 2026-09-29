import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guard";
import { updateTrek } from "@/lib/trek";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/admin/treks/[id]">
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
    const trek = await updateTrek(id, body as never);
    return NextResponse.json({ trek, message: "Listing updated successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid trek data.", issues: error.issues },
        { status: 400 }
      );
    }
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code?: string }).code === "P2025"
    ) {
      return NextResponse.json({ error: "Trek not found." }, { status: 404 });
    }
    throw error;
  }
}
