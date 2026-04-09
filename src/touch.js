import { setKey } from './input.js';

// Fullscreen touch controls:
// - Left side of screen: steer left
// - Right side of screen: steer right
// - Swipe/hold bottom-left: brake
// - Swipe/hold bottom-right: pedal
// - Tap center/top area: bell
// - Double-tap or two-finger: start game (Enter)

const activeTouches = new Map(); // touchId -> action

export function initTouch() {
  const canvas = document.getElementById('game');

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const action = getAction(touch, canvas);
      activeTouches.set(touch.identifier, action);
      applyAction(action, true);
    }

    // Two fingers = start/restart
    if (e.touches.length >= 2) {
      setKey('Enter', true);
      setTimeout(() => setKey('Enter', false), 100);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const oldAction = activeTouches.get(touch.identifier);
      const newAction = getAction(touch, canvas);
      if (oldAction !== newAction) {
        applyAction(oldAction, false);
        activeTouches.set(touch.identifier, newAction);
        applyAction(newAction, true);
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    for (const touch of e.changedTouches) {
      const action = activeTouches.get(touch.identifier);
      if (action) {
        applyAction(action, false);
        activeTouches.delete(touch.identifier);
      }
    }
  }, { passive: false });

  canvas.addEventListener('touchcancel', (e) => {
    for (const touch of e.changedTouches) {
      const action = activeTouches.get(touch.identifier);
      if (action) {
        applyAction(action, false);
        activeTouches.delete(touch.identifier);
      }
    }
  });

  // Prevent context menu on long press
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

function getAction(touch, canvas) {
  const rect = canvas.getBoundingClientRect();
  const x = (touch.clientX - rect.left) / rect.width;  // 0..1
  const y = (touch.clientY - rect.top) / rect.height;   // 0..1

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
