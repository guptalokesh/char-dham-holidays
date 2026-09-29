import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth/guard";
import { createRoom, listRooms } from "@/lib/farm";

export async function GET() {
  const admin = await requireAdminSession(await cookies());
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const rooms = await listRooms();
  return NextResponse.json({ rooms });
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
    const room = await createRoom(body as never);
    return NextResponse.json({ room, message: "Room created successfully." }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid room data.", issues: error.issues },
        { status: 400 }
      );
    }
    throw error;
  }
}
