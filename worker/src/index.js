// CommitBureau demo proxy: a Cloudflare Worker that forwards the game's GitHub API requests and adds
// a token kept in Cloudflare's secret store (env.GITHUB_TOKEN). The browser never sees the token.
//
// It only forwards the three read-only requests the game makes, so it can't be used as a general
// GitHub client. Set the token with `npx wrangler secret put GITHUB_TOKEN`; it is never in this repo.

const GITHUB = 'https://api.github.com'

// The game's requests, and nothing else.
const ALLOWED_PATHS = [
  /^\/repos\/[\w.-]+\/[\w.-]+\/commits$/, // latest commits, or one file's history with ?path=
  /^\/repos\/[\w.-]+\/[\w.-]+\/commits\/[0-9a-f]{7,40}$/, // one commit with its diff
  /^\/users\/[\w-]+\/repos$/, // "My archive" mode
]
const ALLOWED_QUERY = new Set(['per_page', 'path', 'sort'])

// A commit never changes, so it can be cached for a day. Lists change, so keep them for 10 minutes.
const ONE_COMMIT_TTL = 86400
const LIST_TTL = 600

export default {
  async fetch(request, env, ctx) {
    const cors = corsHeaders(request.headers.get('Origin'), env.ALLOWED_ORIGINS)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    if (request.method !== 'GET') return json(405, { message: 'Only GET requests are supported.' }, cors)

    const url = new URL(request.url)
    if (!ALLOWED_PATHS.some((re) => re.test(url.pathname))) {
      return json(404, { message: 'Not a request CommitBureau makes.' }, cors)
    }
    for (const key of url.searchParams.keys()) {
      if (!ALLOWED_QUERY.has(key)) return json(400, { message: `Query parameter "${key}" is not allowed.` }, cors)
    }
    if (!env.GITHUB_TOKEN) return json(500, { message: 'The proxy has no GitHub token configured.' }, cors)

    // Shared edge cache, keyed on the GitHub URL only (not the visitor), so repeat demos cost no API calls.
    // Cloudflare may skip this cache on *.workers.dev addresses; the proxy still works, just uncached.
    const cache = globalThis.caches?.default
    const cacheKey = new Request(GITHUB + url.pathname + url.search)
    let res = cache ? await cache.match(cacheKey) : undefined

    if (!res) {
      const upstream = await fetch(cacheKey.url, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          'User-Agent': 'CommitBureau-proxy',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
      res = new Response(upstream.body, upstream)
      if (upstream.ok && cache) {
        const ttl = /\/commits\/[0-9a-f]+$/.test(url.pathname) ? ONE_COMMIT_TTL : LIST_TTL
        res.headers.set('Cache-Control', `public, max-age=${ttl}`)
        ctx.waitUntil(cache.put(cacheKey, res.clone()))
      }
    }

    // Pass GitHub's status and body through, with CORS added for the game's pages.
    const out = new Response(res.body, res)
    out.headers.delete('Set-Cookie')
    for (const [k, v] of Object.entries(cors)) out.headers.set(k, v)
    return out
  },
}

// Only the game's own pages (GitHub Pages, local dev) may call the proxy from a browser.
function corsHeaders(origin, allowedList = '') {
  const allowed = allowedList.split(',').map((o) => o.trim()).filter(Boolean)
  const headers = {
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept',
    // The engine reads these to explain rate limits to the player.
    'Access-Control-Expose-Headers': 'x-ratelimit-remaining, x-ratelimit-reset',
    Vary: 'Origin',
  }
  if (origin && allowed.includes(origin)) headers['Access-Control-Allow-Origin'] = origin
  return headers
}

function json(status, body, headers) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, 'Content-Type': 'application/json' } })
}
