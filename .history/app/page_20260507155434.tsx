import { PageFrame } from "../components/page-frame";
import { SectionHeader, StatCard } from "../components/ui";
import { getOverviewData } from "@/lib/portal-data";

export default async function Home() {
  const overview = await getOverviewData();

  return (
    <PageFrame
      role="reviewer"
       title="QualityIQ dashboard"
    >
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} delta={metric.delta} />
        ))}
      </section>
      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          {/* Top performers: shows the roster cards used to spot strong agents and coaching needs. */}
          <SectionHeader title="Top performers" subtitle="Static mock data for the first migration pass." />
          <div className="space-y-3">
            {overview.topPerformers.map((agent) => (
              <div key={agent.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium text-white">{agent.name}</div>
                    <div className="text-sm text-[var(--muted)]">{agent.role}</div>
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
          {/* Recent evaluations: the daily queue that reviewers will open and inspect. */}
          <SectionHeader title="Recent evaluations" subtitle="How the review feed should feel in the Next.js build." />
          <div className="space-y-3">
            {overview.evaluations.map((evaluation) => (
              <div key={evaluation.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div>
                    <div className="font-medium text-white">{evaluation.agentName}</div>
                    <div className="text-sm text-[var(--muted)]">
                      {evaluation.caseType} � {evaluation.reviewer}
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

