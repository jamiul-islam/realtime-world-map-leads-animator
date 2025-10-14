import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const accessToken = requestUrl.searchParams.get('access_token');
  const refreshToken = requestUrl.searchParams.get('refresh_token');

  console.log('Set session route:', {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
  });

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Missing tokens')}`);
  }

  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            console.error('Error setting cookies:', error);
          }
        },
      },
    }
  );

  try {
    console.log('Setting session from tokens...');
    
    const { data, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      throw sessionError;
    }

    console.log('Session set successfully:', data.session?.user?.email);
    console.log('Cookies that will be set:', cookieStore.getAll().map(c => c.name));
    
    // Redirect to modify page
    return NextResponse.redirect(`${requestUrl.origin}/modify`);
  } catch (err: any) {
    console.error('Set session error:', err);
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(err.message || 'Failed to set session')}`
    );
  }
}
