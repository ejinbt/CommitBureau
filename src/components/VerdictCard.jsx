import React, { useState, useEffect } from 'react';
import { Check, X, Terminal, Copy, ArrowRight, CornerDownLeft } from 'lucide-react';
import './VerdictCard.css';

/**
 * VerdictCard Component (Redesigned)
 * Clean, sharp, understated forensic verdict card.
 * Uses real Lucide icons and crisp typography.
 */
export default function VerdictCard({
  isCorrect,
  explanation,
  command,
  pointsAwarded,
  isLastRound,
  onNextRound
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Enter in the investigation terminal runs a command; it must not skip to the next round.
      if (e.target instanceof Element && e.target.closest('input, textarea')) return;
      if (e.key === 'Enter') {
        onNextRound();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNextRound]);

  const handleCopyCommand = () => {
    if (!command) return;
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`verdict-pane ${isCorrect ? 'verdict-success' : 'verdict-failure'}`}>
      <div className="verdict-top">
        <div className="verdict-badge">
          {isCorrect ? <Check size={14} className="verdict-icon-ok" /> : <X size={14} className="verdict-icon-bad" />}
          <span className="verdict-state-text">
            {isCorrect ? 'Hypothesis Confirmed' : 'Evidence Mismatch'}
          </span>
        </div>
        <span className="verdict-score-delta">
          {isCorrect ? `+${pointsAwarded} pts` : '+0 pts'}
        </span>
      </div>

      <div className="verdict-explanation">
        <p className="explanation-paragraph">{explanation}</p>
      </div>

      {command && (
        <div className="verdict-cli-bar">
          <div className="cli-bar-label">
            <Terminal size={12} />
            <span>Reproduction Command</span>
          </div>
          <div className="cli-bar-input-group">
            <span className="cli-dollar">$</span>
            <code className="cli-cmd-str">{command}</code>
            <button
              type="button"
              className="cli-copy-action"
              onClick={handleCopyCommand}
              title="Copy command"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      )}

      <div className="verdict-action-row">
        <span className="verdict-key-hint">
          Press <kbd><CornerDownLeft size={10} /> Enter</kbd> to continue
        </span>
        <button
          type="button"
          className={`verdict-proceed-btn ${isLastRound ? 'btn-compile-final' : ''}`}
          onClick={onNextRound}
        >
          <span>{isLastRound ? 'COMPILE FINAL DEBRIEF' : 'PROCEED TO NEXT EVIDENCE'}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
