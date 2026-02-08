// statistics.export.ts

type SectionExportConfig = {
  expandArray?: string | null;
  preferredColumns?: string[];
  headerLabels?: Record<string, string>;
  dedupeKeys?: string[];
  normalizeRow?: (r: Row) => Row;
};

export const SECTION_EXPORT_CONFIG: Record<SectionKeyEnum, SectionExportConfig> = {
  [SectionKeyEnum.USERS]: {
    expandArray: 'signupsOverTime',
    preferredColumns: [
      'date',
      'value',
      'label',
      'statusDistribution.labels',
      'guideApplications.pending',
      'guideApplications.approved',
      'guideApplications.rejected',
      'guideApplications.avgReviewTime',
    ],
    headerLabels: {
      date: 'Date',
      value: 'Signups',
      label: 'Label',
      'statusDistribution.labels': 'Status distribution',
      'guideApplications.pending': 'Guide apps pending',
      'guideApplications.approved': 'Guide apps approved',
      'guideApplications.rejected': 'Guide apps rejected',
      'guideApplications.avgReviewTime': 'Guide review avg (s)',
    },
    dedupeKeys: ['date', 'value'],
  },

  [SectionKeyEnum.TOURS]: {
    expandArray: 'upcomingTours',
    preferredColumns: [
      'date',
      'value',
      'label',
      'bookingsPerTour.label',
      'bookingsPerTour.value',
      'ratingLeaderboard.label',
      'ratingLeaderboard.value',
      'statusCounts.labels',
    ],
    dedupeKeys: ['date', 'value'],
  },

  [SectionKeyEnum.REVIEWS]: {
    expandArray: 'volumeOverTime',
    preferredColumns: ['date', 'value', 'avgRatingTrend.value', 'verificationStatus.labels', 'helpfulnessDistribution.labels'],
    dedupeKeys: ['date', 'value'],
  },

  [SectionKeyEnum.REPORTS]: {
    expandArray: 'resolutionTimes',
    preferredColumns: ['date', 'value', 'statusFunnel.labels', 'reasonsBreakdown.labels', 'avgResolutionTime'],
    dedupeKeys: ['date', 'value'],
  },

  [SectionKeyEnum.IMAGES]: {
    expandArray: 'uploadsOverTime',
    preferredColumns: ['date', 'value', 'moderationStatus.labels', 'storageProviders.labels', 'totalStorage'],
    dedupeKeys: ['date', 'value'],
  },

  [SectionKeyEnum.NOTIFICATIONS]: {
    expandArray: 'deliveryTimeline',
    preferredColumns: ['date', 'value', 'sentVsRead.sent', 'sentVsRead.read', 'sentVsRead.readRate', 'byType.labels', 'byPriority.labels'],
    dedupeKeys: ['date', 'value'],
  },

  [SectionKeyEnum.CHAT]: {
    expandArray: 'messagesOverTime',
    preferredColumns: ['date', 'value', 'readVsUnread.read', 'readVsUnread.unread', 'readVsUnread.readRate', 'topConversations.label', 'topConversations.value'],
    dedupeKeys: ['date', 'value'],
  },

  [SectionKeyEnum.EMPLOYEES]: {
    expandArray: 'countsByRole', // code will choose largest if not present
    preferredColumns: ['label', 'count', 'countsByRole.count', 'countsByDepartment.count', 'countsByStatus.count', 'shiftsData.scheduled', 'shiftsData.completed', 'shiftsData.completionRate'],
    dedupeKeys: ['label', 'count'],
  },

  [SectionKeyEnum.KPIS]: {
    expandArray: null,
    preferredColumns: ['totalUsers', 'totalTours', 'totalBookings', 'avgRating', 'totalImages', 'openReports', 'totalRevenue', 'activeEmployees'],
    dedupeKeys: [],
  },
};

export function toCsv(
  rows: Record<string, string>[],
  columns: { key: string; label: string }[],
  filenameBase: string
): void {
  if (!rows || rows.length === 0) return;

  // Header row based on provided columns (stable order)
  const headers = columns.map(c => escapeCell(c.label)).join(',');

  // For each row, map columns to row values (missing keys -> empty string)
  const csvRows = rows.map(row => {
    const cells = columns.map(col => {
      const raw = row[col.key];
      const cell = raw === undefined || raw === null ? '' : String(raw);
      return escapeCell(cell);
    });
    return cells.join(',');
  });

  const csvContent = [headers, ...csvRows].join('\r\n');
  downloadFile(csvContent, `${filenameBase}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Properly escape cell per RFC4180:
 * - If cell contains comma, quote, or newline, wrap in quotes.
 * - Replace " with "" inside quoted cell.
 */
function escapeCell(value: string): string {
  if (value === null || value === undefined) return '';
  const hasSpecial = /[",\r\n]/.test(value);
  if (hasSpecial) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toJson<T>(data: T, filenameBase: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filenameBase}.json`, 'application/json;charset=utf-8;');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


// src/utils/helpers/statistics.export.ts
import { SectionKeyEnum, SectionResponse } from '@/types/dashboard/statistics.types';

export type Scalar = string | number | boolean | null | undefined;
export type Row = Record<string, string>;
export type Column = { key: string; label: string };

/** type guard for primitive scalar values */
export function isPrimitive(val: unknown): val is Scalar {
  return (
    val === null ||
    val === undefined ||
    typeof val === 'string' ||
    typeof val === 'number' ||
    typeof val === 'boolean'
  );
}

export function stringifyPrimitive(val: unknown): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  return String(val);
}

