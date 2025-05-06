import { createOpenAI } from "@ai-sdk/openai"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createMistral } from "@ai-sdk/mistral"
import { createDeepSeek } from "@ai-sdk/deepseek"
import { streamText } from "ai"
type ModelProvider = keyof typeof providers;

// Initialize providers with API keys
const providers = {
    openai: createOpenAI({ apiKey: process.env.NEXT_OPENAI_API_KEY }),
    anthropic: createAnthropic({ apiKey: process.env.NEXT_ANTHROPIC_API_KEY }),
    google: createGoogleGenerativeAI({ apiKey: process.env.NEXT_GOOGLE_API_KEY }),
    mistral: createMistral({ apiKey: process.env.NEXT_MISTRAL_API_KEY }),
    deepseek: createDeepSeek({ apiKey: process.env.NEXT_DEEPSEEK_API_KEY })
} as const;

export async function POST(req: Request) {
    try {
        const { model, messages } = await req.json()

        if (!model || !providers[model as ModelProvider]) {
            return new Response('Invalid model', { status: 400 })
        }

        const stream = await streamText({
            model: providers[model as ModelProvider].chat(
                model === 'google' ? 'gemini-1.5-pro' :
                    model === 'anthropic' ? 'claude-3-opus-20240229' :
                        model === 'mistral' ? 'mistral-large-latest' :
                            model === 'deepseek' ? 'deepseek-reasoner' : 'gpt-4o-mini'
            ),
            messages
        })

        return stream.toDataStreamResponse()
    } catch (error) {
        console.error('Chat error:', error)
        return new Response('Internal server error', { status: 500 })
    }
}