// app/api/cases/route.ts
// Cases collection route — GET lists cases with filters, POST creates a new case. Role-gated.

import { NextRequest, NextResponse } from "next/server";
import { requireAnyRole } from "@/lib/session";
import { listCases, createCase } from "@/lib/queries/cases";
import type { CaseFilters, CaseStatus, DisputeStatus } from "@/lib/queries/cases";
import type { CreateCaseInput } from "@/lib/queries/cases";

// GET /api/cases?status=open&month=2026-04&agentId=...&reviewerId=...
export async function GET(request: NextRequest) {
  const user = await requireAnyRole(["admin", "reviewer", "agent"]);
  const { searchParams } = new URL(request.url);

  const filters: CaseFilters = {};

  // Agents can only see their own cases
  if (user.role === "agent") {
    filters.agentId = user.agentId;
    // Agents only see published cases
    filters.published = true;
  } else {
    if (searchParams.get("agentId"))    filters.agentId    = searchParams.get("agentId")!;
    if (searchParams.get("reviewerId")) filters.reviewerId = searchParams.get("reviewerId")!;
    if (searchParams.get("published"))  filters.published  = searchParams.get("published") === "true";
  }

  if (searchParams.get("status"))        filters.status        = searchParams.get("status")! as CaseStatus;
  if (searchParams.get("month"))         filters.month         = searchParams.get("month")!;
  if (searchParams.get("caseType"))      filters.caseType      = searchParams.get("caseType")!;
  if (searchParams.get("disputeStatus")) filters.disputeStatus = searchParams.get("disputeStatus")! as DisputeStatus;

  const cases = await listCases(filters);
  return NextResponse.json(cases);
}

// POST /api/cases — admin and reviewer can create
export async function POST(request: NextRequest) {
  const user = await requireAnyRole(["admin", "reviewer"]);

  const body = await request.json() as CreateCaseInput & { autoFail?: boolean };

  if (!body.bookingReference || !body.caseType || !body.month || !body.agentId || !body.agentEmail) {
    return NextResponse.json(
      { error: "bookingReference, caseType, month, agentId, and agentEmail are required." },
      { status: 400 },
    );
  }

  const newCase = await createCase({
    ...body,
    createdBy:    user.id,
    reviewerId:   body.reviewerId   ?? user.role === "reviewer" ? user.reviewerId : null,
    reviewerName: body.reviewerName ?? user.role === "reviewer" ? user.name       : null,
  });

  return NextResponse.json(newCase, { status: 201 });
}