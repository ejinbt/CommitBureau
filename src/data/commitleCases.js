/**
 * COMMITLE / The Daily Git Forensics Dossier
 * Wordle-style daily 5-letter Git Forensics puzzles.
 * Deterministic daily rotation synchronized by UTC date.
 */

export const COMMITLE_TARGETS = [
  {
    dayNumber: 1,
    word: 'RESET',
    repo: 'torvalds/linux',
    brief: 'A rogue author pushed unfinished commits to HEAD. What 5-letter Git command rewinds the commit tree while preserving working files?',
    command: 'git reset --soft HEAD~1',
    hint: 'Opposite of advance; rewinds the current HEAD branch pointer.',
    explanation: 'git reset moves the current branch HEAD to a specified state, letting you undo commits cleanly.'
  },
  {
    dayNumber: 2,
    word: 'BLAME',
    repo: 'facebook/react',
    brief: 'A memory leak was introduced in fiber reconciliation. What 5-letter Git command reveals which author modified each line?',
    command: 'git blame -L 42,60 src/ReactFiber.js',
    hint: 'Point fingers; shows author, commit hash, and timestamp for each line.',
    explanation: 'git blame annotates each line in a file with the commit and author who last changed it.'
  },
  {
    dayNumber: 3,
    word: 'MERGE',
    repo: 'microsoft/vscode',
    brief: 'Two engineers completed feature branches simultaneously. What 5-letter Git command joins both branches into the current branch?',
    command: 'git merge feature/copilot-bridge',
    hint: 'Combines two separate branch histories into one commit.',
    explanation: 'git merge integrates changes from the named branch into the current checked-out branch.'
  },
  {
    dayNumber: 4,
    word: 'CLONE',
    repo: 'nodejs/node',
    brief: 'An investigator needs a fresh local copy of an entire upstream repository. What 5-letter Git command downloads it?',
    command: 'git clone https://github.com/nodejs/node.git',
    hint: 'Makes a complete replica of a remote repo on your local machine.',
    explanation: 'git clone copies a repository along with its commit history, branches, and tags.'
  },
  {
    dayNumber: 5,
    word: 'STASH',
    repo: 'kubernetes/kubernetes',
    brief: 'Urgent hotfix required, but your working directory has uncommitted modifications. What 5-letter Git command shelves them temporarily?',
    command: 'git stash save "wip-controller"',
    hint: 'Hides dirty working state away so you can work on a clean tree.',
    explanation: 'git stash temporarily shelves changes so you can switch branches without committing unfinished work.'
  },
  {
    dayNumber: 6,
    word: 'PATCH',
    repo: 'git/git',
    brief: 'A vulnerability fix was mailed as a unified diff file. What 5-letter Git command applies this delta directly to the tree?',
    command: 'git apply security-fix.patch',
    hint: 'A compact file describing differences that can be applied to code.',
    explanation: 'git patch / git apply takes a recorded diff format and applies code changes to working files.'
  },
  {
    dayNumber: 7,
    word: 'STAGE',
    repo: 'rust-lang/rust',
    brief: 'Before creating a commit snapshot, modified files must be added to index. What 5-letter Git verb describes this operation?',
    command: 'git add -p compiler/rustc_middle',
    hint: 'Prepares modified files in the index before commit snapshot.',
    explanation: 'Staging files moves modified files into the Git index preparing them for snapshot.'
  },
  {
    dayNumber: 8,
    word: 'FETCH',
    repo: 'python/cpython',
    brief: 'You want to inspect remote branches without touching or modifying your working directory. What 5-letter Git command is used?',
    command: 'git fetch origin main',
    hint: 'Retrieves remote objects and refs without auto-merging.',
    explanation: 'git fetch downloads commits, files, and refs from a remote repository without merging them.'
  },
  {
    dayNumber: 9,
    word: 'CLEAN',
    repo: 'golang/go',
    brief: 'Build artifacts and untracked binaries are cluttering the workspace. What 5-letter Git command removes untracked debris?',
    command: 'git clean -fd',
    hint: 'Removes untracked files from the working tree.',
    explanation: 'git clean sweeps away untracked files and directories from your working directory.'
  },
  {
    dayNumber: 10,
    word: 'ABORT',
    repo: 'vuejs/core',
    brief: 'A three-way merge resulted in messy conflicts. What 5-letter Git flag cancels the merge and restores the pre-merge branch state?',
    command: 'git merge --abort',
    hint: 'Stops the merge and returns to the exact state before merging started.',
    explanation: 'The --abort flag safely halts a conflicted merge or rebase, restoring the baseline commit.'
  },
  {
    dayNumber: 11,
    word: 'DIFFS',
    repo: 'django/django',
    brief: 'An auditor wants to inspect textual line deltas between two releases. What 5-letter Git plural noun describes these deltas?',
    command: 'git diff v4.2.0..v5.0.0',
    hint: 'Displays changes between commits, commit and working tree, etc.',
    explanation: 'Git diffs show line-by-line additions and deletions between branches or commit points.'
  },
  {
    dayNumber: 12,
    word: 'TRACK',
    repo: 'neovim/neovim',
    brief: 'You branched off main and want upstream pull notifications. What 5-letter verb sets up remote branch linkage?',
    command: 'git branch --set-upstream-to=origin/main',
    hint: 'Links a local branch to an upstream counterpart.',
    explanation: 'Tracking branches maintain an explicit relationship between local branch and remote branch.'
  },
  {
    dayNumber: 13,
    word: 'HOOKS',
    repo: 'denoland/deno',
    brief: 'Security wants pre-commit linter checks to run automatically. What 5-letter Git feature folder handles lifecycle triggers?',
    command: 'cat .git/hooks/pre-commit',
    hint: 'Custom executable scripts Git executes before or after actions.',
    explanation: 'Git hooks are event-driven scripts that run automatically during commit, push, and receive operations.'
  },
  {
    dayNumber: 14,
    word: 'FORCE',
    repo: 'oven-sh/bun',
    brief: 'A corrupted commit was amended locally. What 5-letter flag forces the remote to accept the rewritten history with lease check?',
    command: 'git push --force-with-lease',
    hint: 'Overrides remote branch ref, disabling fast-forward safety check.',
    explanation: 'git push --force allows rewriting remote history, recommended with --force-with-lease for safety.'
  }
];

