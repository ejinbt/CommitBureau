import React, { useEffect, useMemo, useState } from 'react';
import { GitBranch, Clock, ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { playClickSound } from '../utils/audio';
import { SpiderPeep } from './character';
import { getDailyRepos } from '../api';
import './DailyRepos.css';

const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const LEVEL_INFO = {
  1: { rank: 'Rookie', topic: 'Commits: messages, authors, order' },
  2: { rank: 'Officer', topic: 'Diffs: read what changed' },
  3: { rank: 'Detective', topic: 'File history: who and when' },
  4: { rank: 'Inspector', topic: 'Merges and pull requests' },
};

const REPO_BLURBS = {
  'pallets/flask': 'The small Python web framework.',
  'expressjs/express': 'The classic minimal web server for Node.js.',
  'fastapi/fastapi': 'A modern, fast Python API framework.',
  'sveltejs/svelte': 'The UI framework that compiles itself away.',
  'vitejs/vite': 'The fast frontend build tool this game runs on.',
  'prettier/prettier': 'The code formatter half the internet uses.',
  'tailwindlabs/tailwindcss': 'Utility-first CSS.',
  'facebook/react': 'The library behind most of the modern web.',
  'vuejs/core': 'The core of the Vue.js framework.',
  'django/django': 'The Python web framework for perfectionists with deadlines.',
  'neovim/neovim': 'Vim, rebuilt for the modern era.',
  'denoland/deno': 'A secure runtime for JavaScript and TypeScript.',
  'microsoft/TypeScript': 'JavaScript with types.',
  'golang/go': 'The Go programming language itself.',
  'nodejs/node': 'The JavaScript runtime.',
  'rails/rails': 'Ruby on Rails, merged one pull request at a time.',
  'torvalds/linux': 'The Linux kernel. Linus merges by hand.',
  'git/git': 'Git, tracked in Git.',
  'kubernetes/kubernetes': 'Container orchestration at planet scale.',
  'rust-lang/rust': 'The Rust compiler, merged by a robot.',
  'moby/moby': 'The open-source engine behind Docker.',
  'godotengine/godot': 'The free and open-source game engine.',
};

function savedResult(date, difficulty) {
  try {
    return JSON.parse(localStorage.getItem(`cb_daily_${date}_${difficulty}`) || 'null');
  } catch {
    return null;
  }
}

function timeToMidnight() {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const total = Math.max(0, Math.floor((midnight - now) / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function DailyRepos({ onStartDaily, onScrollNext }) {
  const daily = useMemo(() => getDailyRepos(), []);
  const [countdown, setCountdown] = useState(timeToMidnight);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(timeToMidnight()), 1000);
    return () => clearInterval(timer);
  }, []);

  const solvedCount = daily.filter((d) => savedResult(d.date, d.difficulty)).length;

  return (
    <section className="daily-repos-section">
      <SpiderPeep side="right" mode="viewport" top="44%" delay={2.5} interval={14} />
      <div className="daily-repos-inner">
        <header className="daily-repos-header">
          <div className="daily-repos-eyebrow">
            <span className="daily-accent">//</span> DAILY REPOS <span className="daily-sep">#{daily[0].number}</span>
          </div>
          <h2 className="daily-repos-title">Three real repos. One day. Crack all three.</h2>
          <p className="daily-repos-subtitle">
            Everyone gets the same three cases today. Each opens straight into the investigation, with your
            terminal ready.
          </p>
          <div className="daily-repos-meta">
            <span className="daily-meta-chip">
              <CheckCircle2 size={13} /> {solvedCount} / 3 played today
            </span>
            <span className="daily-meta-chip">
              <Clock size={13} /> New repos in {countdown}
            </span>
          </div>
        </header>

        <div className="daily-repos-grid">
          {daily.map((d) => {
            const slug = `${d.owner}/${d.repo}`;
            const result = savedResult(d.date, d.difficulty);
            const info = LEVEL_INFO[d.level];
            return (
              <article key={d.difficulty} className={`daily-repo-card diff-${d.difficulty} ${result ? 'played' : ''}`}>
                <div className="daily-card-top">
                  <span className={`daily-difficulty diff-${d.difficulty}`}>{DIFFICULTY_LABEL[d.difficulty]}</span>
                  <span className="daily-level">Level {d.level} · {info.rank}</span>
                </div>

                <h3 className="daily-repo-name">
                  <GitBranch size={16} className="daily-repo-icon" />
                  <span>{slug}</span>
                </h3>
                <p className="daily-repo-blurb">{REPO_BLURBS[slug] || 'A real open-source repository.'}</p>
                <p className="daily-repo-topic">{info.topic}</p>

                <div className="daily-card-bottom">
                  {result ? (
                    <span className="daily-result">
                      <CheckCircle2 size={14} /> {result.correct}/{result.total} · {result.percent}%
                    </span>
                  ) : (
                    <span className="daily-result pending">Not played yet</span>
                  )}
                  <button type="button" className="daily-investigate-btn" onClick={() => onStartDaily?.(d)}>
                    <span>{result ? 'Replay' : 'Investigate'}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="cb-section-scroll-arrow">
        <button
          type="button"
          className="cb-hero-scroll-btn"
          onClick={() => {
            playClickSound();
            onScrollNext?.();
          }}
          aria-label="Scroll to cases"
        >
          <span className="cb-scroll-label">CASES</span>
          <ChevronDown size={18} className="cb-scroll-chevron" />
        </button>
      </div>
    </section>
  );
}
