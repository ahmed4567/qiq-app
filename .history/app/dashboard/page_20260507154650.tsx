import { PageFrame } from "../../components/page-frame";
import { Pill, SectionHeader, StatCard } from "../../components/ui";
import { kpiPercent, kpiTier, tierColor } from "../../lib/scoring";
import { getDashboardData } from "@/lib/portal-data";
import { getRoleWorkspaceCases } from "@/lib/workspace-view-data";
import { requireSession } from "@/lib/session";

const roleTitles = {
  admin: "Admin dashboard",
  reviewer: "Reviewer dashboard",
  agent: "Agent dashboard",
} as const;

export default async function DashboardPage() {
  const user = await requireSession();
  const dashboard = await getDashboardData();
  const workspaceCases = getRoleWorkspaceCases(user.role, {
    agentId: user.agentId,
    reviewerId: user.reviewerId,
  });
  const tier = kpiTier(dashboard.monthlyAverageScore);
  const kpi = kpiPercent(dashboard.monthlyAverageScore);

  return (
    <PageFrame
      role={user.role}
      eyebrow={roleTitles[user.role]}
      title="Operations quality dashboard"
     >
  \

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Workspace summary" subtitle="This changes based on the signed-in role." />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-[var(--muted)]">Signed in as</div>
              <div className="mt-2 text-lg font-semibold text-white">{user.name}</div>
              <div className="mt-1 text-sm text-[var(--muted)]">{user.role}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-[var(--muted)]">Assigned cases</div>
              <div className="mt-2 text-3xl font-semibold text-white">{workspaceCases.assigned.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-[var(--muted)]">Published cases</div>
              <div className="mt-2 text-3xl font-semibold text-white">{workspaceCases.published.length}</div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {user.role === "admin" ? (
              <>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
                  Admins can create cases under any agent and assign them to reviewers.
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
                  This view helps route new work before it reaches the reviewer queue.
                </div>
              </>
            ) : null}

            {user.role === "reviewer" ? (
              <>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
                  Reviewers work through assigned cases and publish them after QA checks.
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
                  Published cases flow automatically to the owning agent dashboard.
                </div>
              </>
            ) : null}

            {user.role === "agent" ? (
              <>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
                  Agents see published cases, dispute items, and their overall quality score.
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
                  Only cases owned by you appear here after reviewer sign-off.
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Review health" subtitle="A quick view of where the team is spending time." />
          <div className="space-y-3">
            {[
              ["Published", String(workspaceCases.published.length)],
              ["Pending", String(workspaceCases.assigned.length)],
              ["Disputed", String(workspaceCases.all.filter((entry) => entry.status === "Disputed").length)],
              ["Overall KPI", `${kpi}%`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm text-[var(--muted)]">{label}</span>
                <span className="font-medium text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Top agents" subtitle="A preview of the agent list page." />
          <div className="space-y-3">
            {dashboard.topPerformers.map((agent) => (
              <div key={agent.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <div className="font-medium text-white">{agent.name}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {agent.team} · {agent.role}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">{agent.score}</div>
                    <div className="text-xs text-[var(--brand-peach)]">{agent.trend}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Recent reviews" subtitle="What the evaluation feed should display." />
          <div className="space-y-3">
            {workspaceCases.published.slice(0, 4).map((qualityCase) => (
              <div key={qualityCase.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <div className="font-medium text-white">{qualityCase.title}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {qualityCase.ownerAgentName} · {qualityCase.assignedReviewer}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">{qualityCase.score}</div>
                    <div className="text-xs text-[var(--brand-peach)]">{qualityCase.status}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="KPI snapshot" subtitle="The monthly average score drives the payout tier." />
          <div className="rounded-[26px] border border-white/10 bg-white/5 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm text-[var(--muted)]">Average score</div>
                <div className="mt-2 text-5xl font-semibold text-white">{dashboard.monthlyAverageScore}</div>
              </div>
              <div className="text-right">
                <Pill tone="indigo">Tier: {tier}</Pill>
                <div className="mt-3 text-3xl font-semibold" style={{ color: tierColor(tier) }}>
                  {kpi}%
                </div>
                <div className="text-sm text-[var(--muted)]">KPI bonus band</div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Current work" subtitle="The active queue depends on the logged-in role." />
          <div className="space-y-3">
            {workspaceCases.myQueue.map((qualityCase) => (
              <div key={qualityCase.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium text-white">{qualityCase.title}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {qualityCase.ownerAgentName} · {qualityCase.category}
                    </div>
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
      </section>
    </PageFrame>
  );
}
