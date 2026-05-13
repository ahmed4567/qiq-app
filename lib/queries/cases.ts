import "server-only";
import sql from "@/lib/db";
import { calculateScore, kpiTier } from "@/lib/scoring";
import type { ScoreInput } from "@/lib/scoring";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CaseStatus = "open" | "in_review" | "closed";
export type DisputeStatus = "none" | "pending" | "accepted" | "rejected";

export type DbCase = {
  id: string;
  eval_id: string | null;
  booking_reference: string;
  case_type: string;
  month: string;

  agent_id: string;
  agent_email: string;
  reviewer_id: string | null;
  reviewer_name: string | null;
  created_by: string | null;

  status: CaseStatus;
  published: boolean;
  auto_fail: boolean;

  creation_date: Date | null;
  resolved_date: Date | null;
  created_at: Date;
  updated_at: Date;

  ownership_value: string | null;
  ownership_comment: string | null;
  handover_value: string | null;
  handover_comment: string | null;
  copy_paste_value: string | null;
  copy_paste_comment: string | null;
  correct_email_value: string | null;
  correct_email_comment: string | null;
  flow_value: string | null;
  flow_comment: string | null;
  client_approach_value: string | null;
  client_approach_comment: string | null;
  supplier_approach_value: string | null;
  supplier_approach_comment: string | null;
  freshdesk_value: string | null;
  freshdesk_comment: string | null;
  juniper_value: string | null;
  juniper_comment: string | null;

  total_score: number | null;
  kpi_tier: string | null;
  notes: string | null;

  dispute_status: DisputeStatus;
  dispute_comment: string | null;
  dispute_reply: string | null;
};

// ─── Score helpers ─────────────────────────────────────────────────────────────

/** Pull the ScoreInput record from a flat case payload. */
function extractScoreInput(scores: CaseScores): ScoreInput {
  return {
    ownership: scores.ownership_value ?? undefined,
    handover: scores.handover_value ?? undefined,
    copyPaste: scores.copy_paste_value ?? undefined,
    correctEmail: scores.correct_email_value ?? undefined,
    flow: scores.flow_value ?? undefined,
    clientApproach: scores.client_approach_value ?? undefined,
    supplierApproach: scores.supplier_approach_value ?? undefined,
    freshdesk: scores.freshdesk_value ?? undefined,
    juniper: scores.juniper_value ?? undefined,
  };
}

type CaseScores = Partial<{
  ownership_value: string;
  ownership_comment: string;
  handover_value: string;
  handover_comment: string;
  copy_paste_value: string;
  copy_paste_comment: string;
  correct_email_value: string;
  correct_email_comment: string;
  flow_value: string;
  flow_comment: string;
  client_approach_value: string;
  client_approach_comment: string;
  supplier_approach_value: string;
  supplier_approach_comment: string;
  freshdesk_value: string;
  freshdesk_comment: string;
  juniper_value: string;
  juniper_comment: string;
}>;

// ─── List / Filter ────────────────────────────────────────────────────────────

export type CaseFilters = {
  agentId?: string;
  reviewerId?: string;
  status?: CaseStatus;
  published?: boolean;
  month?: string;
  caseType?: string;
  disputeStatus?: DisputeStatus;
};

export async function listCases(filters: CaseFilters = {}): Promise<DbCase[]> {
  return sql<DbCase[]>`
    SELECT * FROM cases
    WHERE true
      ${filters.agentId    ? sql`AND agent_id = ${filters.agentId}`              : sql``}
      ${filters.reviewerId ? sql`AND reviewer_id = ${filters.reviewerId}::uuid`  : sql``}
      ${filters.status     ? sql`AND status = ${filters.status}`                 : sql``}
      ${filters.published  !== undefined ? sql`AND published = ${filters.published}` : sql``}
      ${filters.month      ? sql`AND month = ${filters.month}`                   : sql``}
      ${filters.caseType   ? sql`AND case_type = ${filters.caseType}`            : sql``}
      ${filters.disputeStatus ? sql`AND dispute_status = ${filters.disputeStatus}` : sql``}
    ORDER BY created_at DESC
  `;
}

// ─── Get one ─────────────────────────────────────────────────────────────────

export async function getCaseById(id: string): Promise<DbCase | null> {
  const rows = await sql<DbCase[]>`
    SELECT * FROM cases WHERE id = ${id}::uuid LIMIT 1
  `;
  return rows[0] ?? null;
}

// ─── Create ───────────────────────────────────────────────────────────────────

