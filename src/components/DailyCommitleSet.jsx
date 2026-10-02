import React, { useMemo, useState } from 'react';
import DailyCommitle from './DailyCommitle';
import { getDailyCommitleSet } from '../data/commitleCases';
import { playClickSound } from '../utils/audio';
import './DailyCommitleSet.css';

const LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };

function savedResult(dateString, slot) {
  try {
    const saved = JSON.parse(localStorage.getItem(`cb_commitle_${dateString}_${slot}`) || 'null');
    if (!saved?.isGameOver) return null;
    return saved.hasWon ? 'won' : 'lost';
  } catch {
    return null;
  }
}

export default function DailyCommitleSet({ onScrollToCases }) {
  const puzzles = useMemo(() => getDailyCommitleSet(), []);
  const dateString = puzzles[0].dateString;
  const [active, setActive] = useState(
    () => puzzles.find((p) => !savedResult(dateString, p.difficulty))?.difficulty || 'easy'
  );
  const [, setRefresh] = useState(0);

  const tabs = (
    <div className="commitle-difficulty-tabs" role="tablist" aria-label="Puzzle difficulty">
      {puzzles.map((p) => {
        const result = savedResult(dateString, p.difficulty);
        return (
          <button
            key={p.difficulty}
            type="button"
            role="tab"
            aria-selected={p.difficulty === active}
            className={`commitle-difficulty-tab diff-${p.difficulty} ${p.difficulty === active ? 'active' : ''}`}
            onClick={() => {
              playClickSound();
              setActive(p.difficulty);
              setRefresh((n) => n + 1);
            }}
          >
            <span>{LABELS[p.difficulty]}</span>
            {result === 'won' && <span className="tab-result" aria-label="solved">✓</span>}
            {result === 'lost' && <span className="tab-result lost" aria-label="not solved">✗</span>}
          </button>
        );
      })}
    </div>
  );

  const puzzle = puzzles.find((p) => p.difficulty === active);
  return (
    <DailyCommitle
      key={active}
      puzzle={puzzle}
      slot={active}
      tabs={tabs}
      onScrollToCases={onScrollToCases}
    />
  );
}
