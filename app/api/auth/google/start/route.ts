import { NextRequest, NextResponse } from "next/server";
import { buildGoogleAuthUrl, createOAuthState, hasGoogleOAuthConfig, OAUTH_STATE_COOKIE_NAME } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  if (!hasGoogleOAuthConfig()) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  const state = createOAuthState();
  const authUrl = buildGoogleAuthUrl(state);
  const response = NextResponse.redirect(authUrl);

  response.cookies.set(OAUTH_STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}