export type CreateCaseInput = {
  bookingReference: string;
  caseType: string;
  month: string;
  agentId: string;
  agentEmail: string;
  reviewerId?: string | null;
  reviewerName?: string | null;
  createdBy: string;
  creationDate?: string | null;
  resolvedDate?: string | null;
  autoFail?: boolean;
  notes?: string | null;
  scores?: CaseScores;
};

export async function createCase(input: CreateCaseInput): Promise<DbCase> {
  const scores = input.scores ?? {};
  const scoreInput = extractScoreInput(scores);
  const hasAnyScore = Object.values(scoreInput).some(Boolean);
  const total = hasAnyScore ? calculateScore(scoreInput, input.autoFail ?? false) : null;
  const tier = total !== null ? kpiTier(total) : null;

  const rows = await sql<DbCase[]>`
    INSERT INTO cases (
      booking_reference, case_type, month,
      agent_id, agent_email, reviewer_id, reviewer_name, created_by,
      creation_date, resolved_date, auto_fail, notes,
      ownership_value, ownership_comment,
      handover_value, handover_comment,
      copy_paste_value, copy_paste_comment,
      correct_email_value, correct_email_comment,
      flow_value, flow_comment,
      client_approach_value, client_approach_comment,
      supplier_approach_value, supplier_approach_comment,
      freshdesk_value, freshdesk_comment,
      juniper_value, juniper_comment,
      total_score, kpi_tier
    ) VALUES (
      ${input.bookingReference}, ${input.caseType}, ${input.month},
      ${input.agentId}, ${input.agentEmail},
      ${input.reviewerId ?? null}, ${input.reviewerName ?? null},
      ${input.createdBy},
      ${input.creationDate ?? null}, ${input.resolvedDate ?? null},
      ${input.autoFail ?? false}, ${input.notes ?? null},
      ${scores.ownership_value ?? null}, ${scores.ownership_comment ?? null},
      ${scores.handover_value ?? null}, ${scores.handover_comment ?? null},
      ${scores.copy_paste_value ?? null}, ${scores.copy_paste_comment ?? null},
      ${scores.correct_email_value ?? null}, ${scores.correct_email_comment ?? null},
      ${scores.flow_value ?? null}, ${scores.flow_comment ?? null},
      ${scores.client_approach_value ?? null}, ${scores.client_approach_comment ?? null},
      ${scores.supplier_approach_value ?? null}, ${scores.supplier_approach_comment ?? null},
      ${scores.freshdesk_value ?? null}, ${scores.freshdesk_comment ?? null},
      ${scores.juniper_value ?? null}, ${scores.juniper_comment ?? null},
      ${total}, ${tier}
    )
    RETURNING *
  `;
  return rows[0];
}

// ─── Update ───────────────────────────────────────────────────────────────────

export type UpdateCaseInput = Partial<CreateCaseInput> & { status?: CaseStatus };

