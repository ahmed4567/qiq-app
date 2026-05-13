import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, clearSessionCookieOptions } from "@/lib/session";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(SESSION_COOKIE, "", clearSessionCookieOptions());
  return response;
}