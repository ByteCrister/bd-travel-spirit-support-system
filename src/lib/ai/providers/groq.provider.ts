import Groq from "groq-sdk";
import { AssistantIntent, ChatTurn, LLMProvider } from "../llm.interface";
import { extractJsonObject, parseAssistantIntent } from "../intent-parser";
import { SCHEMA_CONTEXT, buildPrompt } from "../schema-context";
import { buildActionPrompt, buildSessionSummaryPrompt, buildSynthesisPrompt } from "../chat-prompts";

export class GroqProvider implements LLMProvider {
    private groq: Groq;
    private model: string;

    constructor(apiKey: string, modelName = "llama-3.3-70b-versatile") {
        this.groq = new Groq({ apiKey });
        this.model = modelName;
    }

    async generateIntent(userMessage: string, history: ChatTurn[] = []): Promise<AssistantIntent> {
        const chatCompletion = await this.groq.chat.completions.create({
            messages: [
                { role: "system", content: SCHEMA_CONTEXT },
                { role: "user", content: buildPrompt(userMessage, history) },
            ],
            model: this.model,
            temperature: 0.1,
            response_format: { type: "json_object" },
        });

        const content = chatCompletion.choices[0]?.message?.content || "";
        return parseAssistantIntent(extractJsonObject(content));
    }

    async generateAction(input: {
        userMessage: string;
        history?: ChatTurn[];
        sessionSummary?: string | null;
    }): Promise<unknown> {
        const completion = await this.groq.chat.completions.create({
            messages: [{ role: "user", content: buildActionPrompt(input) }],
            model: this.model,
            temperature: 0.2,
            response_format: { type: "json_object" },
        });
        return extractJsonObject(completion.choices[0]?.message?.content || "");
    }

    async synthesizeAnswer(input: {
        userMessage: string;
        history?: ChatTurn[];
        sessionSummary?: string | null;
        data: Array<{ id: string; result: import("../llm.interface").QueryExecutionResult }>;
    }): Promise<string> {
        const completion = await this.groq.chat.completions.create({
            messages: [{ role: "user", content: buildSynthesisPrompt(input) }],
            model: this.model,
            temperature: 0.2,
        });
        return (completion.choices[0]?.message?.content || "").trim();
    }

    async summarizeSession(input: {
        priorSummary?: string | null;
        history: ChatTurn[];
    }): Promise<string> {
        const completion = await this.groq.chat.completions.create({
            messages: [{ role: "user", content: buildSessionSummaryPrompt(input) }],
            model: this.model,
            temperature: 0.1,
        });
        return (completion.choices[0]?.message?.content || "").trim();
    }
}
