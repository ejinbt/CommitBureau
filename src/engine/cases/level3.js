// Level 3 (Detective): the history of one file.
// Each generator takes the game context and returns one round, or null if this repo can't support it.

import { freshCommits } from '../diff.js'
import { getCommit, getFileHistory } from '../github.js'
import {
  authorName,
  clipMessage,
  commitDate,
  firstLine,
  isBot,
  isMerge,
  logLine,
  makeOptions,
  shortSha,
  shuffle,
  uniqueOthers,
} from '../utils.js'

const SHOWN_COMMITS = 12 // commits listed for "who touched most"
const MAX_NAME_WIDTH = 22 // author column width in that list
const MAX_CREATED_HISTORY = 15 // "which commit created" only uses files whose whole history fits on screen
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
// Newest first, the order git log prints.
function newestFirst(commits) {
  return [...commits].sort((a, b) => (commitDate(b) > commitDate(a) ? 1 : commitDate(b) < commitDate(a) ? -1 : 0))
}

// Who touched this file most? Show the file's recent commits with authors, the player counts the names.
export async function whoTouchedMost(ctx) {
  const found = await findFileHistory(ctx, 'who_touched_most', (history) => {
    // Count only what's on screen, so the evidence always matches the answer. Bots don't count.
    const shown = newestFirst(history.filter((c) => !isBot(authorName(c)))).slice(0, SHOWN_COMMITS)
    const ranking = countAuthors(shown)
    // Needs a clear winner: at least 2 people and no tie for first place.
    if (shown.length < 3 || ranking.length < 2 || ranking[0][1] === ranking[1][1]) return null
    return { shown, ranking }
  })
  if (!found) return null
  const { path, shown, ranking } = found

  const [top, topCount] = ranking[0]
  const [second, secondCount] = ranking[1]
  // Wrong answers: other people who touched this file (harder), then anyone in the repo.
  const repoAuthors = ctx.commits.map(authorName).filter((n) => !isBot(n))
  const wrong = uniqueOthers([...ranking.slice(1).map(([name]) => name), ...shuffle(repoAuthors)], top, 3)
  if (wrong.length < 2) return null

  // Like `git log --format="%h %an %s" -- <file>`, with names padded into a column for easy counting.
  const width = Math.min(Math.max(...shown.map((c) => authorName(c).length)), MAX_NAME_WIDTH)
  const log = shown.map((c) => `${shortSha(c.sha)}  ${authorName(c).padEnd(width)}  ${clipMessage(c, 50)}`)

  return {
    level: 3,
    type: 'who_touched_most',
    prompt: `Here are the latest commits to ${path}. Who made the most of them?`,
    evidence: { diff: log.join('\n'), author: null, date: null, file: path },
    ...makeOptions(top, wrong),
    explanation: `Of these ${shown.length} commits to ${path}, ${top} made ${topCount}. ${second} is next with ${secondCount}.`,
    hint: 'git log -- <file> lists only the commits that touched that file. Count the names.',
    command: `git shortlog -sn -- ${path}`,
  }
}

// Which commit created this file? Show the file's whole history, the creating commit is at the bottom.
export async function whichCommitCreated(ctx) {
  const found = await findFileHistory(ctx, 'which_commit_created', (history) => {
    // The whole history has to fit on screen, or the bottom line (the creation) would be cut off.
    if (history.length < 3 || history.length > MAX_CREATED_HISTORY) return null
    const ordered = newestFirst(history)
    return { ordered, oldest: ordered[ordered.length - 1] }
  })
  if (!found) return null
  const { path, ordered: history, oldest } = found

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
    prompt: `${path} didn't always exist. Here is its full history. Which commit created it?`,
    evidence: { diff: history.map(logLine).join('\n'), author: null, date: null, file: path },
    ...makeOptions(real, wrong),
    explanation: `git log lists the newest commit first, so the bottom line is where ${path} began: "${real}" (${sha}, ${commitDate(oldest).slice(0, 10)}). The other commits changed it later.`,
    hint: 'The first commit for a file is at the bottom of git log -- <file>. --diff-filter=A shows only commits that Added it.',
    command: `git log --diff-filter=A -- ${path}`,
  }
}

export const level3 = [whoTouchedMost, whichCommitCreated]
