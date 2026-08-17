import type { ScreenComponent, UserAction } from "../../protocol/types";
import { TextPart } from "./parts/TextPart";
import { ButtonPart } from "./parts/ButtonPart";
import { InputPart } from "./parts/InputPart";
import { SelectPart } from "./parts/SelectPart";
import { ConfirmPart } from "./parts/ConfirmPart";
import { ProcessingPart } from "./parts/ProcessingPart";
import { SuccessPart } from "./parts/SuccessPart";
import { ErrorPart } from "./parts/ErrorPart";

/**
 * This is the whole idea in one function: it never knows in advance
 * what screen it is drawing. It reads `component.type` off the wire
 * message and picks a part — nothing here is specific to "data plans"
 * or "confirmation" or any other screen id.
 */
export function ComponentRenderer({
  component,
  onAction,
}: {
  component: ScreenComponent;
  onAction: (action: UserAction) => void;
}) {
  switch (component.type) {
    case "text":
      return <TextPart component={component} />;
    case "button":
      return <ButtonPart component={component} onAction={onAction} />;
    case "input":
      return <InputPart component={component} onAction={onAction} />;
    case "select":
      return <SelectPart component={component} onAction={onAction} />;
    case "confirm":
      return <ConfirmPart component={component} onAction={onAction} />;
    case "processing":
      return <ProcessingPart component={component} />;
    case "success":
      return <SuccessPart component={component} />;
    case "error":
      return <ErrorPart component={component} />;
    default: {
      // Exhaustiveness check: a new ComponentType added to the union without
      // a matching case here fails the build, not the demo.
      const _exhaustive: never = component;
      return _exhaustive;
    }
  }
}
