const { GoogleGenerativeAI } = require('@google/generative-ai');
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash', generationConfig: { responseMimeType: 'application/json', temperature: 0.1 } });

async function test() {
  const prompt = `
You are a production support AI assistant for the BD Travel Spirit support system.
You must decide what to do next.

You may do ONE of:
1) reply  — answer directly without a DB query (greetings, help, explanations).
2) clarify — ask up to 3 short questions ONLY when the intent is genuinely ambiguous (two different possible metrics, completely unclear entity).
3) query  — request 1-4 database queries.

DEFAULT INFERENCE RULES (apply these before considering clarify):
- "this month" / "current month" → createdAt: { $gte: "2026-07-01T00:00:00.000Z" }
- "today" → createdAt: { $gte: "2026-07-31T00:00:00.000Z" }
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

Today's date: 2026-07-31
Start of current month (ISO): 2026-07-01T00:00:00.000Z

Available query intent format and models:
You are an admin assistant for the BD Travel Spirit support system.
Convert each admin question into ONE JSON object. No markdown. No explanation.

Intent types:
1) find — list documents
2) aggregate — counts, sums, revenue, averages
3) reply — greetings, help, or questions that need no database query

JSON shapes:
{ "type": "find", "model": "<model>", "filter": {}, "projection": {}, "limit": 10, "sort": { "createdAt": -1 } }
{ "type": "aggregate", "model": "<model>", "pipeline": [ { "$match": {} }, { "$group": { "_id": null, "total": { "$sum": "$totalPaid" } } } ] }
{ "type": "reply", "message": "your helpful admin answer" }

Models and fields:
traveler — name, phone, accountStatus, isVerified, address.district, address.division, address.upazila, user (ObjectId), createdAt
user — name, email, role (traveler|guide|assistant|support|admin), createdAt
employee — user (ObjectId), companyId, status, employmentType, salary, currency, paymentMode, contactInfo.phone, contactInfo.email, dateOfJoining, payroll.status, createdAt
guide — companyName, bio, status (pending|approved|rejected|suspended), owner.phone, address.city, address.division, reviewedAt, createdAt
tour — title, slug, uniqueTourCode, status, moderationStatus, companyId, division, district, basePrice.amount, basePrice.currency, featured, publishedAt, createdAt
booking — bookingReference, uniqueTourCode, traveler, tour, totalParticipants, totalPaid, status, payment.status, payment.method, bookedAt, createdAt
transaction — paymentAccountId, stripePaymentIntentId, amount, currency, status (pending|processing|succeeded|failed|canceled|refunded), description, createdAt

Rules:
- Partial text search: { "name": { "$regex": "akash", "$options": "i" } } or { "companyName": { "$regex": "spirit", "$options": "i" } }
- Use exact enum strings from schema (e.g. accountStatus "active", booking status "confirmed", payment.status "paid")
- Default limit 10 unless user asks for more (max 50)
- Money / revenue / total paid → usually model "booking" or "transaction" with aggregate
- "How many travelers" → aggregate with $count or $group
- If unclear or conversational → type "reply"
- For "help" or "what can you do" → type "reply" with capabilities summary

Few-shot examples (follow this pattern exactly):
"show me the revenue of this month" → { "type":"query", "queries":[{ "id":"q1", "intent":{ "type":"aggregate", "model":"booking", "pipeline":[{ "$match":{ "status":"confirmed", "bookedAt":{ "$gte":"2026-07-01T00:00:00.000Z" } } },{ "$group":{ "_id":null, "totalRevenue":{ "$sum":"$totalPaid" } } }] } }] }
"top 2 new traveler users name email joining date this month" → { "type":"query", "queries":[{ "id":"q1", "intent":{ "type":"find", "model":"user", "filter":{ "role":"traveler", "createdAt":{ "$gte":"2026-07-01T00:00:00.000Z" } }, "projection":{ "name":1, "email":1, "createdAt":1 }, "sort":{ "createdAt":-1 }, "limit":2 } }] }
"list all travelers" → { "type":"query", "queries":[{ "id":"q1", "intent":{ "type":"find", "model":"traveler", "filter":{}, "sort":{ "createdAt":-1 }, "limit":10 } }] }
"how many bookings confirmed last month" → { "type":"query", "queries":[{ "id":"q1", "intent":{ "type":"aggregate", "model":"booking", "pipeline":[{ "$match":{ "status":"confirmed" } },{ "$count":"total" }] } }] }
"how much revenue generated by the latest booking" → { "type":"query", "queries":[{ "id":"q1", "intent":{ "type":"find", "model":"booking", "filter":{}, "sort":{ "createdAt":-1 }, "limit":1, "projection":{ "totalPaid":1, "status":1, "bookingReference":1, "createdAt":1 } } }] }

User request: """How much revenue generated by the latest booking?"""

Return ONLY JSON in one of these shapes:
{ "type":"reply", "message":"..." }
{ "type":"clarify", "questions":["..."] }
{ "type":"query", "queries":[ { "id":"q1", "intent": { ...find or aggregate } } ] }
`;
  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}
test();
