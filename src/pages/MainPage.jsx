import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Header from '../components/Header';
import BureauBriefing from '../components/BureauBriefing';
import DailyCommitleSet from '../components/DailyCommitleSet';
import CaseIntakeConsole from '../components/CaseIntakeConsole';
import Footer from '../components/Footer';

gsap.registerPlugin(ScrollToPlugin);

/**
 * MainPage
 * Single cohesive entry page:
 * - Section 1: Bureau Briefing (Hero & Mission with down arrow)
 * - Section 2: COMMITLE (The Daily Git Forensics Wordle with down arrow)
 * - Section 3: Case Intake Console (Target selection)
 * - Footer: System telemetry, clearance matrix & protocol links
 * - Butter-smooth GSAP ScrollToPlugin navigation physics
 */
export default function MainPage({ onStartCase, level = 1, rank = 'Rookie', intakeTab = 'featured', onNavigate, onSelectLevel, mode, onSelectMode }) {
  const commitleSectionRef = useRef(null);
  const intakeSectionRef = useRef(null);

  const smoothScrollTo = (target) => {
    if (typeof target === 'number') {
      gsap.to(window, {
        duration: 0.95,
        scrollTo: { y: target, autoKill: false },
        ease: 'power3.inOut'
      });
      return;
    }

    if (target && target.current) {
      gsap.to(window, {
        duration: 0.95,
        scrollTo: { y: target.current, autoKill: false },
        ease: 'power3.inOut'
      });
    }
  };

  const handleScrollToCommitle = () => {
    smoothScrollTo(commitleSectionRef);
  };

  const handleScrollToIntake = (tab) => {
    if (onNavigate && tab) {
      onNavigate('intake', tab);
    }
    smoothScrollTo(intakeSectionRef);
  };

  const handleNav = (section, tab) => {
    if (section === 'home') {
      smoothScrollTo(0);
      return;
    }
    if (section === 'commitle' || section === 'daily') {
      handleScrollToCommitle();
      return;
    }
    if (onNavigate) {
      onNavigate(section, tab);
    }
    handleScrollToIntake(tab);
  };

  return (
    <div className="cb-app-shell">
      {/* High-Performance Fixed GPU Layer for Ambient Lighting */}
      <div className="cb-bg-ambient" aria-hidden="true" />

      {/* Floating Capsule Header */}
      <Header 
        level={level} 
        rank={rank} 
        onStartCaseClick={() => handleScrollToIntake('featured')}
        onNavigate={handleNav} 
      />

      <main>
        {/* SECTION 1: Bureau Briefing & Forensics Mission */}
        <BureauBriefing onScrollToIntake={handleScrollToCommitle} />

        {/* SECTION 2: COMMITLE (Daily Wordle Forensics Case) */}
        <div ref={commitleSectionRef} id="daily-commitle">
          <DailyCommitleSet onScrollToCases={() => handleScrollToIntake('featured')} />
        </div>

        {/* SECTION 3: Case Intake Console (Repository Selection) */}
        <div ref={intakeSectionRef} id="case-intake">
          <CaseIntakeConsole 
            onSelectRepo={onStartCase}
            initialTab={intakeTab}
            level={level}
            onSelectLevel={onSelectLevel}
            mode={mode}
            onSelectMode={onSelectMode}
          />
        </div>
      </main>

      {/* Forensic Intelligence Footer */}
      <Footer onNavigate={handleNav} />
    </div>
  );
}
