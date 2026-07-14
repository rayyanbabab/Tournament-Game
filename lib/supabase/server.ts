/**
 * Compatibility shim: replaces @supabase/ssr server client
 * with a Neon-backed implementation using NextAuth for auth.
 * 
 * All server components import this file unchanged.
 * The API mimics the subset of Supabase client used in this app.
 */
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

// Minimal query builder that mimics supabase chaining API
function buildQuery(table: string) {
  let _select = '*'
  let _filters: Array<{ col: string; op: string; val: any }> = []
  let _order: { col: string; asc: boolean } | null = null
  let _limit: number | null = null
  let _single = false
  let _count = false
  let _head = false

  const builder: any = {
    select(cols: string, opts?: { count?: string; head?: boolean }) {
      _select = cols
      if (opts?.count) _count = true
      if (opts?.head) _head = true
      return builder
    },
    eq(col: string, val: any) {
      _filters.push({ col, op: '=', val })
      return builder
    },
    neq(col: string, val: any) {
      _filters.push({ col, op: '!=', val })
      return builder
    },
    in(col: string, vals: any[]) {
      _filters.push({ col, op: 'in', val: vals })
      return builder
    },
    order(col: string, opts?: { ascending?: boolean }) {
      _order = { col, asc: opts?.ascending !== false }
      return builder
    },
    limit(n: number) {
      _limit = n
      return builder
    },
    single() {
      _single = true
      _limit = 1
      return builder
    },
    async then(resolve: any) {
      return resolve(await builder._run())
    },
    async _run() {
      try {
        // Build WHERE clause
        const whereParts: string[] = []
        const values: any[] = []
        let idx = 1

        for (const f of _filters) {
          if (f.op === 'in') {
            const placeholders = f.val.map(() => `$${idx++}`).join(', ')
            values.push(...f.val)
            whereParts.push(`"${f.col}" IN (${placeholders})`)
          } else {
            whereParts.push(`"${f.col}" ${f.op} $${idx++}`)
            values.push(f.val)
          }
        }

        const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''
        const orderBy = _order ? `ORDER BY "${_order.col}" ${_order.asc ? 'ASC' : 'DESC'}` : ''
        const limitClause = _limit ? `LIMIT ${_limit}` : ''

        if (_count) {
          const rows = await sql(`SELECT COUNT(*) as count FROM "${table}" ${where}`, values)
          return { count: parseInt(rows[0]?.count || '0'), data: null, error: null }
        }

        const rows = await sql(`SELECT * FROM "${table}" ${where} ${orderBy} ${limitClause}`, values)

        if (_single) {
          return { data: rows[0] || null, error: rows[0] ? null : { message: 'Not found' } }
        }

        return { data: rows, error: null }
      } catch (e: any) {
        return { data: null, error: { message: e.message }, count: null }
      }
    }
  }

  // Make it awaitable
  Object.defineProperty(builder, Symbol.toStringTag, { value: 'Promise' })
  
  return builder
}

class NeonClient {
  auth = {
    async getUser() {
      const session = await auth()
      if (!session?.user) return { data: { user: null }, error: null }
      return {
        data: {
          user: {
            id: session.user.id,
            email: session.user.email,
            role: (session.user as any).role,
            full_name: (session.user as any).full_name,
          }
        },
        error: null,
      }
    },
  }

  from(table: string) {
    const qb = buildQuery(table)

    return {
      select: qb.select.bind(qb),
      // insert
      insert(rows: any | any[]) {
        const data = Array.isArray(rows) ? rows : [rows]
        const qbInsert: any = {
          async _run() {
            try {
              const results = []
              for (const row of data) {
                const cols = Object.keys(row).map(c => `"${c}"`).join(', ')
                const placeholders = Object.keys(row).map((_, i) => `$${i + 1}`).join(', ')
                const vals = Object.values(row)
                const inserted = await sql(`INSERT INTO "${table}" (${cols}) VALUES (${placeholders}) RETURNING *`, vals)
                results.push(inserted[0])
              }
              return { data: results.length === 1 ? results[0] : results, error: null }
            } catch (e: any) {
              return { data: null, error: { message: e.message } }
            }
          },
          select() { return this },
          single() { return this },
          async then(resolve: any) { return resolve(await this._run()) },
        }
        return qbInsert
      },
      // update
      update(updates: any) {
        const qbUpdate: any = {
          _filters: [] as any[],
          eq(col: string, val: any) { this._filters.push({ col, op: '=', val }); return this },
          async _run() {
            try {
              const vals: any[] = []
              let idx = 1
              const setParts = Object.entries(updates).map(([k, v]) => {
                vals.push(v)
                return `"${k}" = $${idx++}`
              })
              const whereParts = this._filters.map((f: any) => {
                vals.push(f.val)
                return `"${f.col}" ${f.op} $${idx++}`
              })
              const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''
              await sql(`UPDATE "${table}" SET ${setParts.join(', ')} ${where}`, vals)
              return { data: null, error: null }
            } catch (e: any) {
              return { data: null, error: { message: e.message } }
            }
          },
          async then(resolve: any) { return resolve(await this._run()) },
        }
        return qbUpdate
      },
      // delete
      delete() {
        const qbDelete: any = {
          _filters: [] as any[],
          eq(col: string, val: any) { this._filters.push({ col, op: '=', val }); return this },
          async _run() {
            try {
              const vals: any[] = []
              let idx = 1
              const whereParts = this._filters.map((f: any) => {
                vals.push(f.val)
                return `"${f.col}" ${f.op} $${idx++}`
              })
              const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''
              await sql(`DELETE FROM "${table}" ${where}`, vals)
              return { data: null, error: null }
            } catch (e: any) {
              return { data: null, error: { message: e.message } }
            }
          },
          async then(resolve: any) { return resolve(await this._run()) },
        }
        return qbDelete
      },
      // passthrough for select chaining
      eq: qb.eq.bind(qb),
      neq: qb.neq.bind(qb),
      in: qb.in.bind(qb),
      order: qb.order.bind(qb),
      limit: qb.limit.bind(qb),
      single: qb.single.bind(qb),
      then: qb.then.bind(qb),
    }
  }

  storage = {
    from(_bucket: string) {
      return {
        upload: async (_path: string, _file: any) => ({ data: null, error: { message: 'Storage not available' } }),
        getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
      }
    }
  }
}

export async function createClient() {
  return new NeonClient()
}
