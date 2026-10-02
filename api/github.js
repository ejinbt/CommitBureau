// CommitBureau demo proxy, as a Vercel Function at /api/github.
// The game sends its GitHub API requests here as /api/github?p=<GitHub path>. This function adds a token
// from Vercel's environment variables (GITHUB_TOKEN, with GITHUB_BACKUP_TOKEN as a fallback) and forwards them to api.github.com, so players get
// 5,000 requests an hour without a token of their own, and the browser never sees the token.
//
// It only forwards the three read-only requests the game makes, so it can't be used as a general GitHub client.

const GITHUB = 'https://api.github.com'

// The game's requests, and nothing else.
const ALLOWED_PATHS = [
  /^\/repos\/[\w.-]+\/[\w.-]+\/commits$/, // latest commits, or one file's history with ?path=
  /^\/repos\/[\w.-]+\/[\w.-]+\/commits\/[0-9a-f]{7,40}$/, // one commit with its diff
  /^\/users\/[\w-]+\/repos$/, // "My archive" mode
]
const ALLOWED_QUERY = new Set(['per_page', 'path', 'sort'])

// Vercel's CDN caches successful answers: a commit never changes (a day), lists do (10 minutes).
const ONE_COMMIT_TTL = 86400
const LIST_TTL = 600

// Marks answers that really came from this function. The engine checks it, so a missing function
// (local `vite` dev, or a host without functions) is treated as "no proxy" rather than a GitHub error.
const PROXY_HEADER = 'X-CommitBureau-Proxy'

export async function GET(request) {
  const target = new URL(request.url).searchParams.get('p') || ''

  let url
  try {
    url = new URL(target, GITHUB)
  } catch {
    return reply(400, { message: 'Missing or malformed GitHub path.' })
  }
  // Resolving against GitHub's address means "//elsewhere.com/..." would leave GitHub. Refuse that.
  if (url.origin !== GITHUB || !ALLOWED_PATHS.some((re) => re.test(url.pathname))) {
    return reply(404, { message: 'Not a request CommitBureau makes.' })
  }
  for (const key of url.searchParams.keys()) {
    if (!ALLOWED_QUERY.has(key)) return reply(400, { message: `Query parameter "${key}" is not allowed.` })
  }
  // GITHUB_TOKEN first; GITHUB_BACKUP_TOKEN takes over if the first is missing, rejected or out of requests.
  const tokens = [process.env.GITHUB_TOKEN, process.env.GITHUB_BACKUP_TOKEN].filter(Boolean)
  if (!tokens.length) return reply(500, { message: 'The proxy has no GitHub token configured.' })

  let upstream
  for (const token of tokens) {
    try {
      upstream = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'User-Agent': 'CommitBureau-proxy',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      })
    } catch {
      return reply(502, { message: "The proxy couldn't reach GitHub." })
    }
    if (!tokenFailed(upstream)) break
  }

  // Pass GitHub's status and body through, plus the rate limit headers the engine explains to players.
  const headers = {
    'Content-Type': 'application/json',
    [PROXY_HEADER]: '1',
    'Cache-Control': upstream.ok
      ? `public, s-maxage=${/\/commits\/[0-9a-f]+$/.test(url.pathname) ? ONE_COMMIT_TTL : LIST_TTL}`
      : 'no-store',
  }
  for (const name of ['x-ratelimit-remaining', 'x-ratelimit-reset']) {
    const value = upstream.headers.get(name)
    if (value) headers[name] = value
  }
  return new Response(await upstream.text(), { status: upstream.status, headers })
}

function reply(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', [PROXY_HEADER]: '1', 'Cache-Control': 'no-store' },
  })
}

// A token is unusable when GitHub rejects it (401) or it has run out of requests (403/429 with none left).
function tokenFailed(res) {
  if (res.status === 401) return true
  return (res.status === 403 || res.status === 429) && res.headers.get('x-ratelimit-remaining') === '0'
}
