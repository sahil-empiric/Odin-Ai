'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import type { Message, ModelProvider } from '@/types/database.types'

type ModelConfig = {
  [key in ModelProvider]: {
    name: string
    tierRequired: 'standard' | 'advance' | 'premium'
  }
}

export const modelConfig: ModelConfig = {
  openai: { name: 'GPT-4o', tierRequired: 'premium' },
  deepseek: { name: 'DeepSeek Reasoner', tierRequired: 'premium' },
  google: { name: 'Gemini Pro', tierRequired: 'premium' },
  anthropic: { name: 'Claude 3 Opus', tierRequired: 'premium' },
  mistral: { name: 'Mistral Large', tierRequired: 'premium' }
}

export function useAiModels(userTier: 'standard' | 'advance' | 'premium') {
  const [activeModel, setActiveModel] = useState<ModelProvider>('openai')
  const { messages, append, isLoading, input, setInput } = useChat({
    api: '/api/chat',
    body: { model: activeModel }
  })

  const getAvailableModels = () => {
    const tierValues = { standard: 1, advance: 2, premium: 3 }
    return (Object.keys(modelConfig) as ModelProvider[]).filter(provider =>
      tierValues[modelConfig[provider].tierRequired] <= tierValues[userTier]
    )
  }

  return {
    activeModel,
    setActiveModel,
    messages,
    append,
    isLoading,
    input,
    setInput,
    getAvailableModels,
    modelConfig
  }
}