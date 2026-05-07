import Link from "next/link";
import { PageFrame } from "../components/page-frame";
import { Pill, SectionHeader, StatCard } from "../components/ui";
import { CASE_TYPES } from "../lib/scoring";
import { getOverviewData } from "@/lib/portal-data";

export default async function Home() {
  const overview = await getOverviewData();

  return (
    <PageFrame
      role="reviewer"
       title="QualityIQ portal map"
    >
      

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} delta={metric.delta} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
       

        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          {/* Scoring system: keep the shared rules in one place so all screens stay aligned. */}
          <SectionHeader title="Scoring system" subtitle="The part worth preserving from the original app." />
          <div className="space-y-3">
            {CASE_TYPES.slice(0, 6).map((caseType) => (
              <div key={caseType} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <span>{caseType}</span>
                <span className="text-[var(--muted)]">Case type</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Persona views" subtitle="Three working views for the main user groups." />
          <div className="space-y-3">
            {[
              ["/views/admin", "Admin workspace", "Permissions, sync, and portal controls."],
              ["/views/reviewer", "Reviewer workspace", "Queue, scoring, and coaching."],
              ["/views/agent", "Agent workspace", "Reviewed cases and feedback."],
            ].map(([href, label, detail]) => (
              <Link
                key={href}
                href={href}
                className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-[var(--brand-pink)]/40 hover:bg-white/10"
              >
                <div className="text-sm font-medium text-white">{label}</div>
                <div className="mt-1 text-sm text-[var(--muted)]">{detail}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Navigation model" subtitle="What the upgraded portal includes at every screen size." />
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Desktop sidebar",
              "Mobile drawer",
              "Role switcher",
              "Active page highlights",
              "Module chips",
              "Status footer",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
                {item}
              </div>
            ))}
          </div>
        </div>
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

