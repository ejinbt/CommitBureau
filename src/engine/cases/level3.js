// Level 3 (Detective): the history of one file.
// Each generator takes the game context and returns one round, or null if this repo can't support it.

import { freshCommits } from '../diff.js'
import { getCommit, getFileHistory } from '../github.js'
import { authorName, commitDate, firstLine, isBot, isMerge, makeOptions, shortSha, shuffle, uniqueOthers } from '../utils.js'

const PAGE_SIZE = 100 // getFileHistory returns at most this many commits
const POOL_COMMITS = 3 // commits to collect file names from, once per game

// File names from a few recent commits, collected once per game and shared by both question types.
async function filePool(ctx) {
  if (!ctx.filePool) {
    const names = new Set()
    for (const { commit } of shuffle(freshCommits(ctx)).slice(0, POOL_COMMITS)) {
      const detail = await getCommit(ctx.owner, ctx.repo, commit.sha)
      for (const f of detail.files || []) if (f.status !== 'removed') names.add(f.filename)
    }
    ctx.filePool = shuffle([...names])
    ctx.rejected = new Set() // "type:path" pairs that didn't fit a question type
  }
  return ctx.filePool
}

// Find a file whose history passes `historyOk`. Each new file costs one API call, and histories are
// cached, so a file that didn't fit one question type can still be tried for the other at no cost.
async function findFileHistory(ctx, type, historyOk, tries = 3) {
  const pool = await filePool(ctx)
  const candidates = pool.filter((p) => !ctx.usedFiles.has(p) && !ctx.rejected.has(`${type}:${p}`))
  for (const path of candidates.slice(0, tries)) {
    const history = (await getFileHistory(ctx.owner, ctx.repo, path)).filter((c) => !isMerge(c))
    const result = historyOk(history, path)
    if (result) {
      ctx.usedFiles.add(path)
      return { path, history, ...result }
    }
    ctx.rejected.add(`${type}:${path}`)
  }
  return null
}

// Count commits per human author, most first: [["Ada", 5], ["Linus", 2], ...]
function countAuthors(history) {
  const counts = new Map()
  for (const c of history) {
    const name = authorName(c)
    if (!isBot(name)) counts.set(name, (counts.get(name) || 0) + 1)
  }
  return [...counts].sort((a, b) => b[1] - a[1])
}

// Who touched this file most? Pick the author with the most commits to one file.
export async function whoTouchedMost(ctx) {
  const found = await findFileHistory(ctx, 'who_touched_most', (history) => {
    const ranking = countAuthors(history)
    // Needs a clear winner: at least 2 people and no tie for first place.
    if (ranking.length < 2 || ranking[0][1] === ranking[1][1]) return null
    return { ranking }
  })
  if (!found) return null
  const { path, history, ranking } = found

  const [top, topCount] = ranking[0]
  const [second, secondCount] = ranking[1]
  // Wrong answers: other people who touched this file (harder), then anyone in the repo.
  const repoAuthors = ctx.commits.map(authorName).filter((n) => !isBot(n))
  const wrong = uniqueOthers([...ranking.slice(1).map(([name]) => name), ...shuffle(repoAuthors)], top, 3)
  if (wrong.length < 2) return null

  const scope = history.length >= PAGE_SIZE ? `the latest ${history.length}` : `all ${history.length}`
  return {
    level: 3,
    type: 'who_touched_most',
    prompt: `Who has made the most commits to ${path}?`,
    evidence: { diff: null, author: null, date: null, file: path },
    ...makeOptions(top, wrong),
    explanation: `Of ${scope} commits that changed ${path}, ${top} made ${topCount}. ${second} is next with ${secondCount}.`,
    hint: 'git log -- <file> lists only the commits that touched that file. Whose name shows up most?',
    command: `git shortlog -sn -- ${path}`,
  }
}

// Which commit created this file? Pick the commit that first added it.
export async function whichCommitCreated(ctx) {
  const found = await findFileHistory(ctx, 'which_commit_created', (history) => {
    // A full page means older commits are cut off, so we can't see the creation. Skip busy files.
    if (history.length < 3 || history.length >= PAGE_SIZE) return null
    const oldest = history.reduce((a, b) => (commitDate(a) <= commitDate(b) ? a : b))
    return { oldest }
  })
  if (!found) return null
  const { path, history, oldest } = found

  // Make sure the oldest commit really added the file (it wasn't renamed from somewhere else).
  const detail = await getCommit(ctx.owner, ctx.repo, oldest.sha)
  const added = (detail.files || []).find((f) => f.filename === path)
  if (added?.status !== 'added') return null

  const real = firstLine(oldest.commit.message)
  // Wrong answers: later commits to the same file. They all touched it, but only one created it.
  const later = history.filter((c) => c.sha !== oldest.sha).map((c) => firstLine(c.commit.message))
  const wrong = uniqueOthers(shuffle(later), real, 3)
  if (wrong.length < 2) return null

  const sha = shortSha(oldest.sha)
  return {
    level: 3,
    type: 'which_commit_created',
    prompt: `${path} didn't always exist. Which commit created it?`,
    evidence: { diff: null, author: null, date: null, file: path },
    ...makeOptions(real, wrong),
    explanation: `"${real}" (${sha}, ${commitDate(oldest).slice(0, 10)}) added ${path}. The other commits changed it later.`,
    hint: 'The first commit for a file is at the bottom of git log -- <file>. --diff-filter=A shows only commits that Added it.',
    command: `git log --diff-filter=A -- ${path}`,
  }
}

export const level3 = [whoTouchedMost, whichCommitCreated]
