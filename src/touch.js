import { setKey } from './input.js';
import { toggleMute } from './audio.js';

let gameState = 'title';

export function setTouchGameState(s) {
  gameState = s;
}

export function initTouch() {
  // --- Control buttons (steer, brake, bell, pedal) ---
  document.querySelectorAll('[data-key]').forEach(el => {
    const code = el.dataset.key;

    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setKey(code, true);
      el.classList.add('pressed');
    }, { passive: false });

    el.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setKey(code, false);
      el.classList.remove('pressed');
    }, { passive: false });

    el.addEventListener('touchcancel', () => {
      setKey(code, false);
      el.classList.remove('pressed');
    });

    // Mouse fallback for testing
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      setKey(code, true);
      el.classList.add('pressed');
    });
    el.addEventListener('mouseup', () => {
      setKey(code, false);
      el.classList.remove('pressed');
    });
    el.addEventListener('mouseleave', () => {
      setKey(code, false);
      el.classList.remove('pressed');
    });
  });

  // --- Canvas tap = Enter on title/gameover ---
  const canvas = document.getElementById('game');
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState !== 'playing') {
      setKey('Enter', true);
      setTimeout(() => setKey('Enter', false), 100);
    }
  }, { passive: false });

  // --- Mute button ---
  const muteBtn = document.getElementById('mute-btn');
  if (muteBtn) {
    muteBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const m = toggleMute();
      muteBtn.classList.toggle('muted', m);
      muteBtn.querySelector('span').textContent = m ? '✕' : '♪';
    }, { passive: false });

    // Mouse fallback
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const m = toggleMute();
      muteBtn.classList.toggle('muted', m);
      muteBtn.querySelector('span').textContent = m ? '✕' : '♪';
    });
  }

  // Prevent scroll/zoom on the page
  document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('contextmenu', (e) => e.preventDefault());
}
