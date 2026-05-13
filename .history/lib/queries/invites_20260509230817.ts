import "server-only";
import crypto from "node:crypto";
import sql from "@/lib/db";
import type { PortalRole } from "@/lib/roles";

export type DbInvite = {
  id: string;
  name: string;
  email: string;
  role: PortalRole;
  token: string;
  agent_id: string | null;
  reviewer_id: string | null;
  invited_by: string;
  expires_at: Date;
  accepted_at: Date | null;
  created_at: Date;
};

const INVITE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

export async function createInvite({
  name,
  email,
  role,
  agentId,
  reviewerId,
  invitedBy,
}: {
  name: string;
  email: string;
  role: PortalRole;
  agentId?: string | null;
  reviewerId?: string | null;
  invitedBy: string;
}): Promise<DbInvite> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

  // Invalidate any prior pending invite for this email
  await sql`DELETE FROM invites WHERE email = ${email.toLowerCase().trim()} AND accepted_at IS NULL`;

  const rows = await sql<DbInvite[]>`
    INSERT INTO invites (name, email, role, token, agent_id, reviewer_id, invited_by, expires_at)
    VALUES (
      ${name},
      ${email.toLowerCase().trim()},
      ${role},
      ${token},
      ${agentId ?? null},
      ${reviewerId ?? null},
      ${invitedBy},
      ${expiresAt}
    )
    RETURNING *
  `;
  return rows[0];
}

export async function getInviteByToken(token: string): Promise<DbInvite | null> {
  const rows = await sql<DbInvite[]>`
    SELECT * FROM invites
    WHERE token = ${token}
      AND accepted_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function acceptInvite(token: string): Promise<void> {
  await sql`
    UPDATE invites SET accepted_at = NOW() WHERE token = ${token}
  `;
}

export async function listPendingInvites(): Promise<DbInvite[]> {
  return sql<DbInvite[]>`
    SELECT * FROM invites
    WHERE accepted_at IS NULL AND expires_at > NOW()
    ORDER BY created_at DESC
  `;
}