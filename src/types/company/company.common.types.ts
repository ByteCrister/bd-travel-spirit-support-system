// types/company.common.ts
// Shared primitives, enums, and utility envelopes used across Companies pages.
// Keep this file stable and backward-compatible; other DTO files import from here.

/**
 * Canonical string identifier (Mongo ObjectId serialized).
 * Always a 24-hex string returned from .toString().
 */
export type ObjectIdString = string;

/**
 * ISO 8601 date-time string (e.g., "2025-10-01T14:25:00.000Z").
 * Use .toISOString() on Date values when mapping from models.
 */
export type ISODateString = string;

/**
 * Three-letter uppercase currency code (e.g., "BDT", "USD").
 * Keep UI rendering agnostic to specific currency formatting.
 */
export type CurrencyCode = string;

/**
 * Lightweight string used for basic i18n or label values.
 * Future-friendly for structured locale objects.
 */
export type LocaleString = string;

/**
 * Simple tag used for filtering and faceted search in tables.
 */
export type Tag = string;
/**
 * Route params for /companies/[companyId] pages.
 */
export interface CompanyRouteParams {
    companyId: ObjectIdString;
}

/**
 * Route params for /companies/[companyId]/[tourId] pages.
 */
export interface CompanyTourRouteParams extends CompanyRouteParams {
    tourId: ObjectIdString;
}
