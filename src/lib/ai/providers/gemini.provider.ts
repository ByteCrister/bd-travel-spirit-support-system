import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatTurn, LLMProvider } from "../llm.interface";
import { extractJsonObject } from "../intent-parser";
import { buildActionPrompt, buildSessionSummaryPrompt, buildSynthesisPrompt } from "../chat-prompts";

export class GeminiProvider implements LLMProvider {
    private genAI: GoogleGenerativeAI;
    private model: string;

    constructor(apiKey: string, modelName = "gemini-3.5-flash") {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = modelName;
    }

    async generateAction(input: {
        userMessage: string;
        history?: ChatTurn[];
        sessionSummary?: string | null;
        isAdmin?: boolean;
    }): Promise<unknown> {
        const model = this.genAI.getGenerativeModel({
            model: this.model,
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.4,
            },
        });
        const prompt = buildActionPrompt(input);
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return extractJsonObject(text);
    }

    async synthesizeAnswer(input: {
        userMessage: string;
        history?: ChatTurn[];
        sessionSummary?: string | null;
        data: Array<{ id: string; result: import("../llm.interface").QueryExecutionResult }>;
    }): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: this.model });
        const prompt = buildSynthesisPrompt(input);
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    }

    async summarizeSession(input: {
        priorSummary?: string | null;
        history: ChatTurn[];
    }): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: this.model });
        const prompt = buildSessionSummaryPrompt(input);
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    }
}
