export type MembershipTier = "free" | "basic" | "premium"

export type ModelProvider = "openai" | "deepseek" | "google" | "anthropic" | "mistral"

export type RoomType = "single" | "comparison" | "roundtable"

export interface User {
  id: string
  email: string
  membership_tier: MembershipTier
  created_at: string
}

export interface Chat {
  id: string
  user_id: string
  title: string
  room_type: RoomType
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  chat_id: string
  role: "user" | "assistant"
  content: string
  model?: ModelProvider
  created_at: string
}
