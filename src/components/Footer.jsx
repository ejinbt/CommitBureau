import React from 'react';
import { ArrowUp, Terminal, ShieldCheck, GitBranch, ExternalLink } from 'lucide-react';
import gsap from 'gsap';
import logoImg from '../assets/logo.png';
import { playClickSound } from '../utils/audio';
import './Footer.css';

/**
 * Footer Component
 * High-end cyber-forensic footer matching the CommitBureau aesthetic:
 * - Brand emblem & live telemetry indicator
 * - Direct navigation to investigation protocols (Briefing, Commitle, Intake)
 * - Clearance level matrix and intelligence links
 * - Butter-smooth GSAP Return-to-Top trigger
 */
export default function Footer({ onNavigate }) {
  const handleScrollToTop = () => {
    playClickSound();
    gsap.to(window, {
      duration: 1.0,
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
    <footer className="cb-footer">
      <div className="cb-container">
        {/* Top Grid */}
        <div className="cb-footer-grid">
          {/* Column 1: Brand & Status Telemetry */}
          <div className="cb-footer-brand-col">
            <div className="cb-footer-logo-row">
              <img src={logoImg} alt="CommitBureau Logo" className="cb-footer-logo" />
              <div className="cb-footer-brand-text">
                <span className="cb-footer-brand-title cb-heading">COMMITBUREAU</span>
                <span className="cb-footer-brand-sub cb-mono">// FORENSIC REPO LAB</span>
              </div>
            </div>

            <p className="cb-footer-desc">
              Authentic Git repository forensics laboratory. Transform production GitHub commit 
              histories into investigative cases, analyze genuine code diffs, and master professional 
              Git CLI terminal operations.
            </p>

            <div className="cb-footer-status">
              <span className="cb-footer-pulse-dot" />
              <span className="cb-footer-status-label cb-mono">
                TELEMETRY: ALL BUREAU SYSTEMS OPERATIONAL
              </span>
            </div>
          </div>

          {/* Column 2: Investigation Protocols */}
          <div className="cb-footer-col">
            <h4 className="cb-footer-col-title cb-mono">
              <Terminal size={14} className="cb-footer-col-ico" />
              <span>PROTOCOLS</span>
            </h4>
            <ul className="cb-footer-links cb-mono">
              <li>
                <a href="#hero" onClick={handleScrollToTop}>
                  Mission Briefing
                </a>
              </li>
              <li>
                <a href="#daily-commitle" onClick={handleLinkClick('commitle')}>
                  Daily Commitle Cipher
                </a>
              </li>
              <li>
                <a href="#case-intake" onClick={handleLinkClick('intake', 'featured')}>
                  Featured Case Intake
                </a>
              </li>
              <li>
                <a href="#custom-repo" onClick={handleLinkClick('intake', 'custom')}>
                  Custom Repo Inspection
                </a>
              </li>
              <li>
                <a href="#archive" onClick={handleLinkClick('intake', 'archive')}>
                  Personal Detective Archive
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Forensic Clearance */}
          <div className="cb-footer-col">
            <h4 className="cb-footer-col-title cb-mono">
              <ShieldCheck size={14} className="cb-footer-col-ico" />
              <span>CLEARANCE RANKS</span>
            </h4>
            <ul className="cb-footer-links cb-mono">
              <li>
                <span className="cb-footer-rank-tag">LVL 1</span>
                <span>Rookie Investigator</span>
              </li>
              <li>
                <span className="cb-footer-rank-tag">LVL 2</span>
                <span>Junior Detective</span>
              </li>
              <li>
                <span className="cb-footer-rank-tag">LVL 3</span>
                <span>Forensic Auditor</span>
              </li>
              <li>
                <span className="cb-footer-rank-tag">LVL 4</span>
                <span>Senior Inspector</span>
              </li>
              <li>
                <span className="cb-footer-rank-tag">LVL 5</span>
                <span>Principal Bureau Chief</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Intelligence & Telemetry */}
          <div className="cb-footer-col">
            <h4 className="cb-footer-col-title cb-mono">
              <GitBranch size={14} className="cb-footer-col-ico" />
              <span>INTELLIGENCE</span>
            </h4>
            <ul className="cb-footer-links cb-mono">
              <li>
                <a 
                  href="https://github.com/ejinbt/CommitBureau" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cb-footer-ext-link"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub Ecosystem</span>
                  <ExternalLink size={11} className="cb-ext-ico" />
                </a>
              </li>
              <li>
                <span>Git CLI v2.43 Core</span>
              </li>
              <li>
                <span>HMAC Diff Verification</span>
              </li>
              <li>
                <span>Production Bug Patches</span>
              </li>
              <li>
                <span>Zero Mocked Telemetry</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="cb-footer-bottom">
          <div className="cb-footer-copy cb-mono">
            <span>© 2026 CommitBureau HQ. Open Investigation System.</span>
            <span className="cb-footer-sep">/</span>
            <span className="cb-footer-tagline">BUILT FOR DEVELOPERS & GIT DETECTIVES</span>
          </div>

          <div className="cb-footer-actions">
            <button
              type="button"
              className="cb-footer-top-btn cb-mono"
              onClick={handleScrollToTop}
              aria-label="Return to top of page"
            >
              <span>TOP OF DOSSIER</span>
              <ArrowUp size={14} className="cb-top-chevron" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
