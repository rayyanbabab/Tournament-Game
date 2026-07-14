/**
 * Client-side compatibility shim.
 * All 'use client' components that import createClient from here
 * will get a dummy client. Auth operations should use next-auth/react instead.
 */
export function createClient() {
  return {
    auth: {
      async getUser() { return { data: { user: null }, error: null } },
      async signOut() {
        const { signOut } = await import('next-auth/react')
        await signOut({ callbackUrl: '/' })
        return { error: null }
      },
    },
    from(_table: string) {
      return {
        select: () => this.from(_table),
        eq: () => this.from(_table),
        single: async () => ({ data: null, error: null }),
        then: async (resolve: any) => resolve({ data: null, error: null }),
      }
    },
    storage: {
      from(_bucket: string) {
        return {
          upload: async () => ({ data: null, error: { message: 'Use server action for uploads' } }),
          getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
        }
      }
    }
  }
}
