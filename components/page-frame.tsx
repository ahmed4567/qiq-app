import type { ReactNode } from "react";
import type { PortalUserSummary } from "@/lib/roles";
import { getSessionUser } from "@/lib/session";
import type { WorkspaceRole } from "./workspace-nav";
import { WorkspaceNav } from "./workspace-nav";

type PageFrameProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  role?: WorkspaceRole;
  user?: PortalUserSummary | null;
  children: ReactNode;
};

export async function PageFrame({ title, eyebrow, subtitle, role = "reviewer", user, children }: PageFrameProps) {
  const sessionUser = user ?? (await getSessionUser());

  return (
    <div className="min-h-screen overflow-x-hidden text-[var(--foreground)]">
      <div className="grid-fade pointer-events-none fixed inset-0 opacity-40" />
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-3 py-3 sm:px-4 lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6 lg:p-6">
        <WorkspaceNav role={sessionUser?.role ?? role} user={sessionUser} />

        <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
          <header className="glass-panel rounded-[28px] px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  {eyebrow ? (
                    <div className="text-xs uppercase tracking-[0.35em] text-[var(--brand-peach)]">{eyebrow}</div>
                  ) : null}
                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl lg:text-4xl">
                    {title}
                  </h1>
                  {subtitle ? <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{subtitle}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="pill rounded-full px-3 py-2 text-[var(--brand-peach)]">Sheets-backed</span>
                  <span className="pill rounded-full px-3 py-2 text-white">Role-aware</span>
                  <span className="pill rounded-full px-3 py-2 text-white">Responsive</span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex min-w-0 flex-col gap-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
