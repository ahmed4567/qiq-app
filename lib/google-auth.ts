import "server-only";

import crypto from "node:crypto";
import { getOptionalEnv, getRequiredEnv } from "./env";
import { createSessionCookie, type SessionUser } from "./session";

const OAUTH_STATE_COOKIE = "qiq_oauth_state";

function randomToken(size = 24): string {
  return crypto.randomBytes(size).toString("base64url");
}

export function hasGoogleOAuthConfig(): boolean {
  return Boolean(
    getOptionalEnv("GOOGLE_OAUTH_CLIENT_ID") &&
      getOptionalEnv("GOOGLE_OAUTH_CLIENT_SECRET") &&
      getOptionalEnv("GOOGLE_OAUTH_REDIRECT_URI"),
  );
}

export function buildGoogleAuthUrl(state: string): string {
  const clientId = getRequiredEnv("GOOGLE_OAUTH_CLIENT_ID");
  const redirectUri = getRequiredEnv("GOOGLE_OAUTH_REDIRECT_URI");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "select_account");

  return url.toString();
}

export async function exchangeCodeForUser(code: string): Promise<SessionUser> {
  const clientId = getRequiredEnv("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = getRequiredEnv("GOOGLE_OAUTH_CLIENT_SECRET");
  const redirectUri = getRequiredEnv("GOOGLE_OAUTH_REDIRECT_URI");

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Google token exchange failed: ${await tokenResponse.text()}`);
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string };

  if (!tokenData.access_token) {
    throw new Error("Google token exchange did not return an access token");
  }

  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  if (!profileResponse.ok) {
    throw new Error(`Google profile lookup failed: ${await profileResponse.text()}`);
  }

  const profile = (await profileResponse.json()) as {
    name?: string;
    email?: string;
    picture?: string;
  };

  if (!profile.email) {
    throw new Error("Google profile did not include an email address");
  }

  return {
    name: profile.name ?? profile.email,
    email: profile.email,
    picture: profile.picture,
    provider: "google",
    role: "reviewer",
  };
}

export function createLoginSession(user: SessionUser): string {
  return createSessionCookie(user);
}

export function createOAuthState(): string {
  return randomToken();
}

export const OAUTH_STATE_COOKIE_NAME = OAUTH_STATE_COOKIE;
