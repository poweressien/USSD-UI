import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { cn } from "../../lib/cn";

interface Step {
  title: string;
  description: string;
  to: string;
  cta: string;
}

const STEPS: Step[] = [
  { title: "Current USSD", description: "Start from what every subscriber already has: a bare numbered reply menu.", to: "/compare", cta: "Open Compare" },
  { title: "The problem", description: "Numeric-only menus are slow, error-prone, and impossible to make self-explanatory.", to: "/docs/problem", cta: "Read Problem" },
  { title: "USSD-UI concept", description: "A structured presentation layer the network can offer on top of the same session.", to: "/docs/solution", cta: "Read Proposal" },
  { title: "Network architecture", description: "The full layered path — device, network, existing USSD infrastructure, USSD-UI adapter, Telco service.", to: "/network", cta: "Open Network" },
  { title: "Capability negotiation", description: "Dial in as a legacy device, then a supported one — watch the real CAPABILITY_REQUEST/RESPONSE handshake decide the outcome.", to: "/network", cta: "Open Network" },
  { title: "Structured protocol", description: "Open Protocol Inspector to see the sequenced envelope on the wire, with the hypothetical-transport disclaimer.", to: "/network", cta: "Open Network" },
  { title: "Interactive terminal", description: "Walk Home → Data Plans → pick a plan, all as tappable controls.", to: "/simulate", cta: "Open Simulate" },
  { title: "Custom amount", description: "Open Custom Amount and show live validation on the input component.", to: "/simulate", cta: "Open Simulate" },
  { title: "User action → Telco service", description: "Confirm a purchase — nothing executes without it — then set \"Always fail\" and use Retry to show the service staying authoritative.", to: "/simulate", cta: "Open Simulate" },
  { title: "Legacy fallback", description: "See the exact same protocol message rendered as classic numbered USSD, side by side.", to: "/compare", cta: "Open Compare" },
  { title: "Protocol & session inspectors", description: "Inspect Protocol and Inspect Session to show the raw ScreenMessage and session state behind the screen.", to: "/simulate", cta: "Open Simulate" },
  { title: "Network trace", description: "Every hop — device, network, gateway, adapter, service — logged live in order.", to: "/network", cta: "Open Network" },
  { title: "USSD vs CAT/STK", description: "Where this proposal sits next to existing USSD and SIM Toolkit approaches.", to: "/docs/cat-stk", cta: "Read Comparison" },
  { title: "Telco integration", description: "A presentation layer next to existing billing/product systems — not a replacement for them.", to: "/docs/telco-integration", cta: "Read Integration Model" },
  { title: "Security model", description: "The handset is never the authority for price, balance, eligibility, or success — the service is.", to: "/docs/security", cta: "Read Security Model" },
  { title: "Technical limitations", description: "What this prototype deliberately does not do, stated plainly.", to: "/docs/limitations", cta: "Read Limitations" },
];

export function DemoMode() {
  const [active, setActive] = useState(0);
  const step = STEPS[active];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold">Demo Presentation Mode</h1>
      <p className="mt-1 text-sm text-text-muted">
        A recommended walkthrough for a technical review — sixteen steps, roughly ten minutes.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-[260px_1fr]">
        <ol className="space-y-0.5">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "flex w-full items-baseline gap-2 rounded-md px-2.5 py-1.5 text-left text-sm",
                  i === active ? "bg-accent-soft text-accent-strong" : "text-text-muted hover:text-text",
                )}
              >
                <span className="font-mono text-[11px] text-text-faint">{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </button>
            </li>
          ))}
        </ol>

        <div className="rounded-lg border border-border bg-surface p-6">
          <p className="font-mono text-xs text-text-faint">
            Step {String(active + 1).padStart(2, "0")} / {STEPS.length}
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold">{step.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">{step.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link to={step.to}>
              <Button variant="primary">{step.cta} →</Button>
            </Link>
            <Button variant="ghost" disabled={active === 0} onClick={() => setActive((i) => Math.max(0, i - 1))}>
              ← Previous
            </Button>
            <Button
              variant="ghost"
              disabled={active === STEPS.length - 1}
              onClick={() => setActive((i) => Math.min(STEPS.length - 1, i + 1))}
            >
              Next →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
