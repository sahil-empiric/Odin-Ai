"use client"

import { useState } from "react"
import { openai } from "@ai-sdk/openai"
import { deepseek } from "@ai-sdk/deepseek"
import { anthropic } from "@ai-sdk/anthropic"
import { google } from '@ai-sdk/google';
import { mistral } from "@ai-sdk/mistral"
import { generateText, streamText } from "ai"
import type { ModelProvider } from "@/types/database.types"

type ModelConfig = {
  [key in ModelProvider]: {
    name: string
    model: any
    tierRequired: "free" | "basic" | "premium"
  }
}

export const modelConfig: ModelConfig = {
  openai: {
    name: "GPT-4o",
    model: openai("gpt-4o"),
    tierRequired: "free",
  },
  deepseek: {
    name: "DeepSeek Reasoner",
    model: deepseek("deepseek-reasoner"),
    tierRequired: "basic",
  },
  gemini: {
    name: "Gemini Pro",
    model: google("gemini-pro"),
    tierRequired: "basic",
  },
  anthropic: {
    name: "Claude 3 Opus",
    model: anthropic("claude-3-opus-20240229"),
    tierRequired: "premium",
  },
  mistral: {
    name: "Mistral Large",
    model: mistral("mistral-large-latest"),
    tierRequired: "premium",
  },
}

export function useAiModels(userTier: "free" | "basic" | "premium") {
  const [isGenerating, setIsGenerating] = useState(false)

  const getAvailableModels = () => {
    const tierValues = { free: 1, basic: 2, premium: 3 }
    const userTierValue = tierValues[userTier]

    return Object.entries(modelConfig)
      .filter(([_, config]) => {
        const modelTierValue = tierValues[config.tierRequired]
        return userTierValue >= modelTierValue
      })
      .map(([key]) => key as ModelProvider)
  }

  const generateResponse = async (provider: ModelProvider, prompt: string, onChunk?: (chunk: string) => void) => {
    setIsGenerating(true)
    try {
      const modelInfo = modelConfig[provider]

      if (onChunk) {
        const result = streamText({
          model: modelInfo.model,
          prompt,
          onChunk: (event: { chunk: { type: string; textDelta?: string } }) => {
            const { chunk } = event;
            if (chunk.type === "text-delta" && chunk.textDelta) {
              onChunk(chunk.textDelta);
            }
          },
        })

        return result.text
      } else {
        const { text } = await generateText({
          model: modelInfo.model,
          prompt,
        })

        return text
      }
    } catch (error) {
      console.error("Error generating response:", error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    getAvailableModels,
    generateResponse,
    modelConfig,
  }
}
