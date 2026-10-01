import React, { useState } from 'react';
import MainPage from './pages/MainPage';
import InvestigationPage from './pages/InvestigationPage';
import DebriefPage from './pages/DebriefPage';

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

  const handleStartCase = (target) => {
    setTargetRepo(target);
    setCurrentScreen('investigation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishCase = (finalState) => {
    setLastDebrief(finalState);
    if (finalState?.score >= 320) {
      setLevel((prev) => Math.min(prev + 1, 3));
      setRank('Inspector');
    } else if (finalState?.score >= 200) {
      setRank('Detective');
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
          level={level}
          onPlayAgain={handlePlayAgain}
          onReturnIntake={handleExitCase}
        />
      )}
    </>
  );
}
