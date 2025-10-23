// constants/faqReport.const.ts
// Utility type to extract enum values
type EnumValues<T> = T[keyof T];

export enum FAQ_REPORT_REASON {
  SPAM = "spam",
  INAPPROPRIATE = "inappropriate",
  OFF_TOPIC = "off_topic",
  HARASSMENT = "harassment",
}
export type FaqReportReason = EnumValues<typeof FAQ_REPORT_REASON>;

export const FAQ_REPORT_REASON_EXPLANATIONS: Record<FAQ_REPORT_REASON, string> = {
  [FAQ_REPORT_REASON.SPAM]: "This question/answer appears to be spam or advertising.",
  [FAQ_REPORT_REASON.INAPPROPRIATE]: "Contains offensive or inappropriate content.",
  [FAQ_REPORT_REASON.OFF_TOPIC]: "Not relevant to this specific tour.",
  [FAQ_REPORT_REASON.HARASSMENT]: "Harassing or targeting individuals or groups.",
};
