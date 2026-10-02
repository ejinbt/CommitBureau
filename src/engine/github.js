import { demoResponse } from '../data/demoRepo.js'
import { DEMO_PROXY_URL, PROXY_HEADER } from './config.js'

const API = 'https://api.github.com'
const cache = new Map()
let token = ''
let networkCalls = 0

export function apiCallsMade() {
  return networkCalls
}

export function setToken(value) {
  token = (value || '').trim()
}

const TOKEN_KEY = 'cb_github_token'
function storedToken() {
  return readStorage(TOKEN_KEY).trim()
}

const DEMO_ACCESS_KEY = 'cb_demo_access'

export function demoAccessAvailable() {
  return Boolean(DEMO_PROXY_URL)
}

export function isDemoAccessOn() {
  return demoAccessAvailable() && !(token || storedToken()) && readStorage(DEMO_ACCESS_KEY) !== 'off'
}

export function setDemoAccess(on) {
  try {
    globalThis.localStorage?.setItem(DEMO_ACCESS_KEY, on ? 'on' : 'off')
  } catch {
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
  const demo = demoResponse(path)
  if (demo !== undefined) return Promise.resolve(demo)

  if (!cache.has(path)) {
    const request = fetchJson(path).catch((err) => {
      cache.delete(path)
      throw err
    })
    cache.set(path, request)
  }
  return cache.get(path)
}

async function fetchJson(path) {
  const accept = { Accept: 'application/vnd.github+json' }
  networkCalls++

  if (isDemoAccessOn()) {
    let proxied = null
    try {
      proxied = await fetch(`${DEMO_PROXY_URL}?p=${encodeURIComponent(path)}`, { headers: accept })
    } catch {
    }
    if (proxied?.headers.get(PROXY_HEADER)) {
      if (proxied.ok) return proxied.json()
      if (proxied.status < 500) throw new Error(friendlyError(proxied, true))
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

export function getCommits(owner, repo) {
  return gh(`/repos/${owner}/${repo}/commits?per_page=100`)
}

export function getCommit(owner, repo, sha) {
  return gh(`/repos/${owner}/${repo}/commits/${sha}`)
}

export function fetchUserRepos(username) {
  return gh(`/users/${username}/repos?per_page=100&sort=pushed`)
}

export function getFileHistory(owner, repo, path) {
  return gh(`/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=100`)
}
