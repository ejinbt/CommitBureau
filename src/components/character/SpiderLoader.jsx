import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { SPIDER_SPRITES } from '../../assets/spiderAssets';
import './SpiderLoader.css';

export default function SpiderLoader({
  text = 'INSPECTING GIT REPOSITORY BLOB...',
  subtext = 'INTERROGATING HISTORICAL COMMITS & METADATA',
  fullscreen = false,
  progress = null,
  className = ''
}) {
  const spriteRef = useRef(null);
  const shadowRef = useRef(null);
  const progressLineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (spriteRef.current) {
        gsap.to(spriteRef.current, {
          y: -10,
          rotation: 2.2,
          duration: 0.38,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        });
      }

      if (shadowRef.current) {
        gsap.to(shadowRef.current, {
          scaleX: 0.72,
          opacity: 0.35,
          duration: 0.38,
          repeat: -1,
          yoyo: true,
          ease: 'power1.inOut'
        });
      }

      if (progressLineRef.current && progress === null) {
        gsap.fromTo(
          progressLineRef.current,
          { x: '-100%' },
          { x: '100%', duration: 1.4, repeat: -1, ease: 'power2.inOut' }
        );
      }
    });

    return () => ctx.revert();
  }, [progress]);

  const containerClasses = [
    'cb-spider-loader',
    fullscreen ? 'cb-spider-loader--fullscreen' : 'cb-spider-loader--inline',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="cb-spider-loader-card">
        <div className="cb-spider-loader-stage">
          <img
            ref={spriteRef}
            src={SPIDER_SPRITES.loadWalk}
            alt="Bureau Detective In Motion"
            className="cb-spider-loader-sprite"
            draggable="false"
          />
          <div ref={shadowRef} className="cb-spider-loader-shadow" />
        </div>

        <div className="cb-spider-loader-body">
          <div className="cb-spider-loader-badge cb-mono">
            <span className="cb-spider-loader-pulse" />
            <span>FORENSIC TELEMETRY ACTIVE</span>
          </div>

          <h3 className="cb-spider-loader-text cb-heading">{text}</h3>
          {subtext && <p className="cb-spider-loader-sub cb-mono">{subtext}</p>}

          <div className="cb-spider-loader-progress-track">
            {progress !== null ? (
              <div 
                className="cb-spider-loader-progress-fill" 
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} 
              />
            ) : (
              <div 
                ref={progressLineRef} 
                className="cb-spider-loader-progress-scanner" 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
