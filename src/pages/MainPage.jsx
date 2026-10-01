import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import BureauBriefing from '../components/BureauBriefing';
import DailyCommitle from '../components/DailyCommitle';
import CaseIntakeConsole from '../components/CaseIntakeConsole';
import { playClickSound } from '../utils/audio';

/**
 * MainPage
 * Single cohesive entry page:
 * - Section 1: Bureau Briefing (Hero & Mission)
 * - Section 2: COMMITLE (The Daily Git Forensics Wordle)
 * - Section 3: Case Intake Console (Target selection)
 * - Unified Fixed Viewport Navigation Arrow (Identical styling on Section 1 & Section 2)
 */
export default function MainPage({ onStartCase, level = 1, rank = 'Rookie', intakeTab = 'featured', onNavigate, onSelectLevel, mode, onSelectMode }) {
  const commitleSectionRef = useRef(null);
  const intakeSectionRef = useRef(null);
  const [activeSection, setActiveSection] = useState('hero'); // 'hero' | 'commitle' | 'intake'

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      if (scrollY < vh * 0.6) {
        setActiveSection('hero');
      } else if (scrollY < vh * 1.6) {
        setActiveSection('commitle');
      } else {
        setActiveSection('intake');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <div ref={commitleSectionRef} id="daily-commitle">
          <DailyCommitle />
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

      {/* Unified Bottom-Right Viewport Scroll Arrow (Identical across Section 1 and Section 2) */}
      <div className={`cb-hero-scroll-wrapper ${activeSection === 'intake' ? 'hidden' : ''}`}>
        <button
          type="button"
          className="cb-hero-scroll-btn"
          onClick={() => {
            playClickSound();
            if (activeSection === 'hero') {
              handleScrollToCommitle();
            } else {
              handleScrollToIntake('featured');
            }
          }}
          aria-label={activeSection === 'hero' ? 'Scroll to Commitle' : 'Scroll to Case Intake'}
        >
          <span className="cb-scroll-label">
            {activeSection === 'hero' ? 'COMMITLE' : 'CASES'}
          </span>
          <ChevronDown size={18} className="cb-scroll-chevron" />
        </button>
      </div>
    </div>
  );
}
