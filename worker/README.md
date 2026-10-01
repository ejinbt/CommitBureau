# CommitBureau demo proxy

A Cloudflare Worker that lets players use CommitBureau without a GitHub token of their own. The game sends
its GitHub API requests here; the Worker adds a token stored in Cloudflare's secret store and forwards them
to `api.github.com`. The token never reaches the browser or this repo.

It only forwards the read-only requests the game makes:

| Request | Used for |
|---|---|
| `GET /repos/{owner}/{repo}/commits` (optionally `?path=`) | Commit list, one file's history |
| `GET /repos/{owner}/{repo}/commits/{sha}` | One commit's diff |
| `GET /users/{name}/repos` | "My archive" mode |

Anything else gets a 404 without reaching GitHub. Browsers can only call it from the pages listed in
`ALLOWED_ORIGINS` in `wrangler.toml`.

## Deploy

You need a free Cloudflare account. Run these from this `worker/` folder:

```
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
npx wrangler deploy
```

- `wrangler secret put` asks for the token in the terminal. Paste a fine-grained token with
  **Public repositories (read-only)** access and nothing else. Never paste it anywhere else.
- `wrangler deploy` prints the Worker's address, like `https://commitbureau-proxy.<you>.workers.dev`.
  Put that address in `src/engine/config.js` as `DEMO_PROXY_URL` and commit it. The address is not a secret.

## Check it

```
curl "https://commitbureau-proxy.<you>.workers.dev/repos/facebook/react/commits?per_page=1"
```

A JSON list with one commit means it works. To change the token later, run `npx wrangler secret put GITHUB_TOKEN`
again. To shut it down, run `npx wrangler delete`.
