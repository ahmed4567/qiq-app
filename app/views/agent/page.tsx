import { PageFrame } from "../../../components/page-frame";
import { Pill, SectionHeader } from "../../../components/ui";
import { getAgentViewData, getRoleWorkspaceCases } from "@/lib/workspace-view-data";
import { requireRole } from "@/lib/session";

export default async function AgentWorkspaceView() {
  const user = await requireRole("agent");
  const data = await getAgentViewData(user.agentId ?? "A-1042");
  const workspaceCases = getRoleWorkspaceCases("agent", { agentId: user.agentId ?? data.agent.id });

  return (
    <PageFrame
      role="agent"
      eyebrow="Persona view"
      title="Agent self-service workspace"
      subtitle="A personal quality view for an agent to review published cases, feedback, and disputes."
    >
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title={data.agent.name} subtitle={`${data.agent.team} · ${data.agent.role} · ${data.agent.id}`} />
          <div className="flex flex-wrap gap-2">
            <Pill tone="indigo">Score {data.agent.score}</Pill>
            <Pill tone="pink">{data.agent.reviews} reviews</Pill>
            <Pill tone="orange">{data.agent.disputes} disputes</Pill>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-[var(--muted)]">Current tier</div>
              <div className="mt-2 font-medium text-white">Reviewed and visible</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-[var(--muted)]">Last review</div>
              <div className="mt-2 font-medium text-white">{data.agent.lastReview}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-[var(--muted)]">Published cases</div>
              <div className="mt-2 font-medium text-white">{workspaceCases.agentCases.length}</div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Reviewed cases" subtitle="What the agent can inspect without admin access." />
          <div className="space-y-3">
            {workspaceCases.agentCases.map((qualityCase) => (
              <div key={qualityCase.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium text-white">{qualityCase.title}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {qualityCase.assignedReviewer} · {qualityCase.publishedAt}
                    </div>
                    <div className="mt-2 text-sm text-[var(--muted)]">{qualityCase.summary}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone="pink">{qualityCase.status}</Pill>
                    <Pill tone="cream">{qualityCase.score}</Pill>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Dispute history" subtitle="Agent can challenge reviewed quality cases." />
          <div className="space-y-3">
            {workspaceCases.agentCases
              .filter((qualityCase) => qualityCase.status === "Disputed")
              .map((qualityCase) => (
                <div key={qualityCase.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-lg font-semibold text-white">{qualityCase.title}</div>
                  <div className="mt-1 text-sm text-[var(--muted)]">{qualityCase.summary}</div>
                </div>
              ))}
            {workspaceCases.agentCases.every((qualityCase) => qualityCase.status !== "Disputed") ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
                No current disputes. Reviewed cases are published and visible here.
              </div>
            ) : null}
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Overall score" subtitle="The agent sees their summary KPI and recent quality state." />
          <div className="rounded-[26px] border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-[var(--muted)]">Average score</div>
            <div className="mt-2 text-5xl font-semibold text-white">{data.agent.score}</div>
            <div className="mt-3 text-sm text-[var(--muted)]">
              Published cases are shared here after reviewer sign-off.
            </div>
          </div>
        </div>
      </section>
    </PageFrame>
  );
}
