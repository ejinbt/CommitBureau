import React from 'react';
import { FolderOpen, FileText, Terminal, Gavel, Lightbulb } from 'lucide-react';
import './HowItWorks.css';

// The four things a player does in every case, in order.
const STEPS = [
  {
    icon: FolderOpen,
    title: 'Pick a case',
    text: 'Play one of today’s three Daily Cases, a featured repo, any public GitHub repo, or your own projects in My Archive. Choose a level first.',
  },
  {
    icon: FileText,
    title: 'Read the brief',
    text: 'Each round tells you what is known and what is hidden: a scrubbed author, a torn-off commit message, a file nobody owns up to.',
  },
  {
    icon: Terminal,
    title: 'Investigate',
    text: 'Type real git commands in the case terminal to dig up the evidence. Click a suggestion to get started, or type help to see every command.',
  },
  {
    icon: Gavel,
    title: 'Accuse',
    text: 'Pick your answer. The verdict explains the evidence and gives you the real command, so you can run it on your own clone later.',
  },
];

// One real round from Case Zero, the built-in practice repo, to show the loop end to end.
const EXAMPLE = [
  { kind: 'brief', text: 'Commit b4c9fdf changed server/orders.js. Its author line was scrubbed. Find out who works on that file.' },
  { kind: 'cmd', text: 'git show b4c9fdf --stat' },
  { kind: 'out', text: 'Author: ???' },
  { kind: 'out', text: '    Fix order IDs repeating after a restart' },
  { kind: 'out', text: ' server/orders.js |   3 ++-' },
  { kind: 'cmd', text: 'git log --format="%h %an %s" -- server/orders.js' },
  { kind: 'out', text: '0b3b979 Theo Park Log every order to the console' },
  { kind: 'out', text: 'ae99d87 Theo Park Serve the menu from the API' },
  { kind: 'out', text: '71bde5a Sam Okafor Return 400 for empty orders' },
  { kind: 'out', text: 'f956a50 Theo Park Add order API' },
];

const LEVELS = [
  { level: 1, rank: 'Rookie', topic: 'Commits: messages, authors and order', command: 'git log --oneline' },
  { level: 2, rank: 'Officer', topic: 'Diffs: what a commit added and removed', command: 'git show <commit>' },
  { level: 3, rank: 'Detective', topic: 'File history: who owns a file, where it began', command: 'git shortlog -sn -- <file>' },
  { level: 4, rank: 'Inspector', topic: 'Merges and pull requests', command: 'git cat-file -p <commit>' },
  { level: 5, rank: 'Chief', topic: 'Git emergencies: pick the right fix', command: 'git stash, git revert, git bisect…' },
];

const RULES = [
  ['100 points', 'for each correct answer'],
  ['+25 per streak', 'for each right answer in a row, up to +100'],
  ['−50 for a clue', 'the Field Clue button costs points but teaches the idea'],
  ['80% to rank up', '4 out of 5 correct moves you to the next level'],
];

const TIPS = [
  'Press ↑ in the terminal to bring back your last command.',
  'Case Zero works offline with no token: the safest place to start.',
  'Without a token GitHub allows about 60 requests an hour. Add one with the Add Token button if a real repo runs out.',
  'git log lists the newest commit first. The oldest is at the bottom.',
];

/**
 * HowItWorks ("Field Manual")
 * Explains the game loop, walks through one real Case Zero round, and lists the levels, scoring and tips.
 */
export default function HowItWorks() {
  return (
    <section className="cb-how-section">
      <div className="cb-container cb-how-inner">
        <header className="cb-how-header">
          <div className="cb-how-eyebrow cb-mono">
            <span className="cb-how-accent">//</span> FIELD MANUAL
          </div>
          <h2 className="cb-how-title cb-heading">How a case works</h2>
          <p className="cb-how-subtitle">
            Every case comes from a real repository’s history. You find the clues with real git commands, then name
            the culprit.
          </p>
        </header>

        <ol className="cb-how-steps">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="cb-how-step">
              <div className="cb-how-step-top">
                <span className="cb-how-step-num cb-mono">{i + 1}</span>
                <Icon size={18} className="cb-how-step-icon" aria-hidden="true" />
              </div>
              <h3 className="cb-how-step-title">{title}</h3>
              <p className="cb-how-step-text">{text}</p>
            </li>
          ))}
        </ol>

        <div className="cb-how-example">
          <div className="cb-how-terminal" aria-label="Example investigation from Case Zero">
            <div className="cb-how-terminal-bar cb-mono">
              <span className="cb-how-dot red" />
              <span className="cb-how-dot amber" />
              <span className="cb-how-dot green" />
              <span className="cb-how-terminal-title">~/commitbureau/case-zero</span>
            </div>
            <div className="cb-how-terminal-body cb-mono">
              {EXAMPLE.map((line, i) => (
                <div key={i} className={`cb-how-line ${line.kind}`}>
                  {line.kind === 'cmd' && <span className="cb-how-prompt">$ </span>}
                  {line.kind === 'brief' && <span className="cb-how-brief-tag">CASE BRIEF </span>}
                  {line.text}
                </div>
              ))}
            </div>
          </div>

          <div className="cb-how-reasoning">
            <span className="cb-how-reasoning-tag cb-mono">THE DEDUCTION</span>
            <h3 className="cb-how-reasoning-title">Who wrote b4c9fdf?</h3>
            <p>
              The commit’s author is hidden, but it changed <code>server/orders.js</code>. The file’s history shows who
              works on it, and of the suspects, only <strong>Theo Park</strong> appears there.
            </p>
            <p>
              That is the whole game: read the brief, run the commands that would reveal the truth, and let the evidence
              decide. The suspects are Mara, Theo and Ines, and the log rules out everyone but Theo.
            </p>
          </div>
        </div>

        <div className="cb-how-columns">
          <div className="cb-how-panel">
            <h3 className="cb-how-panel-title">The five levels</h3>
            <div className="cb-how-table-wrap">
              <table className="cb-how-table">
                <thead>
                  <tr>
                    <th scope="col">Level</th>
                    <th scope="col">You investigate</th>
                    <th scope="col">Typical command</th>
                  </tr>
                </thead>
                <tbody>
                  {LEVELS.map((l) => (
                    <tr key={l.level}>
                      <td className="cb-how-level">
                        <span className="cb-mono">{l.level}</span> {l.rank}
                      </td>
                      <td>{l.topic}</td>
                      <td>
                        <code>{l.command}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="cb-how-panel">
            <h3 className="cb-how-panel-title">Scoring</h3>
            <dl className="cb-how-rules">
              {RULES.map(([term, detail]) => (
                <div key={term} className="cb-how-rule">
                  <dt className="cb-mono">{term}</dt>
                  <dd>{detail}</dd>
                </div>
              ))}
            </dl>

            <h3 className="cb-how-panel-title cb-how-tips-title">
              <Lightbulb size={15} aria-hidden="true" /> Tips
            </h3>
            <ul className="cb-how-tips">
              {TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
