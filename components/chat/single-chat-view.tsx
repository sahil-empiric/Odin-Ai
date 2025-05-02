"use client"

import { useState } from "react"
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
        content: "Hello, can you explain how React hooks work?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
        id: "2",
        role: "assistant",
        content:
            "React Hooks are functions that let you use state and other React features in functional components. They were introduced in React 16.8 as a way to use stateful logic without writing a class component.\n\nHere are some of the most commonly used hooks:\n\n1. **useState**: Allows you to add state to functional components.\n\n```jsx\nconst [count, setCount] = useState(0);\n```\n\n2. **useEffect**: Lets you perform side effects in function components. It's similar to lifecycle methods like componentDidMount, componentDidUpdate, and componentWillUnmount combined.\n\n```jsx\nuseEffect(() => {\n  document.title = `You clicked ${count} times`;\n  \n  return () => {\n    // Cleanup code (similar to componentWillUnmount)\n  };\n}, [count]); // Only re-run if count changes\n```\n\n3. **useContext**: Accepts a context object and returns the current context value.\n\n4. **useReducer**: An alternative to useState for more complex state logic.\n\n5. **useCallback**: Returns a memoized callback function.\n\n6. **useMemo**: Returns a memoized value.\n\n7. **useRef**: Returns a mutable ref object.\n\nHooks follow two important rules:\n- Only call hooks at the top level (not inside loops, conditions, or nested functions)\n- Only call hooks from React function components or custom hooks\n\nWould you like me to explain any specific hook in more detail?",
        timestamp: new Date(Date.now() - 1000 * 60 * 4),
        model: "gpt-4o",
    },
    {
        id: "3",
        role: "user",
        content: "Can you explain useEffect in more detail?",
        timestamp: new Date(Date.now() - 1000 * 60 * 3),
    },
]

interface SingleChatViewProps {
    selectedModel: string
    setSelectedModel: (model: string) => void
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
}

export default function SingleChatView({
    selectedModel,
    setSelectedModel,
    sidebarOpen,
    setSidebarOpen,
}: SingleChatViewProps) {
    const [messages, setMessages] = useState(SAMPLE_MESSAGES)
    const [isLoading, setIsLoading] = useState(false)
    const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
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

        // Simulate AI response
        setIsLoading(true)

        // Simulate API delay
        setTimeout(() => {
            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `This is a simulated response to: "${message}"`,
                timestamp: new Date(),
                model: selectedModel,
            }

            setMessages((prev) => [...prev, assistantMessage])
            setIsLoading(false)
        }, 2000)
    }

    const getModelName = (modelId: string) => {
        return AI_MODELS.find((model) => model.id === modelId)?.name || modelId
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
                        <DropdownMenuRadioGroup value={selectedModel} onValueChange={setSelectedModel}>
                            {AI_MODELS.map((model) => (
                                <DropdownMenuRadioItem key={model.id} value={model.id} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`model-${model.id}`}
                                        checked={selectedModel === model.id}
                                        onCheckedChange={() => {
                                            setSelectedModel(model.id)
                                            setModelDropdownOpen(false)
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
                    {messages.map((message) => (
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
                                <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
                                    <div
                                        className={`rounded-lg px-4 py-2 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                                    >
                                        <div className="whitespace-pre-wrap">{message.content}</div>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>
                                            {message.timestamp.toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                        {message.role === "assistant" && message.model && (
                                            <span className="rounded bg-muted px-1 py-0.5">{getModelName(message.model)}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start mb-6">
                            <div className="flex">
                                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow mr-2 bg-muted">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col items-start">
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
                                        <span className="rounded bg-muted px-1 py-0.5">{getModelName(selectedModel)}</span>
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
