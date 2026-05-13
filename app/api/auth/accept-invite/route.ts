import { NextRequest, NextResponse } from "next/server";
import { getInviteByToken, acceptInvite } from "@/lib/queries/invites";
import { createUser } from "@/lib/queries/users";
import { hashPassword } from "@/lib/auth-utils";
import {
  SESSION_COOKIE,
  createSessionCookie,
  createSessionCookieOptions,
} from "@/lib/session";

// POST /api/auth/accept-invite
// Body: { token, password }
export async function POST(request: NextRequest) {
  const { token, password } = (await request.json()) as {
    token: string;
    password: string;
  };

  if (!token || !password) {
    return NextResponse.json({ error: "token and password are required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const invite = await getInviteByToken(token);
  if (!invite) {
    return NextResponse.json({ error: "Invite is invalid or has expired." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  const user = await createUser({
    name:       invite.name,
    email:      invite.email,
    passwordHash,
    role:       invite.role,
    agentId:    invite.agent_id,
    reviewerId: invite.reviewer_id,
    invitedBy:  invite.invited_by,
  });

  await acceptInvite(token);

  // Log the new user in immediately
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

  const response = NextResponse.json({ success: true });
  response.cookies.set(
    SESSION_COOKIE,
    createSessionCookie(sessionUser),
    createSessionCookieOptions(),
  );
  return response;
}