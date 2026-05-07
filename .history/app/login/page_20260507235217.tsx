import Link from "next/link";
import { redirect } from "next/navigation";
import { getDevLoginCredentialsByRole, getSessionUser } from "@/lib/session";
import type { PortalRole } from "@/lib/roles";
 
type LoginPageProps = {
  searchParams?: Promise<{ error?: string; role?: string }>;
};
 
const roleMeta: Record<PortalRole, { title: string; description: string; accent: string }> = {
  admin: {
    title: "Admin",
    description: "Creates cases, assigns reviewers, and manages portal controls.",
    accent: "text-[var(--brand-orange)]",
  },
  reviewer: {
    title: "Quality reviewer",
    description: "Reviews assigned cases, scores them, and publishes the outcome.",
    accent: "text-[var(--brand-pink)]",
  },
  agent: {
    title: "Agent",
    description: "Views published reviews, overall score, and disputed cases.",
    accent: "text-[var(--brand-peach)]",
  },
};
 
function normalizeRole(role: string | undefined): PortalRole {
  return role === "admin" || role === "agent" ? role : "reviewer";
}
 
export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await getSessionUser()) {
    redirect("/dashboard");
  }
 
  const params = (await searchParams) ?? {};
  const role = normalizeRole(params.role);
  const credentials = getDevLoginCredentialsByRole(role);
 
  const errorMessage =
    params.error === "dev-login"
      ? "The demo credentials did not match. Use the selected profile on the page."
      : params.error === "dev-disabled"
        ? "Local demo login is disabled in this environment."
        : null;
 
  return (
    <div className="min-h-screen p-3 text-white sm:p-4 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-6xl overflow-hidden rounded-[32px] border border-white/10 bg-white/5 lg:min-h-[calc(100svh-3rem)] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="brand-gradient-soft order-2 flex flex-col justify-between p-6 sm:p-8 lg:order-1 lg:p-10">
          <div>
            <div className="text-[11px] uppercase tracking-[0.35em] text-[var(--brand-peach)]">Beds XML</div>
            <h1 className="mt-4 max-w-lg text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
              Sign in to the operations quality portal.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300">
              Pick a role profile to jump into the matching workspace while Google auth is still being finished.
            </p>
          </div>
          <div className="mt-8 grid gap-3 text-xs sm:grid-cols-3">
            <div className="pill rounded-2xl px-3 py-3 text-[var(--brand-peach)]">Admin manages cases</div>
            <div className="pill rounded-2xl px-3 py-3 text-white">Reviewers publish cases</div>
            <div className="pill rounded-2xl px-3 py-3 text-white">Agents view their scores</div>
          </div>
        </section>
 
        <section className="order-1 flex items-center justify-center border-b border-white/10 bg-black/15 p-5 sm:p-8 lg:order-2 lg:border-b-0 lg:border-l lg:p-10">
          <form className="glass-panel w-full max-w-md rounded-[28px] p-6 sm:p-7" action="/api/auth/dev-login" method="post">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--brand-peach)]">Demo login</div>
            <div className="mt-2 text-2xl font-semibold text-white">Choose your workspace</div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Each profile opens a different view so you can test admin, reviewer, and agent flows separately.
            </p>
 
            {errorMessage ? (
              <div className="mt-4 rounded-2xl border border-[var(--brand-orange)]/40 bg-[rgba(255,97,71,0.12)] px-4 py-3 text-sm text-white">
                {errorMessage}
              </div>
            ) : null}
 
            <div className="mt-5 grid gap-3">
              {(["admin", "reviewer", "agent"] as PortalRole[]).map((candidateRole) => {
                const meta = roleMeta[candidateRole];
                const active = candidateRole === role;
 
                return (
                  <Link
                    key={candidateRole}
                    href={`/login?role=${candidateRole}`}
                    className={[
                      "rounded-3xl border p-4 transition",
                      active
                        ? "border-[var(--brand-pink)]/60 bg-[rgba(205,31,141,0.16)]"
                        : "border-white/10 bg-white/5 hover:border-[var(--brand-pink)]/40 hover:bg-white/10",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className={`text-sm font-semibold ${meta.accent}`}>{meta.title}</div>
                        <div className="mt-1 text-sm leading-6 text-[var(--muted)]">{meta.description}</div>
                      </div>
                      <span className="pill rounded-full px-3 py-2 text-xs text-white">Select</span>
                    </div>
                  </Link>
                );
              })}
            </div>
 
            {/* Only render the credentials hint block when credentials are available. */}
            {credentials && (
              <div className="mt-5 rounded-2xl border border-[var(--brand-pink)]/30 bg-[rgba(205,31,141,0.12)] p-4 text-sm text-white">
                <div className="font-medium">Default credentials for {roleMeta[role].title}</div>
                <div className="mt-2 space-y-1 text-[var(--muted)]">
                  <div>
                    Email: <span className="text-white">{credentials.email}</span>
                  </div>
                  <div>
                    Password: <span className="text-white">{credentials.password}</span>
                  </div>
                </div>
              </div>
            )}
 
            <div className="mt-5 space-y-4">
              <input name="role" type="hidden" value={role} />
              <label className="block">
                <span className="mb-2 block text-sm text-[var(--muted)]">Email</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-[#091422] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--brand-pink)]/50"
                  defaultValue={credentials?.email ?? ""}
                  name="email"
                  type="email"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-[var(--muted)]">Password</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-[#091422] px-4 py-3 text-sm text-white outline-none transition focus:border-[var(--brand-pink)]/50"
                  defaultValue={credentials?.password ?? ""}
                  name="password"
                  type="password"
                />
              </label>
              <button
                className="brand-gradient block w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-95"
                type="submit"
              >
                Enter the portal
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}