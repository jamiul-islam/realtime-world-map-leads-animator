import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  // This refreshes the session and sets the cookies properly
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('Middleware: User check:', {
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
  });

  // Protect /modify route - but allow /auth/callback to pass through
  if (
    !user &&
    request.nextUrl.pathname.startsWith('/modify')
  ) {
    console.log('Middleware: No user, redirecting to /login');
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  console.log('Middleware: Allowing request to:', request.nextUrl.pathname);
  return supabaseResponse;
}
