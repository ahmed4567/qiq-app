import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookieOptions, SESSION_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(SESSION_COOKIE, "", clearSessionCookieOptions());
  return response;
}

