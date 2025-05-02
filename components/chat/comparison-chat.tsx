"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { createBrowserClient } from "@/lib/supabase"
import { useAiModels } from "@/hooks/use-ai-models"
import { MessageInput } from "@/components/chat/message-input"
import { Button } from "@/components/ui/button"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import type { Chat, Message, ModelProvider } from "@/types/database.types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs"

interface ComparisonChatProps {
  chat: Chat
  initialMessages: Message[]
}

const supabase = createBrowserClient()

export function ComparisonChat({ chat, initialMessages }: ComparisonChatProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [membershipTier, setMembershipTier] = useState<"free" | "basic" | "premium">("basic")
  const [selectedModels, setSelectedModels] = useState<ModelProvider[]>(["openai", "deepseek"])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentResponses, setCurrentResponses] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<string>("openai")

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
      // Add user message to UI
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

      // Generate AI responses for each selected model
      setIsGenerating(true)
      setCurrentResponses({})

      const responsePromises = selectedModels.map(async (model) => {
        // Initialize empty response for this model
        setCurrentResponses((prev) => ({ ...prev, [model]: "" }))

        // Stream the response
        const responsePromise = generateResponse(model, content, (chunk) => {
          setCurrentResponses((prev) => ({
            ...prev,
            [model]: (prev[model] || "") + chunk,
          }))
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

        return { model, message: savedAiMessage as Message }
      })

      // Wait for all responses
      await Promise.all(responsePromises)

      // Update chat's updated_at timestamp
      await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chat.id)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsGenerating(false)
      setCurrentResponses({})
    }
  }

  // Group messages by conversation turn
  const messageGroups = messages.reduce((groups, message) => {
    if (message.role === "user") {
      groups.push([message])
    } else if (groups.length > 0) {
      const lastGroup = groups[groups.length - 1]
      lastGroup.push(message)
    }
    return groups
  }, [] as Message[][])

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messageGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <h2 className="text-2xl font-bold mb-2">Start a comparison</h2>
            <p className="text-muted-foreground mb-4">Send a message to compare responses from different AI models</p>
          </div>
        ) : (
          <div className="space-y-8">
            {messageGroups.map((group, groupIndex) => {
              const userMessage = group.find((m) => m.role === "user")
              const aiMessages = group.filter((m) => m.role === "assistant")

              return (
                <div key={groupIndex} className="space-y-4">
                  {userMessage && (
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="font-medium mb-2">You</div>
                      <div className="whitespace-pre-wrap">{userMessage.content}</div>
                    </div>
                  )}

                  {aiMessages.length > 0 && (
                    <Tabs defaultValue={aiMessages[0].model} value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid" style={{ gridTemplateColumns: `repeat(${aiMessages.length}, 1fr)` }}>
                        {aiMessages.map((msg) => (
                          <TabsTrigger key={msg.id} value={msg.model || "unknown"}>
                            {msg.model ? modelConfig[msg.model as ModelProvider].name : "AI"}
                          </TabsTrigger>
                        ))}
                      </TabsList>

                      {aiMessages.map((msg) => (
                        <TabsContent
                          key={msg.id}
                          value={msg.model || "unknown"}
                          className="bg-background p-4 rounded-lg"
                        >
                          <div className="font-medium mb-2 flex items-center gap-2">
                            {msg.model ? modelConfig[msg.model as ModelProvider].name : "AI"}
                            <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {msg.model}
                            </div>
                          </div>
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
                </div>
              )
            })}

            {isGenerating && Object.keys(currentResponses).length > 0 && (
              <div className="space-y-4">
                <Tabs defaultValue={Object.keys(currentResponses)[0]} value={activeTab} onValueChange={setActiveTab}>
                  <TabsList
                    className="grid"
                    style={{ gridTemplateColumns: `repeat(${Object.keys(currentResponses).length}, 1fr)` }}
                  >
                    {Object.entries(currentResponses).map(([model]) => (
                      <TabsTrigger key={model} value={model}>
                        {modelConfig[model as ModelProvider].name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {Object.entries(currentResponses).map(([model, content]) => (
                    <TabsContent key={model} value={model} className="bg-background p-4 rounded-lg">
                      <div className="font-medium mb-2 flex items-center gap-2">
                        {modelConfig[model as ModelProvider].name}
                        <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{model}</div>
                      </div>
                      <div className="whitespace-pre-wrap">{content}</div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <div className="mb-4">
          <div className="text-sm font-medium mb-2">Select models to compare:</div>
          <div className="flex flex-wrap gap-2">
            {availableModels.map((model) => (
              <Button
                key={model}
                variant={selectedModels.includes(model) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (selectedModels.includes(model)) {
                    if (selectedModels.length > 1) {
                      setSelectedModels(selectedModels.filter((m) => m !== model))
                    }
                  } else {
                    setSelectedModels([...selectedModels, model])
                  }
                }}
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
