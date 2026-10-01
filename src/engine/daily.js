// The Daily Case: one repo per day, the same for every player, like Wordle.
//
// The repo comes from a curated pool of famous, active code repositories rather than GitHub's
// search or trending pages: GitHub has no trending API, search results drift and include
// awesome-lists and books that make poor cases, and every player must get the same repo.
// Picking costs no API calls. The pool is shuffled with a fixed seed, so the order looks random
// but no repo repeats until the whole pool has been used.

export const DAILY_POOL = [
  // Web frameworks and UI
  'facebook/react', 'vercel/next.js', 'vuejs/core', 'sveltejs/svelte', 'angular/angular',
  'tailwindlabs/tailwindcss', 'vitejs/vite', 'expressjs/express', 'mui/material-ui',
  'ant-design/ant-design', 'excalidraw/excalidraw', 'withastro/astro',
  // Languages and runtimes
  'nodejs/node', 'denoland/deno', 'oven-sh/bun', 'microsoft/TypeScript', 'rust-lang/rust',
  'golang/go', 'python/cpython',
  // Developer tools
  'microsoft/vscode', 'neovim/neovim', 'git/git', 'prettier/prettier', 'eslint/eslint',
  'webpack/webpack', 'babel/babel', 'jestjs/jest', 'astral-sh/ruff', 'zed-industries/zed',
  'microsoft/PowerToys',
  // Backend frameworks
  'django/django', 'pallets/flask', 'fastapi/fastapi', 'rails/rails', 'laravel/framework',
  'spring-projects/spring-boot',
  // Infrastructure and databases
  'kubernetes/kubernetes', 'moby/moby', 'hashicorp/terraform', 'grafana/grafana',
  'prometheus/prometheus', 'redis/redis', 'supabase/supabase',
  // Data and AI
  'pytorch/pytorch', 'tensorflow/tensorflow', 'huggingface/transformers',
  'scikit-learn/scikit-learn', 'numpy/numpy', 'pandas-dev/pandas', 'ollama/ollama',
  // Apps, games and everything else
  'torvalds/linux', 'electron/electron', 'flutter/flutter', 'godotengine/godot',
  'home-assistant/core', 'bitcoin/bitcoin',
]

// Daily Case #1 is this date. Change it to the launch day if you want #1 to be launch day.
export const DAILY_START = '2026-10-01'

const DAY_MS = 86400000
const POOL_SEED = 0xc0ffee

// The player's local calendar date as YYYY-MM-DD, like Wordle: the case changes at their midnight.
export function dateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Days since DAILY_START, counting the start day as #1. Calendar dates only, so time zones and
// daylight saving can't shift the number.
export function dailyNumber(date = new Date()) {
  const [y, m, d] = dateKey(date).split('-').map(Number)
  const [sy, sm, sd] = DAILY_START.split('-').map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(sy, sm - 1, sd)) / DAY_MS) + 1
}

// Small seeded random number generator (mulberry32): the same seed always gives the same sequence.
export function seededRandom(seed) {
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

// Today's Daily Case: { number, date, owner, repo }. Everyone gets the same answer for the same date.
// Each pass through the pool uses a fresh shuffle, so the order doesn't repeat cycle after cycle.
export function getDailyCase(date = new Date()) {
  const number = Math.max(1, dailyNumber(date))
  const cycle = Math.floor((number - 1) / DAILY_POOL.length)
  const order = seededShuffle(DAILY_POOL, POOL_SEED + cycle)
  const [owner, repo] = order[(number - 1) % DAILY_POOL.length].split('/')
  return { number, date: dateKey(date), owner, repo }
}
