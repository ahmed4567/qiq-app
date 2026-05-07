"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PortalRole, PortalUserSummary } from "@/lib/roles";

export type WorkspaceRole = PortalRole;

type WorkspaceNavProps = {
  role?: WorkspaceRole;
  user?: PortalUserSummary | null;
};

const primaryGroups = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", roles: ["admin", "reviewer", "agent"] as WorkspaceRole[] },
      { href: "/views/admin", label: "Admin view", roles: ["admin"] as WorkspaceRole[] },
      { href: "/views/reviewer", label: "Reviewer view", roles: ["reviewer"] as WorkspaceRole[] },
      { href: "/views/agent", label: "Agent view", roles: ["agent"] as WorkspaceRole[] },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/agents", label: "Agents", roles: ["admin", "reviewer"] as WorkspaceRole[] },
      { href: "/evaluations/new", label: "New evaluation", roles: ["reviewer"] as WorkspaceRole[] },
      { href: "/disputes", label: "Disputes", roles: ["reviewer"] as WorkspaceRole[] },
      { href: "/admin", label: "Admin", roles: ["admin"] as WorkspaceRole[] },
    ],
  },
];

 
const roleLinks: Array<{ role: WorkspaceRole; href: string; label: string }> = [
  { role: "admin", href: "/views/admin", label: "Admin" },
  { role: "reviewer", href: "/views/reviewer", label: "Reviewer" },
  { role: "agent", href: "/views/agent", label: "Agent" },
];

const messageContacts = [
  { name: "Erik Gunsel", status: "Online" },
  { name: "Emily Smith", status: "Away" },
  { name: "Arthur Adelk", status: "Online" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function roleLabel(role?: WorkspaceRole) {
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : "Guest";
}

function NavItem({
  href,
  label,
  active,
  compact = false,
}: {
  href: string;
  label: string;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={[
        "flex items-center justify-between rounded-2xl border px-4 py-3 text-sm transition",
        compact ? "min-h-[52px]" : "",
        active
          ? "border-[var(--brand-pink)]/55 bg-[rgba(205,31,141,0.16)] text-white"
          : "border-white/10 bg-white/5 text-[var(--muted)] hover:border-[var(--brand-pink)]/40 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      <span>{label}</span>
      <span className={active ? "text-[var(--brand-peach)]" : "text-white/30"}>↗</span>
    </Link>
  );
}

function ProfileCard({ user }: { user?: PortalUserSummary | null }) {
  const signedIn = Boolean(user);
  const displayName = user?.name ?? "Demo guest";
  const displayEmail = user?.email ?? "Sign in to open the workspace";
  const avatarText = user ? initials(user.name) : "B";

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-4">
      <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--brand-peach)]">Profile</div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(255,255,255,0.12)] text-sm font-semibold text-white">
          {avatarText}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{displayName}</div>
          <div className="truncate text-xs text-[var(--muted)]">{displayEmail}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="pill rounded-full px-3 py-2 text-xs text-white">{roleLabel(user?.role)}</span>
        <span className="pill rounded-full px-3 py-2 text-xs text-white">
          {signedIn ? "Session active" : "Guest preview"}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        {signedIn ? (
          <form action="/api/auth/logout" method="get">
            <button
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-[var(--brand-pink)]/40 hover:bg-white/10"
              type="submit"
            >
              Logout
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-medium text-white transition hover:border-[var(--brand-pink)]/40 hover:bg-white/10"
          >
            Sign in
          </Link>
        )}
      </div>
    </section>
  );
}

function AppBrandCard() {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
      <div className="text-[11px] uppercase tracking-[0.35em] text-[var(--brand-peach)]">Beds XML</div>
      <div className="mt-2 text-lg font-semibold brand-text">Operations quality portal</div>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        Dashboard, reviews, disputes, and agent case visibility in one workspace.
      </p>
    </div>
  );
}

export function WorkspaceNav({ role = "reviewer", user }: WorkspaceNavProps) {
  const pathname = usePathname();
  const visibleRoleLinks = roleLinks.filter((item) => item.role === role);
  const visiblePrimaryGroups = primaryGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <aside className="glass-panel-strong hidden min-h-full w-full max-w-[320px] flex-col rounded-[28px] p-5 lg:flex">
        <AppBrandCard />
       

        <div className="mt-4 rounded-[28px] border border-white/10 bg-white/5 p-4">
            <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--brand-peach)]">Role switcher</div>
            <div className="mt-3 space-y-2">
              {visibleRoleLinks.map((item) => {
                const active = role === item.role;

              return (
                <NavItem key={item.role} href={item.href} label={item.label} active={active} />
              );
            })}
          </div>
        </div>

        <nav className="mt-4 space-y-4">
          {visiblePrimaryGroups.map((group) => (
            <section key={group.title} className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--brand-peach)]">{group.title}</div>
              <div className="mt-3 space-y-2">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);

                  return <NavItem key={item.href} href={item.href} label={item.label} active={active} />;
                })}
              </div>
            </section>
          ))}
        </nav>

        

        
        <div className="mt-4">
          <ProfileCard user={user} />
        </div>
      </aside>

      <details className="glass-panel-strong rounded-[28px] p-4 lg:hidden">
        <summary className="cursor-pointer list-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
          Open navigation
        </summary>
        <div className="mt-4 space-y-4">
          <AppBrandCard />
          <ProfileCard user={user} />

          <div className="grid gap-2 sm:grid-cols-3">
            {visibleRoleLinks.map((item) => {
              const active = role === item.role;

              return (
                <NavItem key={item.role} href={item.href} label={item.label} active={active} compact />
              );
            })}
          </div>

          {visiblePrimaryGroups.map((group) => (
            <section key={group.title} className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--brand-peach)]">{group.title}</div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href);

                  return <NavItem key={item.href} href={item.href} label={item.label} active={active} compact />;
                })}
              </div>
            </section>
          ))}

         

           
          <section className="rounded-[28px] border border-white/10 bg-white/5 p-4">
            <div className="rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4">
              <div className="text-center text-sm font-semibold text-white">Let&apos;s start!</div>
              <p className="mt-2 text-center text-sm leading-6 text-[var(--muted)]">
                Creating or adding a new quality case is one tap away.
              </p>
              <Link
                href="/evaluations/new"
                className="brand-gradient mt-4 block rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white transition hover:opacity-95"
              >
                + Add New Case
              </Link>
            </div>
          </section>
        </div>
      </details>
    </>
  );
}
