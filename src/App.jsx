import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import MainPage from './pages/MainPage';
import InvestigationPage from './pages/InvestigationPage';
import DebriefPage from './pages/DebriefPage';
import DetectiveCursor from './components/DetectiveCursor';
import { finalReport, RANKS } from './api';
import { attachTactileAudioListener } from './utils/audio';

gsap.registerPlugin(ScrollToPlugin);

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

  // Mount global tactile button audio listener
  useEffect(() => {
    return attachTactileAudioListener();
  }, []);

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

  const smoothScrollToTop = () => {
    gsap.to(window, {
      duration: 0.8,
      scrollTo: { y: 0, autoKill: false },
      ease: 'power3.inOut'
    });
  };

  const smoothScrollToEl = (id) => {
    const el = document.getElementById(id);
    if (el) {
      gsap.to(window, {
        duration: 0.95,
        scrollTo: { y: el, autoKill: false },
        ease: 'power3.inOut'
      });
    }
  };

  // A Daily Repo case plays at its own level and doesn't move the player's saved level.
  const [dailyRun, setDailyRun] = useState(null); // { difficulty, level, date } while playing a daily case

  const handleStartDaily = (daily) => {
    setDailyRun({ difficulty: daily.difficulty, level: daily.level, date: daily.date });
    setTargetRepo({ owner: daily.owner, repo: daily.repo });
    setCurrentScreen('investigation');
    window.history.pushState({ screen: 'investigation' }, '', window.location.href);
    smoothScrollToTop();
  };

  const handleStartCase = (target) => {
    setDailyRun(null);
    setTargetRepo(target);
    setCurrentScreen('investigation');
    window.history.pushState({ screen: 'investigation' }, '', window.location.href);
    smoothScrollToTop();
  };

  const handleFinishCase = (finalState) => {
    setLastDebrief(finalState);
    const levelPlayed = dailyRun ? dailyRun.level : level;
    setLastLevelPlayed(levelPlayed);

    const report = finalReport(finalState, levelPlayed);

    if (dailyRun) {
      // Remember today's result for this difficulty, shown on the Daily Repos card.
      try {
        localStorage.setItem(
          `cb_daily_${dailyRun.date}_${dailyRun.difficulty}`,
          JSON.stringify({ percent: report.percent, score: report.score, correct: report.correctCount, total: report.totalCount })
        );
      } catch {
        // Storage blocked: the card just won't show the result.
      }
    } else {
      setRank(report.rank);
      if (report.unlocked) {
        setLevel((prev) => Math.min(prev + 1, 5));
      }
    }

    setCurrentScreen('debrief');
    window.history.pushState({ screen: 'debrief' }, '', window.location.href);
    smoothScrollToTop();
  };

  const handleExitCase = (preferredTab) => {
    if (preferredTab) {
      setIntakeTab(preferredTab);
    }
    setCurrentScreen('main');
    window.history.pushState({ screen: 'main' }, '', window.location.href);
    smoothScrollToTop();
  };

  const handlePlayAgain = () => {
    setCurrentScreen('investigation');
    window.history.pushState({ screen: 'investigation' }, '', window.location.href);
    smoothScrollToTop();
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
      smoothScrollToTop();
    } else if (section === 'commitle' || section === 'daily') {
      setTimeout(() => {
        smoothScrollToEl('daily-commitle');
      }, 50);
    } else {
      setTimeout(() => {
        smoothScrollToEl('case-intake');
      }, 50);
    }
  };

  const screenContainerRef = useRef(null);

  // Butter-smooth GSAP transition between screens
  useEffect(() => {
    if (screenContainerRef.current) {
      gsap.fromTo(
        screenContainerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, clearProps: 'all', ease: 'power2.out' }
      );
    }
  }, [currentScreen]);

  return (
    <>
      <DetectiveCursor />
      <div ref={screenContainerRef} className="cb-screen-viewport">
        {currentScreen === 'main' && (
          <MainPage 
            level={level} 
            rank={rank} 
            intakeTab={intakeTab}
            onStartCase={handleStartCase}
            onStartDaily={handleStartDaily}
            onNavigate={handleNavigate}
            onSelectLevel={handleSelectLevel}
          />
        )}

        {currentScreen === 'investigation' && (
          <InvestigationPage
            targetRepo={targetRepo}
            level={dailyRun ? dailyRun.level : level}
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
            daily={dailyRun}
            onPlayAgain={handlePlayAgain}
            onReturnIntake={handleExitCase}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </>
  );
}
