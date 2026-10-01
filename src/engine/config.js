// Where the CommitBureau demo proxy lives: the Vercel Function in /api/github.js, on the same site as
// the game. It adds a server-side GitHub token, so players get 5,000 requests an hour without one.
// Where it isn't deployed (local `vite` dev, other hosts), the engine notices and calls GitHub directly.
export const DEMO_PROXY_URL = '/api/github'

// Header the proxy puts on every answer, so the engine can tell a real proxy reply from a missing route.
export const PROXY_HEADER = 'X-CommitBureau-Proxy'