export async function updateCase(id: string, input: UpdateCaseInput): Promise<DbCase | null> {
  const scores = input.scores ?? {};

  // Re-compute score only if any score fields are being updated
  const hasScoreUpdate = Object.keys(scores).length > 0;
  let totalScore: number | null | undefined = undefined;
  let kpiTierValue: string | null | undefined = undefined;

  if (hasScoreUpdate) {
    // Fetch current values and merge to get full score picture
    const current = await getCaseById(id);
    if (!current) return null;

    const merged: CaseScores = {
      ownership_value: scores.ownership_value ?? current.ownership_value ?? undefined,
      handover_value: scores.handover_value ?? current.handover_value ?? undefined,
      copy_paste_value: scores.copy_paste_value ?? current.copy_paste_value ?? undefined,
      correct_email_value: scores.correct_email_value ?? current.correct_email_value ?? undefined,
      flow_value: scores.flow_value ?? current.flow_value ?? undefined,
      client_approach_value: scores.client_approach_value ?? current.client_approach_value ?? undefined,
      supplier_approach_value: scores.supplier_approach_value ?? current.supplier_approach_value ?? undefined,
      freshdesk_value: scores.freshdesk_value ?? current.freshdesk_value ?? undefined,
      juniper_value: scores.juniper_value ?? current.juniper_value ?? undefined,
    };

    const autoFail = input.autoFail ?? current.auto_fail;
    const computed = calculateScore(extractScoreInput(merged), autoFail);
    totalScore = computed;
    kpiTierValue = kpiTier(computed);
  }

  const fields: Record<string, unknown> = {};

  if (input.bookingReference !== undefined) fields.booking_reference = input.bookingReference;
  if (input.caseType         !== undefined) fields.case_type         = input.caseType;
  if (input.month            !== undefined) fields.month             = input.month;
  if (input.agentId          !== undefined) fields.agent_id          = input.agentId;
  if (input.agentEmail       !== undefined) fields.agent_email       = input.agentEmail;
  if (input.reviewerId       !== undefined) fields.reviewer_id       = input.reviewerId;
  if (input.reviewerName     !== undefined) fields.reviewer_name     = input.reviewerName;
  if (input.creationDate     !== undefined) fields.creation_date     = input.creationDate;
  if (input.resolvedDate     !== undefined) fields.resolved_date     = input.resolvedDate;
  if (input.autoFail         !== undefined) fields.auto_fail         = input.autoFail;
  if (input.notes            !== undefined) fields.notes             = input.notes;
  if (input.status           !== undefined) fields.status            = input.status;

  if (scores.ownership_value         !== undefined) fields.ownership_value          = scores.ownership_value;
  if (scores.ownership_comment       !== undefined) fields.ownership_comment        = scores.ownership_comment;
  if (scores.handover_value          !== undefined) fields.handover_value           = scores.handover_value;
  if (scores.handover_comment        !== undefined) fields.handover_comment         = scores.handover_comment;
  if (scores.copy_paste_value        !== undefined) fields.copy_paste_value         = scores.copy_paste_value;
  if (scores.copy_paste_comment      !== undefined) fields.copy_paste_comment       = scores.copy_paste_comment;
  if (scores.correct_email_value     !== undefined) fields.correct_email_value      = scores.correct_email_value;
  if (scores.correct_email_comment   !== undefined) fields.correct_email_comment    = scores.correct_email_comment;
  if (scores.flow_value              !== undefined) fields.flow_value               = scores.flow_value;
  if (scores.flow_comment            !== undefined) fields.flow_comment             = scores.flow_comment;
  if (scores.client_approach_value   !== undefined) fields.client_approach_value    = scores.client_approach_value;
  if (scores.client_approach_comment !== undefined) fields.client_approach_comment  = scores.client_approach_comment;
  if (scores.supplier_approach_value   !== undefined) fields.supplier_approach_value   = scores.supplier_approach_value;
  if (scores.supplier_approach_comment !== undefined) fields.supplier_approach_comment = scores.supplier_approach_comment;
  if (scores.freshdesk_value         !== undefined) fields.freshdesk_value          = scores.freshdesk_value;
  if (scores.freshdesk_comment       !== undefined) fields.freshdesk_comment        = scores.freshdesk_comment;
  if (scores.juniper_value           !== undefined) fields.juniper_value            = scores.juniper_value;
  if (scores.juniper_comment         !== undefined) fields.juniper_comment          = scores.juniper_comment;

  if (totalScore    !== undefined) fields.total_score = totalScore;
  if (kpiTierValue  !== undefined) fields.kpi_tier    = kpiTierValue;

  if (Object.keys(fields).length === 0) return getCaseById(id);

  const rows = await sql<DbCase[]>`
    UPDATE cases
    SET ${sql(fields)}, updated_at = NOW()
    WHERE id = ${id}::uuid
    RETURNING *
  `;
  return rows[0] ?? null;
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteCase(id: string): Promise<boolean> {
  const result = await sql`DELETE FROM cases WHERE id = ${id}::uuid`;
  return (result.count ?? 0) > 0;
}

// ─── Publish ──────────────────────────────────────────────────────────────────

export async function publishCase(id: string, published: boolean): Promise<DbCase | null> {
  const rows = await sql<DbCase[]>`
    UPDATE cases
    SET published = ${published}, status = ${published ? "closed" : "in_review"}, updated_at = NOW()
    WHERE id = ${id}::uuid
    RETURNING *
  `;
  return rows[0] ?? null;
}

// ─── Dispute ─────────────────────────────────────────────────────────────────

export async function updateDispute(
  id: string,
  {
    disputeStatus,
    disputeComment,
    disputeReply,
  }: {
    disputeStatus: DisputeStatus;
    disputeComment?: string | null;
    disputeReply?: string | null;
  },
): Promise<DbCase | null> {
  const rows = await sql<DbCase[]>`
    UPDATE cases
    SET
      dispute_status  = ${disputeStatus},
      dispute_comment = COALESCE(${disputeComment ?? null}, dispute_comment),
      dispute_reply   = COALESCE(${disputeReply ?? null}, dispute_reply),
      updated_at      = NOW()
    WHERE id = ${id}::uuid
    RETURNING *
  `;
  return rows[0] ?? null;
}