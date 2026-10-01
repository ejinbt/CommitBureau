import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import './Header.css';

/**
 * Floating Capsule Navbar with Physics & Magnetic Interactions
 * - Liquid elastic glider indicator following hovered links
 * - Magnetic spring pull on logo and CTA button
 * - Tactile mechanical keycap CTA button
 */
export default function Header({ onStartCaseClick, onNavigate }) {
  const navLinksRef = useRef(null);
  const gliderRef = useRef(null);
  const logoRef = useRef(null);
  const ctaRef = useRef(null);

  // Magnetic effect for elements
  const setupMagnetic = (elementRef, strength = 0.3) => {
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
    const cleanupLogo = setupMagnetic(logoRef, 0.35);
    const cleanupCta = setupMagnetic(ctaRef, 0.25);

    return () => {
      if (cleanupLogo) cleanupLogo();
      if (cleanupCta) cleanupCta();
    };
  }, []);

  // Liquid Glider for nav links
  const handleLinkHover = (e) => {
    const link = e.currentTarget;
    const nav = navLinksRef.current;
    const glider = gliderRef.current;
    if (!link || !nav || !glider) return;

    const linkRect = link.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();

    const targetX = linkRect.left - navRect.left;
    const targetWidth = linkRect.width;

    gsap.to(glider, {
      opacity: 1,
      x: targetX,
      width: targetWidth,
      duration: 0.4,
      ease: 'elastic.out(1, 0.65)'
    });
  };

  const handleNavLeave = () => {
    if (gliderRef.current) {
      gsap.to(gliderRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

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
        {/* Left: Magnetic Circular Emblem (Returns home) */}
        <div 
          ref={logoRef} 
          className="cb-nav-logo-circle" 
          title="CommitBureau HQ (Home)"
          onClick={handleNavClick('home', 'featured')}
          role="button"
          tabIndex={0}
        >
          <span className="cb-nav-logo-text">CB</span>
        </div>

        {/* Center: Clean Nav Links with Elastic Glider */}
        <nav 
          ref={navLinksRef} 
          className="cb-nav-links"
          onMouseLeave={handleNavLeave}
        >
          {/* Liquid Sliding Glider */}
          <div ref={gliderRef} className="cb-nav-glider" aria-hidden="true" />

          <a 
            href="#case-intake" 
            className="cb-nav-link" 
            onMouseEnter={handleLinkHover}
            onClick={handleNavClick('intake', 'featured')}
          >
            Cases
          </a>
          <a 
            href="#case-intake" 
            className="cb-nav-link" 
            onMouseEnter={handleLinkHover}
            onClick={handleNavClick('intake', 'featured')}
          >
            Featured
          </a>
          <a 
            href="#case-intake" 
            className="cb-nav-link" 
            onMouseEnter={handleLinkHover}
            onClick={handleNavClick('intake', 'archive')}
          >
            My Archive
          </a>
          <a 
            href="https://github.com/ejinbt/CommitBureau" 
            target="_blank" 
            rel="noreferrer" 
            className="cb-nav-link"
            onMouseEnter={handleLinkHover}
          >
            GitHub
          </a>
        </nav>

        {/* Right: Sleek Modern Magnetic CTA */}
        <button 
          ref={ctaRef}
          type="button" 
          className="cb-nav-pill-cta"
          onClick={handleNavClick('intake', 'featured')}
        >
          <span>Start Case</span>
          <span className="cb-nav-arrow" aria-hidden="true">→</span>
        </button>
      </header>
    </div>
  );
}
