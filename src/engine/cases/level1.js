// Level 1 (Rookie): what a commit is.
// Each generator takes the game context and returns one round, or null if this repo can't support it
// (for example "who did it" needs at least two different authors).

import { freshCommits, trimPatch } from '../diff.js'
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
  newestFirst,
  pickRandom,
  shortSha,
  shuffle,
  uniqueOthers,
} from '../utils.js'

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
    investigate: {
      brief: `Commit ${sha} changed ${file.filename}, but its message was torn off. Read the change, then pick the message that fits.`,
      suggest: [`git show ${sha} -- ${file.filename}`],
      mask: { sha: commit.sha, hide: 'message' },
    },
  }
}

const SUSPECT_COMMITS = 2 // other commits shown per suspect, in the fallback version
const TRAIL_TRIES = 6 // case commits to try for a file trail; each try costs up to two API calls (cached, and capped by the game budget)
const TRAIL_LINES = 6 // lines of the file's history shown as evidence

// Each human author's commits in the list, newest first.
function commitsByAuthor(ctx) {
  const byAuthor = new Map()
  for (const c of ctx.commits) {
    const name = authorName(c)
    if (isBot(name) || isMerge(c)) continue
    if (!byAuthor.has(name)) byAuthor.set(name, [])
    byAuthor.get(name).push(c)
  }
  return byAuthor
}

// Who did it? Prefer the file trail, which the evidence proves. Fall back to work habits when no file
// in the tried commits has a usable trail.
export async function whoDidIt(ctx) {
  const byAuthor = commitsByAuthor(ctx)
  if (byAuthor.size < 2) return null
  return (await whoDidItByFileTrail(ctx, byAuthor)) || whoDidItByHabits(ctx, byAuthor)
}

// The file trail: the case commit changed a file, and the evidence is that file's history.
// Suspects are chosen so exactly one of them appears in it, so the answer follows from the evidence.
async function whoDidItByFileTrail(ctx, byAuthor) {
  const candidates = shuffle(freshCommits(ctx)).filter(({ commit }) => !isBot(authorName(commit)))
  for (const { commit } of candidates.slice(0, TRAIL_TRIES)) {
    const real = authorName(commit)
    const detail = await getCommit(ctx.owner, ctx.repo, commit.sha)
    // A file this commit created has no earlier history to follow.
    const file = shuffle((detail.files || []).filter((f) => f.status !== 'added' && f.status !== 'removed'))[0]
    if (!file) continue

    const history = (await getFileHistory(ctx.owner, ctx.repo, file.filename)).filter((c) => !isMerge(c))
    const onFile = new Set(history.map(authorName))
    const trail = newestFirst(history.filter((c) => c.sha !== commit.sha && !isBot(authorName(c))))
    // The real author must have worked on this file before...
    if (!trail.some((c) => authorName(c) === real)) continue
    // ...and the other suspects never, so only one suspect shows up in the trail.
    const wrong = uniqueOthers(shuffle([...byAuthor.keys()].filter((name) => !onFile.has(name))), real, 3)
    if (wrong.length < 2) continue

    // Show the latest lines of the trail, making sure the real author's latest commit is among them.
    let shown = trail.slice(0, TRAIL_LINES)
    if (!shown.some((c) => authorName(c) === real)) {
      shown = [...shown.slice(0, TRAIL_LINES - 1), trail.find((c) => authorName(c) === real)]
    }
    const width = Math.min(Math.max(...shown.map((c) => authorName(c).length)), 22)
    const lines = shown.map((c) => `${shortSha(c.sha)}  ${authorName(c).padEnd(width)}  ${clipMessage(c, 50)}`)

    ctx.used.add(commit.sha)
    const sha = shortSha(commit.sha)
    const path = file.filename
    return {
      level: 1,
      type: 'who_did_it',
      prompt: `Who wrote commit ${sha}? It changed ${path}. Check who else works on that file.`,
      evidence: {
        diff: [
          [logLine(commit), 'Author: ???'].join('\n'),
          [`$ git log --format="%h %an %s" -- ${path}`, ...lines].join('\n'),
        ].join('\n\n'),
        author: null,
        date: commitDate(commit).slice(0, 10),
        file: path,
      },
      ...makeOptions(real, wrong),
      explanation: `${real} wrote ${sha}. Of the suspects, only ${real} appears in the history of ${path}. git log -- <file> shows who has worked on a file.`,
      hint: "Look at the names in the file's history. Which suspect works on this file?",
      command: `git log --format="%h %an %s" -- ${path}`,
      investigate: {
        brief: `Commit ${sha} changed ${path}. Its author line was scrubbed. Find out who works on that file.`,
        suggest: [`git show ${sha} --stat`, `git log --format="%h %an %s" -- ${path}`],
        mask: { sha: commit.sha, hide: 'author' },
      },
    }
  }
  return null
}

