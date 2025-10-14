'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have hash parameters (implicit flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const error = hashParams.get('error');

        console.log('Client callback:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          error,
        });

        if (error) {
          window.location.href = `/login?error=${encodeURIComponent(error)}`;
          return;
        }

        // If we have tokens in hash, send them to server route to set cookies
        if (accessToken && refreshToken) {
          console.log('Sending tokens to server...');
          
          // Call server route with tokens as query params
          window.location.href = `/auth/set-session?access_token=${accessToken}&refresh_token=${refreshToken}`;
          return;
        }

        // No hash params - might be PKCE flow, let server route handle it
        console.log('No hash params, checking for code...');
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        
        if (code) {
          // Server route will handle PKCE flow
          return;
        }

        throw new Error('No authentication data received');
      } catch (err: any) {
        console.error('Client callback error:', err);
        window.location.href = `/login?error=${encodeURIComponent(err.message)}`;
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-purple-950">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <div className="text-cyan-400">Completing authentication...</div>
      </div>
    </div>
  );
}
