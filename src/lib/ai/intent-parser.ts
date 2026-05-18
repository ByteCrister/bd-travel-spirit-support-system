import { Types } from "mongoose";
import {
    AssistantIntent,
    AggregateIntent,
    DataModel,
    FindIntent,
    ReplyIntent,
} from "./llm.interface";

const DATA_MODELS: DataModel[] = [
    "traveler",
    "user",
    "employee",
    "guide",
    "tour",
    "booking",
    "transaction",
];

const FORBIDDEN_FILTER_KEYS = new Set(["$where", "$function", "$accumulator", "$expr"]);
const ALLOWED_PIPELINE_STAGES = new Set([
    "$match",
    "$group",
    "$sort",
    "$limit",
    "$project",
    "$lookup",
    "$unwind",
    "$count",
    "$addFields",
]);

const MAX_LIMIT = 50;
const MAX_PIPELINE_LENGTH = 12;

export function extractJsonObject(text: string): unknown {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("No JSON in LLM response");
    }
    return JSON.parse(jsonMatch[0]);
}

export function parseAssistantIntent(raw: unknown): AssistantIntent {
    if (!raw || typeof raw !== "object") {
        throw new Error("Invalid intent payload");
    }

    const payload = raw as Record<string, unknown>;
    const type = payload.type;

    if (type === "reply") {
        const message = payload.message;
        if (typeof message !== "string" || !message.trim()) {
            throw new Error("Reply intent requires a message");
        }
        return { type: "reply", message: message.trim() } satisfies ReplyIntent;
    }

    const model = normalizeModel(payload.model);
    if (!model) {
        throw new Error(`Unknown model: ${String(payload.model)}`);
    }

    if (type === "aggregate") {
        const pipeline = sanitizePipeline(payload.pipeline);
        return { type: "aggregate", model, pipeline } satisfies AggregateIntent;
    }

    return {
        type: "find",
        model,
        filter: sanitizeFilter(payload.filter ?? {}),
        projection: sanitizeProjection(payload.projection),
        limit: sanitizeLimit(payload.limit),
        sort: sanitizeSort(payload.sort),
    } satisfies FindIntent;
}

function normalizeModel(value: unknown): DataModel | null {
    if (typeof value !== "string") return null;
    const normalized = value.toLowerCase().trim() as DataModel;
    return DATA_MODELS.includes(normalized) ? normalized : null;
}

function sanitizeLimit(value: unknown): number {
    if (typeof value !== "number" || Number.isNaN(value)) return 10;
    return Math.min(Math.max(1, Math.floor(value)), MAX_LIMIT);
}

function sanitizeSort(value: unknown): Record<string, 1 | -1> | undefined {
    if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

    const sort: Record<string, 1 | -1> = {};
    for (const [key, dir] of Object.entries(value as Record<string, unknown>)) {
        if (dir === 1 || dir === -1) sort[key] = dir;
    }
    return Object.keys(sort).length ? sort : undefined;
}

function sanitizeProjection(
    value: unknown
): Record<string, 0 | 1> | undefined {
    if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

    const projection: Record<string, 0 | 1> = {};
    for (const [key, flag] of Object.entries(value as Record<string, unknown>)) {
        if (flag === 0 || flag === 1) projection[key] = flag;
    }
    return Object.keys(projection).length ? projection : undefined;
}

function sanitizeFilter(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return {};
    }
    return sanitizeValue(value as Record<string, unknown>) as Record<string, unknown>;
}

function sanitizePipeline(value: unknown): Record<string, unknown>[] {
    if (!Array.isArray(value)) {
        throw new Error("Aggregate intent requires a pipeline array");
    }

    const pipeline = value
        .slice(0, MAX_PIPELINE_LENGTH)
        .map((stage) => {
            if (!stage || typeof stage !== "object" || Array.isArray(stage)) {
                throw new Error("Invalid aggregation stage");
            }

            const stageObj = stage as Record<string, unknown>;
            const stageName = Object.keys(stageObj)[0];
            if (!stageName || !ALLOWED_PIPELINE_STAGES.has(stageName)) {
                throw new Error(`Aggregation stage not allowed: ${stageName}`);
            }

            if (stageName === "$match") {
                return { $match: sanitizeFilter(stageObj.$match) };
            }

            if (stageName === "$limit") {
                return { $limit: sanitizeLimit(stageObj.$limit) };
            }

            return sanitizeValue(stageObj) as Record<string, unknown>;
        });

    if (!pipeline.length) {
        throw new Error("Aggregate pipeline cannot be empty");
    }

    return pipeline;
}

function sanitizeValue(value: unknown): unknown {
    if (value === null || value === undefined) return value;

    if (typeof value === "string" && isIsoDateString(value)) {
        return new Date(value);
    }

    if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item));
    }

    if (typeof value !== "object") return value;

    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};

    for (const [key, nested] of Object.entries(obj)) {
        if (FORBIDDEN_FILTER_KEYS.has(key)) continue;

        if (key === "$regex" && typeof nested === "string") {
            result.$regex = nested;
            continue;
        }

        if (key === "$options" && typeof nested === "string") {
            result.$options = nested.replace(/[^ims]/g, "") || "i";
            continue;
        }

        if (key === "$oid" && typeof nested === "string" && Types.ObjectId.isValid(nested)) {
            return new Types.ObjectId(nested);
        }

        if (
            (key === "_id" || key.endsWith("Id") || key === "user" || key === "traveler" || key === "tour" || key === "companyId" || key === "authorId" || key === "paymentAccountId") &&
            typeof nested === "string" &&
            Types.ObjectId.isValid(nested)
        ) {
            result[key] = new Types.ObjectId(nested);
            continue;
        }

        if (key.startsWith("$")) {
            result[key] = sanitizeValue(nested);
            continue;
        }

        result[key] = sanitizeValue(nested);
    }

    return result;
}

function isIsoDateString(value: string): boolean {
    return /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isNaN(Date.parse(value));
}
