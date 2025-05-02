"use client"

import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import Sidebar from "@/components/chat/sidebar"
import ChatInterface from "@/components/chat/chat-interface"

export default function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [chatMode, setChatMode] = useState<"single" | "comparison">("single")
    const [selectedModels, setSelectedModels] = useState<string[]>([])
    const isMobile = useMediaQuery("(max-width: 768px)")

    // Close sidebar automatically on mobile
    if (isMobile && isSidebarOpen) {
        setIsSidebarOpen(false)
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    const handleChatModeChange = (mode: "single" | "comparison") => {
        setChatMode(mode)
        // Reset selected models when changing modes
        setSelectedModels([])
    }

    const handleModelSelection = (model: string) => {
        if (chatMode === "single") {
            // In single mode, only one model can be selected
            setSelectedModels([model])
        } else {
            // In comparison mode, up to two models can be selected
            if (selectedModels.includes(model)) {
                // If model is already selected, remove it
                setSelectedModels(selectedModels.filter((m) => m !== model))
            } else if (selectedModels.length < 2) {
                // If less than two models are selected, add the new one
                setSelectedModels([...selectedModels, model])
            } else {
                // If two models are already selected, replace the first one
                setSelectedModels([selectedModels[1], model])
            }
        }
    }

    return (
        // <div className="flex h-screen bg-background">
        //     <Sidebar
        //         isOpen={isSidebarOpen}
        //         toggleSidebar={toggleSidebar}
        //         chatMode={chatMode}
        //         onChatModeChange={handleChatModeChange}
        //     />
        //     <ChatInterface
        //         isSidebarOpen={isSidebarOpen}
        //         toggleSidebar={toggleSidebar}
        //         chatMode={chatMode}
        //         selectedModels={selectedModels}
        //         onModelSelect={handleModelSelection}
        //     />
        // </div>
        <ChatInterface />
    )
}
