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
 
// Fix #2: Removed hardcoded fallback credentials. All values are now required from env vars.
// Missing credentials will produce an empty array, effectively disabling those roles rather
// than silently exposing known plaintext passwords on preview/staging deployments.
function buildDevCredentials(): DevLoginCredentials[] {
  const credentials: DevLoginCredentials[] = [];
 
  if (
    process.env.DEV_LOGIN_ADMIN_EMAIL &&
    process.env.DEV_LOGIN_ADMIN_PASSWORD &&
    process.env.DEV_LOGIN_ADMIN_NAME
  ) {
    credentials.push({
      role: "admin",
      name: process.env.DEV_LOGIN_ADMIN_NAME,
      email: process.env.DEV_LOGIN_ADMIN_EMAIL,
      password: process.env.DEV_LOGIN_ADMIN_PASSWORD,
    });
  }
 
  if (
    process.env.DEV_LOGIN_REVIEWER_EMAIL &&
    process.env.DEV_LOGIN_REVIEWER_PASSWORD &&
    process.env.DEV_LOGIN_REVIEWER_NAME
  ) {
    credentials.push({
      role: "reviewer",
      name: process.env.DEV_LOGIN_REVIEWER_NAME,
      email: process.env.DEV_LOGIN_REVIEWER_EMAIL,
      password: process.env.DEV_LOGIN_REVIEWER_PASSWORD,
      reviewerId: process.env.DEV_LOGIN_REVIEWER_ID ?? "R-001",
    });
  }
 
  if (
    process.env.DEV_LOGIN_AGENT_EMAIL &&
    process.env.DEV_LOGIN_AGENT_PASSWORD &&
    process.env.DEV_LOGIN_AGENT_NAME
  ) {
    credentials.push({
      role: "agent",
      name: process.env.DEV_LOGIN_AGENT_NAME,
      email: process.env.DEV_LOGIN_AGENT_EMAIL,
      password: process.env.DEV_LOGIN_AGENT_PASSWORD,
      agentId: process.env.DEV_LOGIN_AGENT_ID ?? "A-1042",
    });
  }
 
  return credentials;
}
 
export const DEV_LOGIN_CREDENTIALS: DevLoginCredentials[] = buildDevCredentials();
export const DEV_LOGIN_ENABLED =
  process.env.ALLOW_DEV_LOGIN !== "false" && process.env.NODE_ENV !== "production";
 
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
 
  const dotIndex = value.lastIndexOf(".");
  if (dotIndex === -1) {
    return null;
  }
 
  const encodedPayload = value.slice(0, dotIndex);
  const signature = value.slice(dotIndex + 1);
 
  if (!encodedPayload || !signature) {
    return null;
  }
 
  const expectedSignature = sign(encodedPayload);
 
  // Fix #3: Removed the length pre-check — it created a timing oracle since both
  // values are fixed-length base64url HMAC-SHA256 outputs anyway. timingSafeEqual
  // alone is sufficient and correct here.
  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8"),
    )
  ) {
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
    (credentials) =>
      credentials.email.toLowerCase() === email.trim().toLowerCase() &&
      credentials.password === password,
  );
}
 
export function getDevLoginCredentialsByEmail(email: string) {
  return (
    DEV_LOGIN_CREDENTIALS.find(
      (credentials) => credentials.email.toLowerCase() === email.trim().toLowerCase(),
    ) ?? null
  );
}
 


// After — safe null return
export function getDevLoginCredentialsByRole(role: PortalRole): DevLoginCredentials | null {
  return DEV_LOGIN_CREDENTIALS.find((credentials) => credentials.role === role) ?? null;
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