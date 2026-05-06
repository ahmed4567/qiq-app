import { AppShell } from "../../../components/app-shell";
import { Pill, SectionHeader } from "../../../components/ui";
import { getAgentData } from "@/lib/portal-data";
import { requireSession } from "@/lib/session";

type AgentPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AgentPage({ params }: AgentPageProps) {
  await requireSession();
  const { id } = await params;
  const data = await getAgentData(id);
  const agent = data.agent;

  return (
    <AppShell
      eyebrow="Agent detail"
      title={agent.name}
      subtitle={`${agent.team} · ${agent.role} · ${agent.id}`}
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
              ["Current tier", agent.score >= 85 ? "excellent" : agent.score >= 75 ? "good" : "fair"],
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
                      {evaluation.reviewer} · {evaluation.date}
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
    </AppShell>
  );
}
