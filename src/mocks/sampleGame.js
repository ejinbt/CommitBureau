/**
 * Sample game mock conforming to docs/CONTRACT.md
 * Provides 5 realistic Git commit investigation rounds and mock engine methods.
 */

export const SAMPLE_ROUNDS = [
  {
    id: "r1",
    level: 1,
    type: "real_or_fake",
    prompt: "A critical lock was refactored in kernel/sched/core.c. Which commit message is genuine?",
    evidence: {
      diff: `--- a/kernel/sched/core.c
+++ b/kernel/sched/core.c
@@ -1042,6 +1042,8 @@ static void sched_ttwu_do_wakeup(struct rq *rq, struct task_struct *p)
+	/* Ensure runqueue lock is held before modifying state */
+	lockdep_assert_held(&rq->__lock);
 	trace_sched_wakeup(p);`,
      author: null,
      date: "2023-11-14",
      file: "kernel/sched/core.c"
    },
    options: [
      "sched/core: Assert rq->__lock is held in sched_ttwu_do_wakeup",
      "docs: Update scheduler locking guidelines in Documentation/scheduler.rst",
      "sched/fair: Refactor fair queue runtime latency calculation",
      "kernel: Bump kernel patch level version to 6.6.2"
    ],
    answer: 0,
    explanation: "The diff adds a lockdep_assert_held(&rq->__lock) assertion directly before tracing wakeup, verifying lock ownership.",
    hint: "Observe the assertion macro added on the + line.",
    command: "git show 5f83b2a"
  },
  {
    id: "r2",
    level: 1,
    type: "who_did_it",
    prompt: "This commit introduced hooks into the reconciler. Who authored this commit?",
    evidence: {
      diff: `--- a/packages/react-reconciler/src/ReactFiberHooks.js
+++ b/packages/react-reconciler/src/ReactFiberHooks.js
@@ -48,6 +48,9 @@ export function useState(initialState) {
+  const dispatcher = resolveDispatcher();
+  return dispatcher.useState(initialState);
 }`,
      author: null,
      date: "2018-10-25",
      file: "packages/react-reconciler/src/ReactFiberHooks.js"
    },
    options: [
      "Dan Abramov (gaearon)",
      "Linus Torvalds",
      "Guido van Rossum",
      "Brendan Eich"
    ],
    answer: 0,
    explanation: "Dan Abramov and the React core team introduced React Hooks at React Conf in late October 2018.",
    hint: "Think of the co-creator of Redux who worked on the React team during the Hooks launch.",
    command: "git log -1 --format=\"%an <%ae>\" 8b067a9"
  },
  {
    id: "r3",
    level: 1,
    type: "lines_changed",
    prompt: "Examine the diff in security.js. How many lines were added and removed?",
    evidence: {
      diff: `--- a/src/utils/security.js
+++ b/src/utils/security.js
@@ -12,4 +12,5 @@ function sanitizeInput(raw) {
-  return raw.replace(/<script>/gi, '');
+  if (!raw || typeof raw !== 'string') return '';
+  return raw.replace(/<[^>]*>?/gm, '').trim();
 }`,
      author: "alex-dev",
      date: "2024-01-19",
      file: "src/utils/security.js"
    },
    options: [
      "+2 added, -1 removed",
      "+3 added, -2 removed",
      "+1 added, -1 removed",
      "+4 added, -0 removed"
    ],
    answer: 0,
    explanation: "Line 12 was removed (-1) and 2 new validation lines were inserted (+2).",
    hint: "Count the lines starting with '+' vs lines starting with '-'.",
    command: "git diff --stat HEAD~1 HEAD"
  },
  {
    id: "r4",
    level: 1,
    type: "which_file",
    prompt: "This commit strips legacy vendor-prefixed styles. Which file was modified?",
    evidence: {
      diff: `@@ -88,5 +88,0 @@
--webkit-box-shadow: 0 2px 4px rgba(0,0,0,0.2);
--moz-box-shadow: 0 2px 4px rgba(0,0,0,0.2);
-box-shadow: 0 2px 4px rgba(0,0,0,0.2);`,
      author: "css-detective",
      date: "2023-08-11",
      file: null
    },
    options: [
      "src/styles/components/dossier.css",
      "src/engine/scoring.js",
      "public/manifest.json",
      "docs/ARCH.md"
    ],
    answer: 0,
    explanation: "The snippet removes CSS box-shadow declarations, belonging to a stylesheet.",
    hint: "The deleted syntax consists of CSS properties and vendor prefixes.",
    command: "git show --name-only 4d92a18"
  },
  {
    id: "r5",
    level: 1,
    type: "first_or_later",
    prompt: "Two commits touch the auth pipeline. Which commit was authored earlier?",
    evidence: {
      diff: `Commit A [1a7c29d]: "auth: implement JWT verification middleware" (2023-04-10)
Commit B [9e8b11c]: "auth: add refresh token rotation support" (2023-06-15)`,
      author: "lead-maintainer",
      date: null,
      file: "src/middleware/auth.js"
    },
    options: [
      "Commit A (1a7c29d - April 2023)",
      "Commit B (9e8b11c - June 2023)",
      "They were authored in the same merge commit",
      "Commit B is the parent of Commit A"
    ],
    answer: 0,
    explanation: "Commit A occurred on April 10, 2023, which is earlier than Commit B on June 15, 2023.",
    hint: "Check the calendar date inside the commit timestamps.",
    command: "git log --oneline --graph src/middleware/auth.js"
  }
];

