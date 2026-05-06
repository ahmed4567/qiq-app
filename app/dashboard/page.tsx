import { AppShell } from "../../components/app-shell";
import { Pill, SectionHeader, StatCard } from "../../components/ui";
import { kpiPercent, kpiTier, tierColor } from "../../lib/scoring";
import { getDashboardData } from "@/lib/portal-data";
import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
  await requireSession();
  const dashboard = await getDashboardData();
  const tier = kpiTier(dashboard.monthlyAverageScore);
  const kpi = kpiPercent(dashboard.monthlyAverageScore);

  return (
    <AppShell
      eyebrow="Dashboard"
      title="Operations quality dashboard"
      subtitle="A command center for review health, KPI performance, and dispute handling."
    >
      {/* KPI summary tiles: quick health indicators for leadership and QA leads. */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboard.metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} delta={metric.delta} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          {/* KPI snapshot: monthly score and payout tier. */}
          <SectionHeader title="KPI snapshot" subtitle="The monthly average score drives the payout tier." />
          <div className="rounded-[26px] border border-white/10 bg-white/5 p-6">
            <div className="flex items-end justify-between gap-4">
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
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ["Excellent", "Top tier reviews"],
              ["Fair", "Needs coaching"],
              ["Poor", "Immediate follow-up"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-medium text-white">{label}</div>
                <div className="mt-2 text-sm text-[var(--muted)]">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          {/* Review health: queue status and backlog pressure. */}
          <SectionHeader title="Review health" subtitle="A quick view of where the team is spending time." />
          <div className="space-y-3">
            {[
              ["Published", String(dashboard.evaluations.length)],
              ["Pending", dashboard.source === "live" ? "Live" : "43"],
              ["Disputed", String(dashboard.disputes.length)],
              ["Auto fail", "Tracked in evaluations"],
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
          {/* Top agents: quick access to the highest performers. */}
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

        <div className="glass-panel rounded-[28px] p-7">
          {/* Recent reviews: the day-to-day feed for opening detailed scores. */}
          <SectionHeader title="Recent reviews" subtitle="What the evaluation feed should display." />
          <div className="space-y-3">
            {dashboard.evaluations.map((evaluation) => (
              <div key={evaluation.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <div className="font-medium text-white">{evaluation.agentName}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {evaluation.caseType} · {evaluation.reviewer}
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
