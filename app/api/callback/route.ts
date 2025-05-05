import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClientForServer } from '@/utils/supabase/server'


export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    try {
      const supabase = await createClientForServer()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        // Successfully exchanged code for session
        return NextResponse.redirect(`${origin}${next}`)
      }

      console.error("Error exchanging code for session:", error)
    } catch (err) {
      console.error("Unexpected error in callback:", err)
    }
  }

  // If we get here, something went wrong
  return NextResponse.redirect(`${origin}/error`)
}