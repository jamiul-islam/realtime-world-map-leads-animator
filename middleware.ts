import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Check if accessing protected route
  if (request.nextUrl.pathname.startsWith('/modify')) {
    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // No session - redirect to login
    if (!session) {
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user has admin role
    const { data: userData } = await supabase.auth.getUser();
    const userRole = userData.user?.user_metadata?.role || userData.user?.app_metadata?.role;

    if (userRole !== 'admin') {
      // Not an admin - redirect to login with error
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('error', 'Only admins can access the page');
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/modify/:path*'],
};
