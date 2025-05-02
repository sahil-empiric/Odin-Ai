"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createBrowserClient } from "@/lib/supabase"
import { useAiModels } from "@/hooks/use-ai-models"
import { MessageInput } from "@/components/chat/message-input"
import { Button } from "@/components/ui/button"
import type { Chat, Message, ModelProvider } from "@/types/database.types"

interface RoundTableChatProps {
  chat: Chat
  initialMessages: Message[]
}

const supabase = createBrowserClient()

export function RoundTableChat({ chat, initialMessages }: RoundTableChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [membershipTier, setMembershipTier] = useState<"free" | "basic" | "premium">("premium")
  const [selectedModels, setSelectedModels] = useState<ModelProvider[]>(["openai", "anthropic", "mistral"])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentResponse, setCurrentResponse] = useState("")
  const [currentModel, setCurrentModel] = useState<ModelProvider | null>(null)

  const { getAvailableModels, generateResponse, modelConfig } = useAiModels(membershipTier)
  const availableModels = getAvailableModels()

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return

      try {
        const { data: profile } = await supabase.from("profiles").select("membership_tier").eq("id", user.id).single()

        if (profile) {
          setMembershipTier(profile.membership_tier as "free" | "basic" | "premium")
        }
      } catch (error) {
        console.error("Error fetching user profile:", error)
      }
    }

    fetchUserProfile()
  }, [user])

  const handleSendMessage = async (content: string) => {
    if (!user || !chat) return

    try {
      // Add user message
      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        chat_id: chat.id,
        role: "user",
        content,
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])

      // Save user message to database
      const { data: savedMessage, error: messageError } = await supabase
        .from("messages")
        .insert({
          chat_id: chat.id,
          role: "user",
          content,
        })
        .select()
        .single()

      if (messageError) throw messageError

      // Update messages with saved message ID
      setMessages((prev) => prev.map((msg) => (msg.id === userMessage.id ? (savedMessage as Message) : msg)))

      // Generate AI responses in a round-table fashion
      setIsGenerating(true)

      // Create a context from previous messages for the AI models
      const messageContext = messages
        .slice(-10) // Use last 10 messages for context
        .map((msg) => `${msg.role === "user" ? "User" : msg.model}: ${msg.content}`)
        .join("\n\n")

      // Generate responses from each model in sequence
      for (const model of selectedModels) {
        setCurrentModel(model)
        setCurrentResponse("")

        // Prepare prompt for the model
        const prompt = `This is a round-table discussion where multiple AI models are conversing with a user and each other.
Previous conversation:
${messageContext}

User: ${content}

You are ${modelConfig[model].name}. Respond to the user and consider what other AI models have said if applicable.`

        // Stream the response
        const responsePromise = generateResponse(model, prompt, (chunk) => {
          setCurrentResponse((prev) => prev + chunk)
        })

        // Add temporary AI message to UI
        const tempAiMessage: Message = {
          id: `temp-ai-${model}-${Date.now()}`,
          chat_id: chat.id,
          role: "assistant",
          model,
          content: "",
          created_at: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, tempAiMessage])

        // Wait for full response
        const fullResponse = await responsePromise

        // Save AI message to database
        const { data: savedAiMessage, error: aiMessageError } = await supabase
          .from("messages")
          .insert({
            chat_id: chat.id,
            role: "assistant",
            model,
            content: fullResponse,
          })
          .select()
          .single()

        if (aiMessageError) throw aiMessageError

        // Update messages with saved AI message
        setMessages((prev) => prev.map((msg) => (msg.id === tempAiMessage.id ? (savedAiMessage as Message) : msg)))
      }

      // Update chat's updated_at timestamp
      await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chat.id)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsGenerating(false)
      setCurrentResponse("")
      setCurrentModel(null)
    }
  }

  const handleToggleModel = (model: ModelProvider) => {
    if (selectedModels.includes(model)) {
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter((m) => m !== model))
      }
    } else {
      setSelectedModels([...selectedModels, model])
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Start a round table discussion</h2>
            <p className="text-muted-foreground mb-4">Send a message to begin a conversation with multiple AI models</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${message.role === "user" ? "bg-muted/50" : "bg-background border"}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-medium">
                    {message.role === "user" ? "You" : modelConfig[message.model as ModelProvider]?.name || "AI"}
                  </div>
                  {message.role === "assistant" && message.model && (
                    <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{message.model}</div>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            ))}

            {isGenerating && currentResponse && currentModel && (
              <div className="p-4 rounded-lg bg-background border">
                <div className="flex items-center gap-2 mb-2">
                  <div className="font-medium">{modelConfig[currentModel]?.name || "AI"}</div>
                  <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{currentModel}</div>
                </div>
                <div className="whitespace-pre-wrap">{currentResponse}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Select models for the round table:</div>
          <div className="flex flex-wrap gap-2">
            {availableModels.map((model) => (
              <Button
                key={model}
                variant={selectedModels.includes(model) ? "default" : "outline"}
                size="sm"
                onClick={() => handleToggleModel(model)}
                disabled={isGenerating}
              >
                {modelConfig[model].name}
              </Button>
            ))}
          </div>
        </div>

        <MessageInput onSendMessage={handleSendMessage} isDisabled={isGenerating} />
      </div>
    </div>
  )
}
