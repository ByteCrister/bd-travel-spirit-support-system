import { SCHEMA_CONTEXT } from "./schema-context";
import type { ChatTurn, QueryExecutionResult } from "./llm.interface";

function historyBlock(history: ChatTurn[] | undefined): string {
    if (!history?.length) return "";
    return `\nRecent conversation (most recent last):\n${history
        .map((t) => `${t.role}: ${t.content}`)
        .join("\n")}\n`;
}

export function buildActionPrompt(input: {
    userMessage: string;
    history?: ChatTurn[];
    sessionSummary?: string | null;
}): string {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const today = now.toISOString().split("T")[0];

    const summaryBlock = input.sessionSummary?.trim()
        ? `\nSession summary:\n${input.sessionSummary.trim()}\n`
        : "";

    return `
You are a production support AI assistant for the BD Travel Spirit support system.
You must decide what to do next.

You may do ONE of:
1) reply: answer directly without database queries.
2) clarify: ask up to 5 short questions to remove ambiguity.
3) query: request 1-4 database queries using the existing intent JSON format (find/aggregate).

Rules:
- Prefer clarify when user asks for data but missing a required filter (date range, status, which metric, etc.).
- If query: break complex tasks into multiple queries (e.g., revenue + top tours).
- Never include markdown or prose outside the JSON object.
- Keep questions crisp and specific.

Today's date: ${today}
Start of current month (ISO): ${startOfMonth}
${summaryBlock}${historyBlock(input.history)}
Available query intent format and models:
${SCHEMA_CONTEXT}

User request: """${input.userMessage}"""

Return ONLY JSON in one of these shapes:
{ "type":"reply", "message":"..." }
{ "type":"clarify", "questions":["..."] }
{ "type":"query", "queries":[ { "id":"q1", "intent": { ...find/aggregate/reply? (reply not allowed here) } } ] }
`.trim();
}

export function buildSynthesisPrompt(input: {
    userMessage: string;
    history?: ChatTurn[];
    sessionSummary?: string | null;
    data: Array<{ id: string; result: QueryExecutionResult }>;
}): string {
    const summaryBlock = input.sessionSummary?.trim()
        ? `\nSession summary:\n${input.sessionSummary.trim()}\n`
        : "";

    const dataBlock = input.data
        .map(({ id, result }) => {
            const safeRows = result.rows.slice(0, 50);
            return `\n[${id}] model=${result.model} mode=${result.mode}\nrows=${JSON.stringify(
                safeRows
            )}\n`;
        })
        .join("\n");

    return `
You are a helpful, accurate admin AI assistant.
Answer the user using the provided data only. If data is insufficient, say what is missing and ask focused follow-up questions.

Write in Markdown.
Preferred format:
## Answer
<direct answer>

## Details
- <key points>

## Next steps
- <actionable suggestions>

${summaryBlock}${historyBlock(input.history)}
User request: """${input.userMessage}"""

Data:
${dataBlock}
`.trim();
}

export function buildSessionSummaryPrompt(input: {
    priorSummary?: string | null;
    history: ChatTurn[];
}): string {
    const prior = input.priorSummary?.trim()
        ? `Prior summary:\n${input.priorSummary.trim()}\n`
        : "Prior summary: (none)\n";

    return `
You write a compact session memory for an admin support chat.
Capture: user goal, definitions (date ranges, statuses), preferences, and any confirmed constraints.
Do NOT include sensitive data. Do NOT include raw tables.
Keep it under 1200 characters.

${prior}
Recent conversation:
${input.history.map((t) => `${t.role}: ${t.content}`).join("\n")}

Return ONLY the summary text (no JSON).
`.trim();
}

