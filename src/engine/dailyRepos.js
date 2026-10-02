// Daily Repos: three real repositories a day, Easy, Medium and Hard, the same for every player.
// Difficulty is the repo plus the level it is played at:
//   Easy:   a small, readable repo at Level 1 (commits)
//   Medium: a large, well-known repo at Level 2 or 3 (diffs, file history), alternating by day
//   Hard:   a huge repo with real merge history at Level 4 (merges and pull requests)
// Picking costs no API calls. Each pool is shuffled with a fixed seed, so the order looks random but no
// repo repeats until its pool is used up.

export const DAILY_POOLS = {
  easy: [
    'pallets/flask', 'expressjs/express', 'fastapi/fastapi', 'sveltejs/svelte',
    'vitejs/vite', 'prettier/prettier', 'tailwindlabs/tailwindcss',
  ],
  medium: [
    'facebook/react', 'vuejs/core', 'django/django', 'neovim/neovim',
    'denoland/deno', 'microsoft/TypeScript', 'golang/go', 'nodejs/node',
  ],
  // Checked on 2026-10-02: each has dozens of merge commits in its latest 100, which Level 4 needs.
  hard: [
    'rails/rails', 'torvalds/linux', 'git/git', 'kubernetes/kubernetes',
    'rust-lang/rust', 'moby/moby', 'godotengine/godot',
  ],
}

export const DAILY_DIFFICULTIES = ['easy', 'medium', 'hard']

const START = '2026-10-01' // Daily #1
const DAY_MS = 86400000
const SEED = 0xc0ffee

// The player's local calendar date, like Wordle: the repos change at their midnight.
export function dailyDateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function dailyNumber(date) {
  const [y, m, d] = dailyDateKey(date).split('-').map(Number)
  const [sy, sm, sd] = START.split('-').map(Number)
  return Math.max(1, Math.round((Date.UTC(y, m - 1, d) - Date.UTC(sy, sm - 1, sd)) / DAY_MS) + 1)
}

// Small seeded random number generator (mulberry32): the same seed always gives the same sequence.
function seededRandom(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededShuffle(list, seed) {
  const rand = seededRandom(seed)
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function levelFor(difficulty, number) {
  if (difficulty === 'easy') return 1
  if (difficulty === 'hard') return 4
  return number % 2 === 0 ? 2 : 3
}

// Today's three: [{ difficulty, owner, repo, level, number, date }], easy first.
export function getDailyRepos(date = new Date()) {
  const number = dailyNumber(date)
  return DAILY_DIFFICULTIES.map((difficulty, i) => {
    const pool = DAILY_POOLS[difficulty]
    const cycle = Math.floor((number - 1) / pool.length)
    const order = seededShuffle(pool, SEED + i * 1000 + cycle)
    const [owner, repo] = order[(number - 1) % pool.length].split('/')
    return { difficulty, owner, repo, level: levelFor(difficulty, number), number, date: dailyDateKey(date) }
  })
}
