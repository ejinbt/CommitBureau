# Deploying CommitBureau on Vercel

The game is a static React site plus one Vercel Function, `api/github.js`: a small proxy that adds a
GitHub token kept in Vercel's settings. Players (and judges) get 5,000 GitHub requests an hour without
a token of their own, and the token never reaches the browser or this repo.

## One-time setup

1. **Make a token for the proxy.** GitHub → Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token. Repository access: **Public repositories**. No other
   permissions. Copy it.
2. **Import the repo on Vercel.** vercel.com → Add New → Project → pick `CommitBureau`. Vercel detects
   Vite; keep the defaults (build `npm run build`, output `dist`).
3. **Add the token.** Before (or after) the first deploy: Project → Settings → Environment Variables →
   name `GITHUB_TOKEN`, value the token, for Production and Preview. Paste it only there.
4. **Optional backup token.** Add a second variable, `GITHUB_BACKUP_TOKEN`, made the same way (ideally from
   another GitHub account). The proxy switches to it automatically if `GITHUB_TOKEN` is missing, rejected or out of
   requests.
5. **Deploy.** Variables are read at deploy time: if you add or change one after deploying, redeploy (Deployments →
   latest → Redeploy) so the function picks it up. Make sure each variable is enabled for **Production**.

After that, every push to `main` deploys automatically, and every pull request gets its own preview link.

## Check it

Open this in a browser, with your Vercel address:

```
https://<your-app>.vercel.app/api/github?p=/repos/facebook/react/commits?per_page=1
```

A JSON list with one commit means the proxy works. `{"message":"The proxy has no GitHub token configured."}`
means step 3 is missing or needs a redeploy.

## How the game uses it

- No token saved in the game: requests go through `/api/github` (demo access).
- A player saves their own token: requests go straight to GitHub with it.
- Proxy missing or failing (local `npm run dev`, other hosts): the game calls GitHub directly, with the
  usual 60-an-hour limit.

To change the token, edit `GITHUB_TOKEN` in Vercel and redeploy. To stop the proxy, delete the variable.
