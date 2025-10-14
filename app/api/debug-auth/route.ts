import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // Get current session
  const { data: { session }, error } = await supabase.auth.getSession();
  
  return NextResponse.json({
    hasSession: !!session,
    sessionError: error?.message || null,
    user: session?.user ? {
      id: session.user.id,
      email: session.user.email,
    } : null,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    timestamp: new Date().toISOString(),
  });
}
