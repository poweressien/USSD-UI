import { useState } from "react";
import type { FormEvent } from "react";
import type { InputComponent, ScreenDef, UserAction } from "../../protocol/types";
import { stripEmoji } from "../../lib/text";
import type { NavigateKind } from "./NavBar";

interface NumberedItem {
  label: string;
  fire: () => void;
}

/**
 * Renders the exact same ScreenDef the interactive layer receives, but
 * as the numbered-reply format every USSD-capable handset already
 * understands. Nothing here is a different Telco call — see spec
 * section 21: this is the same operation, a different presentation.
 */
export function ClassicUssdRenderer({
  screen,
  onAction,
  onNavigate,
}: {
  screen: ScreenDef;
  onAction: (action: UserAction) => void;
  onNavigate: (kind: NavigateKind) => void;
}) {
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const infoLines: string[] = [];
  const numberedItems: NumberedItem[] = [];
  let inputComponent: InputComponent | undefined;

  for (const component of screen.components) {
    switch (component.type) {
      case "text":
        infoLines.push(component.value);
        break;
      case "button":
        numberedItems.push({
          label: stripEmoji(component.label),
          fire: () => onAction({ type: "button", id: component.id, action: component.action, data: component.data }),
        });
        break;
      case "select":
        for (const option of component.options) {
          numberedItems.push({
            label: option.label,
            fire: () => onAction({ type: "select", id: component.id, action: component.action, value: option.value }),
          });
        }
        break;
      case "confirm":
        for (const row of component.rows) infoLines.push(`${row.label}: ${row.value}`);
        numberedItems.push({
          label: "Confirm",
          fire: () => onAction({ type: "button", id: `${component.id}_confirm`, action: component.confirmAction }),
        });
        if (component.cancelAction) {
          const cancelAction = component.cancelAction;
          numberedItems.push({
            label: "Cancel",
            fire: () => onAction({ type: "button", id: `${component.id}_cancel`, action: cancelAction }),
          });
        }
        break;
      case "input":
        inputComponent = component;
        break;
      case "processing":
        infoLines.push(component.message);
        break;
      case "success":
        infoLines.push(component.heading);
        component.rows?.forEach((row) => infoLines.push(`${row.label}: ${row.value}`));
        if (component.reference) infoLines.push(`Ref: ${component.reference}`);
        break;
      case "error":
        infoLines.push(component.heading);
        if (component.reason) infoLines.push(`Reason: ${component.reason}`);
        break;
      default:
        break;
    }
  }

  function handleSend(e?: FormEvent) {
    e?.preventDefault();
    const trimmed = reply.trim();

    if (trimmed === "0" && screen.navigation.back) {
      onNavigate("back");
      setReply("");
      return;
    }
    if (trimmed === "00" && screen.navigation.home) {
      onNavigate("home");
      setReply("");
      return;
    }
    if (inputComponent) {
      if (trimmed === "") {
        setError("Enter a value.");
        return;
      }
      onAction({ type: "input", id: inputComponent.id, action: inputComponent.action, value: trimmed });
      setReply("");
      setError(undefined);
      return;
    }

    const index = Number(trimmed) - 1;
    const item = numberedItems[index];
    if (Number.isNaN(index) || !item) {
      setError("Invalid option. Try again.");
      return;
    }
    setError(undefined);
    item.fire();
    setReply("");
  }

  return (
    <div className="flex h-full flex-col bg-lcd font-mono text-[var(--color-lcd-text)]">
      <div className="flex items-center justify-between border-b border-black/15 bg-lcd-dark px-3 py-1.5 text-[11px]">
        <span>USSD Session</span>
        {screen.navigation.cancel && (
          <button type="button" onClick={() => onNavigate("cancel")} className="font-semibold hover:underline">
            ✕ Cancel
          </button>
        )}
      </div>

      <div className="lcd-grid no-scrollbar flex-1 overflow-y-auto px-3 py-3 text-[13px] leading-relaxed">
        <p className="mb-2 font-semibold">{screen.title}</p>
        {infoLines.map((line, i) => (
          <p key={i} className="whitespace-pre-wrap">
            {line}
          </p>
        ))}
        {numberedItems.length > 0 && (
          <div className="mt-2">
            {numberedItems.map((item, i) => (
              <p key={i}>
                {i + 1}. {item.label}
              </p>
            ))}
          </div>
        )}
        {inputComponent && <p className="mt-2 opacity-80">{inputComponent.label}:</p>}
        <p className="mt-3 text-[11px] opacity-70">
          {screen.navigation.back && "0 Back  "}
          {screen.navigation.home && "00 Home"}
        </p>
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-black/15 bg-lcd-dark p-2">
        <input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={inputComponent ? "Reply" : "Option"}
          className="min-w-0 flex-1 rounded border border-black/20 bg-[var(--color-lcd)] px-2 py-1.5 text-[13px] outline-none placeholder:text-black/40"
        />
        <button type="submit" className="rounded bg-black/80 px-3 py-1.5 text-[12px] font-semibold text-lcd">
          Send
        </button>
      </form>
      {error && <p className="bg-lcd-dark px-3 pb-2 text-[11px] text-red-800">{error}</p>}
    </div>
  );
}
