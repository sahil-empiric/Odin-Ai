"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PanelLeft, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ChatInterfaceProps {
    isSidebarOpen: boolean
    toggleSidebar: () => void
    chatMode: "single" | "comparison"
    selectedModels: string[]
    onModelSelect: (model: string) => void
}

interface Message {
    id: string
    content: string
    sender: "user" | "ai"
    model?: string
    timestamp: Date
}

const availableModels = [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4", name: "GPT-4" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
    { id: "claude-3-opus", name: "Claude 3 Opus" },
    { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
    { id: "llama-3", name: "Llama 3" },
]

export default function ChatInterface({
    isSidebarOpen,
    toggleSidebar,
    chatMode,
    selectedModels,
    onModelSelect,
}: ChatInterfaceProps) {
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)

    const handleSendMessage = () => {
        if (!input.trim()) return

        // Check if models are selected
        if (selectedModels.length === 0) {
            alert("Please select at least one AI model")
            return
        }

        if (chatMode === "comparison" && selectedModels.length !== 2) {
            alert("Please select exactly two AI models for comparison")
            return
        }

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            sender: "user",
            timestamp: new Date(),
        }

        setMessages([...messages, userMessage])
        setInput("")
        setIsLoading(true)

        // Simulate AI response after a delay
        setTimeout(() => {
            const newMessages: Message[] = []

            if (chatMode === "single") {
                const modelName = availableModels.find((m) => m.id === selectedModels[0])?.name
                newMessages.push({
                    id: Date.now().toString() + "-ai",
                    content: `This is a simulated response from ${modelName}. In a real implementation, this would be the actual response from the selected AI model.`,
                    sender: "ai",
                    model: selectedModels[0],
                    timestamp: new Date(),
                })
            } else {
                // Add responses for both models in comparison mode
                selectedModels.forEach((modelId, index) => {
                    const modelName = availableModels.find((m) => m.id === modelId)?.name
                    newMessages.push({
                        id: Date.now().toString() + `-ai-${index}`,
                        content: `This is a simulated response from ${modelName}. In a real implementation, this would be the actual response from the selected AI model.`,
                        sender: "ai",
                        model: modelId,
                        timestamp: new Date(),
                    })
                })
            }

            setMessages([...messages, userMessage, ...newMessages])
            setIsLoading(false)
        }, 1500)
    }

    const getModelName = (modelId: string) => {
        return availableModels.find((model) => model.id === modelId)?.name || modelId
    }

    return (
        <div
            className={cn("flex flex-col h-screen w-full transition-all duration-300", isSidebarOpen ? "" : "ml-0")}
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:flex hidden">
                        <PanelLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold">AI Chat</h1>
                        <Badge variant="outline" className="mt-1">
                            {chatMode === "single" ? "Single Chat Mode" : "Comparison Mode"}
                        </Badge>
                    </div>
                </div>

                {/* Model selection */}
                <div className="flex items-center gap-4">
                    {chatMode === "single" ? (
                        <Select value={selectedModels[0] || ""} onValueChange={(value) => onModelSelect(value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableModels.map((model) => (
                                    <SelectItem key={model.id} value={model.id}>
                                        {model.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="text-sm font-medium mb-1">Select two models for comparison:</div>
                            <div className="flex flex-wrap gap-3">
                                {availableModels.map((model) => (
                                    <div key={model.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={model.id}
                                            checked={selectedModels.includes(model.id)}
                                            onCheckedChange={() => onModelSelect(model.id)}
                                            disabled={selectedModels.length >= 2 && !selectedModels.includes(model.id)}
                                        />
                                        <label
                                            htmlFor={model.id}
                                            className={cn(
                                                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                                selectedModels.includes(model.id) && "text-primary",
                                            )}
                                        >
                                            {model.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">
                        <div className="max-w-md space-y-2">
                            <h2 className="text-2xl font-bold">Welcome to AI Chat</h2>
                            <p className="text-muted-foreground">
                                {chatMode === "single"
                                    ? "Select a model and start chatting"
                                    : "Select two models to compare their responses"}
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        // Group AI responses in comparison mode
                        if (chatMode === "comparison" && message.sender === "ai") {
                            // Find the user message that preceded this AI response
                            const userMessageIndex = messages.findIndex((m, i) => i < index && m.sender === "user")

                            // If this is the first AI response after a user message, render both AI responses
                            if (
                                userMessageIndex !== -1 &&
                                index === userMessageIndex + 1 &&
                                messages[index].sender === "ai" &&
                                index + 1 < messages.length &&
                                messages[index + 1].sender === "ai"
                            ) {
                                const nextMessage = messages[index + 1]

                                return (
                                    <div key={message.id} className="space-y-2">
                                        <Tabs defaultValue="split" className="w-full">
                                            <TabsList className="grid w-[200px] grid-cols-2">
                                                <TabsTrigger value="split">Split View</TabsTrigger>
                                                <TabsTrigger value="tab">Tab View</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="split" className="mt-2">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Card>
                                                        <CardContent className="pt-4">
                                                            <div className="font-medium mb-2">{getModelName(message.model || "")}</div>
                                                            <div className="text-sm">{message.content}</div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card>
                                                        <CardContent className="pt-4">
                                                            <div className="font-medium mb-2">{getModelName(nextMessage.model || "")}</div>
                                                            <div className="text-sm">{nextMessage.content}</div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="tab">
                                                <Tabs defaultValue={message.model}>
                                                    <TabsList>
                                                        <TabsTrigger value={message.model || "unknown"}>{getModelName(message.model || "")}</TabsTrigger>
                                                        <TabsTrigger value={nextMessage.model || "unknown"}>{getModelName(nextMessage.model || "")}</TabsTrigger>
                                                    </TabsList>

                                                    <TabsContent value={message.model || ""}>
                                                        <Card>
                                                            <CardContent className="pt-4">
                                                                <div className="text-sm">{message.content}</div>
                                                            </CardContent>
                                                        </Card>
                                                    </TabsContent>

                                                    <TabsContent value={nextMessage.model || ""}>
                                                        <Card>
                                                            <CardContent className="pt-4">
                                                                <div className="text-sm">{nextMessage.content}</div>
                                                            </CardContent>
                                                        </Card>
                                                    </TabsContent>
                                                </Tabs>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                )
                            } else if (index > 0 && messages[index - 1].sender === "ai") {
                                // Skip the second AI response as it's already rendered with the first one
                                return null
                            }
                        }

                        // Render user messages and single mode AI messages normally
                        return (
                            <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-lg p-4",
                                        message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                                    )}
                                >
                                    {message.sender === "ai" && chatMode === "single" && (
                                        <div className="font-medium mb-2">{getModelName(message.model || "")}</div>
                                    )}
                                    <div>{message.content}</div>
                                </div>
                            </div>
                        )
                    })
                )}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg p-4 bg-muted flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>AI is thinking...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input area */}
            <div className="border-t p-4">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                            }
                        }}
                        disabled={isLoading}
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
                    </Button>
                </div>
            </div>
        </div>
    )
}
