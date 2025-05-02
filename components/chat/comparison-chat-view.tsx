"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChatInput } from "./chat-input"
import { Menu, ChevronDown, User, Bot, PanelLeft } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"


// Sample AI models
const AI_MODELS = [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4", name: "GPT-4" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
    { id: "claude-3-opus", name: "Claude 3 Opus" },
    { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
    { id: "llama-3", name: "Llama 3" },
]

// Sample messages
const SAMPLE_MESSAGES = [
    {
        id: "1",
        role: "user",
        content: "What are the key differences between React and Vue?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
        id: "2a",
        role: "assistant",
        content:
            "# React vs Vue\n\nReact and Vue are both popular JavaScript frameworks for building user interfaces, but they have several key differences:\n\n## Learning Curve\n- **React**: Steeper learning curve, especially with JSX and concepts like state management\n- **Vue**: Generally considered easier to learn with a more gradual learning curve\n\n## Syntax and Templates\n- **React**: Uses JSX (JavaScript XML) which mixes HTML and JavaScript\n- **Vue**: Uses HTML templates with Vue-specific directives, closer to traditional web development\n\n## State Management\n- **React**: Relies on third-party libraries like Redux or Context API\n- **Vue**: Has Vuex but also includes built-in state management solutions\n\n## Component Structure\n- **React**: Everything is JavaScript/JSX with a functional approach\n- **Vue**: Uses a more traditional separation with template, script, and style sections\n\n## Performance\n- Both have similar performance characteristics, with Vue having a slight edge in some benchmarks\n\n## Flexibility vs Convention\n- **React**: More flexible, fewer opinions about how to structure your application\n- **Vue**: More opinionated, provides more structure out of the box\n\n## Community and Ecosystem\n- **React**: Larger community and ecosystem, backed by Facebook\n- **Vue**: Growing community, initially developed by an individual (Evan You)\n\nThe choice between React and Vue often comes down to team preference, project requirements, and existing expertise.",
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
        model: "gpt-4o",
    },
    {
        id: "2b",
        role: "assistant",
        content:
            "# React vs Vue: Key Differences\n\nReact and Vue are both popular JavaScript frameworks for building user interfaces, but they differ in several important ways:\n\n## Philosophy & Design\n- **React**: Focuses on flexibility and is more of a library than a framework. It emphasizes a functional programming approach and unidirectional data flow.\n- **Vue**: Aims to be an approachable, versatile framework that integrates easily into projects. It takes inspiration from Angular, React, and traditional web development.\n\n## Syntax & Templates\n- **React**: Uses JSX, which combines HTML and JavaScript in the same file. This can be powerful but may feel unfamiliar to new developers.\n- **Vue**: Uses HTML templates with special directives (v-if, v-for, etc.) that will feel more familiar to traditional web developers.\n\n## Component Structure\n- **React**: Components are typically created as JavaScript functions or classes.\n- **Vue**: Uses Single-File Components (SFCs) with clear separation between template, script, and style sections.\n\n## State Management\n- **React**: Requires external libraries like Redux or Recoil for complex state management, though Context API helps with simpler cases.\n- **Vue**: Includes Vuex but also has built-in reactivity system that handles many state management needs.\n\n## Learning Curve\n- **React**: Steeper learning curve due to JSX and functional programming concepts.\n- **Vue**: Generally considered easier to learn for beginners, especially those with HTML/CSS/JS background.\n\n## Community & Adoption\n- **React**: Larger community, more job opportunities, backed by Facebook/Meta.\n- **Vue**: Strong and growing community, but smaller than React's. Initially created by one developer (Evan You).\n\nBoth frameworks are excellent choices with active development and strong communities. The best choice depends on your team's experience, project requirements, and personal preference.",
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
        model: "claude-3-opus",
    },
]

interface ComparisonChatViewProps {
    selectedModels: string[]
    setSelectedModels: (models: string[]) => void
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
}

export default function ComparisonChatView({
    selectedModels,
    setSelectedModels,
    sidebarOpen,
    setSidebarOpen,
}: ComparisonChatViewProps) {
    const [messages, setMessages] = useState(SAMPLE_MESSAGES)
    const [isLoading, setIsLoading] = useState(false)
    const [modelSelectOpen, setModelSelectOpen] = useState(false)
    const isMobile = useMediaQuery("(max-width: 768px)")

    const handleSendMessage = (message: string) => {
        // Add user message
        const userMessage = {
            id: Date.now().toString(),
            role: "user",
            content: message,
            timestamp: new Date(),
        }

        setMessages([...messages, userMessage])

        // Simulate AI responses
        setIsLoading(true)

        // Simulate API delay for first model
        setTimeout(() => {
            const assistantMessage1 = {
                id: (Date.now() + 1).toString() + "a",
                role: "assistant",
                content: `This is a simulated response from ${getModelName(selectedModels[0])} to: "${message}"`,
                timestamp: new Date(),
                model: selectedModels[0],
            }

            setMessages((prev) => [...prev, assistantMessage1])

            // Simulate API delay for second model (slightly longer)
            setTimeout(() => {
                const assistantMessage2 = {
                    id: (Date.now() + 2).toString() + "b",
                    role: "assistant",
                    content: `This is a simulated response from ${getModelName(selectedModels[1])} to: "${message}"`,
                    timestamp: new Date(),
                    model: selectedModels[1],
                }

                setMessages((prev) => [...prev, assistantMessage2])
                setIsLoading(false)
            }, 1000)
        }, 2000)
    }

    const getModelName = (modelId: string) => {
        return AI_MODELS.find((model) => model.id === modelId)?.name || modelId
    }

    const handleModelSelect = (modelId: string) => {
        if (selectedModels.includes(modelId)) {
            // If already selected and we have more than 2 models, remove it
            if (selectedModels.length > 2) {
                setSelectedModels(selectedModels.filter((id) => id !== modelId))
            }
        } else {
            // If not selected and we have less than 2 models, add it
            if (selectedModels.length < 2) {
                setSelectedModels([...selectedModels, modelId])
            } else {
                // If we already have 2 models, replace the first one
                setSelectedModels([selectedModels[1], modelId])
            }
        }
    }

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
                            Select Models
                            <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Select Two AI Models to Compare</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {AI_MODELS.map((model) => (
                                <div key={model.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`compare-model-${model.id}`}
                                        checked={selectedModels.includes(model.id)}
                                        onCheckedChange={() => handleModelSelect(model.id)}
                                        disabled={!selectedModels.includes(model.id) && selectedModels.length >= 2}
                                    />
                                    <label
                                        htmlFor={`compare-model-${model.id}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {model.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between">
                            <div className="text-sm text-muted-foreground">
                                {selectedModels.length === 2 ? "2 models selected" : `${selectedModels.length}/2 models selected`}
                            </div>
                            <Button onClick={() => setModelSelectOpen(false)}>Done</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </header>

            <ScrollArea className="flex-1 overflow-y-auto p-4">
                <div className="max-w-6xl mx-auto">
                    {messages.map((message) => {
                        if (message.role === "user") {
                            return (
                                <div key={message.id} className="mb-6 flex justify-end">
                                    <div className="flex max-w-[80%] flex-row-reverse">
                                        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow ml-2 bg-primary text-primary-foreground">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className="rounded-lg px-4 py-2 bg-primary text-primary-foreground">
                                                <div className="whitespace-pre-wrap">{message.content}</div>
                                            </div>
                                            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>
                                                    {message.timestamp.toLocaleTimeString([], {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        } else {
                            // For assistant messages, check if it's part of a comparison pair
                            const isComparisonPair = message.id.endsWith("a") || message.id.endsWith("b")
                            const pairId = isComparisonPair ? message.id.slice(0, -1) : null

                            // If it's the first message of a comparison pair (ends with 'a'), render a split view
                            if (isComparisonPair && message.id.endsWith("a")) {
                                const secondMessage = messages.find((m) => m.id === pairId + "b")

                                return (
                                    <div key={pairId} className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* First model response */}
                                        <div className="flex">
                                            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow mr-2 bg-muted">
                                                <Bot className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col items-start flex-1">
                                                <div className="rounded-lg px-4 py-2 bg-muted w-full">
                                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>
                                                        {message.timestamp.toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                    {message.model && (
                                                        <span className="rounded bg-muted px-1 py-0.5">{getModelName(message.model)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Second model response */}
                                        {secondMessage ? (
                                            <div className="flex">
                                                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow mr-2 bg-muted">
                                                    <Bot className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col items-start flex-1">
                                                    <div className="rounded-lg px-4 py-2 bg-muted w-full">
                                                        <div className="whitespace-pre-wrap">{secondMessage.content}</div>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>
                                                            {secondMessage.timestamp.toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                        {secondMessage.model && (
                                                            <span className="rounded bg-muted px-1 py-0.5">{getModelName(secondMessage.model)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex">
                                                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow mr-2 bg-muted">
                                                    <Bot className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col items-start flex-1">
                                                    <div className="rounded-lg px-4 py-2 bg-muted">
                                                        <div className="flex items-center gap-1">
                                                            <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                                                            <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                                                            <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                                                        </div>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                        <span>
                                                            {new Date().toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </span>
                                                        <span className="rounded bg-muted px-1 py-0.5">{getModelName(selectedModels[1])}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )
                            } else if (isComparisonPair && message.id.endsWith("b")) {
                                // Skip the second message of a comparison pair as it's already rendered
                                return null
                            } else {
                                // Render regular assistant message (not part of a comparison)
                                return (
                                    <div key={message.id} className="mb-6 flex justify-start">
                                        <div className="flex">
                                            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow mr-2 bg-muted">
                                                <Bot className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col items-start">
                                                <div className="rounded-lg px-4 py-2 bg-muted">
                                                    <div className="whitespace-pre-wrap">{message.content}</div>
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>
                                                        {message.timestamp.toLocaleTimeString([], {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                    {message.model && (
                                                        <span className="rounded bg-muted px-1 py-0.5">{getModelName(message.model)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                        }
                    })}

                    {isLoading && !messages.some((m) => m.id.endsWith("a")) && (
                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* First model loading */}
                            <div className="flex">
                                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow mr-2 bg-muted">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col items-start flex-1">
                                    <div className="rounded-lg px-4 py-2 bg-muted">
                                        <div className="flex items-center gap-1">
                                            <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                                            <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                                            <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>
                                            {new Date().toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        <span className="rounded bg-muted px-1 py-0.5">{getModelName(selectedModels[0])}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Second model loading */}
                            <div className="flex">
                                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow mr-2 bg-muted">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col items-start flex-1">
                                    <div className="rounded-lg px-4 py-2 bg-muted">
                                        <div className="flex items-center gap-1">
                                            <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                                            <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                                            <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>
                                            {new Date().toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        <span className="rounded bg-muted px-1 py-0.5">{getModelName(selectedModels[1])}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="border-t p-4">
                <div className="max-w-3xl mx-auto">
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                </div>
            </div>
        </>
    )
}
