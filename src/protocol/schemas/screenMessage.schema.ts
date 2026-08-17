import { z } from "zod";

/**
 * Structural schema for the draft USSD-UI wire format. This describes
 * *shape*, not business rules — semantic checks (duplicate ids, empty
 * option lists, etc.) live in the validator, not here. Keeping the two
 * separate means a message can be well-formed JSON that still fails a
 * business rule, which is a distinction real protocol implementations
 * need too.
 */

export const SUPPORTED_PROTOCOL_VERSIONS = ["0.1"] as const;

const ConfirmRowSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const BaseComponentSchema = z.object({
  id: z.string().min(1, "Component id is required"),
});

export const ComponentSchema = z.discriminatedUnion("type", [
  BaseComponentSchema.extend({
    type: z.literal("text"),
    value: z.string(),
    emphasis: z.enum(["normal", "muted", "strong"]).optional(),
  }),
  BaseComponentSchema.extend({
    type: z.literal("button"),
    label: z.string().min(1),
    action: z.string().min(1),
    data: z.record(z.string(), z.unknown()).optional(),
  }),
  BaseComponentSchema.extend({
    type: z.literal("input"),
    label: z.string().min(1),
    kind: z.enum(["numeric", "currency", "phone-number", "text", "pin"]),
    action: z.string().min(1),
    min: z.number().optional(),
    max: z.number().optional(),
    placeholder: z.string().optional(),
  }),
  BaseComponentSchema.extend({
    type: z.literal("select"),
    label: z.string().min(1),
    action: z.string().min(1),
    options: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
  BaseComponentSchema.extend({
    type: z.literal("confirm"),
    rows: z.array(ConfirmRowSchema),
    confirmAction: z.string().min(1),
    cancelAction: z.string().optional(),
  }),
  BaseComponentSchema.extend({
    type: z.literal("processing"),
    message: z.string(),
  }),
  BaseComponentSchema.extend({
    type: z.literal("success"),
    heading: z.string(),
    rows: z.array(ConfirmRowSchema).optional(),
    reference: z.string().optional(),
  }),
  BaseComponentSchema.extend({
    type: z.literal("error"),
    heading: z.string(),
    reason: z.string().optional(),
  }),
]);

export const ScreenNavigationSchema = z.object({
  back: z.boolean(),
  home: z.boolean(),
  cancel: z.boolean(),
  retry: z.boolean().optional(),
});

export const ScreenDefSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  components: z.array(ComponentSchema),
  navigation: ScreenNavigationSchema,
});

export const ScreenMessageSchema = z.object({
  protocol: z.literal("USSD-UI"),
  version: z.string().refine(
    (v) => (SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(v),
    "Unsupported protocol version",
  ),
  type: z.literal("screen"),
  sessionId: z.string().min(1),
  screen: ScreenDefSchema,
});
