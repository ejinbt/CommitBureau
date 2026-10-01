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
export default function MainPage({ onStartCase, level = 1, rank = 'Rookie' }) {
  const intakeSectionRef = useRef(null);

  const handleScrollToIntake = () => {
    if (intakeSectionRef.current) {
      intakeSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="cb-app-shell">
      {/* Floating Capsule Header */}
      <Header level={level} rank={rank} onStartCaseClick={handleScrollToIntake} />

      <main>
        {/* SECTION 1: Bureau Briefing & Forensics Mission */}
        <BureauBriefing onScrollToIntake={handleScrollToIntake} />

        {/* SECTION 2: Case Intake Console (Repository Selection) */}
        <div ref={intakeSectionRef}>
          <CaseIntakeConsole onSelectRepo={onStartCase} />
        </div>
      </main>
    </div>
  );
}
