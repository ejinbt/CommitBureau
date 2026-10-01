// Level 1 (Rookie): what a commit is.
// Each generator takes the game context and returns one round, or null if this repo can't support it
// (for example "who did it" needs at least two different authors).

import { freshCommits, trimPatch } from '../diff.js'
import { getCommit } from '../github.js'
import { authorName, commitDate, firstLine, isBot, isMerge, makeOptions, pickRandom, shortSha, shuffle, uniqueOthers } from '../utils.js'

// Wrong-answer messages. Easy: from anywhere in history. Medium: from the closest commits, which look more alike.
function otherMessages(ctx, index, real, count) {
  let others = ctx.commits.map((c, i) => ({ msg: firstLine(c.commit.message), dist: Math.abs(i - index) }))
  others = ctx.difficulty === 'medium' ? others.sort((a, b) => a.dist - b.dist) : shuffle(others)
  return uniqueOthers(others.map((o) => o.msg), real, count)
}

// Pick the file whose patch is easiest to read: has text, and is small but not empty.
function pickDiffFile(files = []) {
  const withPatch = files.filter((f) => f.patch)
  if (!withPatch.length) return null
  const readable = withPatch.filter((f) => f.changes > 0 && f.changes <= 60)
  return pickRandom(readable.length ? readable : withPatch)
}

// Real or fake? Show a diff, pick the commit message that was really written for it.
export async function realOrFake(ctx) {
  const candidates = freshCommits(ctx)
  if (!candidates.length) return null
  const { commit, index } = pickRandom(candidates)
  ctx.used.add(commit.sha)

  const real = firstLine(commit.commit.message)
  const fakes = otherMessages(ctx, index, real, 3)
  if (fakes.length < 2) return null

  const detail = await getCommit(ctx.owner, ctx.repo, commit.sha)
  const file = pickDiffFile(detail.files)
  if (!file) return null

  const sha = shortSha(commit.sha)
  return {
    level: 1,
    type: 'real_or_fake',
    prompt: `This change touched ${file.filename}. Which commit message was really written for it?`,
    evidence: { diff: trimPatch(file.patch), author: null, date: commitDate(commit).slice(0, 10), file: file.filename },
    ...makeOptions(real, fakes),
    explanation: `Commit ${sha} was saved with the message "${real}". The other messages belong to different commits in this repo.`,
    hint: 'Lines starting with + were added and lines starting with - were removed. Pick the message that describes that change.',
    command: `git show ${sha}`,
  }
}

// Who did it? Show a commit message, pick its author.
export async function whoDidIt(ctx) {
  const authors = [...new Set(ctx.commits.map(authorName))].filter((name) => !isBot(name))
  if (authors.length < 2) return null

  const candidates = freshCommits(ctx).filter(({ commit }) => !isBot(authorName(commit)))
  if (!candidates.length) return null
  const { commit } = pickRandom(candidates)
  ctx.used.add(commit.sha)

  const real = authorName(commit)
  const others = uniqueOthers(shuffle(authors), real, 3)
  const sha = shortSha(commit.sha)
  return {
    level: 1,
    type: 'who_did_it',
    prompt: `Someone committed "${firstLine(commit.commit.message)}". Who was it?`,
    evidence: { diff: null, author: null, date: commitDate(commit).slice(0, 10), file: null },
    ...makeOptions(real, others),
    explanation: `${real} is recorded as the author of ${sha}. Every commit stores who wrote it and when.`,
    hint: 'Every commit records an author name and email. git log prints them on the "Author:" line.',
    command: `git log -1 --format="%an <%ae>" ${sha}`,
  }
}

const LOG_GAP = [2, 4] // how many commits apart the two suspects sit in the log excerpt
const MAX_LOG_MESSAGE = 72

// First or later? Show a slice of `git log --oneline`, ask which of two commits in it came first.
// The lesson: git log lists the newest commit at the top, so the lower one is older.
export async function firstOrLater(ctx) {
  // Sort by date ourselves, newest first, so the excerpt always matches what git log would show.
  const byDate = ctx.commits
    .filter((c) => !isMerge(c))
    .sort((x, y) => (commitDate(y) > commitDate(x) ? 1 : commitDate(y) < commitDate(x) ? -1 : 0))

  for (const top of shuffle([...byDate.keys()])) {
    const gap = LOG_GAP[0] + Math.floor(Math.random() * (LOG_GAP[1] - LOG_GAP[0] + 1))
    const newer = byDate[top]
    const older = byDate[top + gap]
    if (!older || ctx.used.has(newer.sha) || ctx.used.has(older.sha)) continue

    const newerMsg = firstLine(newer.commit.message)
    const olderMsg = firstLine(older.commit.message)
    if (newerMsg.toLowerCase() === olderMsg.toLowerCase() || commitDate(newer) === commitDate(older)) continue

    ctx.used.add(newer.sha)
    ctx.used.add(older.sha)
    // One commit of context above and below the pair, like a real slice of the log.
    const excerpt = byDate.slice(Math.max(0, top - 1), top + gap + 2)
    const log = excerpt
      .map((c) => {
        const msg = firstLine(c.commit.message)
        return `${shortSha(c.sha)} ${msg.length > MAX_LOG_MESSAGE ? msg.slice(0, MAX_LOG_MESSAGE - 1) + '…' : msg}`
      })
      .join('\n')

    return {
      level: 1,
      type: 'first_or_later',
      prompt: "Here is part of this repo's git log. Which of these two commits happened first?",
      evidence: { diff: log, author: null, date: null, file: null },
      ...makeOptions(olderMsg, [newerMsg]),
      explanation: `git log lists the newest commit at the top, so the lower one is older. "${olderMsg}" (${commitDate(older).slice(0, 10)}) came before "${newerMsg}" (${commitDate(newer).slice(0, 10)}).`,
      hint: 'git log shows history newest first. Find both commits in the list.',
      command: 'git log --oneline',
    }
  }
  return null
}

export const level1 = [realOrFake, whoDidIt, firstOrLater]
