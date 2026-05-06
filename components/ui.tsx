import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  accent?: string;
};

export function StatCard({ label, value, delta, accent = "text-white" }: StatCardProps) {
  return (
    <div className="glass-panel rounded-[24px] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--muted)]">{label}</p>
        {delta ? (
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-[var(--brand-peach)]">
            {delta}
          </span>
        ) : null}
      </div>
      <div className={`mt-4 text-3xl font-semibold tracking-tight ${accent}`}>{value}</div>
    </div>
  );
}

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

type PillProps = {
  children: ReactNode;
  tone?: "indigo" | "pink" | "orange" | "cream" | "slate";
};

export function Pill({ children, tone = "slate" }: PillProps) {
  const toneClass: Record<NonNullable<PillProps["tone"]>, string> = {
    indigo: "border-[var(--brand-navy)]/40 bg-[rgba(45,42,105,0.18)] text-[var(--brand-peach)]",
    pink: "border-[var(--brand-pink)]/40 bg-[rgba(205,31,141,0.16)] text-white",
    orange: "border-[var(--brand-orange)]/40 bg-[rgba(255,97,71,0.14)] text-white",
    cream: "border-[var(--brand-peach)]/30 bg-[rgba(255,228,221,0.1)] text-[var(--brand-peach)]",
    slate: "border-white/10 bg-white/5 text-slate-100",
  };

  return <span className={`pill rounded-full px-3 py-1.5 text-xs ${toneClass[tone]}`}>{children}</span>;
}
