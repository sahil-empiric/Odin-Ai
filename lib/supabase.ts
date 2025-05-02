// import { createClient } from "@supabase/supabase-js"

// // Initialize Supabase client
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// export const supabase = createClient(supabaseUrl, supabaseAnonKey)


import { createBrowserClient as browserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

class SupabaseClientSingleton {
    private static instance: SupabaseClient;
    private static url: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    private static key: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    private constructor() { }

    public static getInstance(): SupabaseClient {
        if (!SupabaseClientSingleton.instance) {
            SupabaseClientSingleton.instance = browserClient(
                SupabaseClientSingleton.url,
                SupabaseClientSingleton.key
            );
        }
        return SupabaseClientSingleton.instance;
    }
}

export const createBrowserClient = () => SupabaseClientSingleton.getInstance();