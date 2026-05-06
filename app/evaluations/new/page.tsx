import { AppShell } from "../../../components/app-shell";
import { EvaluationForm } from "../../../components/evaluation-form";
import { SectionHeader } from "../../../components/ui";
import { getAgentsData } from "@/lib/portal-data";
import { requireSession } from "@/lib/session";

export default async function NewEvaluationPage() {
  await requireSession();
  const agents = await getAgentsData();
  const agent = agents.agents[0];

  return (
    <AppShell
      eyebrow="Evaluations"
      title="New quality evaluation"
      subtitle="A live scoring form that mirrors the original scoring rules."
    >
      {/* Evaluation form: weighted score entry with instant feedback. */}
      <div className="glass-panel rounded-[28px] p-7">
        <SectionHeader title={`Scoring ${agent.name}`} subtitle="This is where the original eval_form.html should land in Next.js." />
        <EvaluationForm agentName={agent.name} />
      </div>
    </AppShell>
  );
}
