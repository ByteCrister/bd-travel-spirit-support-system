import Groq from "groq-sdk";
import { ChatTurn, LLMProvider } from "../llm.interface";
import { extractJsonObject } from "../intent-parser";
import { buildActionPrompt, buildSessionSummaryPrompt, buildSynthesisPrompt } from "../chat-prompts";

export class GroqProvider implements LLMProvider {
    private groq: Groq;
    private model: string;

    constructor(apiKey: string, modelName = "llama-3.3-70b-versatile") {
        this.groq = new Groq({ apiKey });
        this.model = modelName;
    }

    async generateAction(input: {
        userMessage: string;
        history?: ChatTurn[];
        sessionSummary?: string | null;
        isAdmin?: boolean;
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
