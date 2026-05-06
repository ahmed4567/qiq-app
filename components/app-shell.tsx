import Link from "next/link";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/session";
import { PortalNav } from "./portal-nav";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/agents", label: "Agents" },
  { href: "/evaluations/new", label: "New evaluation" },
  { href: "/disputes", label: "Disputes" },
  { href: "/admin", label: "Admin" },
];

type AppShellProps = {
  title: string;
  eyebrow?: string;
  subtitle?: string;
  children: ReactNode;
};

export async function AppShell({ title, eyebrow, subtitle, children }: AppShellProps) {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen overflow-x-hidden text-[var(--foreground)]">
      <div className="grid-fade pointer-events-none fixed inset-0 opacity-40" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-4 px-3 py-3 sm:px-4 lg:flex-row lg:gap-6 lg:p-6">
        <section className="glass-panel-strong rounded-[28px] p-4 lg:hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.35em] text-[var(--brand-peach)]">Beds XML</div>
              <div className="mt-2 text-lg font-semibold brand-text">Operations quality portal</div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                Mobile-first quick access to reviews, scores, and exceptions.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 text-xs">
              <span className="pill rounded-full px-3 py-2 text-[var(--brand-peach)]">Responsive</span>
              {user ? (
                <>
                  <span className="pill rounded-full px-3 py-2 text-white">{user.name}</span>
                  <Link className="pill rounded-full px-3 py-2 text-white" href="/api/auth/logout">
                    Logout
                  </Link>
                </>
              ) : (
                <Link className="pill rounded-full px-3 py-2 text-[var(--brand-peach)]" href="/login">
                  Sign in
                </Link>
              )}
            </div>
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer list-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              Open navigation
            </summary>
            <div className="mt-3">
              <PortalNav items={navItems} variant="mobile" />
            </div>
          </details>

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-[var(--muted)]">
            Google Sheets sync enabled · Session auth ready · KPI review flows responsive
          </div>
        </section>

        <aside className="glass-panel-strong hidden w-72 flex-shrink-0 rounded-[28px] p-5 lg:flex lg:flex-col">
          <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.35em] text-[var(--brand-peach)]">Beds XML</div>
            <div className="mt-2 text-lg font-semibold brand-text">Operations quality portal</div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Monitoring, scoring, disputes, and KPI tracking for review teams.
            </p>
          </div>

          <PortalNav items={navItems} />

          <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--brand-peach)]">Live status</div>
            <div className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Google Sheets sync enabled
              <br />
              Session auth and audit trail ready
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="glass-panel rounded-[28px] px-5 py-5 sm:px-6 lg:sticky lg:top-6 lg:z-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
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
                <span className="pill rounded-full px-3 py-2 text-white">KPI-driven</span>
                {user ? (
                  <span className="pill rounded-full px-3 py-2 text-[var(--brand-peach)]">{user.name}</span>
                ) : (
                  <Link className="pill rounded-full px-3 py-2 text-[var(--brand-peach)]" href="/login">
                    Sign in
                  </Link>
                )}
                {user ? (
                  <Link className="pill rounded-full px-3 py-2 text-white" href="/api/auth/logout">
                    Logout
                  </Link>
                ) : null}
              </div>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}
