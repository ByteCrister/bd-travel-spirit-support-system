export type DataModel =
    | "traveler"
    | "user"
    | "employee"
    | "guide"
    | "tour"
    | "booking"
    | "transaction";

export type FindIntent = {
    type: "find";
    model: DataModel;
    filter?: Record<string, unknown>;
    projection?: Record<string, 0 | 1>;
    limit?: number;
    sort?: Record<string, 1 | -1>;
};

export type AggregateIntent = {
    type: "aggregate";
    model: DataModel;
    pipeline: Record<string, unknown>[];
};

export type ReplyIntent = {
    type: "reply";
    message: string;
};

export type AssistantIntent = FindIntent | AggregateIntent | ReplyIntent;

export interface ChatTurn {
    role: "user" | "assistant";
    content: string;
}

export interface LLMProvider {
    generateIntent(userMessage: string, history?: ChatTurn[]): Promise<AssistantIntent>;
}

export interface QueryExecutionResult {
    model: DataModel;
    mode: "find" | "aggregate";
    rows: Record<string, unknown>[];
}
