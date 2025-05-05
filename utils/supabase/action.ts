'use server'

import { createClientForServer } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'


export async function login(formData: FormData) {
    const supabase = await createClientForServer()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    console.log("🚀 ~ login ~ error:", error)
    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signOut(): Promise<void> {
    const supabase = await createClientForServer()
    await supabase.auth.signOut()
}

export async function signup(formData: FormData) {
    try {
        // Safely extract form data
        const email = formData.get('email')
        const password = formData.get('password')
        const plan = formData.get('plan')

        if (!email || !password || !plan) {
            console.error("Missing required fields for signup")
            return { redirect: '/error' }
        }

        const supabase = await createClientForServer()

        // Configure signup data with metadata
        const data = {
            email: email as string,
            password: password as string,
            options: {
                data: {
                    role: 'user',
                    plan: plan as string
                },
                emailRedirectTo: `http://localhost:3000/api/callback?next=/dashboard`,
            }
        }

        console.log("Attempting signup with:", { email, plan })

        const { data: userData, error } = await supabase.auth.signUp(data)

        if (error) {
            console.error("Signup error:", error)
            return redirect('/error')
        }

        console.log("Signup successful, redirecting to success page")

        // We explicitly redirect to signup-success page
        // This page is exempt from middleware checks (see middleware.ts)
        return redirect('/signup-success')
    } catch (err) {
        console.error("Unexpected error during signup:", err)
        return redirect('/error')
    }
}

export async function signInWithGoogle(plan?: string) {
    const supabase = await createClientForServer()

    console.log("🚀 ~ signInWithGoogle ~ plan:", plan)

    // Build the callback URL with query parameters
    let callbackUrl = `http://localhost:3000/api/callback`

    // Add plan and registration flag to the callback URL directly
    if (plan) {
        callbackUrl += `?plan=${encodeURIComponent(plan)}&registration=true`
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: callbackUrl,
        },
    })

    if (error) {
        console.error('Error signing in with Google:', error)
        redirect('/error')
    }

    if (data.url) {
        redirect(data.url) // use the redirect API for your server framework
    }

    // The user will be redirected to Google's OAuth flow
    // so we return the URL that Supabase Auth provides
    return data
}