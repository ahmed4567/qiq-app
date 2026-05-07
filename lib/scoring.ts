export const SCORE_MAP: Record<string, number> = {
  Excellent: 100,
  "Good With Enhancement": 70,
  "Need Improvement": 50,
  Poor: 0,
  Yes: 100,
  No: 0,
};

export const WEIGHTS = {
  ownership: 0.2,
  handover: 0.05,
  copyPaste: 0.05,
  correctEmail: 0.1,
  flow: 0.15,
  clientApproach: 0.15,
  supplierApproach: 0.1,
  freshdesk: 0.05,
  juniper: 0.15,
} as const;

export const CRITERIA = [
  { key: "ownership", label: "Ownership + Follow-up", weight: 20, type: "rating" },
  { key: "handover", label: "Handover", weight: 5, type: "yesno" },
  { key: "copyPaste", label: "Copy/Paste (no copy-paste)", weight: 5, type: "yesno" },
  { key: "correctEmail", label: "Correct Email", weight: 10, type: "yesno" },
  { key: "flow", label: "Flow (FCR)", weight: 15, type: "rating" },
  { key: "clientApproach", label: "Client Approach + Acknowledgment", weight: 15, type: "rating" },
  { key: "supplierApproach", label: "Supplier Approach", weight: 10, type: "rating" },
  { key: "freshdesk", label: "FreshDesk Updates", weight: 5, type: "rating" },
  { key: "juniper", label: "Juniper Updates", weight: 15, type: "rating" },
] as const;

export const CASE_TYPES = [
  "Confirmation",
  "Amendment",
  "Cancellation Waiver",
  "Name Amendment",
  "Date Amendment",
  "Complaint",
  "Relocation",
  "On-Spot",
  "Special Request",
  "Payment Issue",
  "Booking Failure",
  "Information",
  "Loading Error",
  "Mapping Error",
  "Adding Supplement",
] as const;

export type CriterionKey = (typeof CRITERIA)[number]["key"];
export type ScoreInput = Partial<Record<CriterionKey, string>>;
export type KpiTier = "excellent" | "good" | "fair" | "low" | "poor";

const KPI_BANDS: Array<{ minScore: number; tier: KpiTier; percent: number; label: string }> = [
  { minScore: 85.0000001, tier: "excellent", percent: 40, label: "40%" },
  { minScore: 75, tier: "good", percent: 25, label: "25%" },
  { minScore: 60, tier: "fair", percent: 10, label: "10%" },
  { minScore: 50, tier: "low", percent: 5, label: "5%" },
  { minScore: Number.NEGATIVE_INFINITY, tier: "poor", percent: 0, label: "0%" },
];

export function calculateScore(data: ScoreInput, autoFail = false): number {
  if (autoFail) {
    return 0;
  }

  let total = 0;

  for (const [criterionKey, weight] of Object.entries(WEIGHTS) as [CriterionKey, number][]) {
    const rawValue = data[criterionKey] ?? "";
    const numericScore = SCORE_MAP[rawValue] ?? 0;
    total += numericScore * weight;
  }

  return Math.round(total * 10) / 10;
}

export function kpiPercent(score: number): number {
  return getKpiBand(score).percent;
}

export function kpiTier(score: number): KpiTier {
  return getKpiBand(score).tier;
}

export function getKpiBand(score: number): { tier: KpiTier; percent: number; label: string } {
  const band = KPI_BANDS.find((candidateBand) => score >= candidateBand.minScore) ?? KPI_BANDS[KPI_BANDS.length - 1];
  return {
    tier: band.tier,
    percent: band.percent,
    label: band.label,
  };
}

export function tierColor(tier: string): string {
  const colors: Record<string, string> = {
    excellent: "#10B981",
    good: "#3B82F6",
    fair: "#F59E0B",
    low: "#F97316",
    poor: "#EF4444",
  };

  return colors[tier] ?? "#888888";
}
