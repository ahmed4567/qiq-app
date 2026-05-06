import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await getSessionUser()) {
    redirect("/dashboard");
  }

  const params = (await searchParams) ?? {};
  const errorMessage =
    params.error === "config"
      ? "Google sign-in is not configured yet. Set the OAuth environment variables first."
      : params.error === "state"
        ? "The sign-in session expired or could not be verified. Please try again."
        : params.error
          ? `Google sign-in failed: ${params.error}`
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
              We use a clean, one-action login screen so reviewers can get back to work quickly on mobile and desktop.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-xs">
            <span className="pill rounded-full px-3 py-2 text-[var(--brand-peach)]">Google login</span>
            <span className="pill rounded-full px-3 py-2 text-white">Session auth</span>
            <span className="pill rounded-full px-3 py-2 text-white">Role-based access</span>
          </div>
        </section>

        <section className="order-1 flex items-center justify-center border-b border-white/10 bg-black/15 p-5 sm:p-8 lg:order-2 lg:border-b-0 lg:border-l lg:p-10">
          <form className="glass-panel w-full max-w-md rounded-[28px] p-6 sm:p-7">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--brand-peach)]">Welcome back</div>
            <div className="mt-2 text-2xl font-semibold text-white">Log in</div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              Continue with Google to open the live quality portal.
            </p>
            {errorMessage ? (
              <div className="mt-4 rounded-2xl border border-[var(--brand-orange)]/40 bg-[rgba(255,97,71,0.12)] px-4 py-3 text-sm text-white">
                {errorMessage}
              </div>
            ) : null}
            <div className="mt-6 space-y-4">
              <a
                className="brand-gradient block w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-95"
                href="/api/auth/google/start"
              >
                Continue with Google
              </a>
            </div>
            <div className="mt-4 text-center text-sm text-slate-300">
              <Link href="/dashboard" className="text-[var(--brand-peach)]">
                I already signed in
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
