import { PageFrame } from "../../../components/page-frame";
import { Pill, SectionHeader, StatCard } from "../../../components/ui";
import { getAdminViewData, getRoleWorkspaceCases } from "@/lib/workspace-view-data";
import { requireRole } from "@/lib/session";
import Link from "next/link";

export default async function AdminWorkspaceView() {
  await requireRole("admin");
  const data = await getAdminViewData();
  const workspaceCases = getRoleWorkspaceCases("admin");

  return (
    <PageFrame
      role="admin"
      eyebrow="Persona view"
      title="Admin workspace"
      subtitle="A supervisor view for permissions, sync health, and operations-wide quality decisions."
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.dashboard.metrics.map((metric) => (
          <StatCard key={metric.label} label={metric.label} value={metric.value} delta={metric.delta} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Admin controls" subtitle="High-trust actions for portal owners and QA leads." />
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Manage reviewers",
              "Refresh Sheets sync",
              "Adjust score weights",
              "Archive old evaluations",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-white">{item}</span>
                  <Pill tone="indigo">Ready</Pill>
                </div>
              </div>
            ))}
          </div>
        </div>

       
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Create cases" subtitle="Admin can create a quality case under an agent as the owner." />
          <div className="space-y-3">
            {[
              "Attach a quality case to a specific agent record",
              "Set the category, priority, and review deadline",
              "Assign the case to a quality reviewer queue",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[var(--muted)]">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-[var(--muted)]">Assigned cases</div>
              <div className="mt-2 text-3xl font-semibold text-white">{workspaceCases.assigned.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-[var(--muted)]">Published cases</div>
              <div className="mt-2 text-3xl font-semibold text-white">{workspaceCases.published.length}</div>
            </div>
          </div>
            <section className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-4">
          <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4">
            <div className="text-center text-sm font-semibold text-white">Let&apos;s start!</div>
            <p className="mt-2 text-center text-sm leading-6 text-[var(--muted)]">
              Creating or adding a new quality case is one tap away.
            </p>
            <Link
              href="/evaluations/new"
              className="brand-gradient mt-4 block rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-95"
            >
              + Add New Case
            </Link>
          </div>
        </section>
        </div>
 {/** Add new case sec */}
      

        <div className="glass-panel rounded-[28px] p-5 sm:p-7">
          <SectionHeader title="Assignment board" subtitle="Admins can route cases to reviewers before publishing." />
          <div className="space-y-3">
            {workspaceCases.all.map((qualityCase) => (
              <div key={qualityCase.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-[var(--brand-peach)]">{qualityCase.id}</div>
                    <div className="mt-2 text-lg font-semibold text-white">{qualityCase.title}</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">
                      Owner {qualityCase.ownerAgentName} · Reviewer {qualityCase.assignedReviewer}
                    </div>
                    <div className="mt-2 text-sm text-[var(--muted)]">{qualityCase.summary}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone="indigo">{qualityCase.status}</Pill>
                    <Pill tone="pink">{qualityCase.priority}</Pill>
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
