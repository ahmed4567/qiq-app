import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type SessionUser = {
  name: string;
  email: string;
  picture?: string;
  provider: "google";
};

type SessionPayload = SessionUser & {
  issuedAt: number;
  expiresAt: number;
};

const SESSION_COOKIE_NAME = "qiq_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSecret(): string {
  return process.env.SESSION_SECRET ?? process.env.GOOGLE_SESSION_SECRET ?? "dev-session-secret-change-me";
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encodePayload(payload: SessionPayload): string {
  return base64UrlEncode(JSON.stringify(payload));
}

function decodePayload(value: string): SessionPayload | null {
  try {
    return JSON.parse(base64UrlDecode(value)) as SessionPayload;
  } catch {
    return null;
  }
}

export function createSessionCookie(user: SessionUser): string {
  const now = Date.now();
  const payload: SessionPayload = {
    ...user,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  const encodedPayload = encodePayload(payload);
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionCookie(value: string | undefined): SessionUser | null {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  if (signature.length !== expectedSignature.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  const payload = decodePayload(encodedPayload);

  if (!payload || payload.expiresAt < Date.now()) {
    return null;
  }

  return {
    name: payload.name,
    email: payload.email,
    picture: payload.picture,
    provider: payload.provider,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionCookie(cookieValue);
}

export async function requireSession(redirectTo = "/login"): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect(redirectTo);
  }

  return user;
}

export function createSessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export function clearSessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

export const SESSION_COOKIE = SESSION_COOKIE_NAME;
