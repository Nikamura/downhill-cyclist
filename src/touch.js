import { setKey } from './input.js';

// Touch zones (during gameplay):
// - Left half: steer left
// - Right half: steer right
// - Bottom-left 30%: brake
// - Bottom-right 30%: pedal
// - Top center: bell
//
// On title/gameover: any tap = Enter (start)

const activeTouches = new Map();
let gameState = 'title'; // synced from main.js

export function setTouchGameState(s) {
  gameState = s;
}

export function initTouch() {
  document.addEventListener('touchstart', (e) => {
    e.preventDefault();

    // On title or gameover, any tap = Enter
    if (gameState !== 'playing') {
      setKey('Enter', true);
      setTimeout(() => setKey('Enter', false), 100);
      return;
    }

    for (const touch of e.changedTouches) {
      const action = getAction(touch);
      activeTouches.set(touch.identifier, action);
      applyAction(action, true);
    }
  }, { passive: false });

  document.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (gameState !== 'playing') return;

    for (const touch of e.changedTouches) {
      const oldAction = activeTouches.get(touch.identifier);
      const newAction = getAction(touch);
      if (oldAction !== newAction) {
        applyAction(oldAction, false);
        activeTouches.set(touch.identifier, newAction);
        applyAction(newAction, true);
      }
    }
  }, { passive: false });

  document.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const action = activeTouches.get(touch.identifier);
      if (action) {
        applyAction(action, false);
        activeTouches.delete(touch.identifier);
      }
    }
  }, { passive: false });

  document.addEventListener('touchcancel', (e) => {
    for (const touch of e.changedTouches) {
      const action = activeTouches.get(touch.identifier);
      if (action) {
        applyAction(action, false);
        activeTouches.delete(touch.identifier);
      }
    }
  });

  document.addEventListener('contextmenu', (e) => e.preventDefault());
}

function getAction(touch) {
  const x = touch.clientX / window.innerWidth;   // 0..1
  const y = touch.clientY / window.innerHeight;   // 0..1

  // Bottom 30% = brake (left) or pedal (right)
  if (y > 0.7) {
    return x < 0.5 ? 'brake' : 'pedal';
  }

  // Top 25% center = bell
  if (y < 0.25 && x > 0.25 && x < 0.75) {
    return 'bell';
  }

  // Left/right halves = steer
  return x < 0.5 ? 'left' : 'right';
}

function applyAction(action, pressed) {
  switch (action) {
    case 'left':  setKey('ArrowLeft', pressed); break;
    case 'right': setKey('ArrowRight', pressed); break;
    case 'brake': setKey('ArrowDown', pressed); break;
    case 'pedal': setKey('ArrowUp', pressed); break;
    case 'bell':
      if (pressed) {
        setKey('Space', true);
        setTimeout(() => setKey('Space', false), 100);
      }
      break;
  }
}
