// Level 1 (Rookie): what a commit is.
// Each generator takes the game context and returns one round, or null if this repo can't support it
// (for example "who did it" needs at least two different authors).

import { getCommit } from '../github.js'
import {
  authorName,
  commitDate,
  firstLine,
  isMerge,
  makeOptions,
  pickRandom,
  shortSha,
  shuffle,
  uniqueOthers,
} from '../utils.js'

const MAX_DIFF_LINES = 30

// Commits we can ask about: not merges, not already used in this game.
function freshCommits(ctx) {
  return ctx.commits
    .map((commit, index) => ({ commit, index }))
    .filter(({ commit }) => !isMerge(commit) && !ctx.used.has(commit.sha))
}

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

function trimPatch(patch) {
  const lines = patch.split('\n')
  if (lines.length <= MAX_DIFF_LINES) return patch
  return [...lines.slice(0, MAX_DIFF_LINES), `... (${lines.length - MAX_DIFF_LINES} more lines)`].join('\n')
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
  // Bots like dependabot[bot] would give the answer away, so only humans count.
  const isBot = (name) => name.endsWith('[bot]')
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

// First or later? Show two commit messages, pick the older one.
export async function firstOrLater(ctx) {
  const candidates = shuffle(freshCommits(ctx))
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i].commit
      const b = candidates[j].commit
      const msgA = firstLine(a.commit.message)
      const msgB = firstLine(b.commit.message)
      const dateA = commitDate(a)
      const dateB = commitDate(b)
      if (msgA.toLowerCase() === msgB.toLowerCase() || dateA === dateB) continue

      ctx.used.add(a.sha)
      ctx.used.add(b.sha)
      const [older, newer] = dateA < dateB ? [a, b] : [b, a]
      const olderMsg = firstLine(older.commit.message)
      const newerMsg = firstLine(newer.commit.message)
      return {
        level: 1,
        type: 'first_or_later',
        prompt: 'Two commits from this repo. Which one happened first?',
        evidence: { diff: null, author: null, date: null, file: null },
        ...makeOptions(olderMsg, [newerMsg]),
        explanation: `"${olderMsg}" was committed on ${commitDate(older).slice(0, 10)}, before "${newerMsg}" on ${commitDate(newer).slice(0, 10)}.`,
        hint: 'git log lists the newest commit at the top. Adding --reverse puts the oldest at the top.',
        command: 'git log --reverse --format="%h %ad %s" --date=short',
      }
    }
  }
  return null
}

export const level1 = [realOrFake, whoDidIt, firstOrLater]
