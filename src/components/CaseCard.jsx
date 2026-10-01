import React, { useState } from 'react';
import { BookOpen, Check, X, ShieldAlert, Cpu, Sparkles, Terminal } from 'lucide-react';
import DiffViewer from './DiffViewer';
import VerdictCard from './VerdictCard';
import { HINT_PENALTY } from '../api';
import './CaseCard.css';

/**
 * CaseCard Component (Forensic Dossier Presentation)
 * - Forensic case dossier banner
 * - High-depth suspect hypothesis cards with role tags and scanline hover physics
 * - 150ms verification suspense state with shake on error
 * - Detective notebook clue reveal with HINT_PENALTY
 * - Shows optionNotes when answered (explaining wrong/right commands)
 * - Conditionally renders DiffViewer only when diff exists
 */
export default function CaseCard({
  round,
  roundNumber,
  totalRounds,
  onAnswer,
  isAnswered,
  userAnswerIndex,
  isCorrect,
  pointsAwarded,
  onNextRound
}) {
  const [hintOpen, setHintOpen] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [verifyingIdx, setVerifyingIdx] = useState(null);

  const toggleHint = () => {
    if (!hintOpen && !hintUsed && !isAnswered) {
      setHintUsed(true);
    }
    setHintOpen(!hintOpen);
  };

  const handleSelectOption = (idx) => {
    if (isAnswered || verifyingIdx !== null) return;
    setVerifyingIdx(idx);

    // 180ms suspense verification delay for high-tactile game feel
    setTimeout(() => {
      onAnswer(idx, hintUsed);
      setVerifyingIdx(null);
    }, 180);
  };

  return (
    <div className="case-dossier-card">
      {/* Top Case Identification Banner */}
      <div className="case-dossier-banner">
        <div className="case-identity-group">
          <div className="case-badge-primary">
            <span className="badge-marker">CASE FILE</span>
            <span className="badge-number">#{roundNumber.toString().padStart(2, '0')}</span>
          </div>
          <div className="case-category-chip">
            <Cpu size={12} className="chip-ico" />
            <span>{round.type ? round.type.replace(/_/g, ' ').toUpperCase() : 'FORENSIC ANOMALY'}</span>
          </div>
        </div>

        {/* Notebook Clue Button */}
        <div className="case-dossier-actions">
          <button
            type="button"
            className={`dossier-hint-btn ${hintOpen ? 'active' : ''} ${hintUsed ? 'penalized' : ''}`}
            onClick={toggleHint}
          >
            <BookOpen size={13} />
            <span>{hintOpen ? 'Close Note' : 'Field Clue'}</span>
            {!hintUsed && !isAnswered && <span className="hint-fee-pill">-{HINT_PENALTY} PTS</span>}
          </button>
        </div>
      </div>

      {/* Detective Notebook Clue Panel */}
      {hintOpen && (
        <div className="dossier-clue-drawer">
          <div className="clue-drawer-header">
            <ShieldAlert size={14} className="clue-warn-icon" />
            <span className="clue-tag">// CONFIDENTIAL INVESTIGATOR NOTE:</span>
            {hintUsed && <span className="clue-fee-tag">{HINT_PENALTY} POINT PENALTY APPLIED</span>}
          </div>
          <p className="clue-body-text">{round.hint || 'Check the commit timestamp against major milestone releases.'}</p>
        </div>
      )}

      {/* Main Interrogation Prompt */}
      <div className="case-inquiry-hero">
        <div className="inquiry-eyebrow">
          <span className="eyebrow-accent">//</span>
          <span className="eyebrow-label">PRIMARY FORENSIC INQUIRY</span>
        </div>
        <h2 className="inquiry-statement">{round.prompt}</h2>
      </div>

      {/* Evidence Terminal Diff Viewer (Only when diff exists) */}
      {round.evidence?.diff && (
        <div className="case-evidence-envelope">
          <DiffViewer
            diff={round.evidence.diff}
            file={round.evidence?.file}
            author={round.evidence?.author}
            date={round.evidence?.date}
            roundType={round.type}
          />
        </div>
      )}

      {/* Suspect / Hypothesis Matrices */}
      <div className="hypotheses-investigation-section">
        <div className="section-meta-header">
          <span className="meta-title">SELECT HYPOTHESIS VERDICT</span>
          <span className="meta-sub">KEYBOARD SHORTCUTS [1 - 4]</span>
        </div>

        <div className="suspect-cards-grid">
          {round.options?.map((opt, idx) => {
            const isSelected = userAnswerIndex === idx || verifyingIdx === idx;
            const isRightAnswer = isAnswered && idx === round.answer;
            const isWrongSelection = isAnswered && isSelected && !isCorrect;
            const isVerifying = verifyingIdx === idx;

            let cardState = 'state-normal';
            if (isVerifying) cardState = 'state-verifying';
            else if (isAnswered) {
              if (isRightAnswer) cardState = 'state-confirmed';
              else if (isWrongSelection) cardState = 'state-compromised';
              else cardState = 'state-dimmed';
            }

            const letterCode = String.fromCharCode(65 + idx);

            return (
              <button
                key={idx}
                type="button"
                className={`suspect-hypothesis-card ${cardState}`}
                disabled={isAnswered || verifyingIdx !== null}
                onClick={() => handleSelectOption(idx)}
              >
                {/* Card Top Pill */}
                <div className="card-top-identity">
                  <div className="key-chip">
                    <span className="chip-key">[{idx + 1}]</span>
                    <span className="chip-letter">HYPOTHESIS {letterCode}</span>
                  </div>
                  {isVerifying && (
                    <div className="verifying-pulse">
                      <Sparkles size={11} className="spin-slow" />
                      <span>ANALYZING...</span>
                    </div>
                  )}
                  {isRightAnswer && (
                    <div className="badge-confirmed">
                      <Check size={12} />
                      <span>CONFIRMED</span>
                    </div>
                  )}
                  {isWrongSelection && (
                    <div className="badge-compromised">
                      <X size={12} />
                      <span>REJECTED</span>
                    </div>
                  )}
                </div>

                {/* Option Content Body */}
                <div className="card-content-body">
                  <span className="suspect-headline">{opt}</span>
                  {isAnswered && round.optionNotes?.[idx] && (
                    <div className="option-forensic-note">
                      <Terminal size={11} className="note-terminal-ico" />
                      <span className="note-text">{round.optionNotes[idx]}</span>
                    </div>
                  )}
                </div>

                {/* Subtle bottom scanline bar */}
                <div className="card-accent-bar" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Post-Answer Verdict Component */}
      {isAnswered && (
        <VerdictCard
          isCorrect={isCorrect}
          explanation={round.explanation}
          command={round.command}
          pointsAwarded={pointsAwarded}
          isLastRound={roundNumber === totalRounds}
          onNextRound={onNextRound}
        />
      )}
    </div>
  );
}
