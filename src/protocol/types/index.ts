/**
 * USSD-UI protocol types — draft reference protocol, not an existing
 * telecom standard. See /specification/ussd-ui-spec-v0.1.md.
 *
 * A ScreenMessage is what a (simulated) Telco service sends down to the
 * handset. A UserAction is what the handset sends back up after the
 * subscriber interacts with a rendered component. The renderer never
 * hard-codes a screen — it walks `screen.components` and dispatches on
 * `type`, so any future component kind only needs a union member here
 * and a case in the component renderer.
 */

export type ComponentType =
  | "text"
  | "button"
  | "input"
  | "select"
  | "confirm"
  | "processing"
  | "success"
  | "error";

export type InputKind = "numeric" | "currency" | "phone-number" | "text" | "pin";

interface BaseComponent {
  id: string;
}

export interface TextComponent extends BaseComponent {
  type: "text";
  value: string;
  emphasis?: "normal" | "muted" | "strong";
}

export interface ButtonComponent extends BaseComponent {
  type: "button";
  label: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface InputComponent extends BaseComponent {
  type: "input";
  label: string;
  kind: InputKind;
  action: string;
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectComponent extends BaseComponent {
  type: "select";
  label: string;
  action: string;
  options: SelectOption[];
}

export interface ConfirmRow {
  label: string;
  value: string;
}

export interface ConfirmComponent extends BaseComponent {
  type: "confirm";
  rows: ConfirmRow[];
  confirmAction: string;
  cancelAction?: string;
}

export interface ProcessingComponent extends BaseComponent {
  type: "processing";
  message: string;
}

export interface SuccessComponent extends BaseComponent {
  type: "success";
  heading: string;
  rows?: ConfirmRow[];
  reference?: string;
}

export interface ErrorComponent extends BaseComponent {
  type: "error";
  heading: string;
  reason?: string;
}

export type ScreenComponent =
  | TextComponent
  | ButtonComponent
  | InputComponent
  | SelectComponent
  | ConfirmComponent
  | ProcessingComponent
  | SuccessComponent
  | ErrorComponent;

export interface ScreenNavigation {
  back: boolean;
  home: boolean;
  cancel: boolean;
  retry?: boolean;
}

export interface ScreenDef {
  id: string;
  title: string;
  subtitle?: string;
  components: ScreenComponent[];
  navigation: ScreenNavigation;
}

export const USSD_UI_PROTOCOL = "USSD-UI" as const;
export const USSD_UI_VERSION = "0.1" as const;

export interface ScreenMessage {
  protocol: typeof USSD_UI_PROTOCOL;
  version: string;
  type: "screen";
  sessionId: string;
  screen: ScreenDef;
}

/** Emitted by the handset renderer whenever the subscriber interacts with a component. */
export interface UserAction {
  type: "button" | "input" | "select" | "navigation";
  id: string;
  action: string;
  data?: Record<string, unknown>;
  value?: string;
}
