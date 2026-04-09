import { setKey } from './input.js';

export function initTouch() {
  document.querySelectorAll('[data-key]').forEach(el => {
    const code = el.dataset.key;

    el.addEventListener('touchstart', (e) => {
      e.preventDefault();
      setKey(code, true);
      el.classList.add('pressed');
    }, { passive: false });

    el.addEventListener('touchend', (e) => {
      e.preventDefault();
      setKey(code, false);
      el.classList.remove('pressed');
    }, { passive: false });

    el.addEventListener('touchcancel', () => {
      setKey(code, false);
      el.classList.remove('pressed');
    });

    // Mouse fallback for desktop testing
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      setKey(code, true);
      el.classList.add('pressed');
    });

    el.addEventListener('mouseup', (e) => {
      e.preventDefault();
      setKey(code, false);
      el.classList.remove('pressed');
    });

    el.addEventListener('mouseleave', () => {
      setKey(code, false);
      el.classList.remove('pressed');
    });
  });

  // Prevent any default touch behavior on the game boy body
  document.querySelector('.gameboy')?.addEventListener('touchmove', (e) => {
    e.preventDefault();
  }, { passive: false });
}
