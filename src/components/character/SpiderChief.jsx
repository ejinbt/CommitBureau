import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { SPIDER_SPRITES } from '../../assets/spiderAssets';
import './SpiderChief.css';

/**
 * SpiderChief: The Bureau Chief Detective ambient hero character.
 * High-presence standing detective with interactive parallax, breathing idle physics,
 * and glowing cybernetic HUD telemetry.
 */
export default function SpiderChief({ className = '' }) {
  const containerRef = useRef(null);
  const spriteRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Atmospheric breathing & floating idle
      if (spriteRef.current) {
        gsap.to(spriteRef.current, {
          y: -10,
          rotation: 0.8,
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      // Eye aura pulsing
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0.85,
          scale: 1.15,
          duration: 2.2,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        });
      }
    }, containerRef);

    // Subtle 3D cursor tilt parallax
    const handleMouseMove = (e) => {
      if (!spriteRef.current) return;
      const { innerWidth, innerHeight } = window;
      const offsetX = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const offsetY = (e.clientY - innerHeight / 2) / (innerHeight / 2);

      gsap.to(spriteRef.current, {
        x: offsetX * 12,
        rotationY: offsetX * 8,
        rotationX: -offsetY * 6,
        duration: 0.8,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      ctx.revert();
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className={`cb-spider-chief ${className}`}>
      <div className="cb-spider-chief-wrapper">
        <div ref={glowRef} className="cb-spider-chief-aura" />
        <img
          ref={spriteRef}
          src={SPIDER_SPRITES.idle}
          alt="CommitBureau Chief Detective"
          className="cb-spider-chief-img"
          draggable="false"
        />
        {/* Holographic HUD Badge */}
        <div className="cb-spider-chief-badge cb-mono">
          <span className="cb-spider-chief-dot" />
          <span>CHIEF INVESTIGATOR</span>
        </div>
      </div>
    </div>
  );
}