// Valid 5-letter words accepted as guesses (Git & Tech terminology)
export const VALID_GUESSES = new Set([
  'RESET', 'BLAME', 'MERGE', 'CLONE', 'STASH', 'PATCH', 'STAGE', 'FETCH',
  'CLEAN', 'ABORT', 'DIFFS', 'TRACK', 'HOOKS', 'FORCE', 'CHECK', 'REVERT',
  'PULLS', 'CHERRY', 'TREES', 'NODES', 'REFSX', 'BLOBS', 'LOGGS', 'INDEX',
  'GRAPH', 'DELTA', 'SQUASH', 'TAGGS', 'HEADS', 'BRANCH', 'REMOTE', 'ORIGIN',
  'PROXY', 'TOKEN', 'LOGIN', 'BUILDS', 'LINTS', 'CODES', 'BYTES', 'DEBUG',
  'STACK', 'CACHE', 'FILES', 'LINES', 'FIXES', 'CRASH', 'ALERT', 'FAULT',
  'PANIC', 'PIPES', 'PORTS', 'PARSE', 'SHELL', 'ROUTE', 'ASYNC', 'AWAIT',
  'SCOPE', 'CLASS', 'STATE', 'STORE', 'VALUE', 'PARAM', 'QUERY', 'CLICK',
  'DRIVE', 'ENTER', 'SHIFT', 'SPACE', 'MACRO', 'LINUX', 'REACT', 'RUSTY',
  'NODES', 'SWIFT', 'CLEAN', 'CLOSE', 'WRITE', 'READS', 'PRINT', 'FLUSH',
  'ABORT', 'CHDIR', 'UNSET', 'ALIAS', 'BATCH', 'TRUNC', 'POSIX', 'EPOCH',
  'AUDIT', 'GUARD', 'CIPHER', 'SHAH1', 'SHAH2', 'KEYED', 'SIGNS', 'TRUST'
]);

/**
 * Get deterministic daily case based on days elapsed since launch epoch
 */
export function getDailyCommitleCase(customDate = new Date()) {
  const epoch = new Date('2026-01-01T00:00:00Z');
  const now = new Date(Date.UTC(customDate.getFullYear(), customDate.getMonth(), customDate.getDate()));
  const dayIndex = Math.max(0, Math.floor((now - epoch) / (1000 * 60 * 60 * 24)));
  
  const caseData = COMMITLE_TARGETS[dayIndex % COMMITLE_TARGETS.length];
  return {
    ...caseData,
    dayNumber: dayIndex + 1,
    dateString: now.toISOString().split('T')[0]
  };
}

/**
 * Evaluate Wordle guess against target
 * Returns array of { letter, status: 'correct' | 'present' | 'absent' }
 */
export function evaluateCommitleGuess(guess, target) {
  const result = [];
  const targetArr = target.split('');
  const guessArr = guess.split('');
  const targetRemaining = {};

  // First pass: identify correct matches
  for (let i = 0; i < 5; i++) {
    const letter = guessArr[i];
    if (letter === targetArr[i]) {
      result[i] = { letter, status: 'correct' };
    } else {
      targetRemaining[targetArr[i]] = (targetRemaining[targetArr[i]] || 0) + 1;
    }
  }

  // Second pass: identify present vs absent
  for (let i = 0; i < 5; i++) {
    if (!result[i]) {
      const letter = guessArr[i];
      if (targetRemaining[letter] > 0) {
        result[i] = { letter, status: 'present' };
        targetRemaining[letter]--;
      } else {
        result[i] = { letter, status: 'absent' };
      }
    }
  }

  return result;
}
