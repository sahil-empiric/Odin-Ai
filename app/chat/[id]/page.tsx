"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createBrowserClient } from "@/lib/supabase"
import { useAiModels } from "@/hooks/use-ai-models"
import { MessageItem } from "@/components/chat/message-item"
import { MessageInput } from "@/components/chat/message-input"
import { ModelSelector } from "@/components/chat/model-selector"
import { ComparisonChat } from "@/components/chat/comparison-chat"
import { RoundTableChat } from "@/components/chat/round-table-chat"
import { Button } from "@/components/ui/button"
import type { Chat, Message, ModelProvider } from "@/types/database.types"

export default function ChatPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()

  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [membershipTier, setMembershipTier] = useState<"free" | "basic" | "premium">("free")
  const [selectedModel, setSelectedModel] = useState<ModelProvider>("openai")
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentResponse, setCurrentResponse] = useState("")

  const { getAvailableModels, generateResponse } = useAiModels(membershipTier)
  const availableModels = getAvailableModels()
  const supabase = createBrowserClient()

  useEffect(() => {
    const fetchChatData = async () => {
      if (!user) return

      try {
        // Fetch user profile for membership tier
        const { data: profile } = await supabase.from("profiles").select("membership_tier").eq("id", user.id).single()

        if (profile) {
          setMembershipTier(profile.membership_tier as "free" | "basic" | "premium")
        }

        // Fetch chat
        const { data: chatData, error: chatError } = await supabase
          .from("chats")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single()

        if (chatError) {
          console.error("Error fetching chat:", chatError)
          router.push("/dashboard")
          return
        }

        setChat(chatData as Chat)

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .eq("chat_id", id)
          .order("created_at", { ascending: true })

        if (messagesError) throw messagesError
        setMessages(messagesData as Message[])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchChatData()
  }, [id, user, router])

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

      // Generate AI response
      setIsGenerating(true)
      setCurrentResponse("")

      // Stream the response
      const responsePromise = generateResponse(selectedModel, content, (chunk) => {
        setCurrentResponse((prev) => prev + chunk)
      })

      // Add temporary AI message to UI
      const tempAiMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        chat_id: chat.id,
        role: "assistant",
        model: selectedModel,
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
          model: selectedModel,
          content: fullResponse,
        })
        .select()
        .single()

      if (aiMessageError) throw aiMessageError

      // Update messages with saved AI message
      setMessages((prev) => prev.map((msg) => (msg.id === tempAiMessage.id ? (savedAiMessage as Message) : msg)))

      // Update chat's updated_at timestamp
      await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chat.id)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsGenerating(false)
      setCurrentResponse("")
    }
  }

  const handleSelectModel = (model: ModelProvider) => {
    setSelectedModel(model)
  }

  const handleGoBack = () => {
    router.push("/dashboard")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  if (!chat) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chat not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background p-4">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleGoBack}>
              Back
            </Button>
            <h1 className="text-xl font-bold">{chat.title || "Untitled Chat"}</h1>
            <div className="text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {chat.room_type.charAt(0).toUpperCase() + chat.room_type.slice(1)}
            </div>
          </div>
          {chat.room_type === "single" && (
            <div className="w-64">
              <ModelSelector
                availableModels={availableModels}
                selectedModel={selectedModel}
                onSelectModel={handleSelectModel}
              />
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {chat.room_type === "single" && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
              <div className="container py-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <h2 className="text-2xl font-bold mb-2">Start a conversation</h2>
                    <p className="text-muted-foreground mb-4">Send a message to start chatting with the AI</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <MessageItem key={message.id} message={message} showModel={false} />
                    ))}
                    {isGenerating && currentResponse && (
                      <MessageItem
                        message={{
                          id: "streaming",
                          chat_id: chat.id,
                          role: "assistant",
                          model: selectedModel,
                          content: currentResponse,
                          created_at: new Date().toISOString(),
                        }}
                        showModel={false}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
            <MessageInput onSendMessage={handleSendMessage} isDisabled={isGenerating} />
          </div>
        )}

        {chat.room_type === "comparison" && <ComparisonChat chat={chat} initialMessages={messages} />}

        {chat.room_type === "roundtable" && <RoundTableChat chat={chat} initialMessages={messages} />}
      </main>
    </div>
  )
}
