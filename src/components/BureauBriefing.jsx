import React from 'react';
import './BureauBriefing.css';

/**
 * Section 1: Bureau Briefing
 * High-impact hero with clean engineering typography.
 * Removed the generic AI pill badge; replaced with authentic metadata.
 */
export default function BureauBriefing({ onScrollToIntake }) {
  return (
    <section className="cb-hero-section">
      <div className="cb-container">
        <div className="cb-hero-grid">
          {/* Left Column: Direct Hook & Actions */}
          <div className="cb-hero-content">
            <div className="cb-hero-eyebrow cb-mono">
              <span className="cb-eyebrow-accent">//</span>
              <span>GIT FORENSICS LAB</span>
              <span className="cb-eyebrow-sep">/</span>
              <span>FIRST COMMIT</span>
            </div>

            <h1 className="cb-hero-title cb-heading">
              Turn Public Repos into <span className="cb-gradient-text">Crime Cases.</span>
            </h1>

            <p className="cb-hero-sub">
              Inspect authentic GitHub commit histories, analyze real production diffs, 
              uncover rogue authors, and master genuine terminal Git commands.
            </p>

            <div className="cb-hero-actions">
              <button 
                type="button" 
                className="cb-btn-emerald"
                onClick={onScrollToIntake}
              >
                <span>Start Investigation</span>
                <span className="cb-btn-arrow" aria-hidden="true">↓</span>
              </button>

              <button 
                type="button" 
                className="cb-btn-glass"
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

          {/* Right Column: Glowing Dark Glass Terminal Card */}
          <div className="cb-hero-visual">
            <div className="cb-ambient-glow" aria-hidden="true" />
            <div className="cb-glass-card cb-terminal-window">
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
    </section>
  );
}
