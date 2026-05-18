import { GoogleGenerativeAI } from "@google/generative-ai";
import { AssistantIntent, ChatTurn, LLMProvider } from "../llm.interface";
import { extractJsonObject, parseAssistantIntent } from "../intent-parser";
import { buildPrompt } from "../schema-context";

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
}
