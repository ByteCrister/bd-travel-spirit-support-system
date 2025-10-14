/**
 * Stages in the report review lifecycle
 */
export enum REPORT_STATUS {
  OPEN = "open",
  IN_REVIEW = "in_review",
  RESOLVED = "resolved",
  REJECTED = "rejected",
}

/**
 * Standardized reasons for reporting
 */
export enum REPORT_REASON {
  FALSE_DESCRIPTION = "false_description",
  LATE_PICKUP = "late_pickup",
  SAFETY_ISSUE = "safety_issue",
  UNPROFESSIONAL_GUIDE = "unprofessional_guide",
  BILLING_PROBLEM = "billing_problem",
  OTHER = "other",
}

/**
 * Triage priority levels
 */
export enum REPORT_PRIORITY {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}
