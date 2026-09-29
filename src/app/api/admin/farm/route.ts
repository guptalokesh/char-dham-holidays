import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guard";
import { getFarmProperty, updateFarmProperty } from "@/lib/farm";

export async function GET() {
  const admin = await requireAdminSession(await cookies());
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const property = await getFarmProperty();
  return NextResponse.json({ property });
}

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

  try {
    const property = await updateFarmProperty(body as never);
    return NextResponse.json({ property, message: "Listing updated successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid property data.", issues: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}
