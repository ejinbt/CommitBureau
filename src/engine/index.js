// Game engine public API. The UI only talks to the engine through these exports.
// See docs/CONTRACT.md for the round shape and error rules.
// Owner: engine (ejinbt)

import { fetchUserRepos } from './github.js'

export { parseRepo } from './parseRepo.js'
export { setToken } from './github.js'
export { FEATURED_REPOS } from '../data/featuredRepos.js'
export { buildGame, ROUNDS_PER_GAME } from './game.js'
export { newGame, scoreAnswer, finalReport, RANKS, PASS_PERCENT, HINT_PENALTY } from './scoring.js'

// "My archive" mode: a user's public repos, trimmed to what the UI needs.
export async function getUserRepos(username) {
  const name = (username || '').trim().replace(/^@/, '')
  if (!/^[A-Za-z0-9-]+$/.test(name)) throw new Error("That doesn't look like a GitHub username.")

  const repos = await fetchUserRepos(name)
  if (!repos.length) throw new Error(`${name} has no public repos to investigate.`)

  return repos.map((r) => ({
    owner: r.owner.login,
    repo: r.name,
    description: r.description,
    language: r.language,
    pushedAt: r.pushed_at,
    fork: r.fork,
  }))
}
