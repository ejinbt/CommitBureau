# Engine <-> UI contract

The UI imports game functions only from `src/api.js`. Change this contract only after both of us agree.

## Ownership

| Area | Owner |
|---|---|
| `src/engine/`, `src/data/` | Engine (ejinbt) |
| `src/components/`, `src/pages/`, `src/mocks/`, CSS, `.github/workflows/` | UI |
| `src/api.js`, `docs/CONTRACT.md` | Shared: change together |

## Functions

```js
parseRepo(input)                                 // "https://github.com/a/b" or "a/b" -> { owner, repo }
setToken(token)                                  // optional; the engine also reads localStorage "cb_github_token"
FEATURED_REPOS                                   // [{ owner, repo, title, description, tag }]
buildGame({ owner, repo }, level, { difficulty }) // -> Promise<Round[]>  (up to 5 rounds), difficulty "easy" | "medium"; level 5 accepts null instead of a repo
newGame(level)                                   // -> fresh game state
scoreAnswer(state, round, pickedIndex, usedHint) // -> new state; answers[i] = { roundId, type, isCorrect, pickedIndex, usedHint, points }
finalReport(state, level)                        // -> { score, correctCount, totalCount, percent, rank, unlocked, maxStreak, skills, suggestion }
getUserRepos(username)                           // -> Promise<{ owner, repo, description, language, pushedAt, fork }[]>
```

Game state is `{ score, streak, maxStreak, answers }`.

`skills` is an array: `[{ type: "real_or_fake", label: "Reading commit messages", correct: 2, total: 3, ratio: "2/3", percentage: 67 }, ...]`.

Game state is a plain object. Keep it in React state and replace it with whatever `scoreAnswer` returns. Don't mutate it.

Errors are thrown as `Error` with a friendly `.message` (invalid URL, repo not found or private, empty repo, rate limit). The UI shows `.message` as-is.

## Round shape

```js
{
  id: "r1",
  level: 1,
  type: "real_or_fake",   // who_did_it, first_or_later, lines_changed, which_file, ...
  prompt: "This diff touched kernel/sched.c. Which commit message is real?",
  evidence: { diff: "...", author: null, date: "2024-03-02", file: "kernel/sched.c" }, // any may be null
  options: ["Fix race in ...", "Add docs for ...", "Bump version to ..."],
  answer: 0,              // index into options
  explanation: "The diff changes a lock, so it is the race fix.",
  hint: "Look at what the + lines actually change.",
  command: "git show 3f2a1c9"
}
```

Level 5 rounds also have `optionNotes`: one string per option, same order, saying what that command would have done. Show the note for the option the player picked when they get it wrong.

A game can have fewer than 5 rounds (small repo, or API budget used up). Use `rounds.length`, not 5.

## Game rules

- 5 rounds per game. 80% or more unlocks the next level.
- Ranks: Rookie, Officer, Detective, Inspector, Chief.

## Branches

- Short feature branches off `main` (`engine/...`, `ui/...`), merged through small PRs every 1-2 hours.
- Only merge code that runs with `npm run dev`.
