import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Check, 
  Copy, 
  CornerDownLeft, 
  Delete, 
  Clock, 
  Flame, 
  Award, 
  GitBranch,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { 
  getDailyCommitleCase, 
  evaluateCommitleGuess, 
  VALID_GUESSES 
} from '../data/commitleCases';
import { playClickSound, playCorrectSound, playWrongSound } from '../utils/audio';
import './DailyCommitle.css';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

/**
 * Section 2: COMMITLE (The Daily Git Forensics Wordle)
 * - 100vh Viewport-fit daily investigation
 * - Authentic 6-guess Wordle evaluation with Git forensic terminology
 * - Daily synchronization, persistent streaks, and emoji share matrix
 */
export default function DailyCommitle() {
  const dailyCase = useMemo(() => getDailyCommitleCase(), []);
  const storageKey = `cb_commitle_${dailyCase.dateString}`;
  const statsKey = 'cb_commitle_stats';

  // Load saved state for today's game
  const [guesses, setGuesses] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.guesses || [];
      }
    } catch {
      // Storage unavailable
    }
    return [];
  });

  const [currentInput, setCurrentInput] = useState('');
  const [isGameOver, setIsGameOver] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed.isGameOver);
      }
    } catch {}
    return false;
  });

  const [hasWon, setHasWon] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Boolean(parsed.hasWon);
      }
    } catch {}
    return false;
  });

  const [shakeRow, setShakeRow] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [timeUntilTomorrow, setTimeUntilTomorrow] = useState('');

  // Player stats
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem(statsKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { played: 0, won: 0, currentStreak: 0, maxStreak: 0 };
  });

  // Countdown timer to next case
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const diffMs = tomorrow - now;
      if (diffMs <= 0) {
        setTimeUntilTomorrow('00h 00m 00s');
        return;
      }
      const hrs = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0');
      const mins = String(Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const secs = String(Math.floor((diffMs % (1000 * 60)) / 1000)).padStart(2, '0');
      setTimeUntilTomorrow(`${hrs}h ${mins}m ${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  // Build key states mapping (green, yellow, gray)
  const keyStates = useMemo(() => {
    const map = {};
    guesses.forEach((guess) => {
      const evaluation = evaluateCommitleGuess(guess, dailyCase.word);
      evaluation.forEach(({ letter, status }) => {
        const current = map[letter];
        if (status === 'correct') {
          map[letter] = 'correct';
        } else if (status === 'present' && current !== 'correct') {
          map[letter] = 'present';
        } else if (status === 'absent' && !current) {
          map[letter] = 'absent';
        }
      });
    });
    return map;
  }, [guesses, dailyCase.word]);

  // Handle letter typing
  const handleKeyInput = useCallback(
    (key) => {
      if (isGameOver) return;

      const upperKey = key.toUpperCase();

      if (upperKey === 'BACKSPACE' || upperKey === 'DELETE') {
        playClickSound();
        setCurrentInput((prev) => prev.slice(0, -1));
        return;
      }

      if (upperKey === 'ENTER') {
        if (currentInput.length !== WORD_LENGTH) {
          playWrongSound();
          setShakeRow(true);
          showToast('ENTER 5-LETTER COMMAND');
          setTimeout(() => setShakeRow(false), 500);
          return;
        }

        const guess = currentInput;
        if (!VALID_GUESSES.has(guess) && guess !== dailyCase.word) {
          playWrongSound();
          setShakeRow(true);
          showToast('NOT IN FORENSIC WORD LIST');
          setTimeout(() => setShakeRow(false), 500);
          return;
        }

        const newGuesses = [...guesses, guess];
        const isCorrectWord = guess === dailyCase.word;
        const reachedMax = newGuesses.length >= MAX_GUESSES;
        const finished = isCorrectWord || reachedMax;

        setGuesses(newGuesses);
        setCurrentInput('');

        if (isCorrectWord) {
          playCorrectSound();
          setIsGameOver(true);
          setHasWon(true);
          showToast('CASE SOLVED! EVIDENCE CONFIRMED');
          
          // Update stats
          const newStats = {
            played: stats.played + 1,
            won: stats.won + 1,
            currentStreak: stats.currentStreak + 1,
            maxStreak: Math.max(stats.maxStreak, stats.currentStreak + 1)
          };
          setStats(newStats);
          try {
            localStorage.setItem(statsKey, JSON.stringify(newStats));
          } catch {}
        } else if (reachedMax) {
          playWrongSound();
          setIsGameOver(true);
          setHasWon(false);
          showToast(`EVIDENCE SEALED. WORD: ${dailyCase.word}`);

          const newStats = {
            played: stats.played + 1,
            won: stats.won,
            currentStreak: 0,
            maxStreak: stats.maxStreak
          };
          setStats(newStats);
          try {
            localStorage.setItem(statsKey, JSON.stringify(newStats));
          } catch {}
        } else {
          playClickSound();
        }

        // Save daily progress to local storage
        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              guesses: newGuesses,
              isGameOver: finished,
              hasWon: isCorrectWord
            })
          );
        } catch {}
        return;
      }

      if (/^[A-Z]$/.test(upperKey) && currentInput.length < WORD_LENGTH) {
        playClickSound();
        setCurrentInput((prev) => prev + upperKey);
      }
    },
    [currentInput, guesses, isGameOver, dailyCase.word, storageKey, stats]
  );

  // Keyboard listener
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target instanceof Element && e.target.closest('input, textarea')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Backspace' || e.key === 'Delete') {
        handleKeyInput('BACKSPACE');
      } else if (e.key === 'Enter') {
        handleKeyInput('ENTER');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyInput(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKeyInput]);

  // Generate shareable Wordle emoji matrix
  const handleShare = () => {
    playClickSound();
    const rows = guesses.map((g) => {
      const evaluated = evaluateCommitleGuess(g, dailyCase.word);
      return evaluated
        .map((item) => {
          if (item.status === 'correct') return '🟩';
          if (item.status === 'present') return '🟨';
          return '⬛';
        })
        .join('');
    });

    const scoreString = hasWon ? `${guesses.length}/${MAX_GUESSES}` : 'X/6';
    const text = `COMMITLE #${dailyCase.dayNumber} ${scoreString}\n${rows.join('\n')}\nCommitBureau Forensics · commitbureau.io`;
    
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    showToast('COPIED RESULTS TO CLIPBOARD');
    setTimeout(() => setCopiedShare(false), 2500);
  };

  return (
    <section id="daily-commitle" className="commitle-section">
      <div className="commitle-viewport-container">
        {/* HUD Top Strip */}
        <div className="commitle-hud-header">
          <div className="commitle-hud-left">
            <span className="commitle-badge">COMMITLE</span>
            <span className="commitle-day-tag">DOSSIER #{String(dailyCase.dayNumber).padStart(3, '0')}</span>
            <div className="commitle-target-chip">
              <GitBranch size={12} className="chip-ico" />
              <span>{dailyCase.repo}</span>
            </div>
          </div>

          <div className="commitle-hud-right">
            <button
              type="button"
              className={`commitle-hint-btn ${showHint ? 'active' : ''}`}
              onClick={() => {
                playClickSound();
                setShowHint(!showHint);
              }}
              title="Forensic Clue"
            >
              <HelpCircle size={13} />
              <span>{showHint ? 'CLOSE CLUE' : 'FIELD CLUE'}</span>
            </button>
          </div>
        </div>

        {/* Case Incident Brief */}
        <div className="commitle-brief-card">
          <div className="brief-lead-row">
            <span className="brief-tag">// ANOMALY BRIEF:</span>
            <span className="brief-instruction">GUESS THE 5-LETTER GIT COMMAND</span>
          </div>
          <p className="brief-text">{dailyCase.brief}</p>
          {showHint && (
            <div className="commitle-clue-popover">
              <Sparkles size={12} className="clue-sparkle" />
              <span>{dailyCase.hint}</span>
            </div>
          )}
        </div>

        {/* Toast Feedback Banner */}
        {toastMessage && (
          <div className="commitle-toast-banner" role="alert">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Wordle Guess Grid (6 rows of 5 tiles) */}
        <div className="commitle-grid-wrap">
          {Array.from({ length: MAX_GUESSES }).map((_, rowIdx) => {
            const isCompletedRow = rowIdx < guesses.length;
            const isCurrentRow = rowIdx === guesses.length;
            const guessWord = isCompletedRow ? guesses[rowIdx] : isCurrentRow ? currentInput : '';
            const evaluation = isCompletedRow ? evaluateCommitleGuess(guessWord, dailyCase.word) : null;
            const isShaking = isCurrentRow && shakeRow;

            return (
              <div 
                key={rowIdx} 
                className={`commitle-grid-row ${isShaking ? 'shake' : ''}`}
              >
                {Array.from({ length: WORD_LENGTH }).map((_, colIdx) => {
                  const letter = guessWord[colIdx] || '';
                  const status = evaluation ? evaluation[colIdx]?.status : '';
                  const hasLetter = Boolean(letter);

                  return (
                    <div
                      key={colIdx}
                      className={`commitle-tile ${status} ${hasLetter && isCurrentRow ? 'pop' : ''}`}
                      style={{ animationDelay: isCompletedRow ? `${colIdx * 100}ms` : '0ms' }}
                    >
                      <span className="tile-letter">{letter}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Solved / Game Over Debrief Card */}
        {isGameOver && (
          <div className="commitle-verdict-drawer">
            <div className="verdict-banner">
              {hasWon ? (
                <div className="verdict-badge won">
                  <ShieldCheck size={14} />
                  <span>CASE CLEARED IN {guesses.length}/{MAX_GUESSES} GUESSES</span>
                </div>
              ) : (
                <div className="verdict-badge lost">
                  <AlertTriangle size={14} />
                  <span>EVIDENCE SEALED · ANSWER WAS: {dailyCase.word}</span>
                </div>
              )}
              <div className="verdict-stats-strip">
                <span className="stat-pill"><Flame size={12} /> {stats.currentStreak}D STREAK</span>
                <span className="stat-pill"><Award size={12} /> {stats.won}/{stats.played} SOLVED</span>
              </div>
            </div>

            <p className="verdict-explanation">
              <strong>$ {dailyCase.command}:</strong> {dailyCase.explanation}
            </p>

            <div className="verdict-actions-row">
              <button
                type="button"
                className="commitle-share-btn"
                onClick={handleShare}
              >
                {copiedShare ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedShare ? 'COPIED TO CLIPBOARD' : 'SHARE RESULTS'}</span>
              </button>
              <div className="commitle-countdown-box">
                <Clock size={12} />
                <span>NEXT CASE: {timeUntilTomorrow}</span>
              </div>
            </div>
          </div>
        )}

        {/* On-screen Tactical Keyboard */}
        {!isGameOver && (
          <div className="commitle-keyboard">
            {KEYBOARD_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} className="keyboard-row">
                {row.map((k) => {
                  const status = keyStates[k] || '';
                  const isSpecial = k === 'ENTER' || k === 'BACKSPACE';
                  return (
                    <button
                      key={k}
                      type="button"
                      className={`keyboard-key ${status} ${isSpecial ? 'special-key' : ''}`}
                      onClick={() => handleKeyInput(k)}
                    >
                      {k === 'BACKSPACE' ? <Delete size={15} /> : k === 'ENTER' ? <CornerDownLeft size={13} /> : k}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
