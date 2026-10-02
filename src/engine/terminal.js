import { getCommit, getCommits, getFileHistory } from './github.js'
import { authorName, commitDate, firstLine, isMerge, newestFirst, shortSha } from './utils.js'

const DEFAULT_LOG_LIMIT = 10
const DEFAULT_ONELINE_LIMIT = 30
const MAX_PATCH_LINES = 60
const HIDDEN_AUTHOR = '???'
const HIDDEN_MESSAGE = '[message torn off]'

export const HELP_TEXT = [
  'Commands you can use in this case:',
  '  git log [--oneline] [-n <count>] [--author=<name>] [--merges] [--reverse] [-- <file>]',
  '  git log --format="%h %an %s" [-- <file>]     (also %H %ad %ae %p %P)',
  '  git log --diff-filter=A -- <file>           which commit added the file',
  '  git show <commit> [--stat | --numstat | --name-only] [-- <file>]',
  '  git cat-file -p <commit>                    the raw commit: tree, parents, author',
  '  git shortlog -sn [-- <file>]                commits per author',
  '  git diff <commit>^ <commit> [-- <file>]     what one commit changed',
  '  clear',
  '<commit> can be a short hash, HEAD, HEAD~2, <hash>^ or <hash>^2 (the second parent of a merge).',
].join('\n')

export function createInvestigation(repoRef, round) {
  const ctx = { owner: repoRef?.owner, repo: repoRef?.repo, mask: round?.investigate?.mask || null }
  return {
    async run(input) {
      try {
        return await execute(ctx, input)
      } catch (err) {
        return { output: err instanceof CommandError ? err.message : `error: ${err.message}`, error: true }
      }
    },
  }
}

class CommandError extends Error {}
const fail = (message) => {
  throw new CommandError(message)
}

async function execute(ctx, input) {
  const typed = input.trim().replace(/^\$\s*/, '').replace(/[—–]/g, '--')
  const words = tokenize(typed)
  if (!words.length) return { output: '' }
  if (words[0] === 'clear') return { output: '', clear: true }
  if (words[0] === 'help') return { output: HELP_TEXT }
  if (words[0] !== 'git') fail(`${words[0]}: command not found. Commands here start with git. Type help.`)
  if (!ctx.owner) fail('This case has no repository to investigate.')

  const [sub, ...args] = words.slice(1)
  switch (sub) {
    case 'log':
      return { output: await gitLog(ctx, args) }
    case 'show':
      return { output: await gitShow(ctx, args) }
    case 'cat-file':
      return { output: await gitCatFile(ctx, args) }
    case 'shortlog':
      return { output: await gitShortlog(ctx, args) }
    case 'diff':
      return { output: await gitDiff(ctx, args) }
    case 'help':
    case undefined:
      return { output: HELP_TEXT }
    default:
      fail(`git ${sub} is not available in this case file. Type help to see what you can use.`)
  }
}

function tokenize(line) {
  const words = []
  let word = ''
  let inWord = false
  let quote = null
  for (const ch of line) {
    if (quote) {
      if (ch === quote) quote = null
      else word += ch
    } else if (ch === '"' || ch === "'") {
      quote = ch
      inWord = true
    } else if (/\s/.test(ch)) {
      if (inWord) words.push(word)
      word = ''
      inWord = false
    } else {
      word += ch
      inWord = true
    }
  }
  if (quote) fail('Missing closing quote.')
  if (inWord) words.push(word)
  return words
}

function splitArgs(args) {
  const dash = args.indexOf('--')
  return dash === -1 ? { opts: args, paths: [] } : { opts: args.slice(0, dash), paths: args.slice(dash + 1) }
}

async function allCommits(ctx) {
  return newestFirst(await getCommits(ctx.owner, ctx.repo))
}

