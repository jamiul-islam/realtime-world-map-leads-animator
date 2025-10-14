import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase browser client
// The @supabase/ssr client automatically:
// - Uses cookies for session storage (shared with server)
// - Uses localStorage for PKCE code verifier
// - Handles PKCE flow automatically
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);
