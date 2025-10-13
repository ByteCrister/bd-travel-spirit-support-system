////////////////////////////////////////////////////////////////////////////////
// ENUMS: Domain-specific constants
////////////////////////////////////////////////////////////////////////////////

/**
 * Types of travelers this tour is suited for
 */
export enum TRAVEL_TYPE {
  COUPLES = "Couples",
  GROUP_OF_FRIENDS = "Group of friends",
  SOLO = "Solo",
  FAMILIES = "Families",
  BUSINESS = "Business",
  ADVENTURE_SEEKERS = "Adventure Seekers",
}

/**
 * Publishing status of the tour
 */
export enum TOUR_STATUS {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}
