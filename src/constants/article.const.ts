/**
 * Enum for article publication status
 */
export enum ARTICLE_STATUS {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

/**
 * Enum for article type (single vs multi-destination, etc.)
 */
export enum ARTICLE_TYPE {
  SINGLE_DESTINATION = "single_destination",
  MULTI_DESTINATION = "multi_destination",
  GENERAL_TIPS = "general_tips",
}
