import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/';

  if (error || errorDescription) {
    console.error('OAuth Callback Error:', error, errorDescription);
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(errorDescription || error || 'Authentication failed')}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else {
      console.error('Error exchanging OAuth code for session:', exchangeError);
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(exchangeError.message)}`);
    }
  }

  // If no code and no error, redirect back to auth
  return NextResponse.redirect(`${origin}/auth`);
}
