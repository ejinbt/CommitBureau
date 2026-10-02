import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { SPIDER_SPRITES } from '../../assets/spiderAssets';
import './SpiderLoader.css';

/**
 * SpiderLoader: High-action forensic walking detective loader.
 * Renders the marching detective with ground shadow physics and cyber telemetry.
 * 
 * @param {string} text - Primary loading status message
 * @param {string} subtext - Secondary technical telemetry detail
 * @param {boolean} fullscreen - Whether to display as a full overlay or inline box
 * @param {number} progress - Optional 0-100 progress value
 */
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
      // Detective walking stride bob and tilt
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

      // Ground shadow expands/contracts with footfall
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

      // Telemetry laser scan beam on progress track
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
        {/* Animated Walking Sprite Stride */}
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

        {/* Status Telemetry */}
        <div className="cb-spider-loader-body">
          <div className="cb-spider-loader-badge cb-mono">
            <span className="cb-spider-loader-pulse" />
            <span>FORENSIC TELEMETRY ACTIVE</span>
          </div>

          <h3 className="cb-spider-loader-text cb-heading">{text}</h3>
          {subtext && <p className="cb-spider-loader-sub cb-mono">{subtext}</p>}

          {/* Cyber Progress Indicator */}
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
