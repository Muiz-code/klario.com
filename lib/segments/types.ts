/**
 * Segment rule model. A segment is a set of rules combined with `match` (all =
 * AND, any = OR). The same model powers both the built-in segments (status,
 * source, device, engagement) and admin-defined custom segments.
 */

export type MatchType = "all" | "any";

export type RuleField =
  | "status"
  | "source"
  | "device"
  | "engagement"
  | "banks"
  | "name"
  | "created_days";

export type RuleOp = "is" | "is_not" | "contains" | "within" | "before";

export type Rule = { field: RuleField; op: RuleOp; value: string };

export type SegmentDef = { match: MatchType; rules: Rule[] };

export type FieldMeta = {
  field: RuleField;
  label: string;
  ops: RuleOp[];
  valueType: "select" | "text" | "number";
  values?: { value: string; label: string }[];
};

/** Field metadata that drives both evaluation and the builder UI. */
export const FIELDS: FieldMeta[] = [
  {
    field: "status",
    label: "Status",
    ops: ["is", "is_not"],
    valueType: "select",
    values: [
      { value: "pending", label: "Pending" },
      { value: "invited", label: "Invited" },
      { value: "active", label: "Active" },
      { value: "unsubscribed", label: "Unsubscribed" },
    ],
  },
  {
    field: "engagement",
    label: "Engagement",
    ops: ["is", "is_not"],
    valueType: "select",
    values: [
      { value: "opened", label: "Opened an email" },
      { value: "clicked", label: "Clicked a link" },
      { value: "never", label: "Never engaged" },
    ],
  },
  { field: "source", label: "Source", ops: ["is", "is_not", "contains"], valueType: "text" },
  { field: "device", label: "Device", ops: ["is", "is_not"], valueType: "text" },
  { field: "banks", label: "Banks", ops: ["contains"], valueType: "text" },
  { field: "name", label: "Name / email", ops: ["contains"], valueType: "text" },
  {
    field: "created_days",
    label: "Signed up",
    ops: ["within", "before"],
    valueType: "number",
  },
];

export const OP_LABELS: Record<RuleOp, string> = {
  is: "is",
  is_not: "is not",
  contains: "contains",
  within: "within last N days",
  before: "before last N days",
};

export function fieldMeta(field: RuleField): FieldMeta | undefined {
  return FIELDS.find((f) => f.field === field);
}
