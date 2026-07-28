import { SCHEMA_CONTEXT } from "./schema-context";
import type { ChatTurn, QueryExecutionResult } from "./llm.interface";

function historyBlock(history: ChatTurn[] | undefined): string {
    if (!history?.length) return "";
    return `\nRecent conversation (most recent last):\n${history
        .map((t) => `${t.role}: ${t.content}`)
        .join("\n")}\n`;
}

// Platform commission rate — read once at module load so it is available at prompt-build time
const COMMISSION_RATE = parseFloat(process.env.ADMIN_COMMISSION_RATE ?? "0.15");
const COMMISSION_PERCENT = Math.round(COMMISSION_RATE * 100); // e.g. 15

export function buildActionPrompt(input: {
    userMessage: string;
    history?: ChatTurn[];
    sessionSummary?: string | null;
    isAdmin?: boolean;
}): string {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const today = now.toISOString().split("T")[0];

    const summaryBlock = input.sessionSummary?.trim()
        ? `\nSession summary:\n${input.sessionSummary.trim()}\n`
        : "";

    // ── Revenue context (admin only) ──────────────────────────────────────────
    const revenueContext = input.isAdmin
        ? `
Revenue / commission rules (ADMIN ONLY):
- Platform commission rate: ${COMMISSION_PERCENT}% (env ADMIN_COMMISSION_RATE = ${COMMISSION_RATE}).
- Each confirmed booking: traveller pays totalPaid → funds held in escrow → on tour completion,
  ${100 - COMMISSION_PERCENT}% goes to the guide company, ${COMMISSION_PERCENT}% goes to the platform.
- To calculate platform revenue from bookings: aggregate booking model, $sum: "$totalPaid", then multiply result by ${COMMISSION_RATE}.
- Example platform revenue query: model "booking", $match status "confirmed", $group _id null, totalGross $sum "$totalPaid".
  Platform share = totalGross × ${COMMISSION_RATE}.
- transaction model shows raw Stripe/payment transactions (admin view only).
- You MAY generate revenue, transaction, commission, and earnings queries.
`.trim()
        : `
IMPORTANT RESTRICTION (support role):
- You are NOT authorised to access revenue, financial, commission, earnings, income, or profit data.
- Do NOT generate intents with model "transaction".
- Do NOT include $sum "$totalPaid", $sum "$amount", or any revenue-related aggregation.
- If the user asks about revenue or financials, respond with type "reply" explaining that this information is restricted to administrators.
`.trim();

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
${revenueContext}

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

