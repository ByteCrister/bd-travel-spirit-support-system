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
1) reply  — answer directly without a DB query (greetings, help, explanations).
2) clarify — ask up to 3 short questions ONLY when the intent is genuinely ambiguous (two different possible metrics, completely unclear entity).
3) query  — request 1-4 database queries.

DEFAULT INFERENCE RULES (apply these before considering clarify):
- "this month" / "current month" → createdAt: { $gte: "${startOfMonth}" }
- "today" → createdAt: { $gte: "${today}T00:00:00.000Z" }
- "top N" / "first N" → limit N, sort by most relevant field desc (createdAt or totalPaid)
- "latest" / "most recent" / "last" (single item) → sort createdAt: -1, limit 1
- "new users" / "new travelers" → role/model matches, sort createdAt: -1
- No status specified → omit status filter entirely (return all statuses, do NOT ask)
- "all" / "any" / "list" with no filter → use empty filter {}, limit 10, sort createdAt: -1
- "revenue" / "how much" / "total paid" on a booking → aggregate on booking model, $sum "$totalPaid"
- Email of a traveler → query model "user" with role "traveler" (traveler model has no email field)
- Joining date → field "createdAt" on user model

RULE: Prefer QUERY over clarify. If you can reasonably infer what the user wants from the message, DO IT.
Only use clarify when you truly cannot determine which entity, metric, or time range is meant.

If query: break complex tasks into multiple queries (e.g., revenue + top tours).
Never include markdown or prose outside the JSON object.

Today's date: ${today}
Start of current month (ISO): ${startOfMonth}
${summaryBlock}${historyBlock(input.history)}
${revenueContext}

Available query intent format and models:
${SCHEMA_CONTEXT}

Few-shot examples (follow this pattern exactly):
"show me the revenue of this month" → { "type":"query", "queries":[{ "id":"q1", "intent":{ "type":"aggregate", "model":"booking", "pipeline":[{ "$match":{ "status":"confirmed", "bookedAt":{ "$gte":"${startOfMonth}" } } },{ "$group":{ "_id":null, "totalRevenue":{ "$sum":"$totalPaid" } } }] } }] }
"top 2 new traveler users name email joining date this month" → { "type":"query", "queries":[{ "id":"q1", "intent":{ "type":"find", "model":"user", "filter":{ "role":"traveler", "createdAt":{ "$gte":"${startOfMonth}" } }, "projection":{ "name":1, "email":1, "createdAt":1 }, "sort":{ "createdAt":-1 }, "limit":2 } }] }
"list all travelers" → { "type":"query", "queries":[{ "id":"q1", "intent":{ "type":"find", "model":"traveler", "filter":{}, "sort":{ "createdAt":-1 }, "limit":10 } }] }
"how many bookings confirmed last month" → { "type":"query", "queries":[{ "id":"q1", "intent":{ "type":"aggregate", "model":"booking", "pipeline":[{ "$match":{ "status":"confirmed" } },{ "$count":"total" }] } }] }
"how much revenue generated by the latest booking" → { "type":"query", "queries":[{ "id":"q1", "intent":{ "type":"find", "model":"booking", "filter":{}, "sort":{ "createdAt":-1 }, "limit":1, "projection":{ "totalPaid":1, "status":1, "bookingReference":1, "createdAt":1 } } }] }
"what is the total revenue from all confirmed bookings" → { "type":"query", "queries":[{ "id":"q1", "intent":{ "type":"aggregate", "model":"booking", "pipeline":[{ "$match":{ "status":"confirmed" } },{ "$group":{ "_id":null, "totalRevenue":{ "$sum":"$totalPaid" } } }] } }] }

User request: """${input.userMessage}"""

Return ONLY JSON in one of these shapes:
{ "type":"reply", "message":"..." }
{ "type":"clarify", "questions":["..."] }
{ "type":"query", "queries":[ { "id":"q1", "intent": { ...find or aggregate } } ] }
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

    // When a session summary exists, it already captures older context.
    // Only include recent history turns to avoid token bloat.
    const recentHistory = input.sessionSummary?.trim()
        ? (input.history ?? []).slice(-4)
        : (input.history ?? []);

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

${summaryBlock}${historyBlock(recentHistory)}
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

