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
      eyebrow="Migration overview"
      title="QualityIQ portal map"
      subtitle="This Next.js app replaces the FastAPI/Jinja starter with a portal shell for quality monitoring, evaluation scoring, and Google Sheets backed workflows."
    >
      {/* Landing summary: gives new users a quick orientation and explains the rebuild path. */}
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <Pill tone="indigo">Next.js App Router</Pill>
            <Pill tone="pink">Google Sheets ready</Pill>
            <Pill tone="orange">Operations quality</Pill>
          </div>
          <h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-white">
            Rebuild the portal as a clean, typed dashboard with real navigation and a scoring engine.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            The FastAPI repo has almost no implemented UI, so the right move is to recreate the product intent:
            login, dashboard, agents, evaluations, disputes, and admin controls.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard" className="brand-gradient rounded-2xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95">
              Open dashboard
            </Link>
            <Link href="/evaluations/new" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Start evaluation
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          {/* Rebuild focus: explains what to rebuild first and why the scoring logic stays centralized. */}
          <div className="text-xs uppercase tracking-[0.35em] text-[var(--brand-peach)]">Rebuild focus</div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            This is the migration compass: it explains what to rebuild first and why the scoring logic should stay
            centralized.
          </p>
          <ul className="mt-5 space-y-3 text-sm text-[var(--muted)]">
            <li>Port scoring logic from `sheets/scoring.py` to `lib/scoring.ts`.</li>
            <li>Render the portal as dashboard-first screens instead of empty templates.</li>
            <li>Use route pages for login, agents, evaluations, disputes, and admin.</li>
            <li>Plug in Google Sheets through server actions or route handlers later.</li>
          </ul>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} delta={metric.delta} />
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          {/* Route map: each tile points to a working page in the Next.js build. */}
          <SectionHeader title="Route map" subtitle="These pages mirror the FastAPI templates and routes." />
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ["/login", "Login / auth"],
              ["/dashboard", "Executive dashboard"],
              ["/agents", "Agent list"],
              ["/agents/A-1042", "Agent detail"],
              ["/evaluations/new", "New evaluation"],
              ["/disputes", "Disputes queue"],
              ["/admin", "Admin tools"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white transition hover:border-[var(--brand-pink)]/40 hover:bg-white/10"
              >
                <div className="text-[var(--muted)]">{href}</div>
                <div className="mt-2 font-medium">{label}</div>
              </Link>
            ))}
          </div>
        </div>

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