async function resolve(ctx, rev) {
  const m = rev.match(/^([^~^]+)((?:[~^]\d*)*)$/)
  if (!m) fail(`fatal: ambiguous argument '${rev}': unknown revision`)
  const [, base, suffix] = m
  const list = await allCommits(ctx)

  let sha
  if (base === 'HEAD') sha = list[0]?.sha
  else if (/^[0-9a-f]{4,40}$/i.test(base)) {
    const matches = list.filter((c) => c.sha.startsWith(base.toLowerCase()))
    if (matches.length > 1) fail(`error: short object ID ${base} is ambiguous`)
    sha = matches[0]?.sha || (base.length === 40 ? base.toLowerCase() : null)
  }
  if (!sha) fail(`fatal: ambiguous argument '${rev}': unknown revision or path not in the working tree`)

  let commit = await fullCommit(ctx, sha)
  for (const step of suffix.match(/[~^]\d*/g) || []) {
    const n = step.length > 1 ? Number(step.slice(1)) : 1
    if (step[0] === '^') {
      const parent = commit.parents[n - 1]
      if (!parent) fail(`fatal: ambiguous argument '${rev}': ${shortSha(commit.sha)} has no parent ${n}`)
      commit = await fullCommit(ctx, parent.sha)
    } else {
      for (let i = 0; i < n; i++) {
        if (!commit.parents[0]) fail(`fatal: ambiguous argument '${rev}': not that many commits back`)
        commit = await fullCommit(ctx, commit.parents[0].sha)
      }
    }
  }
  return commit
}

function fullCommit(ctx, sha) {
  return getCommit(ctx.owner, ctx.repo, sha)
}

function view(ctx, commit) {
  const masked = ctx.mask?.sha && commit.sha.startsWith(ctx.mask.sha)
  const login = commit.author?.login
  const name = masked && ctx.mask.hide === 'author' ? HIDDEN_AUTHOR : authorName(commit)
  return {
    name,
    who: name === HIDDEN_AUTHOR ? HIDDEN_AUTHOR : login ? `${name} (${login})` : name,
    login: masked && ctx.mask.hide === 'author' ? '' : login || '',
    message: masked && ctx.mask.hide === 'message' ? HIDDEN_MESSAGE : commit.commit.message,
    hiddenAuthor: masked && ctx.mask.hide === 'author',
  }
}

function formatDate(commit) {
  const d = new Date(commitDate(commit))
  return isNaN(d) ? commitDate(commit) : d.toUTCString().replace(' GMT', ' +0000')
}

function indentMessage(message) {
  return message
    .trimEnd()
    .split('\n')
    .map((l) => `    ${l}`)
    .join('\n')
}

function header(ctx, commit) {
  const v = view(ctx, commit)
  const lines = [`commit ${commit.sha}`]
  if (isMerge(commit)) lines.push(`Merge: ${commit.parents.map((p) => shortSha(p.sha)).join(' ')}`)
  lines.push(`Author: ${v.who}`, `Date:   ${formatDate(commit)}`, '', indentMessage(v.message))
  return lines.join('\n')
}

function formatLine(ctx, commit, format) {
  const v = view(ctx, commit)
  return format.replace(/%(an|ad|ae|[hHspP])/g, (_, t) => {
    if (t === 'h') return shortSha(commit.sha)
    if (t === 'H') return commit.sha
    if (t === 's') return firstLine(v.message)
    if (t === 'an') return v.name
    if (t === 'ae') return v.login ? `${v.login}@users.noreply.github.com` : HIDDEN_AUTHOR
    if (t === 'ad') return commitDate(commit).slice(0, 10)
    if (t === 'p') return commit.parents.map((p) => shortSha(p.sha)).join(' ')
    if (t === 'P') return commit.parents.map((p) => p.sha).join(' ')
    return _
  })
}

