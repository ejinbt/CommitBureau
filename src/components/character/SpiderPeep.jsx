import React, { useRef, useEffect, useState, useCallback } from 'react';
import gsap from 'gsap';
import { SPIDER_SPRITES } from '../../assets/spiderAssets';
import './SpiderPeep.css';

export default function SpiderPeep({
  side = 'right',
  mode = 'viewport',
  top = '50%',
  delay = 2,
  interval = 14,
  active = true,
  className = ''
}) {
  const peepRef = useRef(null);
  const imgRef = useRef(null);
  const [isPeeping, setIsPeeping] = useState(false);
  const isAnimatingRef = useRef(false);

  const sprite = side === 'left' ? SPIDER_SPRITES.peepLeft : SPIDER_SPRITES.peepRight;

  const peekOut = useCallback(() => {
    if (!peepRef.current || isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsPeeping(true);

    const el = peepRef.current;
    const hideX = side === 'left' ? '-90%' : '90%';
    const showX = '0%';

    gsap.timeline({
      onComplete: () => {
        gsap.to(el, {
          y: '+=4',
          rotation: side === 'left' ? 1.5 : -1.5,
          duration: 1.2,
          repeat: 3,
          yoyo: true,
          ease: 'sine.inOut'
        });

        gsap.delayedCall(4.5, retreat);
      }
    })
    .fromTo(el,
      { x: hideX, opacity: 0 },
      { x: showX, opacity: 1, duration: 0.8, ease: 'back.out(1.4)' }
    );
  }, [side]);

  const retreat = useCallback(() => {
    if (!peepRef.current) return;
    const el = peepRef.current;
    const hideX = side === 'left' ? '-100%' : '100%';

    gsap.killTweensOf(el);
    gsap.to(el, {
      x: hideX,
      opacity: 0,
      duration: 0.6,
      ease: 'power3.in',
      onComplete: () => {
        isAnimatingRef.current = false;
        setIsPeeping(false);
      }
    });
  }, [side]);

  const handleInteraction = () => {
    if (!peepRef.current || !isPeeping) return;
    const el = peepRef.current;

    gsap.timeline()
      .to(el, { scale: 1.08, duration: 0.12, ease: 'power1.out' })
      .to(el, { scale: 1, duration: 0.15, ease: 'power2.in', onComplete: retreat });
  };

  useEffect(() => {
    if (!active) return;

    const initTimer = setTimeout(() => {
      peekOut();
    }, delay * 1000);

    let cycleInterval = null;
    if (interval > 0) {
      cycleInterval = setInterval(() => {
        peekOut();
      }, interval * 1000);
    }

    return () => {
      clearTimeout(initTimer);
      if (cycleInterval) clearInterval(cycleInterval);
      if (peepRef.current) gsap.killTweensOf(peepRef.current);
    };
  }, [active, delay, interval, peekOut]);

  const containerClasses = [
    'cb-spider-peep',
    `cb-spider-peep--${side}`,
    `cb-spider-peep--${mode}`,
    className
  ].filter(Boolean).join(' ');

  const hideTransform = side === 'left' ? 'translateX(-100%)' : 'translateX(100%)';

  return (
    <div
      ref={peepRef}
      className={containerClasses}
      style={{
        top,
        transform: hideTransform,
        opacity: 0
      }}
      onClick={handleInteraction}
      onMouseEnter={handleInteraction}
      role="presentation"
      aria-hidden="true"
    >
      <div className="cb-spider-peep-frame">
        <img
          ref={imgRef}
          src={sprite}
          alt=""
          className="cb-spider-peep-img"
          draggable="false"
        />
        <div className="cb-spider-peep-glow" />
      </div>
    </div>
  );
}
