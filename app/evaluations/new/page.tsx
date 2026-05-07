import { PageFrame } from "../../../components/page-frame";
import { EvaluationForm } from "../../../components/evaluation-form";
import { SectionHeader } from "../../../components/ui";
import { getAgentsData } from "@/lib/portal-data";
import { requireRole } from "@/lib/session";

export default async function NewEvaluationPage() {
  await requireRole("reviewer");
  const agents = await getAgentsData();
  const agent = agents.agents[0];

  return (
    <PageFrame
      role="reviewer"
      eyebrow="Evaluations"
      title="New quality evaluation"
      subtitle="A live scoring form that mirrors the original scoring rules."
    >
      {/* Evaluation form: weighted score entry with instant feedback. */}
      <div className="glass-panel rounded-[28px] p-5 sm:p-7">
        <SectionHeader title={`Scoring ${agent.name}`} subtitle="This is where the original eval_form.html should land in Next.js." />
        <EvaluationForm agentName={agent.name} />
      </div>
    </PageFrame>
  );
}

