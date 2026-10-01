// Builds one game: 5 rounds from the player's current level, using real commits.

import { level1 } from './cases/level1.js'
import { level2 } from './cases/level2.js'
import { level3 } from './cases/level3.js'
import { level4 } from './cases/level4.js'
import { apiCallsMade, getCommits } from './github.js'
import { shuffle } from './utils.js'

export const ROUNDS_PER_GAME = 5
const MIN_ROUNDS = 3 // fewest rounds worth playing if we run out of API budget
const MAX_API_CALLS_PER_GAME = 25

// Level 5 gets added here as they're built.
const LEVELS = {
  1: level1,
  2: level2,
  3: level3,
  4: level4,
}

export async function buildGame({ owner, repo }, level = 1, { difficulty = 'easy' } = {}) {
  const generators = LEVELS[level]
  if (!generators) throw new Error(`Level ${level} isn't open yet. Try level 1.`)

  const commits = await getCommits(owner, repo)
  if (!Array.isArray(commits) || commits.length < 3) {
    throw new Error('This repo has too few commits to build a case. Try a bigger one.')
  }

  // Shared by every generator so no commit or file is asked about twice in one game.
  const ctx = { owner, repo, commits, difficulty, used: new Set(), usedFiles: new Set() }
  const rounds = []

  // Cycle through the question types in a random order for variety.
  // A generator returns null when the repo can't support it, so allow a few extra attempts,
  // but stop once the game has used its share of the 60-per-hour rate limit.
  const callsAtStart = apiCallsMade()
  let order = shuffle(generators)
  for (let attempt = 0; rounds.length < ROUNDS_PER_GAME && attempt < ROUNDS_PER_GAME * 4; attempt++) {
    if (apiCallsMade() - callsAtStart >= MAX_API_CALLS_PER_GAME) break
    if (attempt > 0 && attempt % order.length === 0) order = shuffle(generators)

    let round
    try {
      round = await order[attempt % order.length](ctx)
    } catch (err) {
      // Rate limit or network trouble mid-game: a short game beats no game.
      if (rounds.length >= MIN_ROUNDS) break
      throw err
    }
    if (round) rounds.push({ id: `r${rounds.length + 1}`, ...round })
  }

  if (!rounds.length) throw new Error("Couldn't build any cases from this repo. Try a different one.")
  return rounds
}