/**
 * Flatten an object one level deep into string values.
 * - primitives -> scalar string
 * - array of primitives -> joined by '; '
 * - array of objects -> try to extract label/id if consistent; otherwise JSON.stringify each element
 * - nested object -> produce keys like parent.child (one level)
 */
export function flattenObject(input: Record<string, unknown>): Row {
  const out: Row = {};

  for (const [key, value] of Object.entries(input)) {
    if (isPrimitive(value)) {
      out[key] = stringifyPrimitive(value);
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        out[key] = '';
        continue;
      }

      if (value.every(isPrimitive)) {
        out[key] = (value as Scalar[]).map(stringifyPrimitive).join('; ');
        continue;
      }

      // array of objects or mixed
      const onlyObjects = value.every((v) => typeof v === 'object' && v !== null);
      if (onlyObjects) {
        const first = value[0] as Record<string, unknown>;
        if ('label' in first) {
          out[key] = (value as Record<string, unknown>[]).map((v) => (v.label ?? JSON.stringify(v))).join('; ');
        } else if ('id' in first) {
          out[key] = (value as Record<string, unknown>[]).map((v) => (v.id ?? JSON.stringify(v))).join('; ');
        } else {
          out[key] = (value as Record<string, unknown>[]).map((v) => JSON.stringify(v)).join('; ');
        }
        continue;
      }

      // mixed array: stringify primitives, JSON objects
      out[key] = value.map((v) => (isPrimitive(v) ? stringifyPrimitive(v) : JSON.stringify(v))).join('; ');
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      // flatten one level into parent.child
      for (const [subKey, subVal] of Object.entries(value as Record<string, unknown>)) {
        const composite = `${key}.${subKey}`;
        if (isPrimitive(subVal)) {
          out[composite] = stringifyPrimitive(subVal);
        } else {
          out[composite] = JSON.stringify(subVal);
        }
      }
      continue;
    }

    out[key] = '';
  }

  return out;
}

/**
 * Collect ordered unique keys across rows (stable order: first-seen)
 */
export function collectKeys(rows: Row[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const row of rows) {
    for (const k of Object.keys(row)) {
      if (!seen.has(k)) {
        seen.add(k);
        result.push(k);
      }
    }
  }
  return result;
}

