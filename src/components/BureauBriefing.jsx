import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import logoImg from '../assets/logo.png';
import { playClickSound } from '../utils/audio';
import SpiderChief from './character/SpiderChief';
import './BureauBriefing.css';

/**
 * Section 1: Bureau Briefing
 * High-impact hero with clean, modern buttons, 100% reliable terminal rendering,
 * and 3D gyroscopic cursor physics.
 */
export default function BureauBriefing({ onScrollToIntake }) {
  const terminalRef = useRef(null);
  const primaryBtnRef = useRef(null);
  const secondaryBtnRef = useRef(null);

  useEffect(() => {
    // Orchestrated GSAP Hero Entrance Timeline
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo('.cb-hero-eyebrow', 
      { opacity: 0, y: -16, scale: 0.96 }, 
      { opacity: 1, y: 0, scale: 1, duration: 0.6 }
    )
    .fromTo('.cb-hero-title', 
      { opacity: 0, y: 24 }, 
      { opacity: 1, y: 0, duration: 0.7 }, 
      '-=0.4'
    )
    .fromTo('.cb-hero-sub', 
      { opacity: 0, y: 18 }, 
      { opacity: 1, y: 0, duration: 0.6 }, 
      '-=0.45'
    )
    .fromTo(['.cb-cta-primary', '.cb-cta-secondary'], 
      { opacity: 0, y: 15, scale: 0.95 }, 
      { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.5 }, 
      '-=0.35'
    )
    .fromTo('.cb-metric-item', 
      { opacity: 0, y: 16 }, 
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.45 }, 
      '-=0.3'
    )
    .fromTo(terminalRef.current, 
      { opacity: 0, y: 35, rotateY: 10, scale: 0.98 }, 
      { opacity: 1, y: 0, rotateY: 0, scale: 1, duration: 0.85, ease: 'power2.out' }, 
      '-=0.6'
    );

    const terminal = terminalRef.current;
    if (!terminal) return () => tl.kill();

    // 3D Gyroscopic Tilt on Terminal Window
    const handleMouseMove = (e) => {
      const rect = terminal.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      gsap.to(terminal, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(terminal, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.5)'
      });
    };

    terminal.addEventListener('mousemove', handleMouseMove);
    terminal.addEventListener('mouseleave', handleMouseLeave);

    // Magnetic physics helper
    const setupMagnetic = (btn, strength = 0.25) => {
      if (!btn) return null;
      const onBtnMove = (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * strength;
        const deltaY = (e.clientY - centerY) * strength;

        gsap.to(btn, {
          x: deltaX,
          y: deltaY,
          duration: 0.25,
          ease: 'power2.out'
        });
      };

      const onBtnLeave = () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)'
        });
      };

      btn.addEventListener('mousemove', onBtnMove);
      btn.addEventListener('mouseleave', onBtnLeave);

      return () => {
        btn.removeEventListener('mousemove', onBtnMove);
        btn.removeEventListener('mouseleave', onBtnLeave);
      };
    };

    const cleanupPrimary = setupMagnetic(primaryBtnRef.current, 0.25);
    const cleanupSecondary = setupMagnetic(secondaryBtnRef.current, 0.2);

    return () => {
      tl.kill();
      terminal.removeEventListener('mousemove', handleMouseMove);
      terminal.removeEventListener('mouseleave', handleMouseLeave);
      if (cleanupPrimary) cleanupPrimary();
      if (cleanupSecondary) cleanupSecondary();
    };
  }, []);

  return (
    <section className="cb-hero-section">
      <div className="cb-container">
        <div className="cb-hero-grid">
          {/* Left Column: Direct Hook & Actions */}
          <div className="cb-hero-content">
            <div className="cb-hero-eyebrow cb-mono">
              <img src={logoImg} alt="CommitBureau Logo" className="cb-hero-eyebrow-logo" />
              <span className="cb-eyebrow-accent">//</span>
              <span>GIT FORENSICS LAB</span>
              <span className="cb-eyebrow-sep">/</span>
              <span>FIRST COMMIT</span>
            </div>

            <h1 className="cb-hero-title cb-heading">
              Turn Public Repos into <span className="cb-gradient-text">Forensic Cases.</span>
            </h1>

            <p className="cb-hero-sub">
              Inspect authentic GitHub commit histories, analyze real production diffs, 
              uncover rogue authors, and master genuine terminal Git commands.
            </p>

            {/* Actions Row */}
            <div className="cb-hero-actions">
              <button 
                ref={primaryBtnRef}
                type="button" 
                className="cb-cta-primary"
                onClick={onScrollToIntake}
              >
                <span>Start Investigation</span>
                <span className="cb-cta-arrow" aria-hidden="true">↓</span>
              </button>

              <button 
                ref={secondaryBtnRef}
                type="button" 
                className="cb-cta-secondary"
                onClick={onScrollToIntake}
              >
                Featured Repos
              </button>
            </div>

            {/* Metrics Row */}
            <div className="cb-metrics-row">
              <div className="cb-metric-item">
                <span className="cb-metric-num cb-heading">5 Rounds</span>
                <span className="cb-metric-label">Per Investigation</span>
              </div>
              <div className="cb-metric-divider" />
              <div className="cb-metric-item">
                <span className="cb-metric-num cb-heading">100% Real</span>
                <span className="cb-metric-label">GitHub Production Diffs</span>
              </div>
              <div className="cb-metric-divider" />
              <div className="cb-metric-item">
                <span className="cb-metric-num cb-heading">Git CLI</span>
                <span className="cb-metric-label">Terminal Command Mastery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Always Visible 3D Tilting Terminal Card & Chief Detective */}
          <div className="cb-hero-visual">
            <div className="cb-ambient-glow" aria-hidden="true" />
            <SpiderChief className="cb-hero-chief" />
            <div ref={terminalRef} className="cb-glass-card cb-terminal-window">
              {/* Window Header */}
              <div className="cb-terminal-header">
                <div className="cb-terminal-dots">
                  <span className="cb-dot red" />
                  <span className="cb-dot yellow" />
                  <span className="cb-dot green" />
                </div>
                <div className="cb-terminal-tab cb-mono">
                  <span className="cb-tab-file">auth_middleware.js</span>
                  <span className="cb-tab-pill">DIFF</span>
                </div>
              </div>

              {/* Code Diff Body */}
              <div className="cb-terminal-diff cb-mono">
                <div className="cb-diff-row hunk">
                  <span className="cb-row-num">--</span>
                  <span className="cb-row-code">@@ -34,4 +34,5 @@ async function verifyRequest(req)</span>
                </div>
                <div className="cb-diff-row del">
                  <span className="cb-row-num">34</span>
                  <span className="cb-row-code">-   const bypassAuth = true;</span>
                </div>
                <div className="cb-diff-row add">
                  <span className="cb-row-num">34</span>
                  <span className="cb-row-code">+   const token = req.headers["authorization"];</span>
                </div>
                <div className="cb-diff-row add">
                  <span className="cb-row-num">35</span>
                  <span className="cb-row-code">+   if (!token) throw new AuthError("Missing Token");</span>
                </div>
                <div className="cb-diff-row add">
                  <span className="cb-row-num">36</span>
                  <span className="cb-row-code">+   await verifyHMACSignature(token, secret);</span>
                </div>
              </div>

              {/* Terminal Footer with Real Git Command */}
              <div className="cb-terminal-footer">
                <div className="cb-command-box cb-mono">
                  <span className="cb-command-prompt">$</span>
                  <span className="cb-command-cmd">git show 5f83b2a</span>
                </div>
                <span className="cb-command-tag cb-mono">SOLVING COMMAND</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom-Right Viewport Scroll Arrow to Section 2 (Commitle) */}
      <div className="cb-section-scroll-arrow">
        <button
          type="button"
          className="cb-hero-scroll-btn"
          onClick={() => {
            playClickSound();
            onScrollToIntake();
          }}
          aria-label="Scroll to Daily Cases"
        >
          <span className="cb-scroll-label">DAILY CASES</span>
          <ChevronDown size={18} className="cb-scroll-chevron" />
        </button>
      </div>
    </section>
  );
}
