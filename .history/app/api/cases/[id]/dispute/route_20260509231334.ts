import { NextRequest, NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/session";
import { getCaseById, updateDispute } from "@/lib/queries/cases";
import type { DisputeStatus } from "@/lib/queries/cases";

type Params = { params: Promise<{ id: string }> };

// PATCH /api/cases/[id]/dispute
//
// Agent raises a dispute:
//   { disputeStatus: "pending", disputeComment: "..." }
//
// Admin/reviewer responds:
//   { disputeStatus: "accepted" | "rejected", disputeReply: "..." }
export async function PATCH(request: NextRequest, { params }: Params) {
  const user = await requireAnyRole(["admin", "reviewer", "agent"]);
  const { id } = await params;

  const qcase = await getCaseById(id);
  if (!qcase) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  const body = (await request.json()) as {
    disputeStatus: DisputeStatus;
    disputeComment?: string;
    disputeReply?: string;
  };

  const { disputeStatus, disputeComment, disputeReply } = body;

  // Agents can only raise a dispute (pending) on their own published cases
  if (user.role === "agent") {
    if (qcase.agent_id !== user.agentId) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (disputeStatus !== "pending") {
      return NextResponse.json({ error: "Agents may only set status to pending." }, { status: 403 });
    }
  }

  // Reviewers can only respond to disputes on cases assigned to them
  if (user.role === "reviewer") {
    if (qcase.reviewer_id !== user.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }
    if (disputeStatus === "pending") {
      return NextResponse.json({ error: "Reviewers cannot raise disputes." }, { status: 403 });
    }
  }

  const updated = await updateDispute(id, { disputeStatus, disputeComment, disputeReply });
  return NextResponse.json(updated);
}