export const FEATURED_REPOS = [
  {
    owner: "torvalds",
    repo: "linux",
    title: "Linux Kernel",
    description: "The monolith operating system kernel started in 1991 by Linus Torvalds.",
    tag: "High Difficulty"
  },
  {
    owner: "facebook",
    repo: "react",
    title: "React",
    description: "The web UI library that popularized component-based declarative architecture.",
    tag: "Popular"
  },
  {
    owner: "git",
    repo: "git",
    title: "Git Core",
    description: "The very source code of the distributed version control system.",
    tag: "Meta"
  },
  {
    owner: "pallets",
    repo: "flask",
    title: "Flask",
    description: "A lightweight WSGI web application framework in Python.",
    tag: "Python Classic"
  }
];

/**
 * Initializes a game session.
 * Contract: buildGame({ owner, repo }, level) -> Promise<Round[]>
 */
export async function buildGame({ owner, repo }, level = 1) {
  // Simulate brief network delay for realism
  await new Promise((resolve) => setTimeout(resolve, 400));

  if (!owner || !repo) {
    throw new Error("Invalid repository target. Please specify owner and repository name.");
  }

  // Clone sample rounds with repo name injected
  return SAMPLE_ROUNDS.map((r, i) => ({
    ...r,
    level,
    id: `round-${i + 1}`,
    repo: `${owner}/${repo}`
  }));
}

export const HINT_PENALTY = 50;

/**
 * Scores a round answer and updates game state.
 * Contract: scoreAnswer(state, round, pickedIndex, usedHint) -> new game state
 */
export function scoreAnswer(state, round, pickedIndex, usedHint = false) {
  const isCorrect = pickedIndex === round.answer;
  const currentStreak = isCorrect ? (state?.streak || 0) + 1 : 0;
  const maxStreak = Math.max(currentStreak, state?.maxStreak || 0);

  // Scoring logic:
  // Correct answer: 100 base + (streak * 20) bonus - (hint penalty: 50)
  let roundPoints = 0;
  if (isCorrect) {
    roundPoints = 100 + (currentStreak - 1) * 20 - (usedHint ? HINT_PENALTY : 0);
    if (roundPoints < 20) roundPoints = 20; // minimum floor
  }

  const newScore = (state?.score || 0) + roundPoints;
  const roundResults = [
    ...(state?.answers || []),
    {
      roundId: round.id,
      type: round.type,
      isCorrect,
      pickedIndex,
      usedHint,
      points: roundPoints
    }
  ];

  return {
    ...(state || {}),
    score: newScore,
    streak: currentStreak,
    maxStreak,
    answers: roundResults
  };
}

/**
 * Generates final debrief report.
 * Contract: finalReport(state, level) -> { score, percent, rank, unlocked, skills }
 */
export function finalReport(state, level = state?.level || 1) {
  const answers = state?.answers || [];
  const total = answers.length || 5;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const percent = total ? Math.round((correctCount / total) * 100) : 0;

  const unlocked = percent >= 80;
  const RANKS = ['Rookie', 'Officer', 'Detective', 'Inspector', 'Chief'];
  const rank = RANKS[Math.min(unlocked ? level : level - 1, RANKS.length - 1)];

  // Skills aggregation
  const skillMap = {};
  answers.forEach((ans) => {
    const key = ans.type || "general";
    if (!skillMap[key]) {
      skillMap[key] = { correct: 0, total: 0 };
    }
    skillMap[key].total += 1;
    if (ans.isCorrect) skillMap[key].correct += 1;
  });

  const skills = Object.entries(skillMap).map(([type, stats]) => ({
    type,
    label: formatSkillLabel(type),
    ratio: `${stats.correct}/${stats.total}`,
    percentage: Math.round((stats.correct / stats.total) * 100)
  }));

  return {
    score: state?.score || 0,
    correctCount,
    totalCount: total,
    percent,
    rank,
    unlocked,
    skills
  };
}

function formatSkillLabel(type) {
  switch (type) {
    case "real_or_fake":
      return "Commit Verification";
    case "who_did_it":
      return "Author Forensics";
    case "lines_changed":
      return "Diff Analysis";
    case "which_file":
      return "Path Recognition";
    case "first_or_later":
      return "Timeline Sequencing";
    default:
      return type.replace(/_/g, " ");
  }
}

/**
 * Fetches repos for "My Archive" mode.
 * Contract: getUserRepos(username) -> Promise<Repo[]>
 */
export async function getUserRepos(username) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (!username) return [];

  return [
    // Same shape as the real engine (docs/CONTRACT.md): { owner, repo, description, language, pushedAt, fork }
    {
      owner: username,
      repo: `${username}-portfolio`,
      description: "Personal portfolio website built with React and Tailwind",
      language: "JavaScript",
      pushedAt: "2024-02-10T12:00:00Z",
      fork: false
    },
    {
      owner: username,
      repo: `mini-compiler`,
      description: "A small toy compiler written in JavaScript",
      language: "JavaScript",
      pushedAt: "2023-11-20T15:30:00Z",
      fork: false
    },
    {
      owner: username,
      repo: `hackathon-notes`,
      description: "Quick notes and scripts from weekend hacks",
      language: null,
      pushedAt: "2023-05-04T09:12:00Z",
      fork: false
    }
  ];
}
