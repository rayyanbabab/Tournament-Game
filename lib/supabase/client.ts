/**
 * Client-side compatibility shim.
 * All 'use client' components that import createClient from here
 * will get a safe client interface.
 */
export function createClient() {
  const createQueryBuilder = (_table: string) => {
    const builder: any = {
      select: () => builder,
      eq: () => builder,
      neq: () => builder,
      gt: () => builder,
      gte: () => builder,
      lt: () => builder,
      lte: () => builder,
      in: () => builder,
      order: () => builder,
      limit: () => builder,
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      insert: async (_rows: any) => ({ data: null, error: null }),
      update: async (_updates: any) => builder,
      delete: async () => builder,
      upsert: async (_rows: any, _opts?: any) => ({ data: null, error: null }),
      then: async (resolve: any) => resolve({ data: [], error: null }),
    }
    return builder
  }

  return {
    auth: {
      async getUser(): Promise<{ data: { user: any }; error: any }> { return { data: { user: null }, error: null } },
      async signOut() {
        const { signOut } = await import('next-auth/react')
        await signOut({ callbackUrl: '/' })
        return { error: null }
      },
    },
    from(table: string) {
      return createQueryBuilder(table)
    },
    async rpc(_fnName: string, _params?: any) {
      return { data: null, error: null }
    },
    channel(_name: string) {
      const ch: any = {
        on: () => ch,
        subscribe: () => ch,
      }
      return ch
    },
    removeChannel(_channel: any) {},
    storage: {
      from(_bucket: string) {
        return {
          upload: async (_path?: string, _file?: any, _opts?: any) => ({ data: null, error: null }),
          getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
        }
      }
    }
  }
}