async function gitLog(ctx, args) {
  const { opts, paths } = splitArgs(args)
  let oneline = false
  let format = null
  let limit = null
  let author = null
  let merges = null
  let reverse = false
  let addedOnly = false
  const revs = []

  for (let i = 0; i < opts.length; i++) {
    const o = opts[i]
    if (o === '--oneline') oneline = true
    else if (o.startsWith('--format=') || o.startsWith('--pretty=format:')) format = o.replace(/^--format=|^--pretty=format:/, '')
    else if (o === '-n' || o === '--max-count') limit = Number(opts[++i])
    else if (/^-n\d+$/.test(o)) limit = Number(o.slice(2))
    else if (/^--max-count=\d+$/.test(o)) limit = Number(o.split('=')[1])
    else if (/^-\d+$/.test(o)) limit = Number(o.slice(1))
    else if (o.startsWith('--author=')) author = o.slice('--author='.length).toLowerCase()
    else if (o === '--merges') merges = true
    else if (o === '--no-merges') merges = false
    else if (o === '--reverse') reverse = true
    else if (o === '--diff-filter=A') addedOnly = true
    else if (o.startsWith('-')) fail(`git log ${o} is not available in this case. Type help.`)
    else revs.push(o)
  }
  if (limit !== null && !(limit > 0)) fail('fatal: -n needs a positive number')
  if (paths.length > 1) fail('Only one file at a time here: git log -- <file>')

  let commits
  if (paths.length) {
    const history = await getFileHistory(ctx.owner, ctx.repo, paths[0])
    if (!history.length) fail(`No commits touched '${paths[0]}' in the history this case can see.`)
    commits = newestFirst(history.filter((c) => !isMerge(c)))
  } else {
    commits = await allCommits(ctx)
  }

  if (revs.length) {
    const start = await resolve(ctx, revs[0])
    const at = commits.findIndex((c) => c.sha === start.sha)
    commits = at === -1 ? [start] : commits.slice(at)
  }
  if (addedOnly) {
    if (!paths.length) fail('Use --diff-filter=A with a file: git log --diff-filter=A -- <file>')
    commits = commits.slice(-1)
  }
  if (merges !== null) commits = commits.filter((c) => isMerge(c) === merges)
  let hiddenNote = ''
  if (author) {
    if (commits.some((c) => view(ctx, c).hiddenAuthor)) hiddenNote = hiddenCommitNote(ctx)
    commits = commits.filter((c) => {
      const v = view(ctx, c)
      return !v.hiddenAuthor && (v.name.toLowerCase().includes(author) || v.login.toLowerCase().includes(author))
    })
  }
  if (!commits.length) return `(no commits match)${hiddenNote}`

  const max = limit ?? (oneline || format ? DEFAULT_ONELINE_LIMIT : DEFAULT_LOG_LIMIT)
  let shown = commits.slice(0, max)
  if (reverse) shown = shown.reverse()

  let out
  if (format) out = shown.map((c) => formatLine(ctx, c, format)).join('\n')
  else if (oneline) out = shown.map((c) => formatLine(ctx, c, '%h %s')).join('\n')
  else out = shown.map((c) => header(ctx, c)).join('\n\n')

  if (commits.length > max && limit === null) out += `\n... ${commits.length - max} more (use -n <count> to see more)`
  return out + hiddenNote
}

function hiddenCommitNote(ctx) {
  return `\n(${shortSha(ctx.mask.sha)} is hidden from author searches: its author is what you're investigating)`
}

function filesOf(commit, paths) {
  const files = commit.files || []
  return paths.length ? files.filter((f) => paths.includes(f.filename)) : files
}

function countLines(file) {
  if (!file.patch) return { add: file.additions || 0, del: file.deletions || 0 }
  const lines = file.patch.split('\n')
  return { add: lines.filter((l) => l.startsWith('+')).length, del: lines.filter((l) => l.startsWith('-')).length }
}

function patchText(files) {
  if (!files.length) return '(no file changes to show)'
  return files
    .map((f) => {
      const head = `diff --git a/${f.filename} b/${f.filename}`
      if (!f.patch) return `${head}\n(binary or very large change, no text diff)`
      const lines = f.patch.split('\n')
      const body =
        lines.length > MAX_PATCH_LINES
          ? [...lines.slice(0, MAX_PATCH_LINES), `... ${lines.length - MAX_PATCH_LINES} more lines`]
          : lines
      return [head, `--- a/${f.filename}`, `+++ b/${f.filename}`, ...body].join('\n')
    })
    .join('\n')
}

