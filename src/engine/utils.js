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

export function firstLine(message) {
  return (message || '').split('\n')[0].trim()
}

export function shortSha(sha) {
  return sha.slice(0, 7)
}

export function authorName(commit) {
  return commit.commit.author?.name || commit.author?.login || 'unknown'
}

export function commitDate(commit) {
  return commit.commit.author?.date || commit.commit.committer?.date
}

export function isMerge(commit) {
  return commit.parents.length > 1
}

export function makeOptions(correct, wrong) {
  const options = shuffle([correct, ...wrong])
  return { options, answer: options.indexOf(correct) }
}

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

export function isBot(name) {
  return name.endsWith('[bot]')
}

const MAX_LOG_MESSAGE = 72

export function clipMessage(commit, max = MAX_LOG_MESSAGE) {
  const msg = firstLine(commit.commit.message)
  return msg.length > max ? msg.slice(0, max - 1) + '…' : msg
}

export function logLine(commit) {
  return `${shortSha(commit.sha)} ${clipMessage(commit)}`
}

export function newestFirst(commits) {
  return [...commits].sort((a, b) => (commitDate(b) > commitDate(a) ? 1 : commitDate(b) < commitDate(a) ? -1 : 0))
}
