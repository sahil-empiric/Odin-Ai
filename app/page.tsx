import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">AI Chat Platform</h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/50">
          <div className="container px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Chat with Multiple AI Models</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Compare responses, create round-table discussions, and get insights from the world's most advanced AI
              models.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 bg-background">
          <div className="container px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Choose Your Chat Experience</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Single Model Chat</h3>
                <p className="text-muted-foreground mb-4">
                  Chat one-on-one with your choice of AI model. Perfect for focused conversations and specific tasks.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Available on Free tier</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Access to OpenAI models</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Save chat history</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm border-primary/20 border-2">
                <h3 className="text-xl font-bold mb-3">Comparison Chat</h3>
                <p className="text-muted-foreground mb-4">
                  Submit one prompt and compare responses from multiple AI models side by side.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Available on Basic tier</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Compare up to 5 models</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Access to more advanced models</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-3">Round Table Chat</h3>
                <p className="text-muted-foreground mb-4">
                  Create multi-AI discussions where models interact with you and each other.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Available on Premium tier</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Access to all AI models</span>
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span>
                    <span>Unlimited messages</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container px-4 text-center">
            <h2 className="text-3xl font-bold mb-12">Supported AI Models</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="p-4 bg-background rounded-lg shadow-sm">
                <h3 className="font-bold">OpenAI</h3>
                <p className="text-sm text-muted-foreground">GPT-4o</p>
              </div>
              <div className="p-4 bg-background rounded-lg shadow-sm">
                <h3 className="font-bold">DeepSeek</h3>
                <p className="text-sm text-muted-foreground">DeepSeek Reasoner</p>
              </div>
              <div className="p-4 bg-background rounded-lg shadow-sm">
                <h3 className="font-bold">Google</h3>
                <p className="text-sm text-muted-foreground">Gemini Pro</p>
              </div>
              <div className="p-4 bg-background rounded-lg shadow-sm">
                <h3 className="font-bold">Anthropic</h3>
                <p className="text-sm text-muted-foreground">Claude 3 Opus</p>
              </div>
              <div className="p-4 bg-background rounded-lg shadow-sm">
                <h3 className="font-bold">Mistral</h3>
                <p className="text-sm text-muted-foreground">Mistral Large</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 bg-background">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} AI Chat Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
