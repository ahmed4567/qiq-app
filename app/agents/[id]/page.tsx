import { PageFrame } from "../../../components/page-frame";
import { Pill, SectionHeader } from "../../../components/ui";
import { getAgentData } from "@/lib/portal-data";
import { redirectToRoleHome, requireAnyRole } from "@/lib/session";
import { getKpiBand } from "@/lib/scoring";

type AgentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AgentPage({ params }: AgentPageProps) {
  const user = await requireAnyRole(["admin", "reviewer", "agent"]);
  const { id } = await params;

  if (user.role === "agent" && user.agentId !== id) {
    redirectToRoleHome(user);
  }

  const data = await getAgentData(id);
  const agent = data.agent;
  const currentBand = getKpiBand(agent.score);

  return (
    <PageFrame
      role="reviewer"
      eyebrow="Agent detail"
      title={agent.name}
      subtitle={`${agent.team} � ${agent.role} � ${agent.id}`}
    >
      {/* Agent summary: gives the reviewer context before opening individual cases. */}
      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <div className="mb-4 text-sm leading-6 text-[var(--muted)]">
            This summary gives reviewers the context they need before opening a specific evaluation or dispute.
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill tone="indigo">Score {agent.score}</Pill>
            <Pill tone="pink">{agent.reviews} reviews</Pill>
            <Pill tone="orange">{agent.disputes} disputes</Pill>
            <Pill tone="pink">{agent.trend}</Pill>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
              ["Current tier", currentBand.tier],
              ["Last review", agent.lastReview],
              ["Main case", agent.caseType],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-[var(--muted)]">{label}</div>
                <div className="mt-2 font-medium text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          {/* Recent evaluations: history that supports coaching and dispute decisions. */}
          <SectionHeader title="Recent evaluations" subtitle="Used to back agent coaching and disputes." />
          <div className="space-y-3">
            {data.evaluations.map((evaluation) => (
              <div key={evaluation.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <div className="font-medium text-white">{evaluation.caseType}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {evaluation.reviewer} � {evaluation.date}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">{evaluation.score}</div>
                    <div className="text-xs text-[var(--brand-peach)]">{evaluation.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageFrame>
  );
}

