import Link from "next/link";
import { PageFrame } from "../../../components/page-frame";
import { EvaluationForm } from "../../../components/evaluation-form";
import { Pill, SectionHeader } from "../../../components/ui";
import { getReviewerViewData, getRoleWorkspaceCases } from "@/lib/workspace-view-data";
import { requireRole } from "@/lib/session";

export default async function ReviewerWorkspaceView() {
  const user = await requireRole("reviewer");
  const data = await getReviewerViewData();
  const workspaceCases = getRoleWorkspaceCases("reviewer", { reviewerId: user.reviewerId });

  return (
    <PageFrame
      role="reviewer"
      eyebrow="Persona view"
      title="Quality reviewer workspace"
      subtitle="A fast review queue for scoring agents, checking disputes, and publishing cases."
    >
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Review queue" subtitle="Open cases that need QA attention." />
          <div className="space-y-3">
            {workspaceCases.assigned.map((qualityCase) => (
              <div key={qualityCase.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium text-white">{qualityCase.title}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {qualityCase.ownerAgentName} · {qualityCase.category}
                    </div>
                    <div className="mt-2 text-sm text-[var(--muted)]">{qualityCase.summary}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone="pink">{qualityCase.status}</Pill>
                    <Pill tone="cream">{qualityCase.priority}</Pill>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      <section className="glass-panel rounded-[28px] p-5 sm:p-7">
        <SectionHeader title="Publish queue" subtitle="Reviewers can publish quality cases once checks are complete." />
        <div className="grid gap-3 md:grid-cols-1 xl:grid-cols-1 ">
          {workspaceCases.assigned.map((qualityCase) => (
            <div key={qualityCase.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-[var(--muted)]">Ready to publish
<div className="text-xs uppercase tracking-[0.3em] text-[var(--brand-peach)]">{qualityCase.id}</div>
              <div className="mt-2 text-lg font-semibold text-white">{qualityCase.title}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">Publish to {qualityCase.ownerAgentName}</div>



              </div>
              
              <button className="brand-gradient mt-4 rounded-2xl px-4 py-3 text-sm font-semibold text-white">
                Publish case
              </button>
            </div>
          ))}
        </div>
      </section>
      </section>


      <section className="glass-panel rounded-[28px] p-5 sm:p-7">
        <SectionHeader title="Reviewer insights" subtitle="This keeps the feedback loop visible while you work." />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {data.agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-[var(--brand-pink)]/40 hover:bg-white/10"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--brand-peach)]">{agent.id}</div>
              <div className="mt-2 text-lg font-semibold text-white">{agent.name}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">{agent.team}</div>
            </Link>
          ))}
        </div>
      </section>
    </PageFrame>
  );
}
