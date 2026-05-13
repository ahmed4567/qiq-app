import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/queries/users";
import { verifyPassword } from "@/lib/auth-utils";
import {
  SESSION_COOKIE,
  createSessionCookie,
  createSessionCookieOptions,
  clearSessionCookieOptions,
} from "@/lib/session";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email    = String(formData.get("email")    ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=missing-fields", request.url));
  }

  const user = await getUserByEmail(email);

  const fail = () => {
    const res = NextResponse.redirect(new URL("/login?error=invalid-credentials", request.url));
    res.cookies.set(SESSION_COOKIE, "", clearSessionCookieOptions());
    return res;
  };

  if (!user || !user.password_hash) return fail();

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return fail();

  const sessionUser = {
    id:         user.id,
    name:       user.name,
    email:      user.email,
    picture:    undefined,
    provider:   "local" as const,
    role:       user.role,
    agentId:    user.agent_id ?? undefined,
    reviewerId: user.reviewer_id ?? undefined,
  };

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set(
    SESSION_COOKIE,
    createSessionCookie(sessionUser),
    createSessionCookieOptions(),
  );
  return response;
}