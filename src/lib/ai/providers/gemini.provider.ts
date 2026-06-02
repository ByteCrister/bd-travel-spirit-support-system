import { GoogleGenerativeAI } from "@google/generative-ai";
import { AssistantIntent, ChatTurn, LLMProvider } from "../llm.interface";
import { extractJsonObject, parseAssistantIntent } from "../intent-parser";
import { buildPrompt } from "../schema-context";
import { buildActionPrompt, buildSessionSummaryPrompt, buildSynthesisPrompt } from "../chat-prompts";

export class GeminiProvider implements LLMProvider {
    private genAI: GoogleGenerativeAI;
    private model: string;

    constructor(apiKey: string, modelName = "gemini-2.0-flash") {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = modelName;
    }

    async generateIntent(userMessage: string, history: ChatTurn[] = []): Promise<AssistantIntent> {
        const model = this.genAI.getGenerativeModel({ model: this.model });
        const prompt = buildPrompt(userMessage, history);

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return parseAssistantIntent(extractJsonObject(text));
    }

    async generateAction(input: {
        userMessage: string;
        history?: ChatTurn[];
        sessionSummary?: string | null;
    }): Promise<unknown> {
        const model = this.genAI.getGenerativeModel({ model: this.model });
        const prompt = buildActionPrompt(input);
        const result = await model.generateContent(prompt);
        return extractJsonObject(result.response.text());
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
