// Small helpers shared by the case generators.

export function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// Commit messages can be many lines. The first line is the summary.
export function firstLine(message) {
  return (message || '').split('\n')[0].trim()
}

export function shortSha(sha) {
  return sha.slice(0, 7)
}

// The git author name is always present; the GitHub login is null if the email isn't linked to an account.
export function authorName(commit) {
  return commit.commit.author?.name || commit.author?.login || 'unknown'
}

export function commitDate(commit) {
  return commit.commit.author?.date || commit.commit.committer?.date
}

// A merge commit has two parents: the branch it was on and the branch merged in.
export function isMerge(commit) {
  return commit.parents.length > 1
}

// Shuffle the correct option in with the wrong ones and remember where it landed.
export function makeOptions(correct, wrong) {
  const options = shuffle([correct, ...wrong])
  return { options, answer: options.indexOf(correct) }
}

// Keep the first `count` values that are not the correct one and not repeats (case-insensitive).
export function uniqueOthers(values, correct, count) {
  const seen = new Set([correct.toLowerCase()])
  const out = []
  for (const v of values) {
    const key = v.toLowerCase()
    if (!v || seen.has(key)) continue
    seen.add(key)
    out.push(v)
    if (out.length === count) break
  }
  return out
}

// Bots like dependabot[bot] would give "who" questions away, so only humans count.
export function isBot(name) {
  return name.endsWith('[bot]')
}

const MAX_LOG_MESSAGE = 72

// A commit summary clipped to fit one line of log output.
export function clipMessage(commit, max = MAX_LOG_MESSAGE) {
  const msg = firstLine(commit.commit.message)
  return msg.length > max ? msg.slice(0, max - 1) + '…' : msg
}

// One line of `git log --oneline`: short sha + summary.
export function logLine(commit) {
  return `${shortSha(commit.sha)} ${clipMessage(commit)}`
}

// Newest first, the order git log prints.
export function newestFirst(commits) {
  return [...commits].sort((a, b) => (commitDate(b) > commitDate(a) ? 1 : commitDate(b) < commitDate(a) ? -1 : 0))
}
