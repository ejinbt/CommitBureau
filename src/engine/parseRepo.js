// Turns whatever the player pasted into { owner, repo }.
// Accepts: https://github.com/a/b, github.com/a/b/, a/b.git, a/b, and deeper links like a/b/tree/main.

const OWNER_RE = /^[A-Za-z0-9-]+$/
const REPO_RE = /^[A-Za-z0-9._-]+$/

export function parseRepo(input) {
  const text = (input || '')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/^github\.com\//, '')
    .replace(/\/+$/, '')

  const [owner, rawRepo] = text.split('/')
  const repo = (rawRepo || '').replace(/\.git$/, '')

  if (!owner || !repo || !OWNER_RE.test(owner) || !REPO_RE.test(repo)) {
    throw new Error("That doesn't look like a GitHub repo. Try something like torvalds/linux.")
  }
  return { owner, repo }
}
