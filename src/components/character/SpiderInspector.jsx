import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { SPIDER_SPRITES } from '../../assets/spiderAssets';
import './SpiderInspector.css';

/**
 * SpiderInspector: Crouched detective examining evidence with a magnifying glass.
 * Perfect for placement beside diff viewers, case search inputs, and forensic logs.
 */
export default function SpiderInspector({ className = '', label = 'ANALYZING CODE SIGNATURES' }) {
  const spriteRef = useRef(null);
  const lensRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Crouched observation micro-bobbing
      if (spriteRef.current) {
        gsap.to(spriteRef.current, {
          y: -4,
          rotation: -1,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        });
      }

      // Lens scan pulse
      if (lensRef.current) {
        gsap.to(lensRef.current, {
          scale: 1.25,
          opacity: 0.7,
          duration: 1.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className={`cb-spider-inspector ${className}`}>
      <div className="cb-spider-inspector-stage">
        <img
          ref={spriteRef}
          src={SPIDER_SPRITES.investigation}
          alt="Detective Inspecting Clues"
          className="cb-spider-inspector-img"
          draggable="false"
        />
        <div ref={lensRef} className="cb-spider-inspector-lens" />
      </div>
      {label && (
        <div className="cb-spider-inspector-tag cb-mono">
          <span className="cb-spider-inspector-dot" />
          <span>{label}</span>
        </div>
      )}
    </div>
  );
}
