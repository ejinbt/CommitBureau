/**
 * CommitBureau Web Audio Synthesizer
 * Zero-latency procedural sound effects using native browser Web Audio API.
 * Guaranteed instant playback without external file loading or network lag.
 */

let audioCtx = null;
let lastClickTime = 0;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Auto-unlock audio context on first user interaction anywhere
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
}

/**
 * Tactical UI Click Sound
 * Crisp, punchy tactile micro-click feedback for button presses.
 */
export function playClickSound() {
  try {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - lastClickTime < 35) return; // Prevent double-trigger within 35ms
    lastClickTime = now;

    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.045);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.045);
  } catch {
    // Audio playback blocked or unsupported
  }
}

/**
 * Correct Case Solved Sound
 * Upbeat, rewarding cyber chime (3-note ascending arpeggio C5 -> E5 -> G5).
 */
export function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      const startTime = now + idx * 0.08;
      const duration = 0.32;

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  } catch {
    // Audio playback blocked or unsupported
  }
}

/**
 * Wrong Clue Sound
 * Descending cyber warning buzz for incorrect selections.
 */
export function playWrongSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.26);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  } catch {
    // Audio playback blocked or unsupported
  }
}

/**
 * Global Tactile Audio Listener
 * Guarantees every single interactive button in the app / game triggers tactile click sound.
 */
export function attachTactileAudioListener() {
  if (typeof window === 'undefined') return () => {};

  const handleGlobalClick = (e) => {
    const target = e.target;
    if (!target) return;
    const btn = target.closest('button, [role="button"], a.cb-hud-tab, input[type="submit"], .inv-chip');
    if (btn) {
      playClickSound();
    }
  };

  document.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
  return () => {
    document.removeEventListener('click', handleGlobalClick, { capture: true });
  };
}

