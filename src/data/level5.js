// Level 5 (Chief) scenarios: real-life Git emergencies where the player picks the right command.
// No API needed. Every option carries a "why", so a wrong pick explains what that command would have done.
// {repo} is replaced with the repo name being played, or "your project".

export const scenarios = [
  {
    type: 'undo',
    prompt: 'You just committed to {repo}, then realised the commit is not ready. You want to undo the commit but keep all your changes.',
    answer: { command: 'git reset --soft HEAD~1', why: 'Moves the branch back one commit and keeps your changes staged, ready to commit again.' },
    wrong: [
      { command: 'git reset --hard HEAD~1', why: 'Also undoes the commit, but throws your changes away.' },
      { command: 'git revert HEAD', why: 'Adds a new commit that undoes the last one. The original commit stays in history.' },
      { command: 'git commit --amend', why: 'Edits the last commit instead of undoing it.' },
    ],
    hint: 'HEAD~1 means "one commit before now". The flag decides what happens to your changes.',
  },
  {
    type: 'wrong_branch',
    prompt: 'You made a commit on main by mistake. You have not pushed. You want that commit on a new branch called fix-login, and main back where it was.',
    answer: { command: 'git branch fix-login && git reset --hard HEAD~1', why: 'The new branch keeps pointing at your commit, then main moves back one commit. Nothing is lost.' },
    wrong: [
      { command: 'git reset --hard HEAD~1', why: 'Moves main back, but no branch points at your commit any more, so it is lost (only git reflog can find it).' },
      { command: 'git switch -c fix-login', why: 'Creates the branch, but main still has the commit on it.' },
      { command: 'git revert HEAD', why: 'Adds an undo commit on main. Both commits stay on main and no new branch is made.' },
    ],
    hint: 'A branch is just a label pointing at a commit. Put a new label on your commit before moving main.',
  },
  {
    type: 'bisect',
    prompt: 'The build of {repo} worked at the v1.2 tag and is broken now. There are 200 commits in between. How do you find the commit that broke it fastest?',
    answer: { command: 'git bisect start', why: 'Binary search through history: you mark commits good or bad and Git halves the range each time. 200 commits take about 8 checks.' },
    wrong: [
      { command: 'git blame', why: 'Shows who last changed each line of one file. Useful once you know which file is broken, not before.' },
      { command: 'git log', why: 'Lists the commits, but you would have to test them one by one.' },
      { command: 'git diff v1.2', why: 'Shows everything that changed since v1.2 in one big diff, not which commit did it.' },
    ],
    hint: 'If you check the middle commit, you rule out half the suspects at once.',
  },
  {
    type: 'bisect',
    prompt: 'You are in the middle of git bisect. Git checked out a commit and the build works on it. What do you tell Git?',
    answer: { command: 'git bisect good', why: 'Marks this commit as working, so the bug must be in a later commit. Git jumps to the middle of what is left.' },
    wrong: [
      { command: 'git bisect bad', why: 'Says this commit is broken, which sends the search in the wrong direction.' },
      { command: 'git bisect reset', why: 'Ends the search and returns you to where you started.' },
      { command: 'git bisect start', why: 'Starts a new search. You are already in one.' },
    ],
    hint: 'Bisect only needs to know one thing about each commit it shows you.',
  },
  {
    type: 'revert',
    prompt: 'A bad commit is already pushed to the shared main branch of {repo} and teammates have pulled it. How do you undo it safely?',
    answer: { command: 'git revert <sha>', why: 'Adds a new commit that undoes the bad one. History is not rewritten, so teammates are not affected.' },
    wrong: [
      { command: 'git reset --hard HEAD~1 && git push --force', why: 'Rewrites shared history. Everyone who already pulled now has commits that no longer exist on the server.' },
      { command: 'git commit --amend', why: 'Rewrites the last commit, which is the same problem as a force push once it is shared.' },
      { command: 'git checkout <sha>', why: 'Only lets you look at an old version. It does not undo anything.' },
    ],
    hint: 'Once others have a commit, add to history instead of rewriting it.',
  },
  {
    type: 'stash',
    prompt: 'You are halfway through a change when an urgent bug comes in on another branch. You need a clean working tree without making a commit.',
    answer: { command: 'git stash', why: 'Saves your unfinished changes on a shelf and cleans the working tree. Bring them back later with git stash pop.' },
    wrong: [
      { command: 'git reset --hard', why: 'Cleans the working tree by deleting your unfinished changes for good.' },
      { command: 'git commit -am "wip"', why: 'Works, but puts a half-finished commit in history, which the question asked you to avoid.' },
      { command: 'git switch other-branch', why: 'Git may refuse, or carry your half-done changes over to the other branch.' },
    ],
    hint: 'You want to put the work aside, not delete it and not commit it.',
  },
  {
    type: 'stash',
    prompt: 'The urgent bug is fixed. You want back the unfinished work you stashed earlier.',
    answer: { command: 'git stash pop', why: 'Re-applies the latest stash to your working tree and removes it from the stash list.' },
    wrong: [
      { command: 'git stash', why: 'Stashes again. Your current changes go on the shelf too.' },
      { command: 'git stash drop', why: 'Deletes the latest stash without applying it. Your work is gone.' },
      { command: 'git stash list', why: 'Only lists what is stashed. Nothing comes back.' },
    ],
    hint: 'Think of the stash as a stack: you pushed work onto it earlier.',
  },
  {
    type: 'cherry_pick',
    prompt: 'A bug fix landed on the develop branch of {repo}. The release branch needs that one fix, but none of the other new work on develop.',
    answer: { command: 'git cherry-pick <sha>', why: 'Copies just that one commit onto your current branch.' },
    wrong: [
      { command: 'git merge develop', why: 'Brings in everything on develop, not just the fix.' },
      { command: 'git rebase develop', why: 'Replays your branch on top of develop, so you also get all of develop.' },
      { command: 'git revert <sha>', why: 'Adds a commit that undoes the fix, the opposite of what you want.' },
    ],
    hint: 'You want to pick one commit, not a whole branch.',
  },
  {
    type: 'undo',
    prompt: 'Your last commit message has a typo. You have not pushed yet.',
    answer: { command: 'git commit --amend -m "Fixed message"', why: 'Replaces the last commit with a copy that has the new message. Safe because nobody else has it yet.' },
    wrong: [
      { command: 'git commit -m "Fixed message"', why: 'Makes a second commit. The typo stays in the first one.' },
      { command: 'git revert HEAD', why: 'Undoes the changes in the commit, not the message.' },
      { command: 'git reset --hard HEAD~1', why: 'Throws away the whole commit and its changes.' },
    ],
    hint: 'You want to change the last commit, not add a new one.',
  },
  {
    type: 'recover',
    prompt: 'You ran git reset --hard and a commit you needed has vanished from git log. How do you find it again?',
    answer: { command: 'git reflog', why: 'Lists everywhere HEAD has pointed recently, including the lost commit. Then git reset --hard <sha> brings it back.' },
    wrong: [
      { command: 'git log', why: 'Only shows commits reachable from the current branch, and the branch no longer points there.' },
      { command: 'git stash pop', why: 'Brings back stashed work. A reset commit was never stashed.' },
      { command: 'git revert HEAD', why: 'Undoes the current commit. It does not find lost ones.' },
    ],
    hint: 'Git keeps a private diary of where HEAD has been.',
  },
  {
    type: 'undo',
    prompt: 'You edited app.js and want to throw away just those edits. Your other changed files must stay as they are.',
    answer: { command: 'git restore app.js', why: 'Puts app.js back to the last committed version. Other files are untouched.' },
    wrong: [
      { command: 'git reset --hard', why: 'Throws away the edits in every file, not just app.js.' },
      { command: 'git rm app.js', why: 'Deletes the file itself and stages the deletion.' },
      { command: 'git stash', why: 'Shelves the changes in every file, not just app.js.' },
    ],
    hint: 'You want to restore one file, not the whole working tree.',
  },
  {
    type: 'undo',
    prompt: 'You ran git add on secrets.txt by mistake. You want it out of the next commit, but you want to keep the file and its edits.',
    answer: { command: 'git restore --staged secrets.txt', why: 'Unstages the file. Its edits stay in your working tree.' },
    wrong: [
      { command: 'git rm secrets.txt', why: 'Deletes the file from your disk and stages the deletion.' },
      { command: 'git reset --hard', why: 'Unstages it, but also throws away every uncommitted edit in every file.' },
      { command: 'git commit -m "remove secrets"', why: 'Commits the file, which is the opposite of what you want.' },
    ],
    hint: 'Staging is a waiting area. You want to take the file out of the waiting area only.',
  },
  {
    type: 'inspect',
    prompt: 'Line 40 of app.js in {repo} looks wrong. Who changed it last, and in which commit?',
    answer: { command: 'git blame -L 40,40 app.js', why: 'Shows the commit, author and date of the last change to each line. -L limits it to line 40.' },
    wrong: [
      { command: 'git log app.js', why: 'Lists every commit that touched app.js, but not which one changed line 40.' },
      { command: 'git show HEAD:app.js', why: 'Prints the file as it is in the last commit, not who changed each line.' },
      { command: 'git bisect start', why: 'Finds which commit broke a behaviour. Overkill when you already know the exact line.' },
    ],
    hint: 'Some commands work line by line. One of them is named after assigning blame.',
  },
  {
    type: 'inspect',
    prompt: 'Before committing, you want to see exactly which line changes you have staged.',
    answer: { command: 'git diff --staged', why: 'Shows the changes that are staged, which is exactly what the next commit will contain.' },
    wrong: [
      { command: 'git diff', why: 'Shows only changes that are not staged yet.' },
      { command: 'git status', why: 'Lists which files changed, but not the lines.' },
      { command: 'git log -p', why: 'Shows changes in past commits, not the one you are about to make.' },
    ],
    hint: 'Plain git diff compares your files with the staging area. You want the staging area compared with the last commit.',
  },
]
