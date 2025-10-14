import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    try {
      // Exchange the code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        throw exchangeError;
      }

      // Check if user has admin role
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw userError;
      }

      // Check user metadata for admin role
      const userRole = userData.user?.user_metadata?.role || userData.user?.app_metadata?.role;
      
      if (userRole !== 'admin') {
        // Not an admin - sign out and redirect with error
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=${encodeURIComponent('Only admins can access the page')}`
        );
      }

      // Success - redirect to admin page
      return NextResponse.redirect(`${requestUrl.origin}/modify`);
    } catch (error: any) {
      console.error('Session exchange error:', error);
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=${encodeURIComponent(error.message || 'Authentication failed')}`
      );
    }
  }

  // No code provided
  return NextResponse.redirect(
    `${requestUrl.origin}/login?error=${encodeURIComponent('Invalid authentication request')}`
  );
}
