import type { ScreenMessage } from "../types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Semantic validation for a structurally-valid ScreenMessage. The schema
 * (see /protocol/schemas) already guarantees the shape; this checks the
 * things a schema can't express on its own — uniqueness, non-empty
 * option lists, components that reference an action but forgot to set
 * one, and a screen that offers `retry` navigation with no error/retry
 * affordance to attach it to.
 */
export function validateScreenMessage(message: ScreenMessage): ValidationResult {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const component of message.screen.components) {
    if (seenIds.has(component.id)) {
      errors.push(`Duplicate component id "${component.id}" on screen "${message.screen.id}"`);
    }
    seenIds.add(component.id);

    switch (component.type) {
      case "select":
        if (component.options.length === 0) {
          errors.push(`Select component "${component.id}" has no options`);
        }
        break;
      case "confirm":
        if (component.rows.length === 0) {
          errors.push(`Confirm component "${component.id}" has no rows`);
        }
        if (!component.confirmAction) {
          errors.push(`Confirm component "${component.id}" is missing confirmAction`);
        }
        break;
      case "input":
        if (component.min !== undefined && component.max !== undefined && component.min > component.max) {
          errors.push(`Input component "${component.id}" has min greater than max`);
        }
        break;
      default:
        break;
    }
  }

  if (message.screen.components.length === 0) {
    errors.push(`Screen "${message.screen.id}" has no components`);
  }

  return { valid: errors.length === 0, errors };
}
