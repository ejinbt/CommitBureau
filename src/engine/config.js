// Address of the CommitBureau demo proxy (the Cloudflare Worker in /worker), which adds a server-side
// GitHub token so players get 5,000 requests an hour without a token of their own.
// This is a public address, not a secret. Leave it empty to call GitHub directly.
// After `npx wrangler deploy`, paste the URL it prints, e.g. 'https://commitbureau-proxy.<you>.workers.dev'
export const DEMO_PROXY_URL = ''
