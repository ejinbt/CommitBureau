import React, { useRef, useEffect } from 'react';
import { Folder, Database, FileText, Plus, ArrowRight, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import logoImg from '../assets/logo.webp';
import './Header.css';

/**
 * Cyber-Forensic Capsule Navbar modeled after user's reference:
 * - Left: Official Brand Logo with green neon underglow & high-contrast brand lettering
 * - Center: Bracketed active tab "Cases", Commitle (Daily), Archive, How it works, GitHub
 * - Status Pill: Pulsing green "SYSTEM ONLINE / REPO FORENSICS READY"
 * - Right: Beveled Neon "+ NEW INVESTIGATION ->" Tactical Action Button
 */
export default function Header({ onStartCaseClick, onNavigate }) {
  const logoRef = useRef(null);

  // Magnetic spring pull on logo
  const setupMagnetic = (elementRef, strength = 0.15) => {
    const el = elementRef.current;
    if (!el) return;

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(el, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const onMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.4)'
      });
    };

    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);

    return () => {
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseleave', onMouseLeave);
    };
  };

  useEffect(() => {
    const cleanupLogo = setupMagnetic(logoRef, 0.15);

    return () => {
      if (cleanupLogo) cleanupLogo();
    };
  }, []);

  const handleNavClick = (section, tab) => (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(section, tab);
    } else if (onStartCaseClick) {
      onStartCaseClick(e);
    }
  };

  return (
    <div className="cb-nav-wrapper">
      <header className="cb-capsule-nav">
        {/* Left: CommitBureau Brand Official Logo Only */}
        <div 
          ref={logoRef} 
          className="cb-nav-brand-container" 
          title="CommitBureau HQ (Home)"
          onClick={handleNavClick('home', 'featured')}
          role="button"
          tabIndex={0}
        >
          <img src={logoImg} alt="CommitBureau Logo" className="cb-nav-logo-standalone" />
        </div>

        {/* Center: HUD Nav Tabs */}
        <nav className="cb-nav-links">
          {/* Active Bracketed Cases Tab */}
          <button 
            type="button" 
            className="cb-hud-tab active-cases"
            onClick={handleNavClick('intake', 'featured')}
          >
            <Folder size={14} className="hud-tab-icon" />
            <span className="hud-tab-label">CASES</span>
            <span className="hud-corner-bl" />
            <span className="hud-corner-br" />
          </button>

          {/* Daily Commitle Wordle Tab */}
          <button 
            type="button" 
            className="cb-hud-tab cb-commitle-tab"
            onClick={handleNavClick('commitle', 'daily')}
          >
            <Sparkles size={13} className="hud-tab-icon icon-glow-gold" />
            <span className="hud-tab-label">DAILY</span>
            <span className="hud-daily-pill">DAILY</span>
          </button>

          {/* Archive Tab */}
          <button 
            type="button" 
            className="cb-hud-tab"
            onClick={handleNavClick('intake', 'archive')}
          >
            <Database size={13} className="hud-tab-icon" />
            <span className="hud-tab-label">ARCHIVE</span>
          </button>

          {/* How It Works / Briefing */}
          <button 
            type="button" 
            className="cb-hud-tab"
            onClick={handleNavClick('how')}
          >
            <FileText size={13} className="hud-tab-icon" />
            <span className="hud-tab-label">HOW IT WORKS</span>
          </button>

          {/* GitHub Repo */}
          <a 
            href="https://github.com/ejinbt/CommitBureau" 
            target="_blank" 
            rel="noreferrer" 
            className="cb-hud-tab cb-hud-link"
          >
            <svg 
              className="hud-tab-icon" 
              width="13" 
              height="13" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="hud-tab-label">GITHUB</span>
          </a>
        </nav>

        {/* Right Section: Tactical Action CTA */}
        <div className="cb-nav-right-cluster">
          {/* Rounded Beveled Neon Action Button */}
          <button 
            type="button" 
            className="cb-cyber-cta"
            onClick={handleNavClick('intake', 'featured')}
          >
            <span className="cb-cyber-cta-glow" />
            <div className="cb-cyber-cta-inner">
              <Plus size={15} strokeWidth={3} className="cb-cta-plus" />
              <span className="cb-cta-title">NEW INVESTIGATION</span>
              <span className="cb-cta-arrow-box">
                <ArrowRight size={13} strokeWidth={2.5} />
              </span>
            </div>
          </button>
        </div>
      </header>
    </div>
  );
}