// Work habits (fallback): show each suspect's other recent commits. People tend to work on the same
// parts of a project, so whose other commits look like this one is the clue. Weaker than the file trail.
function whoDidItByHabits(ctx, byAuthor) {
  // The real author needs at least one other commit, or there is nothing to go on.
  const candidates = freshCommits(ctx).filter(({ commit }) => (byAuthor.get(authorName(commit))?.length || 0) >= 2)
  if (!candidates.length) return null
  const { commit } = pickRandom(candidates)
  ctx.used.add(commit.sha)

  const real = authorName(commit)
  const { options, answer } = makeOptions(real, uniqueOthers(shuffle([...byAuthor.keys()]), real, 3))

  // Evidence: the case commit itself with its author hidden, then what each suspect committed apart from it,
  // like `git log --author=<name> --oneline`. The case commit is left out of the suspects' lists, or it would
  // sit under the real author and give the answer away.
  const caseEntry = [logLine(commit), 'Author: ???'].join('\n')
  const suspects = options.map((name) => {
    const theirs = byAuthor.get(name).filter((c) => c.sha !== commit.sha).slice(0, SUSPECT_COMMITS)
    return [`${name}:`, ...theirs.map((c) => `  ${logLine(c)}`)].join('\n')
  })

  const sha = shortSha(commit.sha)
  return {
    level: 1,
    type: 'who_did_it',
    prompt: `Who wrote commit ${sha}? Compare it with each suspect's other recent commits.`,
    evidence: {
      diff: [caseEntry, "Suspects' other commits:", ...suspects].join('\n\n'),
      author: null,
      date: commitDate(commit).slice(0, 10),
      file: null,
    },
    options,
    answer,
    explanation: `${real} is recorded as the author of ${sha}. git log --author shows everything one person committed, which is how you spot who works on what.`,
    hint: 'People tend to work on the same parts of a project. Whose other commits look most like this one?',
    command: `git log --author="${real}" --oneline`,
    investigate: {
      brief: `Commit ${sha}'s author line was scrubbed, so it won't show up under anyone's name. Whose other commits look most like this one?`,
      suggest: [`git show ${sha} --stat`, `git log --author="${options[(answer + 1) % options.length]}" --oneline`],
      mask: { sha: commit.sha, hide: 'author' },
    },
  }
}

const LOG_GAP = [2, 4] // how many commits apart the two suspects sit in the log excerpt

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

    // One commit of context above and below the pair, like a real slice of the log.
    // A second round of this type in the same game must show a different stretch of history,
    // otherwise the two log windows overlap and it looks like the same question twice.
    const excerpt = byDate.slice(Math.max(0, top - 1), top + gap + 2)
    ctx.shownInLog ??= new Set()
    if (excerpt.some((c) => ctx.shownInLog.has(c.sha))) continue
    excerpt.forEach((c) => ctx.shownInLog.add(c.sha))

    ctx.used.add(newer.sha)
    ctx.used.add(older.sha)
    const log = ['$ git log --oneline', ...excerpt.map(logLine)].join('\n')

    return {
      level: 1,
      type: 'first_or_later',
      prompt: "Here is part of this repo's git log. Which of these two commits happened first?",
      evidence: { diff: log, author: null, date: null, file: null },
      ...makeOptions(olderMsg, [newerMsg]),
      explanation: `git log lists the newest commit at the top, so the lower one is older. "${olderMsg}" (${commitDate(older).slice(0, 10)}) came before "${newerMsg}" (${commitDate(newer).slice(0, 10)}).`,
      hint: 'git log shows history newest first. Find both commits in the list.',
      command: 'git log --oneline',
      investigate: {
        brief: 'Find both commits in the log and work out which one happened first.',
        // Enough lines that the older commit is on screen.
        suggest: [`git log --oneline -n ${newestFirst(ctx.commits).findIndex((c) => c.sha === older.sha) + 2}`],
      },
    }
  }
  return null
}

export const level1 = [realOrFake, whoDidIt, firstOrLater]
