import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guard";
import { createTrek, listTreks } from "@/lib/trek";

export async function GET() {
  const admin = await requireAdminSession(await cookies());
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const treks = await listTreks({ activeOnly: false });
  return NextResponse.json({ treks });
}

export async function POST(request: NextRequest) {
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
    const trek = await createTrek(body as never);
    return NextResponse.json({ trek, message: "Listing created successfully." }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid trek data.", issues: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}
