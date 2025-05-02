"use client"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from "@/components/ui/sidebar"
import type { ChatHistory, ChatMode } from "./chat-interface"
import { format } from "date-fns"
import { ChevronDown, MessageSquare, MessageSquareDiff, Settings, User, HelpCircle, LogOut, Menu, Plus, PanelLeft } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"


interface ChatSidebarProps {
    open: boolean
    setOpen: (open: boolean) => void
    chatHistory: ChatHistory[]
    currentChatId: string | null
    onSelectChat: (chatId: string) => void
    onCreateNewChat: (mode: ChatMode, models: string[]) => void
}

export default function ChatSidebar({
    open,
    setOpen,
    chatHistory,
    currentChatId,
    onSelectChat,
    onCreateNewChat,
}: ChatSidebarProps) {
    const isMobile = useMediaQuery("(max-width: 768px)")

    // Filter chats by mode and date
    const singleChats = chatHistory.filter((chat) => chat.mode === "single")
    const comparisonChats = chatHistory.filter((chat) => chat.mode === "comparison")

    const todayChats = {
        single: singleChats.filter((chat) => format(chat.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")),
        comparison: comparisonChats.filter((chat) => format(chat.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")),
    }

    const last7DaysChats = {
        single: singleChats.filter((chat) => {
            const chatDate = new Date(chat.date)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            return chatDate >= sevenDaysAgo && format(chatDate, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd")
        }),
        comparison: comparisonChats.filter((chat) => {
            const chatDate = new Date(chat.date)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            return chatDate >= sevenDaysAgo && format(chatDate, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd")
        }),
    }

    const olderChats = {
        single: singleChats.filter((chat) => {
            const chatDate = new Date(chat.date)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            return chatDate < sevenDaysAgo
        }),
        comparison: comparisonChats.filter((chat) => {
            const chatDate = new Date(chat.date)
            const sevenDaysAgo = new Date()
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
            return chatDate < sevenDaysAgo
        }),
    }

    // Render hamburger menu button for mobile when sidebar is closed
    const renderMobileMenuButton = () => {
        if (isMobile && !open) {
            return (
                <Button
                    variant="ghost"
                    size="icon"
                    className="fixed top-4 left-4 z-50 md:hidden"
                    onClick={() => setOpen(true)}
                >
                    <PanelLeft size={20} />
                </Button>
            );
        }
        return null;
    };

    // Render the sidebar content (shared between mobile and desktop)
    const renderSidebarContent = () => (
        <>
            <SidebarHeader>
                <div className={isMobile ? "p-4" : "px-3 py-2"}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="w-full justify-between">
                                <span className="flex gap-1 items-center"> <Plus size={16} />  New Chat</span> <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuItem onClick={() => onCreateNewChat("single", ["gpt-4o"])}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Single Chat Mode
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onCreateNewChat("comparison", ["gpt-4o", "claude-3-opus"])}>
                                <MessageSquareDiff className="mr-2 h-4 w-4" />
                                Comparison Chat Mode
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <ScrollArea className="flex-1 mt-4">
                    {/* Single Chat History Section */}
                    <div className="mb-6">
                        <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">Single Chat Mode</h3>

                        {todayChats.single.length > 0 && (
                            <div className="mb-4">
                                <h4 className="px-4 text-xs text-muted-foreground mb-1">Today</h4>
                                {todayChats.single.map((chat) => (
                                    <Button
                                        key={chat.id}
                                        variant={currentChatId === chat.id ? "secondary" : "ghost"}
                                        className="w-full justify-start text-left h-auto py-2"
                                        onClick={() => {
                                            onSelectChat(chat.id);
                                            if (isMobile) setOpen(false);
                                        }}
                                    >
                                        <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">{chat.title}</span>
                                    </Button>
                                ))}
                            </div>
                        )}

                        {last7DaysChats.single.length > 0 && (
                            <div className="mb-4">
                                <h4 className="px-4 text-xs text-muted-foreground mb-1">Last 7 Days</h4>
                                {last7DaysChats.single.map((chat) => (
                                    <Button
                                        key={chat.id}
                                        variant={currentChatId === chat.id ? "secondary" : "ghost"}
                                        className="w-full justify-start text-left h-auto py-2"
                                        onClick={() => {
                                            onSelectChat(chat.id);
                                            if (isMobile) setOpen(false);
                                        }}
                                    >
                                        <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">{chat.title}</span>
                                    </Button>
                                ))}
                            </div>
                        )}

                        {olderChats.single.length > 0 && (
                            <div className="mb-4">
                                <h4 className="px-4 text-xs text-muted-foreground mb-1">Older</h4>
                                {olderChats.single.map((chat) => (
                                    <Button
                                        key={chat.id}
                                        variant={currentChatId === chat.id ? "secondary" : "ghost"}
                                        className="w-full justify-start text-left h-auto py-2"
                                        onClick={() => {
                                            onSelectChat(chat.id);
                                            if (isMobile) setOpen(false);
                                        }}
                                    >
                                        <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">{chat.title}</span>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator className="my-4" />

                    {/* Comparison Chat History Section */}
                    <div>
                        <h3 className="px-4 text-sm font-medium text-muted-foreground mb-2">Comparison Chat Mode</h3>

                        {todayChats.comparison.length > 0 && (
                            <div className="mb-4">
                                <h4 className="px-4 text-xs text-muted-foreground mb-1">Today</h4>
                                {todayChats.comparison.map((chat) => (
                                    <Button
                                        key={chat.id}
                                        variant={currentChatId === chat.id ? "secondary" : "ghost"}
                                        className="w-full justify-start text-left h-auto py-2"
                                        onClick={() => {
                                            onSelectChat(chat.id);
                                            if (isMobile) setOpen(false);
                                        }}
                                    >
                                        <MessageSquareDiff className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">{chat.title}</span>
                                    </Button>
                                ))}
                            </div>
                        )}

                        {last7DaysChats.comparison.length > 0 && (
                            <div className="mb-4">
                                <h4 className="px-4 text-xs text-muted-foreground mb-1">Last 7 Days</h4>
                                {last7DaysChats.comparison.map((chat) => (
                                    <Button
                                        key={chat.id}
                                        variant={currentChatId === chat.id ? "secondary" : "ghost"}
                                        className="w-full justify-start text-left h-auto py-2"
                                        onClick={() => {
                                            onSelectChat(chat.id);
                                            if (isMobile) setOpen(false);
                                        }}
                                    >
                                        <MessageSquareDiff className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">{chat.title}</span>
                                    </Button>
                                ))}
                            </div>
                        )}

                        {olderChats.comparison.length > 0 && (
                            <div className="mb-4">
                                <h4 className="px-4 text-xs text-muted-foreground mb-1">Older</h4>
                                {olderChats.comparison.map((chat) => (
                                    <Button
                                        key={chat.id}
                                        variant={currentChatId === chat.id ? "secondary" : "ghost"}
                                        className="w-full justify-start text-left h-auto py-2"
                                        onClick={() => {
                                            onSelectChat(chat.id);
                                            if (isMobile) setOpen(false);
                                        }}
                                    >
                                        <MessageSquareDiff className="mr-2 h-4 w-4 shrink-0" />
                                        <span className="truncate">{chat.title}</span>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <Settings className="h-4 w-4 mr-2" />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <User className="h-4 w-4 mr-2" />
                            <span>Profile</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <HelpCircle className="h-4 w-4 mr-2" />
                            <span>Help</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton>
                            <LogOut className="h-4 w-4 mr-2" />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            {isMobile && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4"
                    onClick={() => setOpen(false)}
                >
                    <ChevronDown className="h-5 w-5 rotate-90" />
                </Button>
            )}
        </>
    );

    return (
        <>
            {/* Mobile menu button (hamburger) */}
            {renderMobileMenuButton()}

            {/* Mobile sidebar - only rendered when needed */}
            {isMobile ? (
                open && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        {/* Backdrop/overlay */}
                        <div
                            className="fixed inset-0 bg-black/20"
                            onClick={() => setOpen(false)}
                        />

                        {/* Sidebar */}
                        <div className="fixed inset-y-0 left-0 w-72 bg-background shadow-lg">
                            <Sidebar className="border-r h-full">
                                {renderSidebarContent()}
                            </Sidebar>
                        </div>
                    </div>
                )
            ) : (
                <Sidebar className="border-r">
                    {renderSidebarContent()}
                </Sidebar>
            )}
        </>
    )
}