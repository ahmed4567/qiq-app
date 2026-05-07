import { getAgentData, getAgentsData, getDashboardData } from "@/lib/portal-data";
import { qualityCases as mockQualityCases } from "./mock-data";
import type { PortalRole } from "./roles";

type QualityCase = {
  id: string;
  title: string;
  ownerAgentId: string;
  ownerAgentName: string;
  assignedReviewer: string;
  assignedReviewerId: string;
  status: "Assigned" | "In Review" | "Published" | "Disputed";
  category: string;
  priority: "High" | "Medium" | "Low";
  score: number;
  publishedAt: string;
  summary: string;
};

const qualityCases: QualityCase[] = mockQualityCases.map((qualityCase) => ({ ...qualityCase }));

export async function getAdminViewData() {
  const dashboard = await getDashboardData();
  return {
    dashboard,
    policies: [
      "Reviewer access gates are enforced on the server.",
      "Sheets sync stays available for admins and QA leads.",
      "KPI bands remain shared across all views.",
      "Audit history is preserved for disputes and coaching.",
    ],
  };
}

export async function getReviewerViewData() {
  const dashboard = await getDashboardData();
  const agents = await getAgentsData();
  return {
    dashboard,
    agents: agents.agents.slice(0, 4),
    queue: dashboard.evaluations.slice(0, 4),
  };
}

export async function getAgentViewData(agentId = "A-1042") {
  const agentData = await getAgentData(agentId);
  const dashboard = await getDashboardData();
  return {
    dashboard,
    agent: agentData.agent,
    evaluations: agentData.evaluations,
  };
}

export function getRoleWorkspaceCases(
  role: PortalRole,
  context: { agentId?: string; reviewerId?: string } = {},
) {
  const agentId = context.agentId ?? "A-1042";
  const reviewerId = context.reviewerId ?? "R-001";
  const published = qualityCases.filter((qualityCase) => qualityCase.status === "Published" || qualityCase.status === "Disputed");
  const assigned = qualityCases.filter((qualityCase) => qualityCase.status === "Assigned" || qualityCase.status === "In Review");
  const agentCases = published.filter((qualityCase) => qualityCase.ownerAgentId === agentId);
  const reviewerCases = assigned.filter((qualityCase) => qualityCase.assignedReviewerId === reviewerId);

  return {
    all: qualityCases,
    published,
    assigned,
    agentCases,
    myQueue:
      role === "admin"
        ? assigned
        : role === "reviewer"
          ? reviewerCases
          : agentCases,
  };
}
