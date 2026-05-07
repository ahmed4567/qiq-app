import "server-only";

import { cache } from "react";
import { agents as mockAgents, disputes as mockDisputes, evaluations as mockEvaluations, metrics as mockMetrics, monthlyAverageScore } from "./mock-data";
import type { AgentRecord, DisputeRecord, EvaluationRecord, PortalMetric } from "./sheets";
import { computeMetrics, getLivePortalData } from "./sheets";

function fallbackMetrics(): PortalMetric[] {
  return mockMetrics.map((metric) => ({ ...metric }));
}

function fallbackAgents(): AgentRecord[] {
  return mockAgents.map((agent) => ({ ...agent }));
}

function fallbackEvaluations(): EvaluationRecord[] {
  return mockEvaluations.map((evaluation) => ({ ...evaluation }));
}

function fallbackDisputes(): DisputeRecord[] {
  return mockDisputes.map((dispute) => ({ ...dispute }));
}

const getCachedLivePortalData = cache(async () => getLivePortalData());

export async function getOverviewData() {
  const live = await getCachedLivePortalData();

  if (!live) {
    const agents = fallbackAgents();
    const evaluations = fallbackEvaluations();
    const disputes = fallbackDisputes();

    return {
      metrics: fallbackMetrics(),
      topPerformers: agents.slice(0, 3),
      evaluations,
      agents,
      disputes,
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
  const liveData = await getCachedLivePortalData();

  if (liveData) {
    return { agents: liveData.agents, source: "live" };
  }

  return { agents: fallbackAgents(), source: "mock" };
}

export async function getAgentData(id: string): Promise<{ agent: AgentRecord; evaluations: EvaluationRecord[]; source: "live" | "mock" }> {
  const liveData = await getCachedLivePortalData();

  if (liveData) {
    const agent = liveData.agents.find((entry) => entry.id === id) ?? liveData.agents[0];
    const evaluations = liveData.evaluations.filter((entry) => entry.agentId === agent.id);
    return { agent, evaluations, source: "live" };
  }

  const fallbackAgentList = fallbackAgents();
  const fallbackEvaluationList = fallbackEvaluations();
  const agent = fallbackAgentList.find((entry) => entry.id === id) ?? fallbackAgentList[0];
  const evaluations = fallbackEvaluationList.filter((entry) => entry.agentId === agent.id);
  return { agent, evaluations, source: "mock" };
}

export async function getEvaluationsData(): Promise<{ evaluations: EvaluationRecord[]; source: "live" | "mock" }> {
  const liveData = await getCachedLivePortalData();

  if (liveData) {
    return { evaluations: liveData.evaluations, source: "live" };
  }

  return { evaluations: fallbackEvaluations(), source: "mock" };
}

export async function getDisputesData(): Promise<{ disputes: DisputeRecord[]; source: "live" | "mock" }> {
  const liveData = await getCachedLivePortalData();

  if (liveData) {
    return { disputes: liveData.disputes, source: "live" };
  }

  return { disputes: fallbackDisputes(), source: "mock" };
}
