import { LLMProvider } from "./llm.interface";
import { GeminiProvider } from "./providers/gemini.provider";
import { GroqProvider } from "./providers/groq.provider";

export function getLLMProvider(): LLMProvider {
    const provider = process.env.AI_PROVIDER || "gemini";

    if (provider === "gemini") {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY not set");
        return new GeminiProvider(apiKey, process.env.GEMINI_MODEL);
    }

    if (provider === "groq") {
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) throw new Error("GROQ_API_KEY not set");
        return new GroqProvider(apiKey, process.env.GROQ_MODEL);
    }

    throw new Error(`Unknown AI provider: ${provider}`);
}