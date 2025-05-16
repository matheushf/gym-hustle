import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from './utils/supabase/server';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const cookieStore = cookies();
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  const supabase = await createClient(cookieStore);
  const { data: { session } } = await supabase.auth.getSession()

  // If there's no session and the user is trying to access any non-auth route
  if (!session && !request.nextUrl.pathname.startsWith('/auth/')) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    return NextResponse.redirect(redirectUrl)
  }

  if (session && request.nextUrl.pathname.startsWith('/auth/')) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/'
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|manifest.*|apple-icon.*|icon.*).*)',
  ],
} 