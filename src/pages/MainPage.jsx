import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Header from '../components/Header';
import BureauBriefing from '../components/BureauBriefing';
import DailyCommitle from '../components/DailyCommitle';
import CaseIntakeConsole from '../components/CaseIntakeConsole';
import { playClickSound } from '../utils/audio';

gsap.registerPlugin(ScrollToPlugin);

/**
 * MainPage
 * Single cohesive entry page:
 * - Section 1: Bureau Briefing (Hero & Mission)
 * - Section 2: COMMITLE (The Daily Git Forensics Wordle)
 * - Section 3: Case Intake Console (Target selection)
 * - Unified Fixed Viewport Navigation Arrow (Identical styling on Section 1 & Section 2)
 * - Butter-smooth GSAP ScrollToPlugin navigation physics
 */
export default function MainPage({ onStartCase, level = 1, rank = 'Rookie', intakeTab = 'featured', onNavigate, onSelectLevel, mode, onSelectMode }) {
  const commitleSectionRef = useRef(null);
  const intakeSectionRef = useRef(null);
  const scrollBtnRef = useRef(null);
  const [activeSection, setActiveSection] = useState('hero'); // 'hero' | 'commitle' | 'intake'

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const vh = window.innerHeight;
          let next = 'hero';
          if (scrollY < vh * 0.5) {
            next = 'hero';
          } else if (scrollY < vh * 1.5) {
            next = 'commitle';
          } else {
            next = 'intake';
          }
          setActiveSection((prev) => (prev !== next ? next : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Magnetic cursor physics on the bottom-right scroll button
  useEffect(() => {
    const btn = scrollBtnRef.current;
    if (!btn) return;

    const onMouseMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.3;
      const deltaY = (e.clientY - centerY) * 0.3;

      gsap.to(btn, {
        x: deltaX,
        y: deltaY,
        duration: 0.25,
        ease: 'power2.out'
      });
    };

    const onMouseLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'elastic.out(1, 0.4)'
      });
    };

    btn.addEventListener('mousemove', onMouseMove);
    btn.addEventListener('mouseleave', onMouseLeave);

    return () => {
      btn.removeEventListener('mousemove', onMouseMove);
      btn.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

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
          ref={scrollBtnRef}
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
