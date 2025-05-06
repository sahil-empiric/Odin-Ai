"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChatInput } from "./chat-input"
import { Menu, ChevronDown, User, Bot, PanelLeft } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { modelConfig, useAiModels } from "@/hooks/use-ai-models"
import type { ModelProvider } from "@/types/database.types"
import { Message } from "ai/react"

interface ComparisonChatViewProps {
    selectedModels: string[]
    setSelectedModels: (models: string[]) => void
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    userTier: "standard" | "advance" | "premium"
}

export default function ComparisonChatView({
    selectedModels,
    setSelectedModels,
    sidebarOpen,
    setSidebarOpen,
    userTier,
}: ComparisonChatViewProps) {
    const [error, setError] = useState<string | null>(null)
    const [modelSelectOpen, setModelSelectOpen] = useState(false)
    const isMobile = useMediaQuery("(max-width: 768px)")
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Get available models using our hook
    const { getAvailableModels } = useAiModels(userTier)
    const availableModels = getAvailableModels()

    // Set up model instances for the first two models
    const model1 = useAiModels(userTier)
    const model2 = useAiModels(userTier)

    // Use state to track the current input
    const [currentInput, setCurrentInput] = useState("")

    // Track if any model is loading
    const isAnyModelLoading = model1.isLoading || model2.isLoading

    // Set active models when selectedModels changes
    useEffect(() => {
        if (selectedModels.length > 0) {
            model1.setActiveModel(selectedModels[0] as ModelProvider)
        }
        if (selectedModels.length > 1) {
            model2.setActiveModel(selectedModels[1] as ModelProvider)
        }
    }, [selectedModels])

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
    }, [model1.messages, model2.messages]);

    // Validate selected models on load
    useEffect(() => {
        // Only run this once on initial load
        if (selectedModels.length === 0 || selectedModels.some(model => !availableModels.includes(model as ModelProvider))) {
            // If no models selected or some selected models are invalid, initialize with first two available
            if (availableModels.length >= 2) {
                setSelectedModels([availableModels[0], availableModels[1]]);
            } else if (availableModels.length === 1) {
                setSelectedModels([availableModels[0]]);
            }
        }
    }, [availableModels, selectedModels, setSelectedModels]);

    // Handle sending a message to all selected models
    const handleSendMessage = async (message: string) => {
        setError(null);

        // Do nothing if we don't have any models selected
        if (selectedModels.length === 0) return;

        // Send the message to all selected models
        try {
            // Add the messages in parallel
            const promises = []

            if (selectedModels.length > 0) {
                promises.push(model1.append({
                    role: "user",
                    content: message,
                }))
            }

            if (selectedModels.length > 1) {
                promises.push(model2.append({
                    role: "user",
                    content: message,
                }))
            }

            // Wait for all messages to be sent
            await Promise.all(promises)

            // Clear the input
            setCurrentInput("")
            scrollToBottom()
        } catch (error) {
            console.error("Error sending messages:", error)
            setError("Failed to send messages to one or more models. Please try again.")
        }
    }

    const getModelName = (modelId: string) => {
        return modelConfig[modelId as ModelProvider]?.name || modelId
    }

    const handleModelSelect = (modelId: string) => {
        // If model is already selected, remove it
        if (selectedModels.includes(modelId)) {
            setSelectedModels(selectedModels.filter(id => id !== modelId));
            return;
        }

        // If we have fewer than 2 models, add the new one
        if (selectedModels.length < 2) {
            setSelectedModels([...selectedModels, modelId]);
            return;
        }

        // If we already have 2 models, replace the first one
        setSelectedModels([selectedModels[1], modelId]);
    }

    // Reset model selection
    const resetModelSelection = () => {
        if (availableModels.length >= 2) {
            setSelectedModels([availableModels[0], availableModels[1]]);
        } else if (availableModels.length === 1) {
            setSelectedModels([availableModels[0]]);
        } else {
            setSelectedModels([]);
        }
    }

    // Get all unique user messages to display
    const allUserMessages = model1.messages
        .filter(msg => msg.role === "user")
        .map(msg => ({
            id: msg.id,
            content: msg.content,
            role: msg.role
        }));

    // Create pairs of message exchanges
    const messagePairs: {
        userMessage: Message | null;
        model1Response: Message | null;
        model2Response: Message | null;
    }[] = [];

    // Process user messages and find corresponding AI responses
    allUserMessages.forEach((userMsg, index) => {
        const userMsgIndex = model1.messages.findIndex(m => m.id === userMsg.id);

        // Find the next assistant message after the user message for model 1
        const model1Response = userMsgIndex >= 0 && userMsgIndex < model1.messages.length - 1 &&
            model1.messages[userMsgIndex + 1].role === "assistant"
            ? model1.messages[userMsgIndex + 1]
            : null;

        // Find the assistant message in model2 messages for the same user query
        const model2UserMsgIndex = model2.messages.findIndex(m =>
            m.role === "user" && m.content === userMsg.content
        );

        const model2Response = model2UserMsgIndex >= 0 && model2UserMsgIndex < model2.messages.length - 1 &&
            model2.messages[model2UserMsgIndex + 1].role === "assistant"
            ? model2.messages[model2UserMsgIndex + 1]
            : null;

        messagePairs.push({
            userMessage: userMsg,
            model1Response,
            model2Response
        });
    });

    return (
        <>
            <header className="flex items-center justify-between border-b p-4">
                <div className="flex items-center">
                    {isMobile && !sidebarOpen && (
                        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                            <PanelLeft size={20} />
                        </Button>
                    )}
                    <h1 className="text-xl font-semibold">Comparison Chat Mode</h1>
                </div>
                <Dialog open={modelSelectOpen} onOpenChange={setModelSelectOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            {selectedModels.length > 0
                                ? `Compare: ${selectedModels.map(id => modelConfig[id as ModelProvider]?.name).join(" vs ")}`
                                : "Select Models"}
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Select Models to Compare (Choose up to 2)</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-2">
                                Select one or two AI models to compare their responses side by side.
                            </p>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {AI_MODELS.map((model) => {
                                const isSelected = selectedModels.includes(model.id);
                                return (
                                    <div key={model.id} className={`flex items-center space-x-2 p-2 rounded-md ${isSelected ? 'bg-secondary/50' : ''}`}>
                                        <Checkbox
                                            id={`compare-model-${model.id}`}
                                            checked={isSelected}
                                            onCheckedChange={() => handleModelSelect(model.id)}
                                        />
                                        <label
                                            htmlFor={`compare-model-${model.id}`}
                                            className="flex-1 text-sm font-medium leading-none cursor-pointer select-none"
                                        >
                                            {model.name}
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                                {selectedModels.length === 0
                                    ? "No models selected"
                                    : selectedModels.length === 1
                                        ? "1 model selected (select one more)"
                                        : "2 models selected (maximum)"}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={resetModelSelection}>
                                    Reset
                                </Button>
                                <Button onClick={() => setModelSelectOpen(false)}>
                                    Done
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </header>

            <ScrollArea className="flex-1 overflow-y-auto p-4">
                <div className="max-w-6xl mx-auto">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-md">
                            {error}
                        </div>
                    )}

                    {messagePairs.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center p-8">
                                <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
                                <p className="text-muted-foreground">
                                    Send a message to compare {selectedModels.map(m => getModelName(m)).join(" and ")}
                                </p>
                            </div>
                        </div>
                    )}

                    {messagePairs.map((pair, pairIndex) => (
                        <div key={`pair-${pairIndex}`} className="mb-6">
                            {/* User message */}
                            {pair.userMessage && (
                                <div className="flex justify-end mb-4">
                                    <div className="flex max-w-[80%] flex-row-reverse">
                                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow ml-2 bg-primary text-primary-foreground">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="rounded-lg px-4 py-2 bg-primary text-primary-foreground">
                                                <div className="whitespace-pre-wrap">{pair.userMessage.content}</div>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>
                                                    {new Date().toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Assistant messages in a grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Model 1 Response */}
                                <div className="flex">
                                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow mr-2 bg-muted">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col items-start flex-1">
                                        <div className="rounded-lg px-4 py-2 bg-muted w-full">
                                            {!pair.model1Response ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                                                        <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                                                        <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">Generating response...</span>
                                                </div>
                                            ) : (
                                                <div className="whitespace-pre-wrap">{pair.model1Response.content}</div>
                                            )}
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>
                                                {new Date().toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                            <span className="rounded bg-muted px-1 py-0.5">
                                                {selectedModels.length > 0 ? getModelName(selectedModels[0]) : "Model 1"}
                                                {!pair.model1Response && "..."}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Model 2 Response */}
                                {selectedModels.length > 1 && (
                                    <div className="flex">
                                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow mr-2 bg-muted">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col items-start flex-1">
                                            <div className="rounded-lg px-4 py-2 bg-muted w-full">
                                                {!pair.model2Response ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                                                            <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                                                            <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">Generating response...</span>
                                                    </div>
                                                ) : (
                                                    <div className="whitespace-pre-wrap">{pair.model2Response.content}</div>
                                                )}
                                            </div>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>
                                                    {new Date().toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                                <span className="rounded bg-muted px-1 py-0.5">
                                                    {getModelName(selectedModels[1])}
                                                    {!pair.model2Response && "..."}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <div className="border-t p-4">
                <div className="max-w-3xl mx-auto">
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        isLoading={isAnyModelLoading}
                        input={currentInput}
                        setInput={setCurrentInput}
                    />
                </div>
            </div>
        </>
    )
}

