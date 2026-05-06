import Link from "next/link";
import { AppShell } from "../../components/app-shell";
import { Pill, SectionHeader } from "../../components/ui";
import { getAgentsData } from "@/lib/portal-data";
import { requireSession } from "@/lib/session";

export default async function AgentsPage() {
  await requireSession();
  const data = await getAgentsData();

  return (
    <AppShell
      eyebrow="Agents"
      title="Agent performance roster"
      subtitle="A searchable-style roster for the quality team, rebuilt for Next.js."
    >
      {/* Roster: compact cards for scanning performance, volume, and disputes. */}
      <div className="glass-panel rounded-[28px] p-5 sm:p-7">
        <SectionHeader title="Roster" subtitle="Each card mirrors the old agent view template." />
        <div className="grid gap-4 lg:grid-cols-2">
          {data.agents.map((agent) => (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-[var(--brand-pink)]/40 hover:bg-white/10"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-[var(--brand-peach)]">{agent.id}</div>
                  <div className="mt-2 text-xl font-semibold text-white">{agent.name}</div>
                  <div className="mt-1 text-sm text-[var(--muted)]">
                    {agent.team} · {agent.role}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold text-white">{agent.score}</div>
                  <div className="text-xs text-[var(--brand-peach)]">{agent.trend}</div>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Pill tone="indigo">Reviews: {agent.reviews}</Pill>
                <Pill tone="orange">Disputes: {agent.disputes}</Pill>
                <Pill tone="cream">Last review: {agent.lastReview}</Pill>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
