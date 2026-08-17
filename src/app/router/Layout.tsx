import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { CapabilityToggle } from "../../features/capability/CapabilityToggle";
import { cn } from "../../lib/cn";

const NAV_LINKS = [
  { to: "/", label: "Start", end: true },
  { to: "/simulate", label: "Simulate" },
  { to: "/network", label: "Network" },
  { to: "/compare", label: "Compare" },
  { to: "/demo", label: "Demo Mode" },
  { to: "/docs", label: "Docs" },
];

export function Layout() {
  const location = useLocation();
  // The capability toggle only affects rendering on /simulate — Network has its own
  // negotiated handshake, Compare always shows both renderers regardless of it, and
  // every other page doesn't read it at all. Showing it everywhere made it look
  // broken elsewhere, since toggling it there visibly did nothing.
  const showCapabilityToggle = location.pathname === "/simulate";

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-6 w-8 items-center justify-center rounded-sm bg-accent/90 font-mono text-[10px] font-bold text-[#1a1305]">
              SIM
            </span>
            <span className="font-display text-sm font-semibold tracking-tight">
              USSD <span className="text-accent-strong">2.0</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive ? "bg-accent-soft text-accent-strong" : "text-text-muted hover:text-text",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {showCapabilityToggle && <CapabilityToggle />}
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-1.5 md:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "whitespace-nowrap rounded-md px-2.5 py-1 text-xs",
                  isActive ? "bg-accent-soft text-accent-strong" : "text-text-muted",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-xs text-text-faint">
        <p>
          Technical proof of concept. Not affiliated with, endorsed by, or connected to MTN, Airtel, Glo, 9mobile,
          or any telecom operator.
        </p>
        <p className="mt-1">
          <Link to="/docs/limitations" className="underline hover:text-text-muted">
            Read the technical limitations
          </Link>
        </p>
      </footer>
    </div>
  );
}
