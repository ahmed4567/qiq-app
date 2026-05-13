import { NextRequest, NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/session";
import { listUsers } from "@/lib/queries/users";
import { createInvite } from "@/lib/queries/invites";
import { sendInviteEmail } from "@/lib/email";
import type { PortalRole } from "@/lib/roles";

// GET /api/users — admin only
export async function GET() {
  await requireAnyRole(["admin"]);
  const users = await listUsers();
  // Strip password_hash before sending
  return NextResponse.json(users.map(({ password_hash: _, ...u }) => u));
}

// POST /api/users — admin sends invite
export async function POST(request: NextRequest) {
  const admin = await requireAnyRole(["admin"]);

  const body = await request.json();
  const { name, email, role, agentId, reviewerId } = body as {
    name: string;
    email: string;
    role: PortalRole;
    agentId?: string;
    reviewerId?: string;
  };

  if (!name || !email || !role) {
    return NextResponse.json({ error: "name, email, and role are required." }, { status: 400 });
  }

  const validRoles: PortalRole[] = ["admin", "reviewer", "agent"];
  if (!validRoles.includes(role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }

  const invite = await createInvite({
    name,
    email,
    role,
    agentId:    agentId    ?? null,
    reviewerId: reviewerId ?? null,
    invitedBy:  admin.id,
  });

  await sendInviteEmail({
    to:          invite.email,
    name:        invite.name,
    inviterName: admin.name,
    role:        invite.role,
    token:       invite.token,
  });

  return NextResponse.json({ success: true, invite: { id: invite.id, email: invite.email } }, { status: 201 });
}