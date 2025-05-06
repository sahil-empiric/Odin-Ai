import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createMistral } from "@ai-sdk/mistral"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { streamText } from "ai"

// Define model configurations
const MODEL_CONFIGS = {
    openai: {
        provider: createOpenAI({ apiKey: process.env.NEXT_OPENAI_API_KEY }),
        defaultModel: 'gpt-4o-mini'
    },
    anthropic: {
        provider: createAnthropic({ apiKey: process.env.NEXT_ANTHROPIC_API_KEY }),
        defaultModel: 'claude-3-opus-20240229'
    },
    google: {
        provider: createGoogleGenerativeAI({ apiKey: process.env.NEXT_GOOGLE_API_KEY }),
        defaultModel: 'gemini-1.5-pro'
    },
    mistral: {
        provider: createMistral({ apiKey: process.env.NEXT_MISTRAL_API_KEY }),
        defaultModel: 'mistral-large-latest'
    },
    deepseek: {
        provider: createDeepSeek({ apiKey: process.env.NEXT_DEEPSEEK_API_KEY }),
        defaultModel: 'deepseek-reasoner'
    }
} as const;

type ModelProvider = keyof typeof MODEL_CONFIGS;

export async function POST(req: Request) {
    try {
        const { model, messages } = await req.json();

        // Validate model
        if (!model || !MODEL_CONFIGS[model as ModelProvider]) {
            return new Response('Invalid model provider', { status: 400 });
        }

        const config = MODEL_CONFIGS[model as ModelProvider];

        // Create and return the stream
        const stream = await streamText({
            model: config.provider.chat(config.defaultModel),
            messages
        });

        return stream.toDataStreamResponse();
    } catch (error) {
        console.error('Chat API error:', error);
        return new Response('Internal server error', { status: 500 });
    }
}