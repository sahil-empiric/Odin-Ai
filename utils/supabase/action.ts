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

export async function signup(formData: FormData) {
    const supabase = await createClientForServer()

    // type-casting here for convenience
    // in practice, you should validate your inputs
    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        options: {
            emailRedirectTo: `http://localhost:3000/api/callback?next=/dashboard`,
        }
    }

    const { data: signupData, error } = await supabase.auth.signUp(data)

    if (error) {
        console.error('Signup error:', error)
        redirect('/error')
    }

    // Always redirect to the signup success page
    // This way we avoid any redirect loops even if Supabase behavior changes
    redirect('/signup-success')
}

export async function signInWithGoogle() {
    const supabase = await createClientForServer()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `http://localhost:3000/api/callback`,
        },
    })

    if (error) {
        console.error('Error signing in with Google:', error)
        redirect('/error')
    }

    // The user will be redirected to Google's OAuth flow
    // so we return the URL that Supabase Auth provides
    return data
}