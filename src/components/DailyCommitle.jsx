import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  AlertTriangle,
  FileCode,
  Lock,
  Unlock
} from 'lucide-react';
import gsap from 'gsap';
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
 * Section 2: COMMITLE (The Forensic Decryption Console)
 * - Authentic 6-guess Wordle evaluation with Git forensic terminology
 * - Split cockpit: Crime Scene & Live Redacted Diff (Left) + Decryption Matrix (Right)
 * - Reactive Diff De-redaction: Green letters dynamically decode in the code terminal
 * - 100vh Viewport-fit layout with GSAP animations
 */
export default function DailyCommitle() {
  const dailyCase = useMemo(() => getDailyCommitleCase(), []);
  const storageKey = `cb_commitle_${dailyCase.dateString}`;
  const statsKey = 'cb_commitle_stats';

  const matrixRef = useRef(null);
  const diffRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);

  // GSAP Entrance Timeline for Commitle Console
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.commitle-console-topbar', 
      { opacity: 0, y: -16 }, 
      { opacity: 1, y: 0, duration: 0.55 }
    )
    .fromTo(leftColRef.current, 
      { opacity: 0, x: -25 }, 
      { opacity: 1, x: 0, duration: 0.65 }, 
      '-=0.35'
    )
    .fromTo(rightColRef.current, 
      { opacity: 0, x: 25 }, 
      { opacity: 1, x: 0, duration: 0.65 }, 
      '-=0.55'
    )
    .fromTo('.commitle-tile', 
      { scale: 0.92, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.35, stagger: 0.015, ease: 'back.out(1.5)' }, 
      '-=0.4'
    );

    return () => tl.kill();
  }, []);

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

  // GSAP reveal for verdict drawer
  useEffect(() => {
    if (isGameOver) {
      gsap.fromTo(
        '.commitle-verdict-drawer',
        { opacity: 0, y: 16, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.5)', delay: 0.1 }
      );
    }
  }, [isGameOver]);

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

  // Compute which letters of the target word have been confirmed in correct positions
  const confirmedPositions = useMemo(() => {
    const target = dailyCase.word;
    const confirmed = [null, null, null, null, null];
    if (hasWon) {
      return target.split('');
    }
    guesses.forEach((guess) => {
      for (let i = 0; i < 5; i++) {
        if (guess[i] === target[i]) {
          confirmed[i] = target[i];
        }
      }
    });
    return confirmed;
  }, [guesses, dailyCase.word, hasWon]);

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

        // Trigger GSAP 3D reveal on newest row
        if (matrixRef.current) {
          const rowElements = matrixRef.current.querySelectorAll(`.commitle-grid-row:nth-child(${newGuesses.length}) .commitle-tile`);
          if (rowElements.length > 0) {
            gsap.fromTo(
              rowElements,
              { rotateX: 90, scale: 0.8 },
              { rotateX: 0, scale: 1, duration: 0.45, stagger: 0.08, ease: 'back.out(1.5)' }
            );
          }
        }

        if (isCorrectWord) {
          playCorrectSound();
          setIsGameOver(true);
          setHasWon(true);
          showToast('CASE SOLVED! EVIDENCE CONFIRMED');
          
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

  const diff = dailyCase.diffSnippet;

  return (
    <section id="daily-commitle" className="commitle-section">
      <div className="commitle-console-frame">
        {/* Top Intelligence Strip */}
        <div className="commitle-console-topbar">
          <div className="console-brand-col">
            <span className="console-badge">COMMITLE</span>
            <span className="console-title">FORENSIC CIPHER DECRYPTION</span>
          </div>

          <div className="console-status-col">
            <div className="console-meta-chip">
              <span className="meta-dot pulse" />
              <span>DOSSIER #{String(dailyCase.dayNumber).padStart(3, '0')}</span>
            </div>
            <div className="console-meta-chip repo">
              <GitBranch size={12} className="chip-ico" />
              <span>{dailyCase.repo}</span>
            </div>
            <button
              type="button"
              className={`console-hint-toggle ${showHint ? 'active' : ''}`}
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

        {/* 2-Column Cockpit Console */}
        <div className="commitle-cockpit-grid">
          {/* LEFT COLUMN: The Crime Scene & Live Redacted Diff */}
          <div className="commitle-left-col" ref={leftColRef}>
            {/* Incident Statement */}
            <div className="commitle-incident-pane">
              <div className="incident-lead">
                <span className="lead-tag">// ANOMALY STATEMENT</span>
                <span className="lead-mode">DAILY WORDLE CIPHER</span>
              </div>
              <p className="incident-narrative">{dailyCase.brief}</p>

              {showHint && (
                <div className="incident-hint-drawer">
                  <Sparkles size={12} className="clue-sparkle" />
                  <span>{dailyCase.hint}</span>
                </div>
              )}
            </div>

            {/* Live Redacted Diff Terminal */}
            <div className="commitle-diff-terminal" ref={diffRef}>
              <div className="diff-terminal-header">
                <div className="diff-mac-dots" aria-hidden="true">
                  <span className="dot red" />
                  <span className="dot yellow" />
                  <span className="dot green" />
                </div>
                <div className="diff-filename-bar">
                  <FileCode size={12} />
                  <span>{diff ? diff.file : 'git/evidence.patch'}</span>
                </div>
                <div className="diff-lock-status">
                  {hasWon ? <Unlock size={12} className="unlocked-ico" /> : <Lock size={12} className="locked-ico" />}
                  <span>{hasWon ? 'DECRYPTED' : 'REDACTED'}</span>
                </div>
              </div>

              <div className="diff-terminal-code">
                {diff?.oldCode && (
                  <div className="diff-line del">
                    <span className="line-gutter">14</span>
                    <span className="line-txt">{diff.oldCode}</span>
                  </div>
                )}
                <div className="diff-line add reactive-line">
                  <span className="line-gutter">15</span>
                  <span className="line-txt">
                    <span className="code-prefix">{diff ? diff.prefix : '$ git '}</span>
                    {/* Interactive Redacted Word Bays */}
                    <span className="redacted-word-bay">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const letter = confirmedPositions[i];
                        const isDecrypted = Boolean(letter);
                        return (
                          <span 
                            key={i} 
                            className={`bay-slot ${isDecrypted ? 'revealed' : 'redacted'}`}
                            title={isDecrypted ? `Confirmed: ${letter}` : 'Position Redacted'}
                          >
                            {letter || (currentInput[i] ? currentInput[i] : '?')}
                          </span>
                        );
                      })}
                    </span>
                    <span className="code-suffix">{diff?.suffix || ''}</span>
                  </span>
                </div>
              </div>

              <div className="diff-terminal-footer">
                <span className="footer-tag">STATUS:</span>
                <span className="footer-msg">
                  {hasWon 
                    ? 'CIPHER CONFIRMED · VERIFIED GIT RECTIFICATION' 
                    : `GUESS ${guesses.length} OF ${MAX_GUESSES} · DECODE THE 5-LETTER COMMAND`}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Decryption Matrix & Command Input */}
          <div className="commitle-right-col" ref={rightColRef}>
            {/* Toast Feedback Banner */}
            {toastMessage && (
              <div className="commitle-toast-banner" role="alert">
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Wordle Guess Grid (6 rows of 5 tiles) */}
            <div className="commitle-matrix-panel" ref={matrixRef}>
              <div className="matrix-status-bar">
                <span className="matrix-label">DECRYPTION ATTEMPTS</span>
                <span className="matrix-counter">
                  {guesses.length} / {MAX_GUESSES}
                </span>
              </div>

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
                          >
                            <span className="tile-letter">{letter}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Solved / Game Over Debrief Card */}
            {isGameOver && (
              <div className="commitle-verdict-drawer">
                <div className="verdict-banner">
                  {hasWon ? (
                    <div className="verdict-badge won">
                      <ShieldCheck size={15} />
                      <span>CIPHER CRACKED IN {guesses.length}/{MAX_GUESSES}</span>
                    </div>
                  ) : (
                    <div className="verdict-badge lost">
                      <AlertTriangle size={15} />
                      <span>SEALED · COMMAND: {dailyCase.word}</span>
                    </div>
                  )}
                  <div className="verdict-stats-strip">
                    <span className="stat-pill"><Flame size={12} /> {stats.currentStreak}D STREAK</span>
                    <span className="stat-pill"><Award size={12} /> {stats.won}/{stats.played}</span>
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
                    <span>{copiedShare ? 'COPIED TO CLIPBOARD' : 'SHARE DEBRIEF'}</span>
                  </button>
                  <div className="commitle-countdown-box">
                    <Clock size={12} />
                    <span>NEXT: {timeUntilTomorrow}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tactical CLI Prompt & Compact Keypad */}
            {!isGameOver && (
              <div className="commitle-input-suite">
                {/* CLI Command Input Prompt */}
                <div className="commitle-prompt-bar">
                  <span className="prompt-sym">$</span>
                  <span className="prompt-cmd">git decrypt</span>
                  <div className="prompt-input-preview">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`prompt-char ${currentInput[i] ? 'filled' : 'empty'}`}>
                        {currentInput[i] || '_'}
                      </span>
                    ))}
                  </div>
                  <span className="prompt-key-hint">
                    <CornerDownLeft size={11} /> Enter
                  </span>
                </div>

                {/* Compact Tactical Cyber Keypad */}
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
                            {k === 'BACKSPACE' ? <Delete size={13} /> : k === 'ENTER' ? <CornerDownLeft size={12} /> : k}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
