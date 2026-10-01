import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Flame, Award, Loader2, GitBranch, Key, X, Check, RotateCcw } from 'lucide-react';
import Header from '../components/Header';
import CaseCard from '../components/CaseCard';
import logoImg from '../assets/logo.png';
import { buildGame, scoreAnswer, setToken } from '../api';
import './InvestigationPage.css';

/**
 * InvestigationPage Component (Cockpit HUD)
 * - 3-Column Cockpit Header (Repo chip, Segmented Round Pips, Glowing CRT Score readout)
 * - In-game GitHub token access for uninterrupted gameplay and rate limit recovery
 * - Case investigation flow
 */
export default function InvestigationPage({
  targetRepo,
  level = 1,
  mode = 'classic',
  rank = 'Rookie',
  onFinishCase,
  onExitCase,
  onNavigate
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);

  // In-game GitHub Token state
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState(() => {
    try {
      return localStorage.getItem('cb_github_token') || '';
    } catch {
      return '';
    }
  });
  const [tokenSavedMsg, setTokenSavedMsg] = useState(null);

  // Game state per docs/CONTRACT.md
  const [gameState, setGameState] = useState({
    score: 0,
    streak: 0,
    maxStreak: 0,
    answers: []
  });

  // Current round interaction state
  const [isAnswered, setIsAnswered] = useState(false);
  const [userAnswerIndex, setUserAnswerIndex] = useState(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  const [reloadSeq, setReloadSeq] = useState(0);

  // Initialize and load game rounds
  useEffect(() => {
    let isMounted = true;

    async function initCase() {
      try {
        setLoading(true);
        setError(null);

        const target = targetRepo || { owner: 'torvalds', repo: 'linux' };
        const fetchedRounds = await buildGame(target, level);

        if (isMounted) {
          setRounds(fetchedRounds || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to initialize forensic case.');
          setLoading(false);
        }
      }
    }

    initCase();
    return () => {
      isMounted = false;
    };
  }, [targetRepo, level, reloadSeq]);

  const handleRetryCase = useCallback(() => {
    setReloadSeq((prev) => prev + 1);
  }, []);

  // Token management handler
  const handleSaveToken = (overrideVal) => {
    const valueToSave = (overrideVal !== undefined ? overrideVal : tokenInput).trim();
    try {
      if (valueToSave) {
        localStorage.setItem('cb_github_token', valueToSave);
      } else {
        localStorage.removeItem('cb_github_token');
      }
    } catch {
      // Storage unavailable
    }
    setToken(valueToSave);
    setTokenInput(valueToSave);
    setTokenSavedMsg(valueToSave ? 'Token saved' : 'Token removed');
    setTimeout(() => setTokenSavedMsg(null), 2500);

    if (error) {
      setReloadSeq((prev) => prev + 1);
    }
  };

  const currentRound = rounds[currentRoundIdx];

  // Answer handler
  const handleAnswer = useCallback(
    (pickedIndex, usedHint = false) => {
      if (isAnswered || !currentRound) return;

      const updatedState = scoreAnswer(gameState, currentRound, pickedIndex, usedHint);
      const lastAnswer = updatedState.answers[updatedState.answers.length - 1];

      setGameState(updatedState);
      setUserAnswerIndex(pickedIndex);
      setIsCorrect(lastAnswer.isCorrect);
      setPointsAwarded(lastAnswer.points);
      setIsAnswered(true);
    },
    [isAnswered, currentRound, gameState]
  );

  // Advance to next round or finish
  const handleNextRound = useCallback(() => {
    if (currentRoundIdx + 1 < rounds.length) {
      setCurrentRoundIdx((prev) => prev + 1);
      setIsAnswered(false);
      setUserAnswerIndex(null);
      setIsCorrect(false);
      setPointsAwarded(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (onFinishCase) {
        onFinishCase(gameState);
      }
    }
  }, [currentRoundIdx, rounds.length, gameState, onFinishCase]);

  // Keyboard shortcut listener for options [1..4]
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAnswered || !currentRound || loading) return;
      // Typing in the investigation terminal (e.g. "-n 3") must not pick an answer.
      if (e.target instanceof Element && e.target.closest('input, textarea')) return;

      if (e.key === '1') handleAnswer(0);
      else if (e.key === '2') handleAnswer(1);
      else if (e.key === '3') handleAnswer(2);
      else if (e.key === '4') handleAnswer(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentRound, loading, handleAnswer]);

  return (
    <div className="investigation-screen-container">
      {/* Top Floating Header */}
      <Header
        level={level}
        rank={rank}
        onStartCaseClick={onExitCase}
        onNavigate={onNavigate || ((sec, tab) => onExitCase(tab))}
      />

      <main className="investigation-viewport">
        {/* Loading state */}
        {loading && (
          <div className="investigation-state-card">
            <Loader2 size={32} className="spin-indicator" />
            <div className="state-text-block">
              <span className="state-headline">INITIALIZING FORENSIC ENVIRONMENT</span>
              <span className="state-sub">Decrypting commit tree and verifying cryptographic hashes...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="investigation-error-block">
            <span className="error-title">Investigation Error</span>
            <p className="error-desc">{error}</p>

            <div className="investigation-token-box">
              <div className="investigation-token-header">
                <Key size={14} className="investigation-token-icon" />
                <span>Add GitHub Token to Continue</span>
              </div>
              <p className="investigation-token-help">
                Enter your GitHub token to bypass rate limits and continue this case immediately.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveToken();
                }}
                className="investigation-token-form"
              >
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste GitHub Personal Access Token"
                  className="investigation-token-input"
                />
                <button type="submit" className="investigation-token-submit-btn">
                  Save & Continue
                </button>
              </form>
              {tokenSavedMsg && <span className="investigation-token-success">{tokenSavedMsg}</span>}
            </div>

            <div className="error-actions-row">
              <button
                type="button"
                className="error-retry-btn"
                onClick={handleRetryCase}
              >
                <RotateCcw size={12} />
                <span>Retry</span>
              </button>
              <button
                type="button"
                className="error-return-btn"
                onClick={onExitCase}
              >
                Return to Intake
              </button>
            </div>
          </div>
        )}

        {/* Active Investigation Case */}
        {!loading && !error && currentRound && (
          <div className="investigation-flow">
            {/* Cockpit HUD Bar */}
            <div className="investigation-cockpit-bar">
              {/* Left Column: Repo & Branch Chip + Token Button */}
              <div className="cockpit-left">
                <button
                  type="button"
                  className="cockpit-exit-btn"
                  onClick={onExitCase}
                  title="Abandon investigation"
                >
                  <ArrowLeft size={13} />
                  <span>ABANDON</span>
                </button>

                <div className="cockpit-target-chip">
                  <img src={logoImg} alt="CommitBureau" className="cockpit-logo-icon" />
                  <GitBranch size={13} className="branch-ico" />
                  <span className="target-repo-name">
                    {targetRepo ? `${targetRepo.owner}/${targetRepo.repo}` : 'torvalds/linux'}
                  </span>
                  <span className="target-branch-badge">main</span>
                </div>

                <button
                  type="button"
                  className={`cockpit-token-trigger ${tokenInput ? 'active' : ''}`}
                  onClick={() => setShowTokenModal(true)}
                  title={tokenInput ? 'GitHub Token Active' : 'Add GitHub Token'}
                >
                  <Key size={12} />
                  <span className="cockpit-token-label">{tokenInput ? 'TOKEN ACTIVE' : 'ADD TOKEN'}</span>
                  {tokenInput && <span className="cockpit-token-pip" />}
                </button>
              </div>

              {/* Center Column: Segmented Round Pips */}
              <div className="cockpit-center">
                <span className="pips-label">ROUND {currentRoundIdx + 1} / {rounds.length}</span>
                <div className="pips-track">
                  {rounds.map((_, i) => {
                    const isPassed = i < currentRoundIdx || (i === currentRoundIdx && isAnswered && isCorrect);
                    const isCurrent = i === currentRoundIdx;
                    return (
                      <div
                        key={i}
                        className={`round-pip ${isPassed ? 'passed' : ''} ${isCurrent ? 'active' : ''}`}
                        title={`Round ${i + 1}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Digital Phosphor Readouts */}
              <div className="cockpit-right">
                <div className="cockpit-stat-cell">
                  <div className="stat-label-row">
                    <Award size={11} className="stat-icon" />
                    <span>SCORE</span>
                  </div>
                  <span className="stat-phosphor-val">
                    {gameState.score.toString().padStart(4, '0')}
                  </span>
                </div>

                <div className="cockpit-stat-cell">
                  <div className="stat-label-row">
                    <Flame size={11} className={`stat-icon ${gameState.streak > 0 ? 'streak-fire' : ''}`} />
                    <span>STREAK</span>
                  </div>
                  <span className={`stat-phosphor-val ${gameState.streak > 0 ? 'streak-glow' : ''}`}>
                    {gameState.streak}X
                  </span>
                </div>
              </div>
            </div>

            {/* Active Case Round */}
            <CaseCard
              round={currentRound}
              roundNumber={currentRoundIdx + 1}
              totalRounds={rounds.length}
              onAnswer={handleAnswer}
              isAnswered={isAnswered}
              userAnswerIndex={userAnswerIndex}
              isCorrect={isCorrect}
              pointsAwarded={pointsAwarded}
              onNextRound={handleNextRound}
              mode={mode}
              targetRepo={targetRepo}
            />
          </div>
        )}
      </main>

      {/* In-Game Token Modal */}
      {showTokenModal && (
        <div className="investigation-modal-backdrop" onClick={() => setShowTokenModal(false)}>
          <div
            className="investigation-token-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <div className="modal-title-row">
                <Key size={15} className="modal-key-icon" />
                <span className="modal-title">GitHub Token</span>
                {tokenInput && <span className="modal-status-badge">ACTIVE</span>}
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowTokenModal(false)}
                aria-label="Close modal"
              >
                <X size={15} />
              </button>
            </div>

            <p className="modal-desc">
              Add your personal token to prevent GitHub rate limits and continue playing uninterrupted.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveToken();
                setShowTokenModal(false);
              }}
              className="modal-form"
            >
              <div className="modal-input-wrap">
                <input
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste GitHub Personal Access Token"
                  className="modal-token-input"
                  autoFocus
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="modal-save-btn">
                  Save & Continue
                </button>
                {tokenInput && (
                  <button
                    type="button"
                    className="modal-remove-btn"
                    onClick={() => handleSaveToken('')}
                  >
                    Remove
                  </button>
                )}
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setShowTokenModal(false)}
                >
                  Close
                </button>
              </div>
            </form>

            {tokenSavedMsg && (
              <div className="modal-feedback">
                <Check size={13} />
                <span>{tokenSavedMsg}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
