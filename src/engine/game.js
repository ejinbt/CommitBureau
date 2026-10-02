import { level1 } from './cases/level1.js'
import { level2 } from './cases/level2.js'
import { level3 } from './cases/level3.js'
import { level4 } from './cases/level4.js'
import { level5 } from './cases/level5.js'
import { apiCallsMade, getCommits } from './github.js'
import { shuffle } from './utils.js'

export const ROUNDS_PER_GAME = 5
const MIN_ROUNDS = 3
const MAX_API_CALLS_PER_GAME = 25

const LEVELS = {
  1: level1,
  2: level2,
  3: level3,
  4: level4,
  5: level5,
}

const REPO_FREE_LEVELS = new Set([5])

export async function buildGame(repoRef, level = 1, { difficulty = 'easy' } = {}) {
  const { owner, repo } = repoRef || {}
  const generators = LEVELS[level]
  if (!generators) throw new Error(`Level ${level} isn't open yet. Try level 1.`)

  let commits = []
  if (!REPO_FREE_LEVELS.has(level)) {
    if (!owner || !repo) throw new Error('Pick a repo to investigate first.')
    commits = await getCommits(owner, repo)
    if (!Array.isArray(commits) || commits.length < 3) {
      throw new Error('This repo has too few commits to build a case. Try a bigger one.')
    }
  }

  const ctx = { owner, repo, commits, difficulty, used: new Set(), usedFiles: new Set(), usedScenarios: new Set() }
  const rounds = []

  const callsAtStart = apiCallsMade()
  let order = shuffle(generators)
  for (let attempt = 0; rounds.length < ROUNDS_PER_GAME && attempt < ROUNDS_PER_GAME * 4; attempt++) {
    if (apiCallsMade() - callsAtStart >= MAX_API_CALLS_PER_GAME) break
    if (attempt > 0 && attempt % order.length === 0) order = shuffle(generators)

    let round
    try {
      round = await order[attempt % order.length](ctx)
    } catch (err) {
      if (rounds.length >= MIN_ROUNDS) break
      throw err
    }
    if (round) rounds.push({ id: `r${rounds.length + 1}`, ...round })
  }

  if (!rounds.length) throw new Error("Couldn't build any cases from this repo. Try a different one.")
  return rounds
}
