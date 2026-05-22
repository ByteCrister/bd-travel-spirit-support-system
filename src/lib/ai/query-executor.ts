import { FilterQuery, Query, Types } from "mongoose";

type LooseQuery = Query<unknown[], unknown>;
import { TravelerModel } from "@/models/travelers/traveler.model";
import { UserModel } from "@/models/user.model";
import EmployeeModel from "@/models/employees/employees.model";
import GuideModel from "@/models/guide/guide.model";
import TourModel from "@/models/tours/tour.model";
import BookingModel from "@/models/tours/booking.model";
import { TransactionModel } from "@/models/payments/transaction.model";
import {
    AggregateIntent,
    AssistantIntent,
    DataModel,
    FindIntent,
    QueryExecutionResult,
} from "./llm.interface";

function asFilter<T>(filter: Record<string, unknown>): FilterQuery<T> {
    return filter as FilterQuery<T>;
}

async function runFind(
    model: DataModel,
    filter: Record<string, unknown>,
    projection: Record<string, 0 | 1> | undefined,
    limit: number,
    sort: Record<string, 1 | -1> | undefined
): Promise<Record<string, unknown>[]> {
    switch (model) {
        case "traveler": {
            let query = TravelerModel.find(asFilter(filter)) as LooseQuery;
            if (projection) query = query.select(projection);
            if (sort) query = query.sort(sort);
            return query
                .populate("user", "name email")
                .limit(limit)
                .lean() as Promise<Record<string, unknown>[]>;
        }
        case "user": {
            let query = UserModel.find(asFilter(filter)) as LooseQuery;
            if (projection) query = query.select(projection);
            if (sort) query = query.sort(sort);
            return query.limit(limit).lean() as Promise<Record<string, unknown>[]>;
        }
        case "employee": {
            let query = EmployeeModel.find(asFilter(filter)) as LooseQuery;
            if (projection) query = query.select(projection);
            if (sort) query = query.sort(sort);
            return query
                .populate("user", "name email")
                .limit(limit)
                .lean() as Promise<Record<string, unknown>[]>;
        }
        case "guide": {
            let query = GuideModel.find(asFilter(filter)) as LooseQuery;
            if (projection) query = query.select(projection);
            if (sort) query = query.sort(sort);
            return query.limit(limit).lean() as Promise<Record<string, unknown>[]>;
        }
        case "tour": {
            let query = TourModel.find(asFilter(filter)) as LooseQuery;
            if (projection) query = query.select(projection);
            if (sort) query = query.sort(sort);
            return query.limit(limit).lean() as Promise<Record<string, unknown>[]>;
        }
        case "booking": {
            let query = BookingModel.find(asFilter(filter)) as LooseQuery;
            if (projection) query = query.select(projection);
            if (sort) query = query.sort(sort);
            return query
                .populate("traveler", "name phone")
                .populate("tour", "title uniqueTourCode status")
                .limit(limit)
                .lean() as Promise<Record<string, unknown>[]>;
        }
        case "transaction": {
            let query = TransactionModel.find(asFilter(filter)) as LooseQuery;
            if (projection) query = query.select(projection);
            if (sort) query = query.sort(sort);
            return query.limit(limit).lean() as Promise<Record<string, unknown>[]>;
        }
        default:
            throw new Error(`Unknown model: ${model}`);
    }
}

async function runAggregate(
    model: DataModel,
    pipeline: Record<string, unknown>[]
): Promise<Record<string, unknown>[]> {
    const stages = pipeline as never[];
    switch (model) {
        case "traveler":
            return TravelerModel.aggregate(stages) as Promise<Record<string, unknown>[]>;
        case "user":
            return UserModel.aggregate(stages) as Promise<Record<string, unknown>[]>;
        case "employee":
            return EmployeeModel.aggregate(stages) as Promise<Record<string, unknown>[]>;
        case "guide":
            return GuideModel.aggregate(stages) as Promise<Record<string, unknown>[]>;
        case "tour":
            return TourModel.aggregate(stages) as Promise<Record<string, unknown>[]>;
        case "booking":
            return BookingModel.aggregate(stages) as Promise<Record<string, unknown>[]>;
        case "transaction":
            return TransactionModel.aggregate(stages) as Promise<Record<string, unknown>[]>;
        default:
            throw new Error(`Unknown model: ${model}`);
    }
}

export async function executeIntent(intent: AssistantIntent): Promise<QueryExecutionResult> {
    if (intent.type === "reply") {
        throw new Error("Reply intents are not executed against the database");
    }

    if (intent.type === "aggregate") {
        return executeAggregate(intent);
    }

    return executeFind(intent);
}

async function executeFind(intent: FindIntent): Promise<QueryExecutionResult> {
    const rows = await runFind(
        intent.model,
        intent.filter ?? {},
        intent.projection,
        intent.limit ?? 10,
        intent.sort
    );

    return { model: intent.model, mode: "find", rows };
}

async function executeAggregate(intent: AggregateIntent): Promise<QueryExecutionResult> {
    const rows = await runAggregate(intent.model, intent.pipeline);
    return { model: intent.model, mode: "aggregate", rows };
}

export function serializeRows(rows: Record<string, unknown>[]): Record<string, unknown>[] {
    return rows.map((row) => JSON.parse(JSON.stringify(row, replacer)));
}

function replacer(_key: string, value: unknown): unknown {
    if (value instanceof Types.ObjectId) {
        return value.toString();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    return value;
}
