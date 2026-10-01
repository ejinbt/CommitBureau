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
buildGame({ owner, repo }, level)                // -> Promise<Round[]>  (5 rounds)
scoreAnswer(state, round, pickedIndex, usedHint) // -> new game state
finalReport(state)                               // -> { score, percent, rank, unlocked, skills }
getUserRepos(username)                           // -> Promise<Repo[]>
```

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

## Game rules

- 5 rounds per game. 80% or more unlocks the next level.
- Ranks: Rookie, Officer, Detective, Inspector, Chief.

## Branches

- Short feature branches off `main` (`engine/...`, `ui/...`), merged through small PRs every 1-2 hours.
- Only merge code that runs with `npm run dev`.
