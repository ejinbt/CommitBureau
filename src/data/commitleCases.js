/**
 * COMMITLE / The Daily Git Forensics Dossier
 * Wordle-style daily puzzle: a terminal session from Case Zero (Night Owl Cafe, the game's fictional
 * demo repo) with one git command redacted. The player reads the real Git output and works out which
 * 5-letter command printed it. Every answer is a real git command, so solving it teaches real Git.
 *
 * In `terminal`, lines starting with "$ " are commands. {{?}} marks the redacted 5-letter command.
 */

export const COMMITLE_TARGETS = [
  {
    word: 'STASH',
    brief: 'Mara had half-finished menu changes when an urgent bug came in. She ran one command and her working tree was clean again, with nothing committed.',
    hint: 'It puts work on a shelf so you can come back to it later.',
    command: 'git stash',
    explanation: 'git stash saves uncommitted changes and cleans the working tree. git stash pop brings them back.',
    terminal: [
      '$ git {{?}}',
      'Saved working directory and index state WIP on main: 2370e68 Remember the cart between visits',
    ],
  },
  {
    word: 'BLAME',
    brief: 'The cart total on line 9 looks suspicious. Someone asked Git who last touched that exact line.',
    hint: 'Line by line, it names the commit and the author behind each line.',
    command: 'git blame -L 9,9 src/cart.js',
    explanation: 'git blame shows, for each line of a file, the commit, author and date that last changed it.',
    terminal: [
      '$ git {{?}} -L 9,9 src/cart.js',
      'd81ffcd5 (Ines Duarte 2026-03-15 10:25:00 +0000 9)   const total = cart.reduce((sum, item) => sum + (item.price || 0), 0)',
    ],
  },
  {
    word: 'MERGE',
    brief: "Sam brought Mara's finished oat milk branch into main. Git combined the two histories on its own.",
    hint: 'It joins another branch into the one you are on.',
    command: 'git merge mquinn/oat-milk',
    explanation: "git merge joins another branch's history into the current branch, creating a merge commit when needed.",
    terminal: [
      '$ git {{?}} mquinn/oat-milk',
      "Merge made by the 'ort' strategy.",
      ' src/menu.js | 3 +++',
      ' 1 file changed, 3 insertions(+)',
    ],
  },
  {
    word: 'RESET',
    brief: 'Theo committed too early. One command later, the commit was gone but his edits were still in the file, waiting to be committed again.',
    hint: 'It moves the branch pointer back. HEAD~1 means one commit back.',
    command: 'git reset HEAD~1',
    explanation: 'git reset moves the current branch to another commit. The default (--mixed) keeps your edits as unstaged changes.',
    terminal: [
      '$ git {{?}} HEAD~1',
      'Unstaged changes after reset:',
      'M\tserver/orders.js',
    ],
  },
  {
    word: 'FETCH',
    brief: "Ines wanted to see what the team pushed overnight without touching her own branch. Git downloaded the new commits and moved only the remote's pointer.",
    hint: 'It downloads from the remote but does not merge anything.',
    command: 'git fetch origin',
    explanation: 'git fetch downloads new commits from a remote and updates origin/main, without changing your branch. git pull is fetch plus merge.',
    terminal: [
      '$ git {{?}} origin',
      'remote: Enumerating objects: 5, done.',
      'remote: Counting objects: 100% (5/5), done.',
      'remote: Total 3 (delta 2), reused 0 (delta 0)',
      'Unpacking objects: 100% (3/3), 412 bytes | 41.00 KiB/s, done.',
      'From github.com:commitbureau/case-zero',
      '   2370e68..0b3b979  main       -> origin/main',
    ],
  },
  {
    word: 'CLEAN',
    brief: 'The project folder was full of leftover files Git had never tracked. Before deleting anything, Mara asked Git to list what it would remove.',
    hint: 'It deletes untracked files. -n means "just tell me, don\'t do it".',
    command: 'git clean -n',
    explanation: 'git clean removes untracked files. -n is a dry run that only lists them; -f actually deletes.',
    terminal: [
      '$ git {{?}} -n',
      'Would remove debug.log',
      'Would remove notes.txt',
    ],
  },
  {
    word: 'CLONE',
    brief: 'A new developer joined the cafe team. Their first command copied the whole repository, history and all, onto their laptop.',
    hint: 'It makes a full local copy of a remote repository.',
    command: 'git clone https://github.com/commitbureau/case-zero.git',
    explanation: 'git clone copies a repository with its full history and sets up origin to point back to it.',
    terminal: [
      '$ git {{?}} https://github.com/commitbureau/case-zero.git',
      "Cloning into 'case-zero'...",
      'remote: Enumerating objects: 64, done.',
      'remote: Counting objects: 100% (64/64), done.',
      'Receiving objects: 100% (64/64), 9.81 KiB | 2.45 MiB/s, done.',
      'Resolving deltas: 100% (17/17), done.',
    ],
  },
  {
    word: 'APPLY',
    brief: 'Ines received the NaN fix as a .patch file by email. Before using it, she checked which files it would change.',
    hint: 'It takes a patch file and applies its changes to your files.',
    command: 'git apply --stat fix-total.patch',
    explanation: 'git apply applies a patch file to the working tree. --stat only summarises what it would change.',
    terminal: [
      '$ git {{?}} --stat fix-total.patch',
      ' src/cart.js | 2 +-',
      ' 1 file changed, 1 insertion(+), 1 deletion(-)',
    ],
  },
  {
    word: 'NOTES',
    brief: 'After review, Sam attached a remark to a commit without changing the commit itself. Later, someone read it back.',
    hint: 'Extra text attached to a commit, stored separately from its message.',
    command: 'git notes show 0b3b979',
    explanation: 'git notes attaches extra information to commits without rewriting them. git notes show prints a note.',
    terminal: [
      '$ git {{?}} show 0b3b979',
      'Reviewed by Sam. Safe to deploy before the Friday rush.',
    ],
  },
  {
    word: 'PRUNE',
    brief: "Mara's oat milk branch was deleted on GitHub, but her laptop still listed it. One command removed the stale reference.",
    hint: 'It trims away references to remote branches that no longer exist.',
    command: 'git remote prune origin',
    explanation: 'git remote prune deletes local remote-tracking branches whose branch is gone on the remote.',
    terminal: [
      '$ git remote {{?}} origin',
      'Pruning origin',
      'URL: git@github.com:commitbureau/case-zero.git',
      ' * [pruned] origin/mquinn/oat-milk',
    ],
  },
  {
    word: 'STAGE',
    brief: 'Theo marked his order API fix to go into the next commit. The status afterwards shows the file ready to commit.',
    hint: 'Another name for git add.',
    command: 'git stage server/orders.js',
    explanation: 'git stage is a built-in synonym for git add: it puts changes in the staging area for the next commit.',
    terminal: [
      '$ git {{?}} server/orders.js',
      '$ git status --short',
      'M  server/orders.js',
    ],
  },
  {
    word: 'STASH',
    brief: 'Mara had been shelving unfinished work all week. She asked Git to show everything on the shelf.',
    hint: 'The shelf itself. The same command that saved the work can list it.',
    command: 'git stash list',
    explanation: 'git stash list shows every saved stash, newest first. stash@{0} is the latest.',
    terminal: [
      '$ git {{?}} list',
      'stash@{0}: WIP on main: 2370e68 Remember the cart between visits',
      'stash@{1}: On menu-prices: new pastry prices',
    ],
  },
  {
    word: 'MERGE',
    brief: 'Two branches both changed the menu. This time Git could not combine them on its own.',
    hint: 'Joining branches. A conflict means both sides edited the same lines.',
    command: 'git merge tpark/menu-endpoint',
    explanation: 'When two branches change the same lines, git merge stops with a conflict for you to resolve, then commit.',
    terminal: [
      '$ git {{?}} tpark/menu-endpoint',
      'Auto-merging src/menu.js',
      'CONFLICT (content): Merge conflict in src/menu.js',
      'Automatic merge failed; fix conflicts and then commit the result.',
    ],
  },
  {
    word: 'RESET',
    brief: 'An experiment went badly. Theo threw away every change since the last good commit and jumped straight back to it.',
    hint: '--hard moves the branch back and discards edits too. Use with care.',
    command: 'git reset --hard 9aff3ef',
    explanation: 'git reset --hard moves the branch and overwrites the working tree, discarding uncommitted changes.',
    terminal: [
      '$ git {{?}} --hard 9aff3ef',
      'HEAD is now at 9aff3ef Explain the order API in the README',
    ],
  },
  {
    word: 'BLAME',
    brief: 'The server started logging every order. The team wanted to know who added that log line and when.',
    hint: 'Line by line authorship. -L picks the lines to look at.',
    command: 'git blame -L 15,16 server/orders.js',
    explanation: 'git blame -L limits the annotation to a range of lines, so you can find who last changed them.',
    terminal: [
      '$ git {{?}} -L 15,16 server/orders.js',
      '71bde5a2 (Sam Okafor 2026-03-13 11:35:00 +0000 15)     orders.push({ id: crypto.randomUUID(), at: Date.now() })',
      "0b3b9790 (Theo Park  2026-03-24 17:15:00 +0000 16)     console.log('New order', orders.at(-1).id)",
    ],
  },
  {
    word: 'CLEAN',
    brief: 'The dry run looked right, so Mara told Git to actually delete the untracked files and folders.',
    hint: '-f forces the deletion, -d includes folders.',
    command: 'git clean -fd',
    explanation: 'git clean -fd deletes untracked files (-f) and untracked folders (-d). It cannot be undone.',
    terminal: [
      '$ git {{?}} -fd',
      'Removing debug.log',
      'Removing notes.txt',
      'Removing tmp/',
    ],
  },
]

