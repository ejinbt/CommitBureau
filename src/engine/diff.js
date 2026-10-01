// Helpers for working with commit diffs (the "patch" text GitHub returns for each changed file).
// A patch looks like:
//   @@ -10,4 +10,5 @@ function foo() {     <- hunk header: where the change is
//    unchanged line                      <- context (starts with a space)
//   -removed line                        <- starts with -
//   +added line                          <- starts with +

import { getCommit } from './github.js'
import { isMerge, pickRandom, shuffle } from './utils.js'

export const MAX_DIFF_LINES = 30

export function patchLineCount(patch) {
  return patch.split('\n').length
}

export function trimPatch(patch) {
  const lines = patch.split('\n')
  if (lines.length <= MAX_DIFF_LINES) return patch
  return [...lines.slice(0, MAX_DIFF_LINES), `... (${lines.length - MAX_DIFF_LINES} more lines)`].join('\n')
}

// Sort a patch into added, removed and unchanged (context) lines, without the +/-/space marker.
export function splitPatch(patch) {
  const added = []
  const removed = []
  const context = []
  for (const line of patch.split('\n')) {
    if (line.startsWith('@@') || line.startsWith('\\')) continue // hunk header, "\ No newline at end of file"
    const text = line.slice(1)
    if (line[0] === '+') added.push(text)
    else if (line[0] === '-') removed.push(text)
    else context.push(text)
  }
  return { added, removed, context }
}

// A file whose patch fits on screen without trimming, so the player sees the whole change.
export function fitsOnScreen(file) {
  return Boolean(file.patch) && file.changes > 0 && patchLineCount(file.patch) <= MAX_DIFF_LINES
}

// Commits we can ask about: not merges, not already used in this game.
export function freshCommits(ctx) {
  return ctx.commits
    .map((commit, index) => ({ commit, index }))
    .filter(({ commit }) => !isMerge(commit) && !ctx.used.has(commit.sha))
}

// Find a commit with a changed file that passes `fileOk`. Each try costs one API call, so give up after a few.
export async function findCommitWithFile(ctx, fileOk, tries = 3) {
  for (const { commit, index } of shuffle(freshCommits(ctx)).slice(0, tries)) {
    ctx.used.add(commit.sha)
    const detail = await getCommit(ctx.owner, ctx.repo, commit.sha)
    const files = (detail.files || []).filter(fileOk)
    if (files.length) return { commit, index, detail, file: pickRandom(files) }
  }
  return null
}
