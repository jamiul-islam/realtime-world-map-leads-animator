import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// Alternative callback route for handling hash-based tokens
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);

  // This route handles the case where Supabase uses implicit flow
  // and sends tokens in the URL hash instead of query params

  console.log("Confirm route called:", requestUrl.href);

  // For hash-based flow, we need to handle this on the client side
  // Redirect to a client-side handler
  return NextResponse.redirect(
    `${requestUrl.origin}/auth/callback${requestUrl.search}`
  );
}
