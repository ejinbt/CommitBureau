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

const LEVEL_KEY = 'cb_level';
function loadLevel() {
  try {
    const saved = Number(localStorage.getItem(LEVEL_KEY));
    return saved >= 1 && saved <= 5 ? saved : 1;
  } catch {
    return 1;
  }
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('main');
  const [targetRepo, setTargetRepo] = useState(null);
  const [level, setLevel] = useState(loadLevel);
  const [rank, setRank] = useState(() => RANKS[loadLevel() - 1]);
  const [lastDebrief, setLastDebrief] = useState(null);
  const [lastLevelPlayed, setLastLevelPlayed] = useState(1);
  const [intakeTab, setIntakeTab] = useState('featured');

  useEffect(() => {
    try {
      localStorage.setItem(LEVEL_KEY, String(level));
    } catch {
    }
  }, [level]);

  const handleSelectLevel = (nextLevel) => {
    setLevel(nextLevel);
    setRank(RANKS[nextLevel - 1]);
  };

  useEffect(() => {
    return attachTactileAudioListener();
  }, []);

  useEffect(() => {
    window.history.replaceState({ screen: 'main' }, '', window.location.href);

    const handlePopState = (e) => {
      if (e.state && e.state.screen) {
        setCurrentScreen(e.state.screen);
      } else {
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

  const [dailyRun, setDailyRun] = useState(null);

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
      try {
        localStorage.setItem(
          `cb_daily_${dailyRun.date}_${dailyRun.difficulty}`,
          JSON.stringify({ percent: report.percent, score: report.score, correct: report.correctCount, total: report.totalCount })
        );
      } catch {
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
    } else if (section === 'how') {
      setTimeout(() => {
        smoothScrollToEl('how-it-works');
      }, 50);
    } else {
      setTimeout(() => {
        smoothScrollToEl('case-intake');
      }, 50);
    }
  };

  const screenContainerRef = useRef(null);

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
