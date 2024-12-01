import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  cookies().delete("projecthub_session_token");
  return NextResponse.json({ success: true });
}
