const keys = {};

export function initInput() {
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    e.preventDefault();
  });
}

// For touch controls
export function setKey(code, pressed) {
  keys[code] = pressed;
}

export function isDown(code) {
  return !!keys[code];
}

export function consumeKey(code) {
  if (keys[code]) {
    keys[code] = false;
    return true;
  }
  return false;
}
