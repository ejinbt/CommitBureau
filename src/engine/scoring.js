// Scoring rules. Game state is a plain object; every function returns a new one instead of changing it,
// which is what React state expects.

export const RANKS = ['Rookie', 'Officer', 'Detective', 'Inspector', 'Chief']
export const PASS_PERCENT = 80

const POINTS_CORRECT = 100
const HINT_PENALTY = 50
const STREAK_BONUS = 25 // per answer in a row after the first
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
}

export function newGame(level = 1) {
  return { level, score: 0, streak: 0, bestStreak: 0, answers: [], last: null }
}

export function scoreAnswer(state, round, pickedIndex, usedHint) {
  const correct = pickedIndex === round.answer
  const streak = correct ? state.streak + 1 : 0

  let points = 0
  if (correct) {
    points = POINTS_CORRECT - (usedHint ? HINT_PENALTY : 0)
    points += Math.min((streak - 1) * STREAK_BONUS, MAX_STREAK_BONUS)
  }

  return {
    ...state,
    score: state.score + points,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    answers: [...state.answers, { roundId: round.id, type: round.type, correct, usedHint }],
    last: { correct, points },
  }
}

export function finalReport(state) {
  const total = state.answers.length
  const correctCount = state.answers.filter((a) => a.correct).length
  const percent = total ? Math.round((correctCount / total) * 100) : 0
  const unlocked = percent >= PASS_PERCENT

  // Level 1 is Rookie. Passing a level promotes you to the next rank, up to Chief.
  const rank = RANKS[Math.min(unlocked ? state.level : state.level - 1, RANKS.length - 1)]

  // Skills report: right answers per question type, e.g. "Finding the author 1/2".
  const skills = {}
  for (const a of state.answers) {
    skills[a.type] ??= { label: SKILL_LABELS[a.type] || a.type, correct: 0, total: 0 }
    skills[a.type].total++
    if (a.correct) skills[a.type].correct++
  }

  // Suggest replaying the weakest question type.
  const weakest = Object.values(skills)
    .filter((s) => s.correct < s.total)
    .sort((x, y) => x.correct / x.total - y.correct / y.total)[0]

  return {
    score: state.score,
    correctCount,
    total,
    percent,
    rank,
    unlocked,
    bestStreak: state.bestStreak,
    skills,
    suggestion: weakest ? `Practise: ${weakest.label}` : 'Clean sheet. Try the next level.',
  }
}
