// Level 4 (Inspector): branches, merges and pull requests.
// Each generator takes the game context and returns one round, or null if this repo can't support it.
// Most of this needs no extra API calls: every commit in the list already carries its `parents`.

import { getCommit } from '../github.js'
import { commitDate, firstLine, isBot, isMerge, makeOptions, pickRandom, shortSha, shuffle, uniqueOthers } from '../utils.js'

// GitHub's default message when a PR is merged with a merge commit.
const MERGE_PR_RE = /^Merge pull request #(\d+) from ([^/\s]+)\/(\S+)/

function unusedMerges(ctx) {
  return ctx.commits.filter((c) => isMerge(c) && !ctx.used.has(c.sha))
}

// Roughly what `git cat-file -p <sha>` prints for a commit, minus the message (it would give merges away).
function rawCommit(commit) {
  const author = commit.commit.author
  return [
    `tree ${shortSha(commit.commit.tree.sha)}`,
    ...commit.parents.map((p) => `parent ${shortSha(p.sha)}`),
    `author ${author.name} ${author.date.slice(0, 10)}`,
  ].join('\n')
}

// Merge or normal commit? Show the raw commit object, count the parents.
export async function mergeOrNormal(ctx) {
  const merges = unusedMerges(ctx)
  const normals = ctx.commits.filter((c) => c.parents.length === 1 && !ctx.used.has(c.sha))
  // Ask about a merge half the time when the repo has any, otherwise every answer would be "normal".
  const pool = merges.length && (Math.random() < 0.5 || !normals.length) ? merges : normals
  if (!pool.length) return null
  const commit = pickRandom(pool)
  ctx.used.add(commit.sha)

  const MERGE = 'A merge commit'
  const NORMAL = 'A normal commit'
  const ROOT = 'The very first commit (no parents)'
  const merge = isMerge(commit)
  const sha = shortSha(commit.sha)
  return {
    level: 4,
    type: 'merge_or_normal',
    prompt: `This is the raw commit object for ${sha}, with the message hidden. What kind of commit is it?`,
    evidence: { diff: rawCommit(commit), author: null, date: null, file: null },
    ...makeOptions(merge ? MERGE : NORMAL, [merge ? NORMAL : MERGE, ROOT]),
    explanation: merge
      ? `It lists ${commit.parents.length} parent lines. A merge commit joins two lines of history, so it has two (or more) parents.`
      : 'It lists one parent: the commit that came right before it. Normal commits have exactly one. Only the very first commit has none.',
    hint: 'Count the "parent" lines. Each one points to a commit that came directly before this one.',
    command: `git cat-file -p ${sha}`,
  }
}

// Who merged it? For "Merge pull request #N from user/branch", pick the person who made the merge commit.
// The trap answer is the branch owner: they wrote the work, but someone else often merges it.
export async function whoMerged(ctx) {
  const prMerges = unusedMerges(ctx).filter((c) => c.author?.login && MERGE_PR_RE.test(firstLine(c.commit.message)))
  if (!prMerges.length) return null
  const commit = pickRandom(prMerges)
  ctx.used.add(commit.sha)

  const [, pr, branchOwner, branch] = firstLine(commit.commit.message).match(MERGE_PR_RE)
  const merger = commit.author.login
  if (isBot(merger)) return null
  const logins = ctx.commits.map((c) => c.author?.login).filter((l) => l && !isBot(l))
  const wrong = uniqueOthers([branchOwner, ...shuffle(logins)], merger, 3)
  if (wrong.length < 2) return null

  // The PR title sits after a blank line: "Merge pull request #42 from alice/fix\n\nFix login redirect"
  const title = firstLine(commit.commit.message.split('\n').slice(1).join('\n').trim())
  const sha = shortSha(commit.sha)
  return {
    level: 4,
    type: 'who_merged',
    prompt: `Pull request #${pr}${title ? ` ("${title}")` : ''} brought in the branch ${branchOwner}/${branch}. Who merged it?`,
    evidence: { diff: null, author: null, date: commitDate(commit).slice(0, 10), file: null },
    ...makeOptions(merger, wrong),
    explanation:
      merger === branchOwner
        ? `${merger} wrote the branch and merged it themselves. The merge commit's author is whoever merged.`
        : `${merger} made the merge commit, so they merged it. ${branchOwner} owns the branch the work came from.`,
    hint: 'The "from user/branch" part says whose branch it was. The merge commit\'s author is whoever merged it.',
    command: `git log -1 --format="%h %an %s" ${sha}`,
  }
}

// Which parent is the merged branch? A merge's first parent is where you were; the second is what you merged in.
export async function mergedBranchParent(ctx) {
  const merges = unusedMerges(ctx).filter((c) => c.parents.length === 2)
  if (!merges.length) return null
  const commit = pickRandom(merges)
  ctx.used.add(commit.sha)

  // Parents are usually in the commit list already; fetch only if not.
  const lookup = async (sha) => ctx.commits.find((c) => c.sha === sha) || getCommit(ctx.owner, ctx.repo, sha)
  const [first, second] = await Promise.all(commit.parents.map((p) => lookup(p.sha)))
  const firstMsg = firstLine(first.commit.message)
  const secondMsg = firstLine(second.commit.message)
  if (firstMsg.toLowerCase() === secondMsg.toLowerCase()) return null

  const sha = shortSha(commit.sha)
  return {
    level: 4,
    type: 'merged_branch_parent',
    prompt: `Merge commit ${sha} ("${firstLine(commit.commit.message)}") has two parents. Which one is the last commit of the branch that was merged in?`,
    evidence: { diff: rawCommit(commit), author: null, date: null, file: null },
    ...makeOptions(secondMsg, [firstMsg]),
    explanation: `The second parent ("${secondMsg}") is the tip of the merged branch. The first parent ("${firstMsg}") is where the receiving branch was before the merge.`,
    hint: 'Parent 1 is the branch you were on when you ran git merge. Parent 2 is the branch you merged in.',
    command: `git log -1 --oneline ${sha}^2`,
  }
}

export const level4 = [mergeOrNormal, whoMerged, mergedBranchParent]
