import "server-only";
import sql from "@/lib/db";
import type { PortalRole } from "@/lib/roles";

export type DbUser = {
  id: string;
  name: string;
  email: string;
  password_hash: string | null;
  role: PortalRole;
  agent_id: string | null;
  reviewer_id: string | null;
  active: boolean;
  invited_by: string | null;
  created_at: Date;
  updated_at: Date;
};

export async function getUserById(id: string): Promise<DbUser | null> {
  const rows = await sql<DbUser[]>`
    SELECT * FROM users WHERE id = ${id} AND active = true LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const rows = await sql<DbUser[]>`
    SELECT * FROM users
    WHERE email = ${email.toLowerCase().trim()} AND active = true
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function listUsers(): Promise<DbUser[]> {
  return sql<DbUser[]>`
    SELECT * FROM users ORDER BY created_at DESC
  `;
}

export async function createUser({
  name,
  email,
  passwordHash,
  role,
  agentId,
  reviewerId,
  invitedBy,
}: {
  name: string;
  email: string;
  passwordHash: string;
  role: PortalRole;
  agentId?: string | null;
  reviewerId?: string | null;
  invitedBy?: string | null;
}): Promise<DbUser> {
  const rows = await sql<DbUser[]>`
    INSERT INTO users (name, email, password_hash, role, agent_id, reviewer_id, invited_by)
    VALUES (
      ${name},
      ${email.toLowerCase().trim()},
      ${passwordHash},
      ${role},
      ${agentId ?? null},
      ${reviewerId ?? null},
      ${invitedBy ?? null}
    )
    RETURNING *
  `;
  return rows[0];
}

export async function updateUser(
  id: string,
  fields: Partial<{
    name: string;
    email: string;
    password_hash: string;
    role: PortalRole;
    agent_id: string;
    reviewer_id: string;
    active: boolean;
  }>,
): Promise<DbUser | null> {
  if (Object.keys(fields).length === 0) return getUserById(id);

  const rows = await sql<DbUser[]>`
    UPDATE users
    SET ${sql(fields)}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] ?? null;
}

export async function deactivateUser(id: string): Promise<void> {
  await sql`UPDATE users SET active = false, updated_at = NOW() WHERE id = ${id}`;
}