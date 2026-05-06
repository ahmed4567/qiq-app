import { calculateScore, kpiPercent, kpiTier } from "./scoring";

export const ratingOptions = ["Excellent", "Good With Enhancement", "Need Improvement", "Poor"] as const;
export const yesNoOptions = ["Yes", "No"] as const;

export const agents = [
  {
    id: "A-1042",
    name: "Mina Hassan",
    team: "Operations",
    role: "Senior Quality Analyst",
    score: 91.2,
    reviews: 84,
    disputes: 2,
    trend: "+4.8",
    lastReview: "Today, 09:20",
    caseType: "Confirmation",
  },
  {
    id: "A-1088",
    name: "Rania Mahmoud",
    team: "Operations",
    role: "Quality Analyst",
    score: 82.4,
    reviews: 77,
    disputes: 5,
    trend: "+1.9",
    lastReview: "Today, 08:45",
    caseType: "Complaint",
  },
  {
    id: "A-1103",
    name: "Youssef Adel",
    team: "Escalations",
    role: "Quality Coach",
    score: 68.6,
    reviews: 61,
    disputes: 4,
    trend: "-2.1",
    lastReview: "Yesterday, 17:10",
    caseType: "Payment Issue",
  },
  {
    id: "A-1124",
    name: "Salma Nasser",
    team: "Retention",
    role: "Quality Reviewer",
    score: 57.8,
    reviews: 49,
    disputes: 6,
    trend: "-4.0",
    lastReview: "Yesterday, 13:30",
    caseType: "Booking Failure",
  },
] as const;

export const evaluations = [
  {
    id: "EV-22019",
    agentId: "A-1042",
    agentName: "Mina Hassan",
    caseType: "Confirmation",
    reviewer: "Quality Desk",
    score: calculateScore({
      ownership: "Excellent",
      handover: "Yes",
      copyPaste: "Yes",
      correctEmail: "Yes",
      flow: "Excellent",
      clientApproach: "Excellent",
      supplierApproach: "Good With Enhancement",
      freshdesk: "Excellent",
      juniper: "Excellent",
    }),
    tier: kpiTier(96),
    kpi: kpiPercent(96),
    date: "2026-05-06",
    status: "Published",
    autoFail: false,
  },
  {
    id: "EV-22018",
    agentId: "A-1088",
    agentName: "Rania Mahmoud",
    caseType: "Complaint",
    reviewer: "Team Lead",
    score: calculateScore({
      ownership: "Good With Enhancement",
      handover: "Yes",
      copyPaste: "Yes",
      correctEmail: "Yes",
      flow: "Excellent",
      clientApproach: "Good With Enhancement",
      supplierApproach: "Good With Enhancement",
      freshdesk: "Excellent",
      juniper: "Need Improvement",
    }),
    tier: kpiTier(82),
    kpi: kpiPercent(82),
    date: "2026-05-05",
    status: "Published",
    autoFail: false,
  },
  {
    id: "EV-22017",
    agentId: "A-1103",
    agentName: "Youssef Adel",
    caseType: "Payment Issue",
    reviewer: "Ops QA",
    score: 0,
    tier: "poor",
    kpi: 0,
    date: "2026-05-05",
    status: "Auto Fail",
    autoFail: true,
  },
] as const;

export const disputes = [
  {
    id: "DS-301",
    agentName: "Rania Mahmoud",
    evaluationId: "EV-22018",
    reason: "Customer acknowledgement was missing in the original review.",
    status: "Open",
    priority: "High",
    updatedAt: "Today, 10:11",
  },
  {
    id: "DS-300",
    agentName: "Youssef Adel",
    evaluationId: "EV-22017",
    reason: "Auto-fail flagged for duplicate copy-paste in a time-sensitive case.",
    status: "Under Review",
    priority: "Medium",
    updatedAt: "Today, 09:02",
  },
] as const;

export const metrics = [
  { label: "Published reviews", value: "1,284", delta: "+12%" },
  { label: "Avg. quality score", value: "81.7", delta: "+3.4" },
  { label: "Active disputes", value: "18", delta: "-5" },
  { label: "KPI payout pool", value: "40%", delta: "Top tier" },
] as const;

export const topPerformers = agents.slice(0, 3);
export const monthlyAverageScore = 81.7;
