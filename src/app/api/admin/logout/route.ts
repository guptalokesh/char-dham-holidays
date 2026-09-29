import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logoutAdmin } from "@/lib/auth/login";

export async function POST() {
  await logoutAdmin(await cookies());
  return NextResponse.json({ success: true });
}
