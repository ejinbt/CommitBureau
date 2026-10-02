import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ShieldCheck, AlertOctagon, X } from 'lucide-react';
import { SPIDER_SPRITES } from '../../assets/spiderAssets';
import './SpiderReaction.css';

export default function SpiderReaction({
  type = 'correct',
  title,
  subtitle,
  children,
  onClose
}) {
  const modalRef = useRef(null);
  const spriteRef = useRef(null);
  const cardRef = useRef(null);

  const isCorrect = type === 'correct';
  const sprite = isCorrect ? SPIDER_SPRITES.correct : SPIDER_SPRITES.wrong;
  const defaultTitle = isCorrect ? 'CASE SOLVED / CIPHER DECRYPTED' : 'INVESTIGATION FAILED / ARCHIVE SEALED';
  const defaultSubtitle = isCorrect 
    ? 'All forensic telemetry verified. Culprit signature successfully isolated.' 
    : 'The culprit escaped into the commit history. Telemetry was inconclusive.';

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardRef.current) {
        gsap.fromTo(
          cardRef.current,
          { scale: 0.82, opacity: 0, y: isCorrect ? 30 : -20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: isCorrect ? 'back.out(1.6)' : 'power3.out' }
        );
      }

      if (spriteRef.current) {
        if (isCorrect) {
          gsap.timeline({ repeat: -1, yoyo: true })
            .to(spriteRef.current, { y: -8, rotation: 1.5, duration: 1.1, ease: 'power1.inOut' });
        } else {
          gsap.timeline({ repeat: -1, yoyo: true })
            .to(spriteRef.current, { x: 3, rotation: -1, duration: 1.4, ease: 'sine.inOut' });
        }
      }
    });

    return () => ctx.revert();
  }, [isCorrect]);

  return (
    <div ref={modalRef} className={`cb-spider-reaction cb-spider-reaction--${type}`}>
      <div ref={cardRef} className="cb-spider-reaction-card">
        {onClose && (
          <button 
            type="button" 
            className="cb-spider-reaction-close" 
            onClick={onClose}
            aria-label="Close reaction"
          >
            <X size={18} />
          </button>
        )}

        <div className="cb-spider-reaction-stage">
          <img
            ref={spriteRef}
            src={sprite}
            alt={isCorrect ? 'Victorious Detective' : 'Dejected Detective'}
            className="cb-spider-reaction-sprite"
            draggable="false"
          />
          <div className="cb-spider-reaction-glow" />
        </div>

        <div className="cb-spider-reaction-content">
          <div className="cb-spider-reaction-badge cb-mono">
            {isCorrect ? <ShieldCheck size={14} /> : <AlertOctagon size={14} />}
            <span>{isCorrect ? 'VERDICT: CONFIRMED' : 'VERDICT: COMPROMISED'}</span>
          </div>

          <h2 className="cb-spider-reaction-title cb-heading">
            {title || defaultTitle}
          </h2>

          <p className="cb-spider-reaction-sub cb-mono">
            {subtitle || defaultSubtitle}
          </p>

          {children && (
            <div className="cb-spider-reaction-actions">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
