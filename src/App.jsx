import React, { useState } from 'react';
import MainPage from './pages/MainPage';
import InvestigationPage from './pages/InvestigationPage';

/**
 * Root Application Component
 * Manages active screen state ('main' | 'investigation' | 'rank')
 * and global detective clearance level.
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [targetRepo, setTargetRepo] = useState(null);
  const [level, setLevel] = useState(1);
  const [rank, setRank] = useState('Rookie');
  const [_lastDebrief, setLastDebrief] = useState(null);

  const handleStartCase = (target) => {
    setTargetRepo(target);
    setCurrentScreen('investigation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishCase = (finalState) => {
    setLastDebrief(finalState);
    // Future Section 4: rank/debrief page
    // For now, if rank unlocked, level up
    if (finalState?.score > 300) {
      setLevel((prev) => Math.min(prev + 1, 3));
      setRank('Detective');
    }
    // Return to main until Section 4 is built
    setCurrentScreen('main');
  };

  const handleExitCase = () => {
    setCurrentScreen('main');
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
    </>
  );
}
