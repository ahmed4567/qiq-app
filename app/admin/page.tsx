import { AppShell } from "../../components/app-shell";
import { Pill, SectionHeader } from "../../components/ui";
import { requireSession } from "@/lib/session";

export default async function AdminPage() {
  await requireSession();

  return (
    <AppShell
      eyebrow="Admin"
      title="Portal administration"
      subtitle="Settings, reviewer controls, sync status, and role management."
    >
      {/* Admin tools: access, sync, and workflow control for supervisors. */}
      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[28px] p-7">
          <SectionHeader title="Controls" subtitle="Simple admin cards for the initial migration pass." />
          <div className="space-y-3">
            {["Manage reviewers", "Refresh Sheets sync", "Adjust score weights", "Archive old evaluations"].map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-sm text-white">{item}</span>
                <Pill tone="indigo">Ready</Pill>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-7">
          <SectionHeader title="Configuration" subtitle="Where the FastAPI environment variables and auth config will land." />
          <div className="space-y-3 text-sm text-[var(--muted)]">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Google Sheets service account credentials</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Session/auth secret and cookie policy</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Reviewer role matrix and route permissions</div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Evaluation weight overrides and KPI bands</div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
