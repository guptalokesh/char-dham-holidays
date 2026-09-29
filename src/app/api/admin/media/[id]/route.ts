import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth/guard";
import { prisma } from "@/lib/db";
import { deleteMedia } from "@/lib/media";

export async function DELETE(
  _request: Request,
  context: RouteContext<"/api/admin/media/[id]">
) {
  const admin = await requireAdminSession(await cookies());
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.media.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  await deleteMedia(id);
  return NextResponse.json({ success: true });
}
