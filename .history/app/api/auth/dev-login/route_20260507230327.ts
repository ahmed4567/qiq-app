import { NextRequest, NextResponse } from "next/server";
import {
  DEV_LOGIN_ENABLED,
  SESSION_COOKIE,
  clearSessionCookieOptions,
  createDevSessionUser,
  createSessionCookie,
  createSessionCookieOptions,
  getDevLoginCredentialsByEmail,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  {/**if (!DEV_LOGIN_ENABLED) {
    return NextResponse.redirect(new URL("/login?error=dev-disabled", request.url));
  }*/}

  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const credentials = getDevLoginCredentialsByEmail(email);

  if (!credentials || credentials.password !== password) {
    const response = NextResponse.redirect(new URL("/login?error=dev-login", request.url));
    response.cookies.set(SESSION_COOKIE, "", clearSessionCookieOptions());
    return response;
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(SESSION_COOKIE, createSessionCookie(createDevSessionUser(credentials)), createSessionCookieOptions());
  return response;
}
