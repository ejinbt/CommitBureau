export const RANKS = ['Rookie', 'Officer', 'Detective', 'Inspector', 'Chief']
export const PASS_PERCENT = 80

const POINTS_CORRECT = 100
export const HINT_PENALTY = 50
const STREAK_BONUS = 25
const MAX_STREAK_BONUS = 100

export const SKILL_LABELS = {
  real_or_fake: 'Reading commit messages',
  who_did_it: 'Finding the author',
  first_or_later: 'Commit order',
  lines_changed: 'Counting changes',
  which_file: 'Matching a diff to its file',
  spot_deleted_line: 'Reading + and - lines',
  who_touched_most: 'Who owns a file',
  which_commit_created: 'Where a file began',
  merge_or_normal: 'Spotting merge commits',
  who_merged: 'Who merged a pull request',
  merged_branch_parent: 'Reading merge parents',
  undo: 'Undoing changes',
  wrong_branch: 'Fixing the wrong branch',
  bisect: 'Hunting bugs with bisect',
  revert: 'Undoing shared commits',
  stash: 'Stashing work',
  cherry_pick: 'Cherry-picking',
  recover: 'Recovering lost commits',
  inspect: 'Inspecting changes',
}

export function newGame(level = 1) {
  return { level, score: 0, streak: 0, maxStreak: 0, answers: [], last: null }
}

export function scoreAnswer(state, round, pickedIndex, usedHint = false) {
  const isCorrect = pickedIndex === round.answer
  const streak = isCorrect ? (state.streak || 0) + 1 : 0

  let points = 0
  if (isCorrect) {
    points = POINTS_CORRECT - (usedHint ? HINT_PENALTY : 0)
    points += Math.min((streak - 1) * STREAK_BONUS, MAX_STREAK_BONUS)
  }

  return {
    ...state,
    score: (state.score || 0) + points,
    streak,
    maxStreak: Math.max(state.maxStreak || 0, streak),
    answers: [...(state.answers || []), { roundId: round.id, type: round.type, isCorrect, pickedIndex, usedHint, points }],
    last: { isCorrect, points },
  }
}

export function finalReport(state, level = state.level || 1) {
  const answers = state.answers || []
  const totalCount = answers.length
  const correctCount = answers.filter((a) => a.isCorrect).length
  const percent = totalCount ? Math.round((correctCount / totalCount) * 100) : 0
  const unlocked = percent >= PASS_PERCENT

  const rank = RANKS[Math.min(unlocked ? level : level - 1, RANKS.length - 1)]

  const byType = {}
  for (const a of answers) {
    byType[a.type] ??= { type: a.type, label: SKILL_LABELS[a.type] || a.type, correct: 0, total: 0 }
    byType[a.type].total++
    if (a.isCorrect) byType[a.type].correct++
  }
  const skills = Object.values(byType).map((s) => ({
    ...s,
    ratio: `${s.correct}/${s.total}`,
    percentage: Math.round((s.correct / s.total) * 100),
  }))

  const weakest = skills.filter((s) => s.correct < s.total).sort((x, y) => x.percentage - y.percentage)[0]

  return {
    score: state.score || 0,
    correctCount,
    totalCount,
    percent,
    rank,
    unlocked,
    maxStreak: state.maxStreak || 0,
    skills,
    suggestion: weakest ? `Practise: ${weakest.label}` : 'Clean sheet. Try the next level.',
  }
}
