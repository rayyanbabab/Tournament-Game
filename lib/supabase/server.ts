/**
 * Compatibility shim: replaces @supabase/ssr server client
 * with a Neon-backed implementation using NextAuth for auth.
 * 
 * All server components import this file unchanged.
 * The API mimics the subset of Supabase client used in this app.
 */
import { auth } from '@/lib/auth'
import sql from '@/lib/db'

function escapeVal(val: any): string {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'number') return Number.isFinite(val) ? String(val) : 'NULL'
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE'
  if (val instanceof Date) return `'${val.toISOString()}'`
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'`
  }
  return `'${String(val).replace(/'/g, "''")}'`
}

async function hydrateRelations(table: string, _select: string, rows: any[]) {
  if (!rows || rows.length === 0) return rows

  try {
    // Hydrate teams
    if (_select.includes('teams') || _select.includes('team')) {
      const teamIds = [...new Set(rows.flatMap(r => [r.team_id, r.team1_id, r.team2_id]).filter(Boolean))]
      if (teamIds.length) {
        const list = teamIds.map(id => escapeVal(id)).join(', ')
        const tRows = await sql.query(`SELECT id, name, logo_url, captain_id FROM teams WHERE id IN (${list})`)
        const tMap = Object.fromEntries(tRows.map((t: any) => [t.id, t]))
        for (const r of rows) {
          if (r.team_id !== undefined) r.teams = tMap[r.team_id] || null
          if (r.team1_id !== undefined) r.team1 = tMap[r.team1_id] || null
          if (r.team2_id !== undefined) r.team2 = tMap[r.team2_id] || null
        }
      }
    }

    // Hydrate tournaments
    if (_select.includes('tournaments')) {
      const tIds = [...new Set(rows.map(r => r.tournament_id).filter(Boolean))]
      if (tIds.length) {
        const list = tIds.map(id => escapeVal(id)).join(', ')
        const tRows = await sql.query(`SELECT * FROM tournaments WHERE id IN (${list})`)
        const tMap = Object.fromEntries(tRows.map((t: any) => [t.id, t]))
        for (const r of rows) {
          if (r.tournament_id !== undefined) r.tournaments = tMap[r.tournament_id] || null
        }
      }
    }

    // Hydrate profiles / captain
    if (_select.includes('profiles') || _select.includes('captain')) {
      const profIds = [...new Set(rows.flatMap(r => [r.captain_id, r.user_id, r.registered_by, r.created_by]).filter(Boolean))]
      if (profIds.length) {
        const list = profIds.map(id => escapeVal(id)).join(', ')
        const pRows = await sql.query(`SELECT id, email, full_name, role, avatar_url FROM profiles WHERE id IN (${list})`)
        const pMap = Object.fromEntries(pRows.map((p: any) => [p.id, p]))
        for (const r of rows) {
          if (r.captain_id !== undefined) r.captain = pMap[r.captain_id] || null
          if (r.registered_by !== undefined) r.profiles = pMap[r.registered_by] || null
          if (r.user_id !== undefined) r.profiles = pMap[r.user_id] || null
          if (r.created_by !== undefined) r.profiles = pMap[r.created_by] || null
        }
      }
    }

    // Hydrate team_members(count)
    if (table === 'teams' && _select.includes('team_members')) {
      const ids = rows.map(r => r.id).filter(Boolean)
      if (ids.length) {
        const list = ids.map(id => escapeVal(id)).join(', ')
        const cRows = await sql.query(`SELECT team_id, count(*)::int as count FROM team_members WHERE team_id IN (${list}) GROUP BY team_id`)
        const cMap = Object.fromEntries(cRows.map((c: any) => [c.team_id, c.count]))
        for (const r of rows) {
          r.team_members = [{ count: cMap[r.id] || 0 }]
        }
      }
    }

    // Hydrate tournament_registrations(count)
    if (table === 'tournaments' && _select.includes('tournament_registrations')) {
      const ids = rows.map(r => r.id).filter(Boolean)
      if (ids.length) {
        const list = ids.map(id => escapeVal(id)).join(', ')
        const cRows = await sql.query(`SELECT tournament_id, count(*)::int as count FROM tournament_registrations WHERE tournament_id IN (${list}) GROUP BY tournament_id`)
        const cMap = Object.fromEntries(cRows.map((c: any) => [c.tournament_id, c.count]))
        for (const r of rows) {
          r.tournament_registrations = [{ count: cMap[r.id] || 0 }]
        }
      }
    }
  } catch (err) {
    console.error('[hydrateRelations] error:', err)
  }

  return rows
}

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

        for (const f of _filters) {
          if (f.op === 'in') {
            const list = f.val.map((v: any) => escapeVal(v)).join(', ')
            whereParts.push(`"${f.col}" IN (${list})`)
          } else {
            whereParts.push(`"${f.col}" ${f.op} ${escapeVal(f.val)}`)
          }
        }

        const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''
        const orderBy = _order ? `ORDER BY "${_order.col}" ${_order.asc ? 'ASC' : 'DESC'}` : ''
        const limitClause = _limit ? `LIMIT ${_limit}` : ''

        if (_count) {
          const rows = await sql.query(`SELECT COUNT(*) as count FROM "${table}" ${where}`)
          return { count: parseInt(rows[0]?.count || '0'), data: null, error: null }
        }

        const rawRows = await sql.query(`SELECT * FROM "${table}" ${where} ${orderBy} ${limitClause}`)
        const rows = await hydrateRelations(table, _select, rawRows)

        if (_single) {
          return { data: rows[0] || null, error: rows[0] ? null : { message: 'Not found' } }
        }

        return { data: rows, error: null }
      } catch (e: any) {
        return { data: null, error: { message: e.message }, count: null }
      }
    }
  }

  // Attach filters
  Object.assign(builder, {
    eq(col: string, val: any) { _filters.push({ col, op: '=', val }); return builder },
    neq(col: string, val: any) { _filters.push({ col, op: '!=', val }); return builder },
    gt(col: string, val: any) { _filters.push({ col, op: '>', val }); return builder },
    gte(col: string, val: any) { _filters.push({ col, op: '>=', val }); return builder },
    lt(col: string, val: any) { _filters.push({ col, op: '<', val }); return builder },
    lte(col: string, val: any) { _filters.push({ col, op: '<=', val }); return builder },
    in(col: string, vals: any[]) { _filters.push({ col, op: 'in', val: vals }); return builder },
    maybeSingle() {
      _single = false
      _limit = 1
      const origThen = builder.then.bind(builder)
      builder.then = async (resolve: any) => {
        const res = await builder._run()
        resolve({ data: res.data?.[0] || null, error: null })
      }
      return builder
    }
  })

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

  async rpc(fnName: string, params?: Record<string, any>) {
    try {
      if (params && Object.keys(params).length > 0) {
        const vals = Object.values(params).map(v => escapeVal(v)).join(', ')
        const res = await sql.query(`SELECT ${fnName}(${vals})`)
        return { data: res, error: null }
      } else {
        const res = await sql.query(`SELECT ${fnName}()`)
        return { data: res, error: null }
      }
    } catch (e: any) {
      return { data: null, error: { message: e.message } }
    }
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
                const vals = Object.values(row).map(v => escapeVal(v)).join(', ')
                const inserted = await sql.query(`INSERT INTO "${table}" (${cols}) VALUES (${vals}) RETURNING *`)
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
      // upsert
      upsert(rows: any | any[], opts?: { onConflict?: string }) {
        const data = Array.isArray(rows) ? rows : [rows]
        const conflictCol = opts?.onConflict || 'id'
        const qbUpsert: any = {
          async _run() {
            try {
              const results = []
              for (const row of data) {
                const cols = Object.keys(row)
                const colNames = cols.map(c => `"${c}"`).join(', ')
                const vals = Object.values(row).map(v => escapeVal(v)).join(', ')
                const updateSet = cols
                  .filter(c => c !== conflictCol)
                  .map(c => `"${c}" = EXCLUDED."${c}"`)
                  .join(', ')
                const conflictClause = conflictCol.includes(',')
                  ? conflictCol.split(',').map(c => `"${c.trim()}"`).join(', ')
                  : `"${conflictCol}"`
                const query = `
                  INSERT INTO "${table}" (${colNames})
                  VALUES (${vals})
                  ON CONFLICT (${conflictClause})
                  DO UPDATE SET ${updateSet}
                  RETURNING *
                `
                const inserted = await sql.query(query)
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
        return qbUpsert
      },
      // update
      update(updates: any) {
        const _filters: any[] = []
        const qbUpdate: any = {
          async _run() {
            try {
              const setParts = Object.entries(updates).map(([k, v]) => `"${k}" = ${escapeVal(v)}`)
              const whereParts = _filters.map((f: any) => {
                if (f.op === 'in') {
                  const list = f.val.map((v: any) => escapeVal(v)).join(', ')
                  return `"${f.col}" IN (${list})`
                } else {
                  return `"${f.col}" ${f.op} ${escapeVal(f.val)}`
                }
              })
              const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''
              await sql.query(`UPDATE "${table}" SET ${setParts.join(', ')} ${where}`)
              return { data: null, error: null }
            } catch (e: any) {
              return { data: null, error: { message: e.message } }
            }
          },
          async then(resolve: any) { return resolve(await this._run()) },
        }
        Object.assign(qbUpdate, {
          eq(col: string, val: any) { _filters.push({ col, op: '=', val }); return qbUpdate },
          neq(col: string, val: any) { _filters.push({ col, op: '!=', val }); return qbUpdate },
          gt(col: string, val: any) { _filters.push({ col, op: '>', val }); return qbUpdate },
          gte(col: string, val: any) { _filters.push({ col, op: '>=', val }); return qbUpdate },
          lt(col: string, val: any) { _filters.push({ col, op: '<', val }); return qbUpdate },
          lte(col: string, val: any) { _filters.push({ col, op: '<=', val }); return qbUpdate },
          in(col: string, vals: any[]) { _filters.push({ col, op: 'in', val: vals }); return qbUpdate },
        })
        return qbUpdate
      },
      // delete
      delete() {
        const _filters: any[] = []
        const qbDelete: any = {
          async _run() {
            try {
              const whereParts = _filters.map((f: any) => {
                if (f.op === 'in') {
                  const list = f.val.map((v: any) => escapeVal(v)).join(', ')
                  return `"${f.col}" IN (${list})`
                } else {
                  return `"${f.col}" ${f.op} ${escapeVal(f.val)}`
                }
              })
              const where = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : ''
              await sql.query(`DELETE FROM "${table}" ${where}`)
              return { data: null, error: null }
            } catch (e: any) {
              return { data: null, error: { message: e.message } }
            }
          },
          async then(resolve: any) { return resolve(await this._run()) },
        }
        Object.assign(qbDelete, {
          eq(col: string, val: any) { _filters.push({ col, op: '=', val }); return qbDelete },
          neq(col: string, val: any) { _filters.push({ col, op: '!=', val }); return qbDelete },
          gt(col: string, val: any) { _filters.push({ col, op: '>', val }); return qbDelete },
          gte(col: string, val: any) { _filters.push({ col, op: '>=', val }); return qbDelete },
          lt(col: string, val: any) { _filters.push({ col, op: '<', val }); return qbDelete },
          lte(col: string, val: any) { _filters.push({ col, op: '<=', val }); return qbDelete },
          in(col: string, vals: any[]) { _filters.push({ col, op: 'in', val: vals }); return qbDelete },
        })
        return qbDelete
      },
      // passthrough for select chaining
      eq: qb.eq.bind(qb),
      neq: qb.neq.bind(qb),
      gt: qb.gt.bind(qb),
      gte: qb.gte.bind(qb),
      lt: qb.lt.bind(qb),
      lte: qb.lte.bind(qb),
      in: qb.in.bind(qb),
      maybeSingle: qb.maybeSingle.bind(qb),
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
