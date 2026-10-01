import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Flame, Award, Loader2, GitBranch } from 'lucide-react';
import Header from '../components/Header';
import CaseCard from '../components/CaseCard';
import { buildGame, scoreAnswer } from '../api';
import './InvestigationPage.css';

/**
 * InvestigationPage Component (Cockpit HUD)
 * - 3-Column Cockpit Header (Repo chip, Segmented Round Pips, Glowing CRT Score readout)
 * - Case investigation flow
 */
export default function InvestigationPage({
  targetRepo,
  level = 1,
  rank = 'Rookie',
  onFinishCase,
  onExitCase,
  onNavigate
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);

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

  // Initialize game rounds
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
  }, [targetRepo, level]);

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
            <span className="error-title">Initialization Error</span>
            <p className="error-desc">{error}</p>
            <button
              type="button"
              className="error-return-btn"
              onClick={onExitCase}
            >
              Return to Intake
            </button>
          </div>
        )}

        {/* Active Investigation Case */}
        {!loading && !error && currentRound && (
          <div className="investigation-flow">
            {/* Cockpit HUD Bar */}
            <div className="investigation-cockpit-bar">
              {/* Left Column: Repo & Branch Chip */}
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
                  <GitBranch size={13} className="branch-ico" />
                  <span className="target-repo-name">
                    {targetRepo ? `${targetRepo.owner}/${targetRepo.repo}` : 'torvalds/linux'}
                  </span>
                  <span className="target-branch-badge">main</span>
                </div>
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
            />
          </div>
        )}
      </main>
    </div>
  );
}
