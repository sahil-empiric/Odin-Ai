"use client"

import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import ChatSidebar from "./chat-sidebar"
import SingleChatView from "./single-chat-view"
import ComparisonChatView from "./comparison-chat-view"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export type ChatMode = "single" | "comparison" | "diagnostic"
export type ChatHistory = {
    id: string
    title: string
    date: Date
    mode: ChatMode
    models: string[]
}

export default function ChatInterface() {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [chatMode, setChatMode] = useState<ChatMode>("single")
    const [selectedModel, setSelectedModel] = useState<string[]>(["openai"])
    const [currentChatId, setCurrentChatId] = useState<string | null>(null)
    const userTier = "premium"
    const isMobile = useMediaQuery("(max-width: 768px)")

    // Sample chat history data
    const [chatHistory, setChatHistory] = useState<ChatHistory[]>([
        {
            id: "1",
            title: "How to build a website",
            date: new Date(2023, 4, 10),
            mode: "single",
            models: ["openai"],
        },
        {
            id: "2",
            title: "JavaScript vs TypeScript",
            date: new Date(),
            mode: "comparison",
            models: ["openai", "anthropic"],
        },
        {
            id: "3",
            title: "React hooks explained",
            date: new Date(),
            mode: "single",
            models: ["openai"],
        },
        {
            id: "4",
            title: "CSS Grid vs Flexbox",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            mode: "comparison",
            models: ["openai", "anthropic"],
        },
    ])

    const createNewChat = (mode: ChatMode, models: string[]) => {
        const newChat: ChatHistory = {
            id: Date.now().toString(),
            title: "New Chat",
            date: new Date(),
            mode,
            models,
        }
        setChatHistory([newChat, ...chatHistory])
        setCurrentChatId(newChat.id)
        setChatMode(mode)
        setSelectedModel(models)

        // Close sidebar on mobile after creating a new chat
        if (isMobile) {
            setSidebarOpen(false)
        }
    }

    const selectChat = (chatId: string) => {
        const chat = chatHistory.find((c) => c.id === chatId)
        if (chat) {
            setCurrentChatId(chatId)
            setChatMode(chat.mode)
            setSelectedModel(chat.models)

            // Close sidebar on mobile after selecting a chat
            if (isMobile) {
                setSidebarOpen(false)
            }
        }
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen bg-background">
                <ChatSidebar
                    open={sidebarOpen}
                    setOpen={setSidebarOpen}
                    chatHistory={chatHistory}
                    currentChatId={currentChatId}
                    onSelectChat={selectChat}
                    onCreateNewChat={createNewChat}
                />
                <main className="flex-1 flex flex-col h-full overflow-hidden">
                   
                    {chatMode === "single" ? (
                        <SingleChatView
                            selectedModel={selectedModel[0]}
                            setSelectedModel={(model) => setSelectedModel([model])}
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                            userTier={userTier}
                        />
                    ) : (
                        <ComparisonChatView
                            selectedModels={selectedModel}
                            setSelectedModels={setSelectedModel}
                            sidebarOpen={sidebarOpen}
                            setSidebarOpen={setSidebarOpen}
                            userTier={userTier}
                        />
                    )}
                </main>
            </div>
        </SidebarProvider>
    )
}
