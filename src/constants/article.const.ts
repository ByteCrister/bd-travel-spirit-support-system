// Utility type to extract enum values
type EnumValues<T> = T[keyof T];

/**
 * Enum for article publication status
 */
export enum ARTICLE_STATUS {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}
export type ArticleStatus = EnumValues<typeof ARTICLE_STATUS>;

/**
 * Enum for article type (single vs multi-destination, etc.)
 */
export enum ARTICLE_TYPE {
  SINGLE_DESTINATION = "single_destination",
  MULTI_DESTINATION = "multi_destination",
  GENERAL_TIPS = "general_tips",
}
export type ArticleType = EnumValues<typeof ARTICLE_TYPE>;