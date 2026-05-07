import "server-only";

import { google } from "googleapis";
import { getOptionalEnv, getRequiredEnv, hasSheetsConfig } from "./env";
import { getKpiBand } from "./scoring";

type RowMap = Record<string, string>;

function normalizeHeader(header: string): string {
  return header
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(" ")
    .map((part, index) => (index === 0 ? part.toLowerCase() : `${part.charAt(0).toUpperCase()}${part.slice(1)}`))
    .join("");
}

function rowsToObjects(values: string[][]): RowMap[] {
  if (!values.length) {
    return [];
  }

  const headers = values[0].map(normalizeHeader);

  return values.slice(1).map((row) =>
    headers.reduce<RowMap>((accumulator, header, index) => {
      accumulator[header] = row[index]?.toString().trim() ?? "";
      return accumulator;
    }, {}),
  );
}

function parseNumber(value: string | undefined, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseMaybeString(value: string | undefined, fallback = ""): string {
  return value && value.trim() ? value.trim() : fallback;
}

function getServiceAccountClient() {
  const json = getRequiredEnv("GOOGLE_SERVICE_ACCOUNT_JSON");
  const credentials = JSON.parse(json) as {
    client_email: string;
    private_key: string;
  };

  return new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function readSheetRows(range: string): Promise<RowMap[]> {
  const spreadsheetId = getRequiredEnv("GOOGLE_SHEETS_SPREADSHEET_ID");
  const auth = getServiceAccountClient();
  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  return rowsToObjects((response.data.values ?? []) as string[][]);
}

export type AgentRecord = {
  id: string;
  name: string;
  team: string;
  role: string;
  score: number;
  reviews: number;
  disputes: number;
  trend: string;
  lastReview: string;
  caseType: string;
};

export type EvaluationRecord = {
  id: string;
  agentId: string;
  agentName: string;
  caseType: string;
  reviewer: string;
  score: number;
  tier: string;
  kpi: number;
  date: string;
  status: string;
  autoFail: boolean;
};

export type DisputeRecord = {
  id: string;
  agentName: string;
  evaluationId: string;
  reason: string;
  status: string;
  priority: string;
  updatedAt: string;
};

export type PortalMetric = {
  label: string;
  value: string;
  delta: string;
};

function buildAgentsFromRows(rows: RowMap[]): AgentRecord[] {
  return rows.map((row, index) => ({
    id: parseMaybeString(row.id, `A-${1000 + index}`),
    name: parseMaybeString(row.name, "Unknown Agent"),
    team: parseMaybeString(row.team, "Operations"),
    role: parseMaybeString(row.role, "Quality Analyst"),
    score: parseNumber(row.score, 0),
    reviews: parseNumber(row.reviews, 0),
    disputes: parseNumber(row.disputes, 0),
    trend: parseMaybeString(row.trend, "+0.0"),
    lastReview: parseMaybeString(row.lastReview, "Not available"),
    caseType: parseMaybeString(row.caseType, "General"),
  }));
}

function buildEvaluationsFromRows(rows: RowMap[]): EvaluationRecord[] {
  return rows.map((row, index) => ({
    id: parseMaybeString(row.id, `EV-${22000 + index}`),
    agentId: parseMaybeString(row.agentId, "A-1000"),
    agentName: parseMaybeString(row.agentName, "Unknown Agent"),
    caseType: parseMaybeString(row.caseType, "General"),
    reviewer: parseMaybeString(row.reviewer, "Quality Desk"),
    score: parseNumber(row.score, 0),
    tier: parseMaybeString(row.tier, "fair"),
    kpi: parseNumber(row.kpi, 0),
    date: parseMaybeString(row.date, new Date().toISOString().slice(0, 10)),
    status: parseMaybeString(row.status, "Published"),
    autoFail: row.autofail?.toLowerCase() === "true" || row.autoFail?.toLowerCase() === "true",
  }));
}

function buildDisputesFromRows(rows: RowMap[]): DisputeRecord[] {
  return rows.map((row, index) => ({
    id: parseMaybeString(row.id, `DS-${300 + index}`),
    agentName: parseMaybeString(row.agentName, "Unknown Agent"),
    evaluationId: parseMaybeString(row.evaluationId, "EV-0000"),
    reason: parseMaybeString(row.reason, "Awaiting dispute details."),
    status: parseMaybeString(row.status, "Open"),
    priority: parseMaybeString(row.priority, "Medium"),
    updatedAt: parseMaybeString(row.updatedAt, "Today"),
  }));
}

export async function getLivePortalData() {
  if (!hasSheetsConfig()) {
    return null;
  }

  const [agentRows, evaluationRows, disputeRows] = await Promise.all([
    readSheetRows(getOptionalEnv("GOOGLE_SHEETS_AGENTS_RANGE") ?? "Agents!A1:J"),
    readSheetRows(getOptionalEnv("GOOGLE_SHEETS_EVALUATIONS_RANGE") ?? "Evaluations!A1:K"),
    readSheetRows(getOptionalEnv("GOOGLE_SHEETS_DISPUTES_RANGE") ?? "Disputes!A1:G"),
  ]);

  return {
    agents: buildAgentsFromRows(agentRows),
    evaluations: buildEvaluationsFromRows(evaluationRows),
    disputes: buildDisputesFromRows(disputeRows),
  };
}

export async function getLiveAgents(): Promise<AgentRecord[] | null> {
  const data = await getLivePortalData();
  return data?.agents ?? null;
}

export async function getLiveAgentById(id: string): Promise<AgentRecord | null> {
  const agents = await getLiveAgents();
  return agents?.find((agent) => agent.id === id) ?? null;
}

export async function getLiveEvaluations(): Promise<EvaluationRecord[] | null> {
  const data = await getLivePortalData();
  return data?.evaluations ?? null;
}

export async function getLiveDisputes(): Promise<DisputeRecord[] | null> {
  const data = await getLivePortalData();
  return data?.disputes ?? null;
}

export function computeMetrics(agents: AgentRecord[], evaluations: EvaluationRecord[], disputes: DisputeRecord[]): PortalMetric[] {
  const averageScore =
    evaluations.length > 0
      ? Math.round((evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / evaluations.length) * 10) / 10
      : 0;

  const activeDisputes = disputes.filter((dispute) => dispute.status.toLowerCase() !== "resolved").length;
  const pendingEvaluations = evaluations.filter((evaluation) => evaluation.status.toLowerCase() === "pending").length;
  const publishedReviews = evaluations.filter((evaluation) => evaluation.status.toLowerCase() !== "draft").length;
  const payoutBand = getKpiBand(averageScore).label;

  return [
    { label: "Published reviews", value: String(publishedReviews || agents.length || 0), delta: agents.length ? `${agents.length} agents` : "Live data" },
    { label: "Avg. quality score", value: averageScore.toFixed(1), delta: "From evaluations" },
    { label: "Active disputes", value: String(activeDisputes), delta: `${pendingEvaluations} pending` },
    { label: "KPI payout pool", value: payoutBand, delta: "Monthly band" },
  ];
}
