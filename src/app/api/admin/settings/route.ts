import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guard";
import { getWebsiteSettings, updateWebsiteSettings } from "@/lib/settings";

export async function GET() {
  const admin = await requireAdminSession(await cookies());
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const settings = await getWebsiteSettings();
  return NextResponse.json({ settings });
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
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  try {
    const settings = await updateWebsiteSettings(body as never);
    return NextResponse.json({ settings, message: "Settings saved successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid settings data.", issues: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}
