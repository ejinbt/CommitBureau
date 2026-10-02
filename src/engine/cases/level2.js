import { findCommitWithFile, fitsOnScreen, splitPatch } from '../diff.js'
import { getCommit } from '../github.js'
import { commitDate, firstLine, isMerge, makeOptions, shortSha, shuffle, uniqueOthers } from '../utils.js'

const MAX_OPTION_LENGTH = 80

function clip(text) {
  const t = text.trim()
  return t.length > MAX_OPTION_LENGTH ? t.slice(0, MAX_OPTION_LENGTH - 1) + '…' : t
}

export async function linesChanged(ctx) {
  const found = await findCommitWithFile(ctx, fitsOnScreen)
  if (!found) return null
  const { commit, file } = found

  const label = (added, removed) => `+${added} / -${removed}`
  const { added, removed } = splitPatch(file.patch)
  const a = added.length
  const d = removed.length
  const real = label(a, d)
  const nearMisses = [
    [d, a],
    [a + 1, d],
    [a, d + 1],
    [Math.max(0, a - 1), d],
    [a, Math.max(0, d - 1)],
    [a + 2, d + 1],
  ]
    .filter(([x, y]) => x + y > 0)
    .map(([x, y]) => label(x, y))

  const sha = shortSha(commit.sha)
  return {
    level: 2,
    type: 'lines_changed',
    prompt: `How many lines did this commit add and remove in ${file.filename}?`,
    evidence: { diff: file.patch, author: null, date: commitDate(commit).slice(0, 10), file: file.filename },
    ...makeOptions(real, uniqueOthers(shuffle(nearMisses), real, 3)),
    explanation: `${a} line(s) start with + (added) and ${d} start with - (removed). Lines starting with a space are unchanged context and don't count.`,
    hint: 'Count only lines starting with + or -. Skip the @@ line and lines starting with a space.',
    command: `git show --numstat ${sha}`,
    investigate: {
      brief: `Commit ${sha} changed ${file.filename}. Count what it added and removed there.`,
      suggest: [`git show ${sha} -- ${file.filename}`, `git show ${sha} --numstat`],
    },
  }
}

export async function whichFile(ctx) {
  const found = await findCommitWithFile(ctx, fitsOnScreen)
  if (!found) return null
  const { commit, detail, file } = found
  const changedHere = new Set(detail.files.map((f) => f.filename))

  const others = ctx.commits
    .filter((c) => c.sha !== commit.sha && !isMerge(c))
    .sort((x, y) => Number(ctx.used.has(y.sha)) - Number(ctx.used.has(x.sha)))
    .slice(0, 3)

  const otherFiles = []
  for (const other of others) {
    const otherDetail = await getCommit(ctx.owner, ctx.repo, other.sha)
    otherFiles.push(...(otherDetail.files || []).map((f) => f.filename).filter((name) => !changedHere.has(name)))
    if (new Set(otherFiles).size >= 3) break
  }
  const wrong = uniqueOthers(shuffle(otherFiles), file.filename, 3)
  if (wrong.length < 2) return null

  const sha = shortSha(commit.sha)
  const total = detail.files.length
  return {
    level: 2,
    type: 'which_file',
    prompt: `This diff comes from the commit "${firstLine(commit.commit.message)}". Which file was changed?`,
    evidence: { diff: file.patch, author: null, date: commitDate(commit).slice(0, 10), file: null },
    ...makeOptions(file.filename, wrong),
    explanation:
      `The diff is from ${file.filename}.` +
      (total > 1 ? ` This commit changed ${total} files in total.` : '') +
      ' The other files exist in this repo but this commit did not touch them.',
    hint: 'Look at what is inside the diff: the language, the names, the kind of text. Which file would hold it?',
    command: `git show --name-only ${sha}`,
    investigate: {
      brief: `Commit ${sha} changed one of the files in the options. Find out which.`,
      suggest: [`git show ${sha} --name-only`],
    },
  }
}

function deletedLines(file) {
  const { added, removed, context } = splitPatch(file.patch)
  const stillThere = new Set([...added, ...context].map((t) => t.trim()))
  return removed.map((t) => t.trim()).filter((t) => t.length >= 3 && !stillThere.has(t))
}

export async function spotDeletedLine(ctx) {
  const found = await findCommitWithFile(ctx, (f) => fitsOnScreen(f) && deletedLines(f).length > 0)
  if (!found) return null
  const { commit, file } = found

  const real = clip(shuffle(deletedLines(file))[0])
  const { added, context } = splitPatch(file.patch)
  const usable = (lines) => shuffle(lines.map(clip).filter((t) => t.length >= 3))
  const wrong = uniqueOthers([...usable(added), ...usable(context)], real, 3)
  if (wrong.length < 2) return null

  const sha = shortSha(commit.sha)
  return {
    level: 2,
    type: 'spot_deleted_line',
    prompt: `Read this diff of ${file.filename}. Which line did the commit delete?`,
    evidence: { diff: file.patch, author: null, date: commitDate(commit).slice(0, 10), file: file.filename },
    ...makeOptions(real, wrong),
    explanation: `"${real}" starts with - in the diff, so it was deleted. Lines starting with + were added, and lines starting with a space did not change.`,
    hint: 'In a diff, - means the line was removed and + means it was added.',
    command: `git diff ${sha}^ ${sha} -- ${file.filename}`,
    investigate: {
      brief: `Commit ${sha} changed ${file.filename}. Find the line it deleted.`,
      suggest: [`git diff ${sha}^ ${sha} -- ${file.filename}`],
    },
  }
}

export const level2 = [linesChanged, whichFile, spotDeletedLine]
