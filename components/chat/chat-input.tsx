"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Send, Mic, ImageIcon, Paperclip, X } from "lucide-react"

interface ChatInputProps {
    onSendMessage: (message: string) => void
    isLoading: boolean
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
    const [message, setMessage] = useState("")
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (message.trim() && !isLoading) {
            onSendMessage(message)
            setMessage("")

            // Reset textarea height
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto"
            }
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = "auto"
            textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
        }
    }, [message])

    return (
        <form onSubmit={handleSubmit} className="relative">
            <div className="relative flex items-end rounded-lg border bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring">
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message..."
                    className="min-h-[60px] max-h-[200px] flex-1 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                    disabled={isLoading}
                />
                <div className="flex items-end p-3 pt-0">
                    <TooltipProvider>
                        <div className="flex gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 rounded-full"
                                        disabled={isLoading}
                                    >
                                        <Paperclip className="h-4 w-4" />
                                        <span className="sr-only">Attach file</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Attach file</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 rounded-full"
                                        disabled={isLoading}
                                    >
                                        <ImageIcon className="h-4 w-4" />
                                        <span className="sr-only">Attach image</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Attach image</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 rounded-full"
                                        disabled={isLoading}
                                    >
                                        <Mic className="h-4 w-4" />
                                        <span className="sr-only">Voice input</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Voice input</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                        disabled={!message.trim() || isLoading}
                                    >
                                        <Send className="h-4 w-4" />
                                        <span className="sr-only">Send message</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Send message</TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>
                </div>
            </div>

            {message.trim() && (
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-48 top-3 h-6 w-6 rounded-full opacity-70"
                    onClick={() => setMessage("")}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Clear input</span>
                </Button>
            )}
        </form>
    )
}