// Every puzzle is set in Case Zero, the game's built-in fictional repo.
const CASE_REPO = 'commitbureau/case-zero'

// Three puzzles a day, one per difficulty. Easy: everyday commands, clue shown. Medium: trickier
// commands and output, clue on request. Hard: rarer commands, and only the terminal output is given.
export const DIFFICULTIES = ['easy', 'medium', 'hard']

const DIFFICULTY_BY_COMMAND = {
  'git stash': 'easy',
  'git merge mquinn/oat-milk': 'easy',
  'git clone https://github.com/commitbureau/case-zero.git': 'easy',
  'git fetch origin': 'easy',
  'git reset HEAD~1': 'medium',
  'git blame -L 9,9 src/cart.js': 'medium',
  'git clean -n': 'medium',
  'git stash list': 'medium',
  'git merge tpark/menu-endpoint': 'medium',
  'git apply --stat fix-total.patch': 'hard',
  'git notes show 0b3b979': 'hard',
  'git remote prune origin': 'hard',
  'git stage server/orders.js': 'hard',
  'git reset --hard 9aff3ef': 'hard',
  'git blame -L 15,16 server/orders.js': 'hard',
  'git clean -fd': 'hard',
}

for (const t of COMMITLE_TARGETS) t.difficulty = DIFFICULTY_BY_COMMAND[t.command] || 'medium'

