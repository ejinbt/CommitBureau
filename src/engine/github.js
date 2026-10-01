// Thin wrapper around the GitHub REST API.
// Every response is cached in memory, so the same URL is never fetched twice in a session.
// Without a token GitHub allows 60 requests per hour per IP, so caching matters.

import { demoResponse } from '../data/demoRepo.js'
import { DEMO_PROXY_URL, PROXY_HEADER } from './config.js'

const API = 'https://api.github.com'
const cache = new Map()
let token = ''
let networkCalls = 0

// How many real requests have gone to GitHub (cache hits don't count). buildGame uses this as a budget.
export function apiCallsMade() {
  return networkCalls
}

// The player's optional token. It stays in this browser tab and is sent only to api.github.com.
export function setToken(value) {
  token = (value || '').trim()
}

// The UI's token field saves to localStorage under this key. Read it on every request so a newly
// saved token works straight away. localStorage can be missing (Node) or blocked (private mode).
const TOKEN_KEY = 'cb_github_token'
function storedToken() {
  return readStorage(TOKEN_KEY).trim()
}

// Demo access: requests go through our proxy, which adds a token the browser never sees.
// On by default whenever the proxy is configured and the player hasn't saved a token of their own.
const DEMO_ACCESS_KEY = 'cb_demo_access'

export function demoAccessAvailable() {
  return Boolean(DEMO_PROXY_URL)
}

export function isDemoAccessOn() {
  return demoAccessAvailable() && !(token || storedToken()) && readStorage(DEMO_ACCESS_KEY) !== 'off'
}

// Lets the UI switch demo access off (for example to test the 60-an-hour limit) and back on.
export function setDemoAccess(on) {
  try {
    globalThis.localStorage?.setItem(DEMO_ACCESS_KEY, on ? 'on' : 'off')
  } catch {
    // Storage blocked: demo access stays at its default.
  }
}

function readStorage(key) {
  try {
    return globalThis.localStorage?.getItem(key) || ''
  } catch {
    return ''
  }
}

export function gh(path) {
  // The built-in demo repo answers from local data: no network, no token, no rate limit.
  const demo = demoResponse(path)
  if (demo !== undefined) return Promise.resolve(demo)

  // Cache the promise, not the result, so two calls for the same URL at once share one request.
  if (!cache.has(path)) {
    const request = fetchJson(path).catch((err) => {
      cache.delete(path) // don't remember failures, let the player retry
      throw err
    })
    cache.set(path, request)
  }
  return cache.get(path)
}

async function fetchJson(path) {
  const accept = { Accept: 'application/vnd.github+json' }
  networkCalls++

  // Demo access first. If the proxy is down or broken, fall back to calling GitHub directly.
  if (isDemoAccessOn()) {
    let proxied = null
    try {
      proxied = await fetch(`${DEMO_PROXY_URL}?p=${encodeURIComponent(path)}`, { headers: accept })
    } catch {
      // Proxy unreachable: fall through to GitHub.
    }
    // Only trust answers the proxy marked as its own; anything else means it isn't deployed here.
    if (proxied?.headers.get(PROXY_HEADER)) {
      if (proxied.ok) return proxied.json()
      if (proxied.status < 500) throw new Error(friendlyError(proxied, true)) // a real GitHub answer, like 404
    }
  }

  const headers = { ...accept }
  const auth = token || storedToken()
  if (auth) headers.Authorization = `Bearer ${auth}`

  let res
  try {
    res = await fetch(API + path, { headers })
  } catch {
    throw new Error("Couldn't reach GitHub. Check your internet connection.")
  }
  if (!res.ok) throw new Error(friendlyError(res))
  return res.json()
}

function friendlyError(res, viaDemoAccess = false) {
  if (res.status === 401) return 'That GitHub token is not valid.'
  if ((res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0') {
    const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000
    const minutes = Math.max(1, Math.ceil((reset - Date.now()) / 60000))
    if (viaDemoAccess) return `Demo access is out of requests. Add your own token or try again in about ${minutes} min.`
    return `GitHub rate limit hit. Add a token or try again in about ${minutes} min.`
  }
  if (res.status === 404) return 'Repo not found. It may be private or misspelled.'
  if (res.status === 409) return 'This repo is empty. There are no commits to investigate.'
  return `GitHub returned an error (${res.status}). Try again in a moment.`
}

// Latest 100 commits, newest first. We never scan full history (Linux has over a million commits).
export function getCommits(owner, repo) {
  return gh(`/repos/${owner}/${repo}/commits?per_page=100`)
}

// One commit with its changed files, line counts and patch text.
export function getCommit(owner, repo, sha) {
  return gh(`/repos/${owner}/${repo}/commits/${sha}`)
}

// Public repos for a user, most recently pushed first.
export function fetchUserRepos(username) {
  return gh(`/users/${username}/repos?per_page=100&sort=pushed`)
}

// The latest 100 commits that touched one file, newest first (what `git log -- <file>` shows).
export function getFileHistory(owner, repo, path) {
  return gh(`/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=100`)
}
