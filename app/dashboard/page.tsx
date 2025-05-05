"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createBrowserClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Chat, MembershipTier, RoomType } from "@/types/database.types"
import { signOut } from "@/utils/supabase/action"

const supabase = createBrowserClient()

export default function DashboardPage() {
  const { user } = useAuth()
  const [chats, setChats] = useState<Chat[]>([])
  const [membershipTier, setMembershipTier] = useState<MembershipTier>("free")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("membership_tier")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError

        if (profile) {
          setMembershipTier(profile.membership_tier as MembershipTier)
        } else {
          // Create profile if it doesn't exist
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            membership_tier: "free",
          })
        }

        // Fetch chats
        const { data: chatData, error: chatError } = await supabase
          .from("chats")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })

        if (chatError) throw chatError
        setChats(chatData as Chat[])
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handleCreateChat = (roomType: RoomType) => {
    router.push(`/chat/new?type=${roomType}`)
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">AI Chat Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {user?.email} - {membershipTier.charAt(0).toUpperCase() + membershipTier.slice(1)} Tier
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="grid gap-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">Create New Chat</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Single Model Chat</CardTitle>
                  <CardDescription>Chat with a single AI model of your choice</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleCreateChat("single")}>
                    Create
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comparison Chat</CardTitle>
                  <CardDescription>Compare responses from multiple AI models</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleCreateChat("comparison")}
                    disabled={membershipTier === "free"}
                  >
                    {membershipTier === "free" ? "Requires Basic Tier" : "Create"}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Round Table Chat</CardTitle>
                  <CardDescription>Multi-AI discussion where models interact with each other</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() => handleCreateChat("roundtable")}
                    disabled={membershipTier !== "premium"}
                  >
                    {membershipTier !== "premium" ? "Requires Premium Tier" : "Create"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Recent Chats</h2>
            {chats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chats.map((chat) => (
                  <Card key={chat.id}>
                    <CardHeader>
                      <CardTitle>{chat.title || "Untitled Chat"}</CardTitle>
                      <CardDescription>{new Date(chat.created_at).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        Type: {chat.room_type.charAt(0).toUpperCase() + chat.room_type.slice(1)}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/chat/${chat.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          Open Chat
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No chats yet. Create your first chat above.</p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Membership</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className={membershipTier === "free" ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle>Standard Tier</CardTitle>
                  <CardDescription>Basic access to AI chat</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>Access to OpenAI models</li>
                    <li>Single model chat only</li>
                    <li>Limited messages per day</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={membershipTier === "free" ? "outline" : "default"}
                    className="w-full"
                    disabled={membershipTier === "free"}
                  >
                    {membershipTier === "free" ? "Current Plan" : "Downgrade"}
                  </Button>
                </CardFooter>
              </Card>

              <Card className={membershipTier === "basic" ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle>Advanced Tier</CardTitle>
                  <CardDescription>Enhanced AI chat capabilities</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>All Free tier features</li>
                    <li>Access to DeepSeek and Gemini models</li>
                    <li>Comparison chat room</li>
                    <li>More messages per day</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={membershipTier === "basic" ? "outline" : "default"}
                    className="w-full"
                    disabled={membershipTier === "basic"}
                  >
                    {membershipTier === "basic"
                      ? "Current Plan"
                      : membershipTier === "premium"
                        ? "Downgrade"
                        : "Upgrade"}
                  </Button>
                </CardFooter>
              </Card>

              <Card className={membershipTier === "premium" ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle>Premium Tier</CardTitle>
                  <CardDescription>Full access to all features</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li>All Basic tier features</li>
                    <li>Access to Claude and Mistral models</li>
                    <li>Round table chat room</li>
                    <li>Unlimited messages</li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={membershipTier === "premium" ? "outline" : "default"}
                    className="w-full"
                    disabled={membershipTier === "premium"}
                  >
                    {membershipTier === "premium" ? "Current Plan" : "Upgrade"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
