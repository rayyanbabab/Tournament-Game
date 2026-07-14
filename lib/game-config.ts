// ─────────────────────────────────────────────────────────────────────────────
// Game Configuration — single source of truth for game categories & formats
// ─────────────────────────────────────────────────────────────────────────────

export type MatchMode = 'leaderboard' | 'bracket' | 'league'
export type BracketFormat = 'single' | 'double' | 'group_playoffs'
export type LBScoringFormat = 'leaderboard' | 'champions_rush'
export type LBDuration = 'one_day' | 'two_days' | 'three_days'

export interface GameConfig {
  value: string          // unique key stored in DB
  label: string
  emoji: string
  category: string       // e.g. 'Battle Royale', 'MOBA', 'FPS', 'Sports'
  defaultMode: MatchMode
  // Leaderboard extras
  scoringPreset?: 'ffim' | 'pmgc' | 'custom'
  maps?: string[]
  // Bracket extras
  defaultBracketFormat?: BracketFormat
  // League extras
  defaultLeagueSlot?: number
}

export const GAME_CONFIGS: GameConfig[] = [
  // ── Battle Royale ──────────────────────────────────────────────────────────
  {
    value: 'Free Fire',
    label: 'Free Fire',
    emoji: '🔥',
    category: 'Battle Royale',
    defaultMode: 'leaderboard',
    scoringPreset: 'ffim',
    maps: ['Bermuda', 'Purgatory', 'Kalahari', 'Alpine', 'Nextera', 'Solara'],
  },
  {
    value: 'PUBG Mobile',
    label: 'PUBG Mobile',
    emoji: '🔫',
    category: 'Battle Royale',
    defaultMode: 'leaderboard',
    scoringPreset: 'pmgc',
    maps: ['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik'],
  },
  // ── MOBA ───────────────────────────────────────────────────────────────────
  {
    value: 'Mobile Legends',
    label: 'Mobile Legends',
    emoji: '⚔️',
    category: 'MOBA',
    defaultMode: 'bracket',
    defaultBracketFormat: 'single',
  },
  {
    value: 'Dota 2',
    label: 'Dota 2',
    emoji: '🧙',
    category: 'MOBA',
    defaultMode: 'bracket',
    defaultBracketFormat: 'double',
  },
  {
    value: 'League of Legends',
    label: 'League of Legends',
    emoji: '🦁',
    category: 'MOBA',
    defaultMode: 'bracket',
    defaultBracketFormat: 'single',
  },
  // ── FPS / Tactical ─────────────────────────────────────────────────────────
  {
    value: 'Valorant',
    label: 'Valorant',
    emoji: '🎯',
    category: 'FPS',
    defaultMode: 'bracket',
    defaultBracketFormat: 'single',
  },
  {
    value: 'CS:GO / CS2',
    label: 'CS:GO / CS2',
    emoji: '💣',
    category: 'FPS',
    defaultMode: 'bracket',
    defaultBracketFormat: 'double',
  },
  // ── Sports ─────────────────────────────────────────────────────────────────
  {
    value: 'eFootball',
    label: 'eFootball',
    emoji: '⚽',
    category: 'Sports',
    defaultMode: 'league',
    defaultLeagueSlot: 24,
  },
  {
    value: 'FIFA',
    label: 'FIFA',
    emoji: '🏆',
    category: 'Sports',
    defaultMode: 'league',
    defaultLeagueSlot: 24,
  },
  // ── Other ──────────────────────────────────────────────────────────────────
  {
    value: 'Other',
    label: 'Other',
    emoji: '🎮',
    category: 'Other',
    defaultMode: 'bracket',
    defaultBracketFormat: 'single',
  },
]

// Scoring presets
export const FFIM_PLACEMENT = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0]
export const PMGC_PLACEMENT = [15, 12, 10, 8, 6, 4, 3, 2, 1, 0, 0, 0]

// Leaderboard format options
export const LB_SCORING_OPTIONS = [
  { key: 'leaderboard' as LBScoringFormat, title: 'Leaderboard', desc: 'Standard point system' },
  { key: 'champions_rush' as LBScoringFormat, title: 'Champions Rush', desc: 'Reach target pts + Booyah' },
]

export const LB_DURATION_OPTIONS = [
  { key: 'one_day' as LBDuration, title: 'One Days', desc: 'Qualifier + Final' },
  { key: 'two_days' as LBDuration, title: 'Two Days', desc: 'Day 1 Qualifier, Day 2 Final' },
  { key: 'three_days' as LBDuration, title: 'Three Days', desc: 'Qualifier → Semi → Final' },
]

export const LB_SLOTS: Record<LBDuration, { slot: number; desc: string }[]> = {
  one_day:    [{ slot: 24, desc: '2 Sesi · Top 6 lolos' }, { slot: 36, desc: '3 Sesi · Top 4 lolos' }],
  two_days:   [{ slot: 24, desc: '2 Sesi · Top 6 → Final' }, { slot: 36, desc: '3 Sesi · Top 4 → Final' }, { slot: 48, desc: '4 Pot · Top 6 → Semi → Final' }, { slot: 72, desc: '6 Pot · Top 4 → Semi → Final' }],
  three_days: [{ slot: 36, desc: '3 Pot · Top 4 → Semi → Final' }, { slot: 48, desc: '4 Pot · Top 6 → Semi → Final' }, { slot: 72, desc: '6 Pot · Top 4 → Semi → Final' }, { slot: 144, desc: '12 Pot · Top 4 → 4 Semi → Final' }],
}

export const BRACKET_FORMAT_OPTIONS = [
  { key: 'single' as BracketFormat, title: 'Single Elimination', desc: "Lose once and you're eliminated." },
  { key: 'double' as BracketFormat, title: 'Double Elimination', desc: 'Upper & Lower Bracket. Teams get a second chance.' },
  { key: 'group_playoffs' as BracketFormat, title: 'Two Stage (Group + Playoffs)', desc: 'Group stage then playoffs.' },
]

export const LEAGUE_SLOTS = [
  { slot: 18, groups: 3, stages: 2 },
  { slot: 24, groups: 4, stages: 3 },
  { slot: 36, groups: 6, stages: 4 },
  { slot: 48, groups: 8, stages: 5 },
  { slot: 72, groups: 12, stages: 6 },
]

// Helper to get config by game value
export const getGameConfig = (value: string): GameConfig | undefined =>
  GAME_CONFIGS.find(g => g.value === value)

// Group games by category
export const GAME_CATEGORIES = Array.from(new Set(GAME_CONFIGS.map(g => g.category)))
