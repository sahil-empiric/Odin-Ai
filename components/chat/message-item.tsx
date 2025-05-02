import type { Message } from "@/types/database.types"

interface MessageItemProps {
  message: Message
  showModel?: boolean
}

export function MessageItem({ message, showModel = false }: MessageItemProps) {
  return (
    <div className={`flex flex-col p-4 ${message.role === "user" ? "bg-muted/50" : "bg-background"}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="font-medium">
          {message.role === "user" ? "You" : message.model ? message.model.toUpperCase() : "AI"}
        </div>
        {showModel && message.model && message.role === "assistant" && (
          <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{message.model}</div>
        )}
      </div>
      <div className="whitespace-pre-wrap">{message.content}</div>
    </div>
  )
}
