import React, { useRef } from 'react';
import Header from '../components/Header';
import BureauBriefing from '../components/BureauBriefing';
import DailyCommitle from '../components/DailyCommitle';
import CaseIntakeConsole from '../components/CaseIntakeConsole';

/**
 * MainPage
 * Single cohesive entry page:
 * - Section 1: Bureau Briefing (Hero & Mission)
 * - Section 2: COMMITLE (The Daily Git Forensics Wordle)
 * - Section 3: Case Intake Console (Target selection)
 */
export default function MainPage({ onStartCase, level = 1, rank = 'Rookie', intakeTab = 'featured', onNavigate, onSelectLevel, mode, onSelectMode }) {
  const commitleSectionRef = useRef(null);
  const intakeSectionRef = useRef(null);

  const handleScrollToCommitle = () => {
    if (commitleSectionRef.current) {
      commitleSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToIntake = (tab) => {
    if (onNavigate && tab) {
      onNavigate('intake', tab);
    }
    if (intakeSectionRef.current) {
      intakeSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNav = (section, tab) => {
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <div ref={commitleSectionRef}>
          <DailyCommitle onScrollToIntake={() => handleScrollToIntake('featured')} />
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
    </div>
  );
}
