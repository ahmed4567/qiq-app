import { AppShell } from "../../components/app-shell";
import { Pill, SectionHeader } from "../../components/ui";
import { getDisputesData } from "@/lib/portal-data";
import { requireSession } from "@/lib/session";

export default async function DisputesPage() {
  await requireSession();
  const data = await getDisputesData();

  return (
    <AppShell
      eyebrow="Disputes"
      title="Dispute resolution queue"
      subtitle="A queue for contested evaluations, escalations, and review notes."
    >
      {/* Disputes queue: each card captures a challenge that needs a decision. */}
      <div className="glass-panel rounded-[28px] p-5 sm:p-7">
        <SectionHeader title="Open items" subtitle="These cards replace the disputes.html template." />
        <div className="space-y-4">
          {data.disputes.map((dispute) => (
            <div key={dispute.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-[var(--brand-peach)]">{dispute.id}</div>
                  <div className="mt-2 text-xl font-semibold text-white">{dispute.agentName}</div>
                  <div className="mt-1 text-sm text-[var(--muted)]">
                    Evaluation {dispute.evaluationId} · {dispute.updatedAt}
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{dispute.reason}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill tone="orange">{dispute.status}</Pill>
                  <Pill tone="pink">{dispute.priority}</Pill>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
