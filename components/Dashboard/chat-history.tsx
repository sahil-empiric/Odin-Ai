"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Generate mock chat data
const generateChats = (count: number) => {
  const statuses = ["Active", "Closed"]
  const names = [
    "John Smith",
    "Emma Johnson",
    "Michael Brown",
    "Olivia Davis",
    "William Wilson",
    "Sophia Martinez",
    "James Anderson",
    "Isabella Taylor",
    "Robert Thomas",
    "Mia Garcia",
    "David Rodriguez",
    "Charlotte Lewis",
  ]

  const messages = [
    "Thanks for your help!",
    "When will the issue be resolved?",
    "I need assistance with my account",
    "The new feature works great",
    "Can you explain how to use this?",
    "I'm having trouble logging in",
    "Is there a way to export my data?",
    "The dashboard looks amazing",
  ]

  return Array.from({ length: count }).map((_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 14))

    const startTime = new Date(date)
    const endTime = new Date(date)
    endTime.setMinutes(endTime.getMinutes() + Math.floor(Math.random() * 60))

    const participant1 = names[Math.floor(Math.random() * names.length)]
    let participant2 = names[Math.floor(Math.random() * names.length)]
    while (participant2 === participant1) {
      participant2 = names[Math.floor(Math.random() * names.length)]
    }

    return {
      id: `CHAT${String(i + 1).padStart(5, "0")}`,
      date: date.toISOString(),
      participants: [participant1, participant2],
      duration: `${Math.floor(Math.random() * 30) + 1} min`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastMessage: messages[Math.floor(Math.random() * messages.length)],
    }
  })
}

const chats = generateChats(20)

export function ChatHistory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredChats, setFilteredChats] = useState(chats)
  const [visibleChats, setVisibleChats] = useState(10)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)

    if (query) {
      const filtered = chats.filter(
        (chat) =>
          chat.participants.some((p) => p.toLowerCase().includes(query)) ||
          chat.lastMessage.toLowerCase().includes(query) ||
          chat.id.toLowerCase().includes(query),
      )
      setFilteredChats(filtered)
    } else {
      setFilteredChats(chats)
    }
  }

  const loadMore = () => {
    setVisibleChats((prev) => Math.min(prev + 10, filteredChats.length))
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat History</CardTitle>
        <CardDescription>View and manage all chat conversations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search chats..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {filteredChats.slice(0, visibleChats).map((chat) => (
            <div key={chat.id} className="flex items-start gap-4 p-4 rounded-lg border">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt="Avatar" />
                <AvatarFallback>{chat.participants[0].charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium truncate">{chat.participants.join(", ")}</div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        chat.status === "Active"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                      }
                    >
                      {chat.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Export Chat</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete Chat</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground truncate mt-1">{chat.lastMessage}</div>

                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <div>
                    {formatDate(chat.date)} at {formatTime(chat.date)}
                  </div>
                  <div>Duration: {chat.duration}</div>
                </div>
              </div>
            </div>
          ))}

          {visibleChats < filteredChats.length && (
            <Button variant="outline" className="w-full mt-4" onClick={loadMore}>
              Load More
            </Button>
          )}

          {filteredChats.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No chat history found.</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
