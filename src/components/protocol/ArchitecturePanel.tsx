const LAYERS: { name: string; role: string; implementedAs: string }[] = [
  { name: "Device / Terminal", role: "The subscriber's handset", implementedAs: "DeviceSimulator" },
  { name: "Mobile Network", role: "Transport only — carries envelopes, adds nothing", implementedAs: "NetworkSimulator" },
  { name: "Existing USSD Infrastructure", role: "Session admission — unaware of USSD-UI", implementedAs: "USSDGatewaySimulator" },
  { name: "USSD-UI Adapter / Gateway", role: "Negotiates capability, builds/validates envelopes", implementedAs: "USSDUIAdapter" },
  { name: "Telco Service", role: "Products, pricing, transaction outcomes", implementedAs: "MockTelcoService" },
];

export function ArchitecturePanel() {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-text-faint">Architecture</p>
      <p className="mb-3 text-xs text-text-faint">
        Every layer below runs locally in this browser tab — see <span className="text-text-muted">src/network/</span>.
      </p>
      <div className="space-y-2">
        {LAYERS.map((layer, i) => (
          <div key={layer.name} className="flex gap-2 text-xs">
            <span className="w-4 shrink-0 font-mono text-text-faint">{i + 1}</span>
            <div>
              <p className="font-medium text-text">{layer.name}</p>
              <p className="text-text-faint">{layer.role}</p>
              <p className="font-mono text-[10px] text-accent-strong">{layer.implementedAs}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
