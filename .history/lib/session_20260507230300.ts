import "server-only";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { PortalRole, PortalUserSummary } from "./roles";

export type SessionUser = PortalUserSummary & {
  provider: "google" | "local";
};

export type DevLoginCredentials = {
  name: string;
  email: string;
  password: string;
  role: PortalRole;
  agentId?: string;
  reviewerId?: string;
};

type SessionPayload = SessionUser & {
  issuedAt: number;
  expiresAt: number;
};

const SESSION_COOKIE_NAME = "qiq_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const DEV_LOGIN_CREDENTIALS: DevLoginCredentials[] = [
  {
    role: "admin",
    name: process.env.DEV_LOGIN_ADMIN_NAME ?? "Demo Admin",
    email: process.env.DEV_LOGIN_ADMIN_EMAIL ?? "admin@bedsxml.local",
    password: process.env.DEV_LOGIN_ADMIN_PASSWORD ?? "admin1234",
  },
  {
    role: "reviewer",
    name: process.env.DEV_LOGIN_REVIEWER_NAME ?? "Demo Reviewer",
    email: process.env.DEV_LOGIN_REVIEWER_EMAIL ?? "reviewer@bedsxml.local",
    password: process.env.DEV_LOGIN_REVIEWER_PASSWORD ?? "reviewer1234",
    reviewerId: process.env.DEV_LOGIN_REVIEWER_ID ?? "R-001",
  },
  {
    role: "agent",
    name: process.env.DEV_LOGIN_AGENT_NAME ?? "Demo Agent",
    email: process.env.DEV_LOGIN_AGENT_EMAIL ?? "agent@bedsxml.local",
    password: process.env.DEV_LOGIN_AGENT_PASSWORD ?? "agent1234",
    agentId: process.env.DEV_LOGIN_AGENT_ID ?? "A-1042",
  },
];
{/**export const DEV_LOGIN_ENABLED = process.env.ALLOW_DEV_LOGIN !== "false" && process.env.NODE_ENV !== "production";
*/}
function getSecret(): string {
  const configuredSecret = process.env.SESSION_SECRET ?? process.env.GOOGLE_SESSION_SECRET;

  if (configuredSecret?.trim()) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Missing required session secret. Set SESSION_SECRET or GOOGLE_SESSION_SECRET.");
  }

  console.warn("[auth] SESSION_SECRET is not set; using development fallback secret.");
  return "dev-session-secret-change-me";
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
    role: payload.role,
    agentId: payload.agentId,
    reviewerId: payload.reviewerId,
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

export function getRoleHomePath(role: PortalRole): string {
  if (role === "admin") {
    return "/views/admin";
  }
  if (role === "agent") {
    return "/views/agent";
  }
  return "/views/reviewer";
}

export function redirectToRoleHome(user: SessionUser): never {
  return redirect(getRoleHomePath(user.role));
}

export async function requireRole(role: PortalRole): Promise<SessionUser> {
  const user = await requireSession();

  if (user.role !== role) {
    redirectToRoleHome(user);
  }

  return user;
}

export async function requireAnyRole(roles: PortalRole[]): Promise<SessionUser> {
  const user = await requireSession();

  if (!roles.includes(user.role)) {
    redirectToRoleHome(user);
  }

  return user;
}

export function createSessionCookieOptions() {
  const expires = new Date(Date.now() + SESSION_TTL_MS);

  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
    expires,
  };
}

export function clearSessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };
}

export const SESSION_COOKIE = SESSION_COOKIE_NAME;

export function isDevLoginCredentials(email: string, password: string) {
  return DEV_LOGIN_CREDENTIALS.some(
    (credentials) => credentials.email.toLowerCase() === email.trim().toLowerCase() && credentials.password === password,
  );
}

export function getDevLoginCredentialsByEmail(email: string) {
  return DEV_LOGIN_CREDENTIALS.find((credentials) => credentials.email.toLowerCase() === email.trim().toLowerCase()) ?? null;
}

export function getDevLoginCredentialsByRole(role: PortalRole) {
  return DEV_LOGIN_CREDENTIALS.find((credentials) => credentials.role === role) ?? DEV_LOGIN_CREDENTIALS[1];
}

export function createDevSessionUser(credentials: DevLoginCredentials): SessionUser {
  return {
    name: credentials.name,
    email: credentials.email,
    provider: "local",
    role: credentials.role,
    agentId: credentials.agentId,
    reviewerId: credentials.reviewerId,
  };
}
