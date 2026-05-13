import { NextRequest, NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/session";
import { getCaseById, updateCase, deleteCase } from "@/lib/queries/cases";
import type { UpdateCaseInput } from "@/lib/queries/cases";

type Params = { params: Promise<{ id: string }> };

// GET /api/cases/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const user = await requireAnyRole(["admin", "reviewer", "agent"]);
  const { id } = await params;

  const qcase = await getCaseById(id);
  if (!qcase) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  // Agents can only view their own published cases
  if (user.role === "agent" && (qcase.agent_id !== user.agentId || !qcase.published)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json(qcase);
}

// PATCH /api/cases/[id]
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await requireAnyRole(["admin", "reviewer"]);
  const { id } = await params;

  const qcase = await getCaseById(id);
  if (!qcase) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  // Reviewers can only update cases assigned to them
  if (user.role === "reviewer" && qcase.reviewer_id !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await request.json() as UpdateCaseInput;
  const updated = await updateCase(id, body);

  return NextResponse.json(updated);
}

// DELETE /api/cases/[id] — admin only
export async function DELETE(_req: NextRequest, { params }: Params) {
  await requireAnyRole(["admin"]);
  const { id } = await params;

  const deleted = await deleteCase(id);
  if (!deleted) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  return NextResponse.json({ success: true });
}