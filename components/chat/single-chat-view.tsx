"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChatInput } from "./chat-input"
import { Menu, ChevronDown, User, Bot, PanelLeft } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { modelConfig, useAiModels } from "@/hooks/use-ai-models"
import type { ModelProvider } from "@/types/database.types"

interface SingleChatViewProps {
    selectedModel: string
    setSelectedModel: (model: string) => void
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    userTier: "standard" | "advance" | "premium"
}

export default function SingleChatView({
    selectedModel,
    setSelectedModel,
    sidebarOpen,
    setSidebarOpen,
    userTier,
}: SingleChatViewProps) {
    const isMobile = useMediaQuery("(max-width: 768px)")
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [error, setError] = useState<string | null>(null)
    const [modelDropdownOpen, setModelDropdownOpen] = useState(false)

    // Use the updated AI models hook
    const {
        activeModel,
        setActiveModel,
        messages,
        append,
        isLoading,
        input,
        setInput,
        getAvailableModels,
    } = useAiModels(userTier)

    // Sync the selected model with activeModel in the hook
    useEffect(() => {
        if (selectedModel !== activeModel) {
            setActiveModel(selectedModel as ModelProvider)
        }
    }, [selectedModel, activeModel, setActiveModel])

    const availableModels = getAvailableModels()
    const AI_MODELS = availableModels.map(provider => ({
        id: provider,
        name: modelConfig[provider].name,
    }))

    // Function to scroll to the bottom of the chat
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Validate selected model on initial load
    useEffect(() => {
        if (selectedModel && !availableModels.includes(selectedModel as ModelProvider)) {
            // If current selected model is not available, select the first available one
            if (availableModels.length > 0) {
                setSelectedModel(availableModels[0]);
            }
        }
    }, [selectedModel, availableModels, setSelectedModel]);

    const handleSendMessage = async (message: string) => {
        setError(null);
        try {
            // Use the append method from useChat hook
            await append({
                role: "user",
                content: message,
            });

            // Input clearing is handled by the hook
            scrollToBottom();
        } catch (error) {
            console.error("Error in chat:", error);
            setError("Failed to send message. Please try again.");
        }
    }

    const getModelName = (modelId: string) => {
        return modelConfig[modelId as ModelProvider]?.name || modelId
    }

    return (
        <>
            <header className="flex items-center justify-between border-b p-4">
                <div className="flex items-center">
                    {isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="mr-2"
                        >
                            <PanelLeft size={20} />
                        </Button>
                    )}
                    <h1 className="text-xl font-semibold">Single Chat Mode</h1>
                </div>
                <DropdownMenu open={modelDropdownOpen} onOpenChange={setModelDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            {getModelName(selectedModel)}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuRadioGroup value={selectedModel} onValueChange={(value) => {
                            setSelectedModel(value);
                            setActiveModel(value as ModelProvider);
                        }}>
                            {AI_MODELS.map((model) => (
                                <DropdownMenuRadioItem key={model.id} value={model.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`model-${model.id}`}
                                        checked={selectedModel === model.id}
                                        onCheckedChange={() => {
                                            setSelectedModel(model.id);
                                            setActiveModel(model.id as ModelProvider);
                                            setModelDropdownOpen(false);
                                        }}
                                    />
                                    <span>{model.name}</span>
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <ScrollArea className="flex-1 p-4 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-md">
                            {error}
                        </div>
                    )}

                    {messages.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center p-8">
                                <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                                <p className="text-muted-foreground">Send a message to begin chatting with {getModelName(selectedModel)}</p>
                            </div>
                        </div>
                    )}

                    {messages.map((message, index) => {
                        // Determine if we should show loading animation - only show for the latest user message
                        // when the next message hasn't arrived yet and the model is loading
                        const isLastUserMessage = message.role === "user" &&
                            index === messages.length - 1 &&
                            isLoading;

                        return (
                            <div
                                key={message.id}
                                className={`mb-6 ${message.role === "user" ? "flex justify-end" : "flex justify-start"}`}
                            >
                                <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                                    <div
                                        className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow ${message.role === "user" ? "ml-2 bg-primary text-primary-foreground" : "mr-2 bg-muted"}`}
                                    >
                                        {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} w-full`}>
                                        <div
                                            className={`rounded-lg px-4 py-2 w-full ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                                        >
                                            {message.role === "assistant" && message.content === "" ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                                                        <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                                                        <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">Generating response...</span>
                                                </div>
                                            ) : (
                                                <div className="whitespace-pre-wrap">
                                                    {message.content}
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                                {new Date().toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                            {message.role === "assistant" && (
                                                <span className="rounded bg-muted px-1 py-0.5">
                                                    {getModelName(selectedModel)}
                                                    {message.content === "" && "..."}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Show loading animation if the last message is from user and we're waiting for a response */}
                    {messages.length > 0 &&
                        messages[messages.length - 1].role === "user" &&
                        isLoading && (
                            <div className="mb-6 flex justify-start">
                                <div className="flex max-w-[80%]">
                                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow mr-2 bg-muted">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col items-start w-full">
                                        <div className="rounded-lg px-4 py-2 w-full bg-muted">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                                                    <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                                                    <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                                                </div>
                                                <span className="text-xs text-muted-foreground">Generating response...</span>
                                            </div>
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                                {new Date().toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                            <span className="rounded bg-muted px-1 py-0.5">
                                                {getModelName(selectedModel)}...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <div className="border-t p-4">
                <div className="max-w-3xl mx-auto">
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        isLoading={isLoading}
                        input={input}
                        setInput={setInput}
                    />
                </div>
            </div>
        </>
    )
}
