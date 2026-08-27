import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname
      const isProtected = ['/dashboard', '/admin'].some(p => pathname.startsWith(p))

      if (isProtected && !isLoggedIn) {
        return false // Redirects to signIn page
      }

      if (pathname.startsWith('/admin') && (auth?.user as any)?.role !== 'admin') {
        const url = nextUrl.clone()
        url.pathname = '/dashboard'
        return Response.redirect(url)
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.full_name = (user as any).full_name
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
        ;(session.user as any).full_name = token.full_name
      }
      return session
    },
  },
  providers: [], // Configured with DB & bcrypt in auth.ts
}
