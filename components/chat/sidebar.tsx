"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PanelLeft, Plus, Settings, User, LogOut, MessageSquare, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import {
    Sidebar as ShadcnSidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarSeparator,
    SidebarProvider,
} from "@/components/ui/sidebar"

interface SidebarProps {
    isOpen: boolean
    toggleSidebar: () => void
    chatMode: "single" | "comparison"
    onChatModeChange: (mode: "single" | "comparison") => void
}

interface ChatHistoryItem {
    id: string
    title: string
    date: Date
    mode: "single" | "comparison"
}

export default function Sidebar({ isOpen, toggleSidebar, chatMode, onChatModeChange }: SidebarProps) {
    // Mock chat history data
    const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
        { id: "1", title: "Understanding React Hooks", date: new Date(), mode: "single" },
        { id: "2", title: "Next.js vs Remix", date: new Date(), mode: "comparison" },
        { id: "3", title: "TypeScript Best Practices", date: new Date(Date.now() - 86400000), mode: "single" },
        { id: "4", title: "GraphQL vs REST API", date: new Date(Date.now() - 86400000 * 2), mode: "comparison" },
        { id: "5", title: "CSS-in-JS Solutions", date: new Date(Date.now() - 86400000 * 5), mode: "single" },
    ])

    // Filter chat history by time period and mode
    const todayChats = chatHistory.filter(
        (chat) => new Date(chat.date).toDateString() === new Date().toDateString() && chat.mode === "single",
    )

    const recentChats = chatHistory.filter(
        (chat) =>
            new Date(chat.date).toDateString() !== new Date().toDateString() &&
            new Date(chat.date) > new Date(Date.now() - 86400000 * 7) &&
            chat.mode === "single",
    )

    const todayComparisonChats = chatHistory.filter(
        (chat) => new Date(chat.date).toDateString() === new Date().toDateString() && chat.mode === "comparison",
    )

    const recentComparisonChats = chatHistory.filter(
        (chat) =>
            new Date(chat.date).toDateString() !== new Date().toDateString() &&
            new Date(chat.date) > new Date(Date.now() - 86400000 * 7) &&
            chat.mode === "comparison",
    )

    return (
        <SidebarProvider defaultOpen={isOpen}>
            <ShadcnSidebar
                className={cn("fixed left-0 top-0 z-40 h-screen transition-transform", !isOpen && "-translate-x-full")}
            >
                <SidebarHeader>
                    <div className="px-3 py-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="w-full justify-between" variant="outline">
                                    <div className="flex items-center gap-2">
                                        <Plus size={16} />
                                        <span>New Chat</span>
                                    </div>
                                    <ChevronDown size={16} />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[200px]">
                                <DropdownMenuItem onClick={() => onChatModeChange("single")}>Single Chat Mode</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onChatModeChange("comparison")}>Comparison Chat Mode</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </SidebarHeader>

                <SidebarContent>
                    {/* Single Chat History */}
                    <SidebarGroup>
                        <SidebarGroupLabel>Single Chat Mode</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {todayChats.length > 0 && (
                                    <>
                                        <div className="px-3 py-1 text-xs text-muted-foreground">Today</div>
                                        {todayChats.map((chat) => (
                                            <SidebarMenuItem key={chat.id}>
                                                <SidebarMenuButton>
                                                    <MessageSquare size={16} />
                                                    <span>{chat.title}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </>
                                )}

                                {recentChats.length > 0 && (
                                    <>
                                        <div className="px-3 py-1 text-xs text-muted-foreground">Last 7 Days</div>
                                        {recentChats.map((chat) => (
                                            <SidebarMenuItem key={chat.id}>
                                                <SidebarMenuButton>
                                                    <MessageSquare size={16} />
                                                    <span>{chat.title}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarSeparator />

                    {/* Comparison Chat History */}
                    <SidebarGroup>
                        <SidebarGroupLabel>Comparison Chat Mode</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {todayComparisonChats.length > 0 && (
                                    <>
                                        <div className="px-3 py-1 text-xs text-muted-foreground">Today</div>
                                        {todayComparisonChats.map((chat) => (
                                            <SidebarMenuItem key={chat.id}>
                                                <SidebarMenuButton>
                                                    <MessageSquare size={16} />
                                                    <span>{chat.title}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </>
                                )}

                                {recentComparisonChats.length > 0 && (
                                    <>
                                        <div className="px-3 py-1 text-xs text-muted-foreground">Last 7 Days</div>
                                        {recentComparisonChats.map((chat) => (
                                            <SidebarMenuItem key={chat.id}>
                                                <SidebarMenuButton>
                                                    <MessageSquare size={16} />
                                                    <span>{chat.title}</span>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        ))}
                                    </>
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <Settings size={16} />
                                <span>Settings</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <User size={16} />
                                <span>Profile</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton>
                                <LogOut size={16} />
                                <span>Logout</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </ShadcnSidebar>

            {/* Mobile sidebar toggle button */}
            <button
                className={cn("fixed left-4 top-4 z-50 rounded-md p-2 md:hidden", isOpen ? "hidden" : "block")}
                onClick={toggleSidebar}
            >
                <PanelLeft size={24} />
            </button>
        </SidebarProvider>
    )
}
