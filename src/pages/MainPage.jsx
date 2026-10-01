import React, { useRef } from 'react';
import Header from '../components/Header';
import BureauBriefing from '../components/BureauBriefing';

/**
 * MainPage
 * Single cohesive entry page:
 * - Section 1: Bureau Briefing (Hero & Concept)
 * - Section 2: Case Intake Console (Target selection)
 */
export default function MainPage({ _onStartCase, level = 1, rank = 'Rookie' }) {
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

        {/* SECTION 2 Anchor: Case Intake Console (Next section) */}
        <div ref={intakeSectionRef} id="case-intake">
          {/* Section 2 will be mounted here */}
        </div>
      </main>
    </div>
  );
}
