// Builds one game: 5 rounds from the player's current level, using real commits.

import { level1 } from './cases/level1.js'
import { level2 } from './cases/level2.js'
import { getCommits } from './github.js'
import { shuffle } from './utils.js'

export const ROUNDS_PER_GAME = 5

// Levels 3-5 get added here as they're built.
const LEVELS = {
  1: level1,
  2: level2,
}

export async function buildGame({ owner, repo }, level = 1, { difficulty = 'easy' } = {}) {
  const generators = LEVELS[level]
  if (!generators) throw new Error(`Level ${level} isn't open yet. Try level 1.`)

  const commits = await getCommits(owner, repo)
  if (!Array.isArray(commits) || commits.length < 3) {
    throw new Error('This repo has too few commits to build a case. Try a bigger one.')
  }

  // Shared by every generator so no commit is asked about twice in one game.
  const ctx = { owner, repo, commits, difficulty, used: new Set() }
  const rounds = []

  // Cycle through the question types in a random order for variety.
  // A generator returns null when the repo can't support it, so allow a few extra attempts.
  let order = shuffle(generators)
  for (let attempt = 0; rounds.length < ROUNDS_PER_GAME && attempt < ROUNDS_PER_GAME * 4; attempt++) {
    if (attempt > 0 && attempt % order.length === 0) order = shuffle(generators)
    const round = await order[attempt % order.length](ctx)
    if (round) rounds.push({ id: `r${rounds.length + 1}`, ...round })
  }

  if (!rounds.length) throw new Error("Couldn't build any cases from this repo. Try a different one.")
  return rounds
}