// Words players may guess: real 5-letter words, weighted towards Git and programming so guesses are
// meaningful. Every answer is added below, so the list can never reject the solution.
const WORD_LIST = `
  apply blame clean clone fetch merge notes prune reset stage stash
  about above abort actor added adder admin adopt after again agent alert alias align alike alive allow
  alpha alter amend among angle apple apron array arrow aside asset async atlas audio audit avoid await
  awake award aware badge baker basic batch beach begin being below bench birth black blade blank blast
  block blood board boost bound brace brain brand brave bread break brick bring broad brown brush buddy
  build built bunch burst buyer cable cache calls carry catch cause chain chair chalk chart chase cheap
  check chest chief child chips civil claim class clear click climb clock close cloud coach coast codec
  codes color comma count court cover crack craft crash crate crawl crazy cream crisp cross crowd cubic
  curve cycle daily dance dated deals debug decay delay delta dense depth digit diner dirty ditch dodge
  doing draft drain drama drawn dream dress drift drink drive dummy eager early earth eight elect email
  empty enjoy enter entry equal error event every exact exist extra faith false fault fiber field fifth
  fifty fight files final first fixed flags flash fleet float floor flush focus force forge forks forth
  forum found frame fresh front fruit fully funny ghost giant given glass globe grace grade grain grand
  grant graph grasp green greet group guard guess guest guide habit happy harsh heads heart heavy hello
  hence hints hooks horse hotel house human humor hunks ideal image index inner input issue joins joint
  judge juice keyed known label large laser later layer learn least leave legal level light limit lines
  links lists local logic loops lower lucky lunch magic major maker match maybe mayor media metal meter
  might minor mixed model money month moral motor mount mouse mouth moved movie music naive nerve never
  newer night nodes noise north noted novel nurse occur ocean offer often older opens order other outer
  owner pages paint panel panic paper parse party paste patch pause peace phase phone photo piece pilot
  pipes pivot pixel place plain plane plant plate point polls ports power press price pride prime print
  prior prize probe proof proxy pulls pushy quick quiet quite quota quote radar radio raise range rapid
  ratio reach react ready realm rebel refer reply rider right rigid river roads robot rogue roots rough
  round route royal rules rural safer salad scale scene scope score scout screw seeds sense serve setup
  seven shade shake shape share sharp sheet shelf shell shift shirt shock shoot short shown sides sight
  sigma since sixth skill slack sleep slice slide slots small smart smile smoke solid solve sorry sound
  south space spare spark speak speed spend spent spike spine split spoke sport squad stack staff stake
  stand start state steal steam steel stick still stock stone store storm story strip stuck study stuff
  style sugar suite super sweet swift swing sync syncs table taken taste teach teams terms tests thank
  theme there thing think third those three throw tight timer times title today token topic total touch
  tough tower trace track trade trail train trash treat trees trend trial trick tried trunk trust truth
  tuple twice types under union unite unity until upper upset urban usage users usual valid value video
  views virus visit vital voice watch water wheel where which while white whole width woman words world
  worry worse worst worth would write wrong wrote yield young yours youth zebra zones
`