async function gitShow(ctx, args) {
  const { opts, paths } = splitArgs(args)
  let mode = 'patch'
  const revs = []
  for (const o of opts) {
    if (o === '--stat') mode = 'stat'
    else if (o === '--numstat') mode = 'numstat'
    else if (o === '--name-only') mode = 'name-only'
    else if (o === '-s' || o === '--no-patch') mode = 'none'
    else if (o.startsWith('-')) fail(`git show ${o} is not available in this case. Type help.`)
    else revs.push(o)
  }
  const commit = await resolve(ctx, revs[0] || 'HEAD')
  const files = filesOf(commit, paths)
  const top = header(ctx, commit)

  if (mode === 'none') return top
  if (isMerge(commit) && !files.length) {
    return `${top}\n\n(a merge commit: it joins two branches. Try git cat-file -p ${shortSha(commit.sha)} to see its parents.)`
  }
  if (mode === 'name-only') return `${top}\n\n${files.map((f) => f.filename).join('\n')}`
  if (mode === 'numstat') {
    return `${top}\n\n${files.map((f) => { const { add, del } = countLines(f); return `${add}\t${del}\t${f.filename}` }).join('\n')}`
  }
  if (mode === 'stat') {
    const width = Math.max(...files.map((f) => f.filename.length), 1)
    const rows = files.map((f) => {
      const { add, del } = countLines(f)
      return ` ${f.filename.padEnd(width)} | ${String(add + del).padStart(3)} ${'+'.repeat(Math.min(add, 30))}${'-'.repeat(Math.min(del, 30))}`
    })
    const totals = files.reduce((t, f) => { const c = countLines(f); return { add: t.add + c.add, del: t.del + c.del } }, { add: 0, del: 0 })
    rows.push(` ${files.length} file${files.length === 1 ? '' : 's'} changed, ${totals.add} insertions(+), ${totals.del} deletions(-)`)
    return `${top}\n\n${rows.join('\n')}`
  }
  return `${top}\n\n${patchText(files)}`
}

async function gitDiff(ctx, args) {
  const { opts, paths } = splitArgs(args)
  const revs = opts.filter((o) => !o.startsWith('-'))
  let target
  if (revs.length === 1 && revs[0].endsWith('^!')) target = await resolve(ctx, revs[0].slice(0, -2))
  else if (revs.length === 2) {
    const [from, to] = await Promise.all(revs.map((r) => resolve(ctx, r)))
    if (to.parents[0]?.sha !== from.sha) {
      fail('Only one commit at a time here: git diff <commit>^ <commit>')
    }
    target = to
  } else fail('Usage here: git diff <commit>^ <commit> [-- <file>]')
  return patchText(filesOf(target, paths))
}

async function gitCatFile(ctx, args) {
  if (args[0] !== '-p' || !args[1]) fail('Usage here: git cat-file -p <commit>')
  const commit = await resolve(ctx, args[1])
  const v = view(ctx, commit)
  const when = Math.floor(new Date(commitDate(commit)).getTime() / 1000)
  return [
    `tree ${commit.commit.tree?.sha || '(unknown)'}`,
    ...commit.parents.map((p) => `parent ${p.sha}`),
    `author ${v.who} ${when} +0000`,
    `committer ${v.who} ${when} +0000`,
    '',
    v.message.trimEnd(),
  ].join('\n')
}

async function gitShortlog(ctx, args) {
  const { opts, paths } = splitArgs(args)
  if (!opts.includes('-sn') && !(opts.includes('-s') && opts.includes('-n'))) {
    fail('Usage here: git shortlog -sn [-- <file>]')
  }
  const source = paths.length
    ? (await getFileHistory(ctx.owner, ctx.repo, paths[0])).filter((c) => !isMerge(c))
    : (await allCommits(ctx)).filter((c) => !isMerge(c))
  const counts = new Map()
  let skippedHidden = false
  for (const c of source) {
    const v = view(ctx, c)
    if (v.hiddenAuthor) {
      skippedHidden = true
      continue
    }
    counts.set(v.name, (counts.get(v.name) || 0) + 1)
  }
  if (!counts.size) return '(no commits)'
  const table = [...counts]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name, n]) => `${String(n).padStart(6)}\t${name}`)
    .join('\n')
  return skippedHidden ? `${table}\n(${shortSha(ctx.mask.sha)} is not counted: its author is what you're investigating)` : table
}
