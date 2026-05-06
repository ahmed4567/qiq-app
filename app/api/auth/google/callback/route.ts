import { NextRequest, NextResponse } from "next/server";
import { createLoginSession, exchangeCodeForUser, OAUTH_STATE_COOKIE_NAME } from "@/lib/google-auth";
import { clearSessionCookieOptions, createSessionCookieOptions, SESSION_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE_NAME)?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=state", request.url));
  }

  try {
    const user = await exchangeCodeForUser(code);
    const sessionToken = createLoginSession(user);
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    response.cookies.set(SESSION_COOKIE, sessionToken, createSessionCookieOptions());
    response.cookies.set(OAUTH_STATE_COOKIE_NAME, "", clearSessionCookieOptions());

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
  }
}

