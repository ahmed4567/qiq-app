import "server-only";

import { agents as mockAgents, disputes as mockDisputes, evaluations as mockEvaluations, metrics as mockMetrics, monthlyAverageScore } from "./mock-data";
import type { AgentRecord, DisputeRecord, EvaluationRecord, PortalMetric } from "./sheets";
import { computeMetrics, getLiveAgents, getLiveDisputes, getLiveEvaluations, getLivePortalData } from "./sheets";

function fallbackMetrics(): PortalMetric[] {
  return mockMetrics as unknown as PortalMetric[];
}

export async function getOverviewData() {
  const live = await getLivePortalData();

  if (!live) {
    return {
      metrics: fallbackMetrics(),
      topPerformers: mockAgents.slice(0, 3),
      evaluations: mockEvaluations,
      agents: mockAgents,
      disputes: mockDisputes,
      monthlyAverageScore,
      source: "mock" as const,
    };
  }

  const metrics = computeMetrics(live.agents, live.evaluations, live.disputes);
  const topPerformers = [...live.agents].sort((left, right) => right.score - left.score).slice(0, 3);
  const recentEvaluations = [...live.evaluations].sort((left, right) => right.date.localeCompare(left.date)).slice(0, 4);

  return {
    metrics,
    topPerformers,
    evaluations: recentEvaluations,
    agents: live.agents,
    disputes: live.disputes,
    monthlyAverageScore:
      live.evaluations.length > 0
        ? Math.round((live.evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / live.evaluations.length) * 10) / 10
        : monthlyAverageScore,
    source: "live" as const,
  };
}

export async function getDashboardData() {
  return getOverviewData();
}

export async function getAgentsData(): Promise<{ agents: AgentRecord[]; source: "live" | "mock" }> {
  const liveAgents = await getLiveAgents();

  if (liveAgents) {
    return { agents: liveAgents, source: "live" };
  }

  return { agents: mockAgents as unknown as AgentRecord[], source: "mock" };
}

export async function getAgentData(id: string): Promise<{ agent: AgentRecord; evaluations: EvaluationRecord[]; source: "live" | "mock" }> {
  const liveData = await getLivePortalData();

  if (liveData) {
    const agent = liveData.agents.find((entry) => entry.id === id) ?? liveData.agents[0];
    const evaluations = liveData.evaluations.filter((entry) => entry.agentId === agent.id);
    return { agent, evaluations, source: "live" };
  }

  const agent = (mockAgents as unknown as AgentRecord[]).find((entry) => entry.id === id) ?? (mockAgents as unknown as AgentRecord[])[0];
  const evaluations = (mockEvaluations as unknown as EvaluationRecord[]).filter((entry) => entry.agentId === agent.id);
  return { agent, evaluations, source: "mock" };
}

export async function getEvaluationsData(): Promise<{ evaluations: EvaluationRecord[]; source: "live" | "mock" }> {
  const liveEvaluations = await getLiveEvaluations();

  if (liveEvaluations) {
    return { evaluations: liveEvaluations, source: "live" };
  }

  return { evaluations: mockEvaluations as unknown as EvaluationRecord[], source: "mock" };
}

export async function getDisputesData(): Promise<{ disputes: DisputeRecord[]; source: "live" | "mock" }> {
  const liveDisputes = await getLiveDisputes();

  if (liveDisputes) {
    return { disputes: liveDisputes, source: "live" };
  }

  return { disputes: mockDisputes as unknown as DisputeRecord[], source: "mock" };
}
