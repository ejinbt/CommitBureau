import React, { useState } from 'react';
import MainPage from './pages/MainPage';
import InvestigationPage from './pages/InvestigationPage';
import DebriefPage from './pages/DebriefPage';
import { finalReport } from './api';

/**
 * Root Application Component
 * Manages active screen state ('main' | 'investigation' | 'debrief')
 * and global detective clearance level.
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('main'); // 'main' | 'investigation' | 'debrief'
  const [targetRepo, setTargetRepo] = useState(null);
  const [level, setLevel] = useState(1);
  const [rank, setRank] = useState('Rookie');
  const [lastDebrief, setLastDebrief] = useState(null);
  const [lastLevelPlayed, setLastLevelPlayed] = useState(1);

  const handleStartCase = (target) => {
    setTargetRepo(target);
    setCurrentScreen('investigation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishCase = (finalState) => {
    setLastDebrief(finalState);
    const levelPlayed = level;
    setLastLevelPlayed(levelPlayed);

    const report = finalReport(finalState, levelPlayed);
    setRank(report.rank);

    if (report.unlocked) {
      setLevel((prev) => Math.min(prev + 1, 5));
    }

    setCurrentScreen('debrief');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitCase = () => {
    setCurrentScreen('main');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayAgain = () => {
    setCurrentScreen('investigation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {currentScreen === 'main' && (
        <MainPage 
          level={level} 
          rank={rank} 
          onStartCase={handleStartCase} 
        />
      )}

      {currentScreen === 'investigation' && (
        <InvestigationPage
          targetRepo={targetRepo}
          level={level}
          rank={rank}
          onFinishCase={handleFinishCase}
          onExitCase={handleExitCase}
        />
      )}

      {currentScreen === 'debrief' && (
        <DebriefPage
          targetRepo={targetRepo}
          gameState={lastDebrief}
          level={lastLevelPlayed}
          onPlayAgain={handlePlayAgain}
          onReturnIntake={handleExitCase}
        />
      )}
    </>
  );
}
