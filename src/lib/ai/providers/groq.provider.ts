import Groq from "groq-sdk";
import { AssistantIntent, ChatTurn, LLMProvider } from "../llm.interface";
import { extractJsonObject, parseAssistantIntent } from "../intent-parser";
import { SCHEMA_CONTEXT, buildPrompt } from "../schema-context";

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
}
