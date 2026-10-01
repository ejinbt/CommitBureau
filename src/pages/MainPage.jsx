import React, { useRef } from 'react';
import Header from '../components/Header';
import BureauBriefing from '../components/BureauBriefing';
import CaseIntakeConsole from '../components/CaseIntakeConsole';

/**
 * MainPage
 * Single cohesive entry page:
 * - Section 1: Bureau Briefing (Hero & Concept)
 * - Section 2: Case Intake Console (Target selection)
 */
export default function MainPage({ onStartCase, level = 1, rank = 'Rookie', intakeTab = 'featured', onNavigate, onSelectLevel }) {
  const intakeSectionRef = useRef(null);

  const handleScrollToIntake = () => {
    if (intakeSectionRef.current) {
      intakeSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNav = (section, tab) => {
    if (section === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <BureauBriefing onScrollToIntake={() => handleScrollToIntake('featured')} />

        {/* SECTION 2: Case Intake Console (Repository Selection) */}
        <div ref={intakeSectionRef}>
          <CaseIntakeConsole 
            onSelectRepo={onStartCase}
            initialTab={intakeTab}
            level={level}
            onSelectLevel={onSelectLevel}
          />
        </div>
      </main>
    </div>
  );
}
