import React from 'react';
import './Header.css';

/**
 * Floating Capsule Navbar
 * Directly modeled after user's reference:
 * Circular monogram logo on left, clean navigation links in center, high-contrast pill CTA on right.
 */
export default function Header({ onStartCaseClick }) {
  return (
    <div className="cb-nav-wrapper">
      <header className="cb-capsule-nav">
        {/* Left: Circular Monogram Logo */}
        <div className="cb-nav-logo-circle">
          <span className="cb-nav-logo-text">CB</span>
        </div>

        {/* Center: Clean Nav Links */}
        <nav className="cb-nav-links">
          <a href="#case-intake" className="cb-nav-link" onClick={onStartCaseClick}>
            Cases
          </a>
          <a href="#case-intake" className="cb-nav-link" onClick={onStartCaseClick}>
            Featured
          </a>
          <a href="#case-intake" className="cb-nav-link" onClick={onStartCaseClick}>
            My Archive
          </a>
          <a 
            href="https://github.com/ejinbt/CommitBureau" 
            target="_blank" 
            rel="noreferrer" 
            className="cb-nav-link"
          >
            GitHub
          </a>
        </nav>

        {/* Right: Pill CTA Button */}
        <button 
          type="button" 
          className="cb-nav-pill-cta"
          onClick={onStartCaseClick}
        >
          Start Case
        </button>
      </header>
    </div>
  );
}
