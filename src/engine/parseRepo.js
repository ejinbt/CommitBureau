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
