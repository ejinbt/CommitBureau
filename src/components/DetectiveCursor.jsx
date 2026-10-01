import React, { useEffect, useState } from 'react';
import './DetectiveCursor.css';

/**
 * Custom Detective Magnifying Glass Cursor
 * - Normal size everywhere on the page with emerald crosshairs and lens tint
 * - Zooms / expands into an active inspection lens when hovering the navbar (.cb-nav-wrapper or .cb-capsule-nav)
 * - Auto-hides on touch / mobile devices where pointers are coarse
 */
export default function DetectiveCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHoveringNav, setIsHoveringNav] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isOverTerminal, setIsOverTerminal] = useState(false);

  useEffect(() => {
    // Only enable custom cursor if device has fine pointer (mouse/trackpad)
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const onMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering navbar
      const target = e.target;
      const navElement = target?.closest?.('.cb-nav-wrapper, .cb-capsule-nav');
      setIsHoveringNav(Boolean(navElement));

      // Check if hovering clickable element
      const clickable = target?.closest?.('button, a, input, select, textarea, [role="button"]');
      setIsPointer(Boolean(clickable));

      // Inside the investigation terminal the normal text cursor is used instead of the lens.
      setIsOverTerminal(Boolean(target?.closest?.('.inv-terminal')));
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible || isOverTerminal) return null;

  return (
    <div
      className={`cb-detective-cursor ${isHoveringNav ? 'zoomed-lens' : ''} ${isPointer ? 'is-pointer' : ''}`}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`
      }}
      aria-hidden="true"
    >
      <div className="cb-lens-frame">
        {/* Optical Glass Lens */}
        <div className="cb-lens-glass">
          <div className="cb-lens-reflection" />
          <div className="cb-lens-crosshair-x" />
          <div className="cb-lens-crosshair-y" />
          <div className="cb-lens-center-dot" />
        </div>
        {/* Metal Handle */}
        <div className="cb-lens-handle">
          <div className="cb-lens-handle-accent" />
        </div>
      </div>
      {isHoveringNav && <span className="cb-lens-zoom-badge">1.5×</span>}
    </div>
  );
}