export function prettifyLabel(key: string): string {
  const withSpaces = key.replace(/\./g, ' ').replace(/([A-Z])/g, ' $1');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

/**
 * Remove duplicate rows. Two rows considered equal when all values for the specified keys match.
 * If no keys provided, dedupe on full JSON string of the row.
 */
export function dedupeRows(rows: Row[], keys?: string[]): Row[] {
  const seen = new Set<string>();
  const out: Row[] = [];

  for (const r of rows) {
    let key: string;
    if (keys && keys.length > 0) {
      key = keys.map((k) => r[k] ?? '').join('||');
    } else {
      key = JSON.stringify(r);
    }
    if (!seen.has(key)) {
      seen.add(key);
      out.push(r);
    }
  }

  return out;
}

/**
 * Build CSV rows and column descriptors from a section object (SectionResponse).
 *
 * Strategy:
 * - detect top-level array fields; if exactly one "main" array -> expand it into rows,
 *   merging flattened parent fields (excluding the main array)
 * - if multiple arrays -> expand the largest array and summarize other arrays as counts/labels
 * - fallback -> single flattened row
 *
 * This function also removes repeated identical rows by default. You can pass dedupeKeys
 * to dedupe by a subset of columns (for example 'date' + 'value').
 */
export function buildCsvFromSection(
  data: SectionResponse | null,
  opts?: { dedupeKeys?: string[]; expandArraysOfPrimitives?: boolean },
  section?: SectionKeyEnum | string
): { rows: Row[]; columns: Column[] } {
  if (!data) return { rows: [], columns: [] };

  // Resolve section key and config
  const resolvedSection = (Object.values(SectionKeyEnum).includes(section as SectionKeyEnum)
    ? (section as SectionKeyEnum)
    : (String(section) as SectionKeyEnum)) as SectionKeyEnum;
  const config = SECTION_EXPORT_CONFIG[resolvedSection];

  // Allow opts to be overridden by section config
  const dedupeKeys = opts?.dedupeKeys ?? config?.dedupeKeys;
  const preferredExpand = config?.expandArray ?? undefined;
  const preferredColumns = config?.preferredColumns ?? undefined;
  const headerLabels = config?.headerLabels ?? undefined;
  const normalizeRow = config?.normalizeRow ?? undefined;

  const entries = Object.entries(data as unknown as Record<string, unknown>);
  const arrayFields = entries.filter(([, v]) => Array.isArray(v)) as [string, unknown[]][];

  // helper to fallback to single-row flattened export
  const fallback = (): { rows: Row[]; columns: Column[] } => {
    const flattened = flattenObject(data as unknown as Record<string, unknown>);
    const row = normalizeRow ? normalizeRow(flattened) : flattened;
    const cols = Object.keys(row).map((k) => ({ key: k, label: headerLabels?.[k] ?? prettifyLabel(k) }));
    return { rows: [row], columns: cols };
  };

  // Helper to finalize rows -> dedupe -> order columns -> label columns
  const finalize = (rows: Row[]): { rows: Row[]; columns: Column[] } => {
    const normalizedRows = normalizeRow ? rows.map(normalizeRow) : rows;
    const deduped = dedupeRows(normalizedRows, dedupeKeys);

    // Determine ordered keys: preferredColumns first (only those present), then first-seen rest
    const presentPreferred = preferredColumns ? preferredColumns.filter((k) => deduped.some((r) => k in r)) : [];
    const rest = collectKeys(deduped).filter((k) => !presentPreferred.includes(k));
    const orderedKeys = presentPreferred.length > 0 ? [...presentPreferred, ...rest] : rest;

    const columns = orderedKeys.map((k) => ({ key: k, label: headerLabels?.[k] ?? prettifyLabel(k) }));
    return { rows: deduped, columns };
  };

  // Determine the main array to expand:
  // 1) config.expandArray if present and exists on data
  // 2) if single array field -> that
  // 3) if multiple arrays -> choose largest
  let mainArrayKey: string | undefined;
  let mainArray: unknown[] | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (preferredExpand && Array.isArray((data as any)[preferredExpand])) {
    mainArrayKey = preferredExpand;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mainArray = (data as any)[preferredExpand] as unknown[];
  } else if (arrayFields.length === 1) {
    [mainArrayKey, mainArray] = arrayFields[0];
  } else if (arrayFields.length > 1) {
    // choose largest array by length
    let largest = arrayFields[0];
    for (const f of arrayFields) {
      if ((f[1]?.length ?? 0) > (largest[1]?.length ?? 0)) largest = f;
    }
    [mainArrayKey, mainArray] = largest;
  }

  // If no main array found -> fallback single-row
  if (!mainArrayKey || !mainArray || mainArray.length === 0) {
    return fallback();
  }

  // If main array consists of primitives and user opted to expand arrays of primitives -> expand,
  // otherwise if primitives but expandArraysOfPrimitives not enabled -> embed joined list in single row
  if (mainArray.every(isPrimitive)) {
    if (opts?.expandArraysOfPrimitives) {
      const rows: Row[] = [];
      for (const item of mainArray as Scalar[]) {
        const base = flattenObject(data as unknown as Record<string, unknown>);
        base[mainArrayKey] = stringifyPrimitive(item);
        rows.push(base);
      }
      return finalize(rows);
    } else {
      // Keep as single row with joined values for the main array
      const base = flattenObject(data as unknown as Record<string, unknown>);
      base[mainArrayKey] = (mainArray as Scalar[]).map(stringifyPrimitive).join('; ');
      return finalize([base]);
    }
  }

  // If main array items are objects -> expand into multiple rows; otherwise fallback
  if (!mainArray.every((it) => typeof it === 'object' && it !== null)) {
    return fallback();
  }

  // Expand main array of objects into rows, summarizing other arrays
  const rows: Row[] = [];
  for (const item of mainArray as Record<string, unknown>[]) {
    const base = flattenObject(data as unknown as Record<string, unknown>);

    // Summarize other arrays into .count and .labels when applicable
    for (const [k, v] of arrayFields) {
      if (k === mainArrayKey) continue;
      const arr = v as unknown[];
      base[`${k}.count`] = String(arr.length);
      if (arr.length > 0 && arr.every((x) => typeof x === 'object' && x !== null && 'label' in x)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        base[`${k}.labels`] = (arr as any[]).map((x) => x.label ?? '').join('; ');
      } else if (arr.length > 0 && arr.every(isPrimitive)) {
        base[`${k}.values`] = (arr as Scalar[]).map(stringifyPrimitive).join('; ');
      }
    }

    // Remove the main array field from parent context (we'll expand its items)
    delete base[mainArrayKey];

    const itemFlattened = flattenObject(item as Record<string, unknown>);
    rows.push({ ...base, ...itemFlattened });
  }

  return finalize(rows);
}
