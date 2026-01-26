import { RequestStatus } from "@/constants/reset-password-request.const";
import { ResetPasswordRequestDTO } from "@/types/password-reset.types";
import { faker } from "@faker-js/faker";

// Deterministic dataset per server process
const SEED = 12345;
faker.seed(SEED);

const DATASET_SIZE = 200;
export let MOCK_DB: ResetPasswordRequestDTO[] = [];

// ---- Helpers ----

function randomStatus(): RequestStatus {
  const r = faker.number.int({ min: 1, max: 100 });
  if (r <= 70) return "pending";
  if (r <= 90) return "denied";
  return "fulfilled";
}

function safeBetween(from: Date, to: Date) {
  // guarantee valid range
  const f = from < to ? from : to;
  const t = from < to ? to : from;
  return faker.date.between({ from: f, to: t });
}

// ---- DTO Builder ----

function makeDto(): ResetPasswordRequestDTO {
  const id = faker.string.uuid();
  const status = randomStatus();

  // requestedAt = within 90 days
  const requestedAtDate = faker.date.recent({ days: 90 });

  // createdAt = any time within 2 years before requestedAt
  const twoYearsBack = faker.date.past({ years: 2 });
  const createdAtDate = safeBetween(twoYearsBack, requestedAtDate);

  let reviewedAt: string | undefined;
  let fulfilledAt: string | undefined;
  let reason: string | undefined;

  if (status === "denied") {
    reviewedAt = safeBetween(requestedAtDate, new Date()).toISOString();
    reason = faker.helpers.arrayElement([
      "Invalid identity provided",
      "Policy violation",
      "Duplicate request",
      "Insufficient verification",
    ]);
  }

  if (status === "fulfilled") {
    const reviewedAtDate = safeBetween(requestedAtDate, new Date());
    reviewedAt = reviewedAtDate.toISOString();

    fulfilledAt = safeBetween(reviewedAtDate, new Date()).toISOString();
  }

  return {
    _id: id,
    requesterEmail: faker.internet.email(),
    requesterMobile: `+8801${faker.number.int({
      min: 100000000,
      max: 999999999,
    })}`,
    requesterName: faker.person.fullName(),

    description: faker.helpers.maybe(() => faker.lorem.sentence(), {
      probability: 0.6,
    }),

    reason,
    status,

    requestedAt: requestedAtDate.toISOString(),
    reviewedAt,
    fulfilledAt,

    requestedFromIP: faker.internet.ipv4(),
    requestedAgent: faker.internet.userAgent(),

    createdAt: createdAtDate.toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
  };
}

// ---- Generate Dataset ----

export function ensureDataset() {
  if (MOCK_DB.length > 0) return;
  MOCK_DB = Array.from({ length: DATASET_SIZE }, () => makeDto());
}

// ---- Search ----

export function matchesSearch(dto: ResetPasswordRequestDTO, q?: string) {
  if (!q) return true;
  const hay = `${dto.requesterEmail} ${dto.requesterName ?? ""} ${
    dto.requesterMobile ?? ""
  }`.toLowerCase();
  return q
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .every((token) => hay.includes(token));
}

// ---- Filters ----

export function applyFilters(
  dto: ResetPasswordRequestDTO,
  filters?: Record<string, string | number | boolean | undefined>
) {
  if (!filters) return true;
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = (dto as any)[k];
    if (val === undefined) return false;
    if (typeof val === "boolean") {
      if (String(val) !== String(v)) return false;
    } else if (typeof val === "number") {
      if (String(val) !== String(v)) return false;
    } else {
      if (String(val).toLowerCase() !== String(v).toLowerCase()) return false;
    }
  }
  return true;
}

// ---- Sorting ----

export function compareByField(
  a: ResetPasswordRequestDTO,
  b: ResetPasswordRequestDTO,
  field: string,
  dir: "asc" | "desc"
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const av = (a as any)[field];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bv = (b as any)[field];

  if (av == null && bv == null) return 0;
  if (av == null) return dir === "asc" ? 1 : -1;
  if (bv == null) return dir === "asc" ? -1 : 1;

  // Date strings
  if (typeof av === "string" && Date.parse(av)) {
    const ad = Date.parse(av);
    const bd = Date.parse(bv);
    return dir === "asc" ? ad - bd : bd - ad;
  }

  // Strings
  if (typeof av === "string") {
    if (av < bv) return dir === "asc" ? -1 : 1;
    if (av > bv) return dir === "asc" ? 1 : -1;
    return 0;
  }

  // Numbers
  if (typeof av === "number") {
    return dir === "asc" ? av - bv : bv - av;
  }

  return 0;
}
