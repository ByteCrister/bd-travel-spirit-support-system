// article.store.ts

/**
 * Enum for article publication status
 */
export enum ARTICLE_STATUS {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}
export type ArticleStatus = `${ARTICLE_STATUS}`;

/**
 * Enum for article type (single vs multi-destination, etc.)
 */
/**
 * Enum for article type specific to Bangladesh tourism
 */
export enum ARTICLE_TYPE {
  SINGLE_DESTINATION = "single_destination", // e.g., "Cox's Bazar Guide"
  MULTI_DESTINATION = "multi_destination", // e.g., "Sylhet Division Tour"
  CITY_GUIDE = "city_guide", // e.g., "Dhaka City Guide"
  HILL_STATION = "hill_station", // e.g., "Bandarban Hill Tracks"
  BEACH_DESTINATION = "beach_destination", // e.g., "Saint Martin's Island"
  HISTORICAL_SITE = "historical_site", // e.g., "Historical Mosques of Bagerhat"
  CULTURAL_EXPERIENCE = "cultural_experience", // e.g., "Sundarbans Mangrove Forest"
  FESTIVAL_GUIDE = "festival_guide", // e.g., "Pohela Boishakh Celebration"
  FOOD_GUIDE = "food_guide", // e.g., "Bangladeshi Street Food"
  TRAVEL_TIPS = "travel_tips", // e.g., "Bangladesh Travel Essentials"
}
export type ArticleType = `${ARTICLE_TYPE}`;

export enum FOOD_RECO_SPICE_TYPE{
  MILD = "Mild",
  MEDIUM = "Medium",
  SPICY = "Spicy"
}
export type FoodRecoSpiceType = `${FOOD_RECO_SPICE_TYPE}`;

export enum FAQ_CATEGORY {
  VISA = "Visa",
  TRANSPORT = "Transport",
  ACCOMMODATION = "Accommodation",
  FOOD = "Food",
  CULTURE = "Culture",
  SAFETY = "Safety",
}
export type FaqCategory = `${FAQ_CATEGORY}`;

export enum ARTICLE_RICH_TEXT_BLOCK_TYPE {
  PARAGRAPH = "paragraph",
  LINK = "link",
  HEADING = "heading",
  IMPORTANT = "important"
}
export type ArticleRichTextBlockType = `${ARTICLE_RICH_TEXT_BLOCK_TYPE}`;