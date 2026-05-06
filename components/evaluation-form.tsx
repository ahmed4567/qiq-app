"use client";

import { useMemo, useState } from "react";
import { calculateScore, type CriterionKey, kpiPercent, kpiTier, CRITERIA } from "../lib/scoring";
import { ratingOptions, yesNoOptions } from "../lib/mock-data";

type EvaluationFormProps = {
  agentName: string;
};

type Answers = Partial<Record<CriterionKey, string>>;

const initialAnswers: Answers = {
  ownership: "Excellent",
  handover: "Yes",
  copyPaste: "Yes",
  correctEmail: "Yes",
  flow: "Excellent",
  clientApproach: "Excellent",
  supplierApproach: "Good With Enhancement",
  freshdesk: "Excellent",
  juniper: "Excellent",
};

export function EvaluationForm({ agentName }: EvaluationFormProps) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [autoFail, setAutoFail] = useState(false);

  const score = useMemo(() => calculateScore(answers, autoFail), [answers, autoFail]);
  const tier = kpiTier(score);
  const kpi = kpiPercent(score);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
      <section className="glass-panel rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--brand-peach)]">Evaluation form</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Score {agentName}</h2>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
            <input
              checked={autoFail}
              onChange={(event) => setAutoFail(event.target.checked)}
              className="h-4 w-4 accent-[var(--brand-pink)]"
              type="checkbox"
            />
            Auto fail
          </label>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {CRITERIA.map((criterion) => {
            const options = criterion.type === "yesno" ? yesNoOptions : ratingOptions;

            return (
              <label key={criterion.key as string} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-medium text-white">{criterion.label}</div>
                    <div className="mt-1 text-xs text-[var(--muted)]">{criterion.weight}% weight</div>
                  </div>
                  <span className="pill rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-[var(--brand-peach)]">
                    {criterion.type}
                  </span>
                </div>
                <select
                  className="mt-4 w-full rounded-2xl border border-white/10 bg-[#091422] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--brand-pink)]/50"
                  value={answers[criterion.key] ?? ""}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [criterion.key]: event.target.value,
                    }))
                  }
                >
                  <option value="">Select a rating</option>
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>
      </section>

      <aside className="glass-panel rounded-[28px] p-5 sm:p-6">
        <div className="text-xs uppercase tracking-[0.3em] text-[var(--brand-peach)]">Live result</div>
        <div className="mt-4 rounded-[26px] border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-[var(--muted)]">Calculated score</div>
          <div className="mt-3 text-5xl font-semibold tracking-tight text-white">{score.toFixed(1)}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="pill rounded-full px-3 py-1.5 text-xs text-[var(--brand-peach)]">Tier: {tier}</span>
            <span className="pill rounded-full px-3 py-1.5 text-xs text-white">KPI: {kpi}%</span>
            <span className="pill rounded-full px-3 py-1.5 text-xs text-white/90">{autoFail ? "Auto fail enabled" : "Manual scoring"}</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {[
            ["Ownership", answers.ownership ?? "Unset"],
            ["Handover", answers.handover ?? "Unset"],
            ["Flow", answers.flow ?? "Unset"],
            ["Juniper", answers.juniper ?? "Unset"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
              <span className="text-[var(--muted)]">{label}</span>
              <span className="text-white">{value}</span>
            </div>
          ))}
        </div>

        <button className="brand-gradient mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95">
          Save evaluation
        </button>
      </aside>
    </div>
  );
}
