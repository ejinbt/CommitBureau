import React from 'react';
import './LevelPicker.css';

// What each level investigates. Matches the question types in src/engine/cases/level1-5.js.
const LEVELS = [
  { level: 1, rank: 'Rookie', topic: 'Commits' },
  { level: 2, rank: 'Officer', topic: 'Diffs' },
  { level: 3, rank: 'Detective', topic: 'File history' },
  { level: 4, rank: 'Inspector', topic: 'Merges & PRs' },
  { level: 5, rank: 'Chief', topic: 'Git emergencies' },
];

/**
 * LevelPicker
 * Lets the player jump straight to any clearance level. All levels are open, so judges and
 * demo viewers can see every question type; passing a level still moves the selection up.
 */
export default function LevelPicker({ level, onSelectLevel }) {
  return (
    <div className="cb-level-picker" role="group" aria-label="Clearance level">
      <span className="cb-level-picker-label cb-mono">CLEARANCE LEVEL</span>
      <div className="cb-level-options">
        {LEVELS.map((item) => (
          <button
            key={item.level}
            type="button"
            className={`cb-level-option ${item.level === level ? 'active' : ''}`}
            aria-pressed={item.level === level}
            onClick={() => onSelectLevel(item.level)}
          >
            <span className="cb-level-option-num cb-mono">{item.level}</span>
            <span className="cb-level-option-text">
              <span className="cb-level-option-rank">{item.rank}</span>
              <span className="cb-level-option-topic">{item.topic}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
