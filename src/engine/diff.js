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

export function splitPatch(patch) {
  const added = []
  const removed = []
  const context = []
  for (const line of patch.split('\n')) {
    if (line.startsWith('@@') || line.startsWith('\\')) continue
    const text = line.slice(1)
    if (line[0] === '+') added.push(text)
    else if (line[0] === '-') removed.push(text)
    else context.push(text)
  }
  return { added, removed, context }
}

export function fitsOnScreen(file) {
  return Boolean(file.patch) && file.changes > 0 && patchLineCount(file.patch) <= MAX_DIFF_LINES
}

export function freshCommits(ctx) {
  return ctx.commits
    .map((commit, index) => ({ commit, index }))
    .filter(({ commit }) => !isMerge(commit) && !ctx.used.has(commit.sha))
}

export async function findCommitWithFile(ctx, fileOk, tries = 3) {
  for (const { commit, index } of shuffle(freshCommits(ctx)).slice(0, tries)) {
    ctx.used.add(commit.sha)
    const detail = await getCommit(ctx.owner, ctx.repo, commit.sha)
    const files = (detail.files || []).filter(fileOk)
    if (files.length) return { commit, index, detail, file: pickRandom(files) }
  }
  return null
}
