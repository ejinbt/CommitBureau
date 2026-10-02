import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Header from '../components/Header';
import BureauBriefing from '../components/BureauBriefing';
import DailyRepos from '../components/DailyRepos';
import CaseIntakeConsole from '../components/CaseIntakeConsole';
import Footer from '../components/Footer';
import HowItWorks from '../components/HowItWorks';

gsap.registerPlugin(ScrollToPlugin);

export default function MainPage({ onStartCase, level = 1, rank = 'Rookie', intakeTab = 'featured', onNavigate, onSelectLevel, onStartDaily }) {
  const commitleSectionRef = useRef(null);
  const intakeSectionRef = useRef(null);
  const howSectionRef = useRef(null);

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
    if (section === 'how') {
      smoothScrollTo(howSectionRef);
      return;
    }
    if (onNavigate) {
      onNavigate(section, tab);
    }
    handleScrollToIntake(tab);
  };

  return (
    <div className="cb-app-shell">
      <div className="cb-bg-ambient" aria-hidden="true" />

      <Header 
        level={level} 
        rank={rank} 
        onStartCaseClick={() => handleScrollToIntake('featured')}
        onNavigate={handleNav} 
      />

      <main>
        <BureauBriefing onScrollToIntake={handleScrollToCommitle} />

        <div ref={commitleSectionRef} id="daily-commitle">
          <DailyRepos onStartDaily={onStartDaily} onScrollNext={() => handleScrollToIntake('featured')} />
        </div>

        <div ref={intakeSectionRef} id="case-intake">
          <CaseIntakeConsole 
            onSelectRepo={onStartCase}
            initialTab={intakeTab}
            level={level}
            onSelectLevel={onSelectLevel}
            onScrollNext={() => smoothScrollTo(howSectionRef)}
          />
        </div>

        <div ref={howSectionRef} id="how-it-works">
          <HowItWorks />
        </div>
      </main>

      <Footer onNavigate={handleNav} />
    </div>
  );
}