export const VALID_GUESSES = new Set([
  ...WORD_LIST.split(/\s+/).filter((w) => w.length === 5).map((w) => w.toUpperCase()),
  ...COMMITLE_TARGETS.map((t) => t.word),
])

/**
 * Today's puzzle: the same for every player on the same local calendar date.
 */
export function getDailyCommitleCase(customDate = new Date()) {
  const epoch = new Date('2026-01-01T00:00:00Z');
  const now = new Date(Date.UTC(customDate.getFullYear(), customDate.getMonth(), customDate.getDate()));
  const dayIndex = Math.max(0, Math.floor((now - epoch) / (1000 * 60 * 60 * 24)));

  const caseData = COMMITLE_TARGETS[dayIndex % COMMITLE_TARGETS.length];
  return {
    ...caseData,
    repo: CASE_REPO,
    dayNumber: dayIndex + 1,
    dateString: now.toISOString().split('T')[0]
  };
}

function dayInfo(customDate) {
  const epoch = new Date('2026-01-01T00:00:00Z');
  const now = new Date(Date.UTC(customDate.getFullYear(), customDate.getMonth(), customDate.getDate()));
  const dayIndex = Math.max(0, Math.floor((now - epoch) / (1000 * 60 * 60 * 24)));
  return { dayIndex, dayNumber: dayIndex + 1, dateString: now.toISOString().split('T')[0] };
}

/**
 * Today's three puzzles, [easy, medium, hard], the same for every player on the same local date.
 * Each difficulty rotates through its own pool, and the three never share an answer on one day.
 */
export function getDailyCommitleSet(customDate = new Date()) {
  const { dayIndex, dayNumber, dateString } = dayInfo(customDate);
  const used = new Set();
  return DIFFICULTIES.map((difficulty) => {
    const pool = COMMITLE_TARGETS.filter((t) => t.difficulty === difficulty);
    let pick = pool[dayIndex % pool.length];
    for (let step = 1; used.has(pick.word) && step < pool.length; step++) {
      pick = pool[(dayIndex + step) % pool.length];
    }
    used.add(pick.word);
    return { ...pick, difficulty, repo: CASE_REPO, dayNumber, dateString };
  });
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
