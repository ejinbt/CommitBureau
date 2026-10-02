# CommitBureau
**it's a detective game , it uses real GitHub repos, and you solve the cases by typing real Git commands**

~~*live demo
demo video
devpost page*~~

## Why we built it
Git is hard to learn because tutorials teach commands on toy examples, but never show you how to read a real project's history. We wanted a way to practise on the real thing, so CommitBureau turns any public GitHub repo, even the Linux kernel, into detective cases you solve with real Git commands. 

## Features
-   **Detective terminal:**  each case gives you a terminal, and you type commands like  `git log`,  `git show`,  `git blame`-style  `git log -- <file>`,  `git shortlog`  and  `git cat-file`  to find the clues. Some clues are hidden on purpose, such as a scrubbed author.
-   **5 levels:**
    -   1 Rookie: commits
    -   2 Officer: diffs
    -   3 Detective: file history
    -   4 Inspector: merges and PRs
    -   5 Chief: choosing the right command in a Git emergency
-   **Daily Cases:**  3 real repos a day (Easy, Medium, Hard), the same for everyone.
-   **Case Zero:**  a built-in practice repo that works  **offline**, with no token.
-   **My Archive:**  type a GitHub username and investigate  **your own**  old projects.
-   Scoring, streaks, hints that cost points, ranks from Rookie to Chief, and a skills report at the end.

## How It Works
+ **Frontend**: React + Vite
+ **Engine**: plain Javascript in src/engine/
+ **UI**: ui talks engine through src/api.js
+ **Data**: GitHub REST API
+ **Rate-limit handling**: Responses are cached, if limit is hit mid-game , player can provide his own github token or game gets shorter automatically
+ **Terminal**: it doesn't run real Git , it requires user to connect his github account. for easier It **imitates** Git's output using the API data, and **masks** the clue the player has to find.
 + **The token proxy:**  a Vercel Function (`api/github.js`) adds a GitHub token  **on the server**, so players get 5,000 requests an hour and the browser never sees the token.
 + **Case Zero**: answers from local data, with no network at all (DEMO)
