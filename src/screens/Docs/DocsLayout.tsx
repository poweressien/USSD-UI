import { NavLink, Outlet } from "react-router-dom";
import { cn } from "../../lib/cn";

const DOC_LINKS = [
  { to: "/docs", label: "Executive Summary", end: true },
  { to: "/docs/problem", label: "Problem" },
  { to: "/docs/solution", label: "Proposed Solution" },
  { to: "/docs/architecture", label: "Architecture" },
  { to: "/docs/protocol", label: "Protocol" },
  { to: "/docs/capability-negotiation", label: "Capability Negotiation" },
  { to: "/docs/wire-transport", label: "Wire / Transport" },
  { to: "/docs/cat-stk", label: "USSD vs CAT/STK" },
  { to: "/docs/compatibility", label: "Compatibility" },
  { to: "/docs/security", label: "Security Model" },
  { to: "/docs/telco-integration", label: "Telco Integration" },
  { to: "/docs/limitations", label: "Technical Limitations" },
  { to: "/docs/future-work", label: "Future Work" },
];

export function DocsLayout() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <nav className="md:sticky md:top-20 md:self-start">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-faint">Documentation</p>
          <ul className="space-y-0.5">
            {DOC_LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn(
                      "block rounded-md px-2.5 py-1.5 text-sm",
                      isActive ? "bg-accent-soft text-accent-strong" : "text-text-muted hover:text-text",
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <article className="min-w-0 pb-16">
          <Outlet />
        </article>
      </div>
    </div>
  );
}
