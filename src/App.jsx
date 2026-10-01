import React, { useState, useEffect } from 'react';
import MainPage from './pages/MainPage';
import InvestigationPage from './pages/InvestigationPage';
import DebriefPage from './pages/DebriefPage';
import DetectiveCursor from './components/DetectiveCursor';
import { finalReport, RANKS } from './api';

// The chosen level survives a reload. Storage can be blocked (private mode), so fall back to level 1.
const LEVEL_KEY = 'cb_level';
function loadLevel() {
  try {
    const saved = Number(localStorage.getItem(LEVEL_KEY));
    return saved >= 1 && saved <= 5 ? saved : 1;
  } catch {
    return 1;
  }
}

/**
 * Root Application Component
 * Manages active screen state ('main' | 'investigation' | 'debrief')
 * and global detective clearance level with browser history integration.
 */
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('main'); // 'main' | 'investigation' | 'debrief'
  const [targetRepo, setTargetRepo] = useState(null);
  const [level, setLevel] = useState(loadLevel);
  const [rank, setRank] = useState(() => RANKS[loadLevel() - 1]);
  const [lastDebrief, setLastDebrief] = useState(null);
  const [lastLevelPlayed, setLastLevelPlayed] = useState(1);
  const [intakeTab, setIntakeTab] = useState('featured');

  // Remember the level for the next visit.
  useEffect(() => {
    try {
      localStorage.setItem(LEVEL_KEY, String(level));
    } catch {
      // Storage blocked: the level just won't survive a reload.
    }
  }, [level]);

  // The level picker on the home screen: jump straight to any level.
  const handleSelectLevel = (nextLevel) => {
    setLevel(nextLevel);
    setRank(RANKS[nextLevel - 1]);
  };

  // Handle browser back and forward button events
  useEffect(() => {
    // Replace initial state so we have a baseline screen recorded
    window.history.replaceState({ screen: 'main' }, '', window.location.href);

    const handlePopState = (e) => {
      if (e.state && e.state.screen) {
        setCurrentScreen(e.state.screen);
      } else {
        // Fallback to main screen if history state is undefined
        setCurrentScreen('main');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleStartCase = (target) => {
    setTargetRepo(target);
    setCurrentScreen('investigation');
    window.history.pushState({ screen: 'investigation' }, '', window.location.href);
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
    window.history.pushState({ screen: 'debrief' }, '', window.location.href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExitCase = (preferredTab) => {
    if (preferredTab) {
      setIntakeTab(preferredTab);
    }
    setCurrentScreen('main');
    window.history.pushState({ screen: 'main' }, '', window.location.href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayAgain = () => {
    setCurrentScreen('investigation');
    window.history.pushState({ screen: 'investigation' }, '', window.location.href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (section, tab) => {
    if (tab) {
      setIntakeTab(tab);
    }
    if (currentScreen !== 'main') {
      setCurrentScreen('main');
      window.history.pushState({ screen: 'main' }, '', window.location.href);
    }
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTimeout(() => {
        const el = document.getElementById('case-intake');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  return (
    <>
      <DetectiveCursor />
      {currentScreen === 'main' && (
        <MainPage 
          level={level} 
          rank={rank} 
          intakeTab={intakeTab}
          onStartCase={handleStartCase}
          onNavigate={handleNavigate}
          onSelectLevel={handleSelectLevel}
        />
      )}

      {currentScreen === 'investigation' && (
        <InvestigationPage
          targetRepo={targetRepo}
          level={level}
          rank={rank}
          onFinishCase={handleFinishCase}
          onExitCase={handleExitCase}
          onNavigate={handleNavigate}
        />
      )}

      {currentScreen === 'debrief' && (
        <DebriefPage
          targetRepo={targetRepo}
          gameState={lastDebrief}
          level={lastLevelPlayed}
          onPlayAgain={handlePlayAgain}
          onReturnIntake={handleExitCase}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
}
