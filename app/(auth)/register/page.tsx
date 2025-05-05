"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { signInWithGoogle, signup } from "@/utils/supabase/action"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [plan, setPlan] = useState("standard")
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // try {
    //   await signUp(email, password)
    //   router.push("/dashboard")
    // } catch (error) {
    //   console.error("Registration error:", error)
    //   setError("Failed to sign up. Please try again.")
    // } finally {
    //   setIsLoading(false)
    // }
    setIsLoading(false)
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Google sign in error:", error)
      setError("Failed to sign in with Google.")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-neutral-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Enter your details to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="space-y-2">
              <div className="flex flex-col space-y-1">
                <Label className="text-zinc-200">Plan</Label>
                <p className="text-sm text-zinc-400">Select the plan that best fits your needs.</p>
              </div>
              <RadioGroup value={plan} onValueChange={setPlan} className="grid grid-cols-2 gap-4">
                <div
                  className={`flex flex-col p-4 rounded-lg border border-zinc-700 ${plan === "standard" ? "bg-zinc-800" : ""}`}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" className="text-zinc-200" />
                    <Label htmlFor="standard" className="font-medium text-zinc-200">
                      Standard ($9.99)
                    </Label>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 pl-6">Perfect for small businesses.</p>
                </div>
                <div
                  className={`flex flex-col p-4 rounded-lg border border-zinc-700 ${plan === "advanced" ? "bg-zinc-800" : ""}`}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" className="text-zinc-200" />
                    <Label htmlFor="advanced" className="font-medium text-zinc-200">
                      Advanced ($19.99)
                    </Label>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 pl-6">Ideal for growing teams with more demands.</p>
                </div>
                <div
                  className={`flex flex-col p-4 rounded-lg border border-zinc-700 ${plan === "premium" ? "bg-zinc-800" : ""}`}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="premium" id="premium" className="text-zinc-200" />
                    <Label htmlFor="premium" className="font-medium text-zinc-200">
                      Premium ($49.99)
                    </Label>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400 pl-6">Full-featured plan for professional teams.</p>
                </div>
              </RadioGroup>
            </div>

            {/* Hidden input to ensure plan value is included in form submission */}
            <input type="hidden" name="plan" value={plan} />

            <Button
              type="submit"
              formAction={async (formData) => {
                await signup(formData);
              }}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" type="button" className="w-full mt-4" onClick={handleGoogleSignIn} disabled={isLoading}>
            Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
