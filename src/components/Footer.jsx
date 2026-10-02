import React from 'react';
import { ArrowUp, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import logoImg from '../assets/logo.png';
import { playClickSound } from '../utils/audio';
import './Footer.css';

/**
 * Clean Cyber-Forensic Minimalist Footer
 */
export default function Footer({ onNavigate }) {
  const handleScrollToTop = () => {
    playClickSound();
    gsap.to(window, {
      duration: 0.9,
      scrollTo: { y: 0, autoKill: false },
      ease: 'power3.inOut'
    });
  };

  const handleLinkClick = (section, tab) => (e) => {
    e.preventDefault();
    playClickSound();
    if (onNavigate) {
      onNavigate(section, tab);
    }
  };

  return (
    <footer className="cb-footer-clean">
      <div className="cb-container">
        <div className="cb-footer-clean-content">
          {/* Brand & Telemetry */}
          <div className="cb-footer-clean-brand">
            <img src={logoImg} alt="CommitBureau Logo" className="cb-footer-clean-logo" />
            <div className="cb-footer-clean-title-group">
              <span className="cb-footer-clean-title cb-heading">COMMITBUREAU</span>
              <span className="cb-footer-clean-telemetry cb-mono">
                <span className="cb-footer-dot" /> SYSTEM ONLINE
              </span>
            </div>
          </div>

          {/* Clean HUD Navigation Links */}
          <nav className="cb-footer-clean-nav cb-mono">
            <a href="#hero" onClick={handleScrollToTop}>
              BRIEFING
            </a>
            <span className="cb-footer-bullet" aria-hidden="true">/</span>
            <a href="#daily-commitle" onClick={handleLinkClick('commitle')}>
              DAILY CASES
            </a>
            <span className="cb-footer-bullet" aria-hidden="true">/</span>
            <a href="#case-intake" onClick={handleLinkClick('intake', 'featured')}>
              CASES
            </a>
            <span className="cb-footer-bullet" aria-hidden="true">/</span>
            <a 
              href="https://github.com/ejinbt/CommitBureau" 
              target="_blank" 
              rel="noopener noreferrer"
              className="cb-footer-clean-ext"
            >
              <span>GITHUB</span>
              <ExternalLink size={11} />
            </a>
          </nav>

          {/* Return To Top Action */}
          <div className="cb-footer-clean-action">
            <button
              type="button"
              className="cb-footer-clean-btn cb-mono"
              onClick={handleScrollToTop}
              aria-label="Return to top"
            >
              <span>TOP</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>

        {/* Minimal Copyright Line */}
        <div className="cb-footer-clean-bottom cb-mono">
          <span>© 2026 CommitBureau HQ. Authentic Git Repository Forensics.</span>
          <span className="cb-footer-clean-tag">OPEN INVESTIGATION PLATFORM</span>
        </div>
      </div>
    </footer>
  );
}
