import {
  CAR_LEFT, CAR_RIGHT, CAR_W, CAR_CENTER, CAR_LANE_W,
  CAR_LANE_DOWN_CENTER, CAR_LANE_UP_CENTER,
  CAR_SPEED_MIN_KMH, CAR_SPEED_MAX_KMH,
  ONCOMING_SPEED_MIN_KMH, ONCOMING_SPEED_MAX_KMH,
  SIDE_L_LEFT, SIDE_R_LEFT, SIDEWALK_W,
  POTHOLE_SIZE, SPEED_TO_KMH,
  GAME_H, COLORS,
} from './constants.js';

// ---- CARS ----

const CAR_COLORS = ['#3366cc', '#cc3333', '#33aa33', '#888888', '#ffcc00', '#222222', '#cc6600'];

// Same-direction car (left lane) — overtakes from behind
export function createCar(playerSpeed) {
  const playerKmh = playerSpeed * SPEED_TO_KMH;
  const carKmh = Math.max(playerKmh + 20, CAR_SPEED_MIN_KMH + Math.random() * (CAR_SPEED_MAX_KMH - CAR_SPEED_MIN_KMH));
  const carScrollSpeed = carKmh / SPEED_TO_KMH;
  const relativeSpeed = carScrollSpeed - playerSpeed;

  // Spawn in the left (same-direction) lane
  const x = CAR_LANE_DOWN_CENTER + (Math.random() - 0.5) * (CAR_LANE_W - 14);

  return {
    x,
    y: GAME_H + 20,
    relativeSpeed,
    oncoming: false,
    color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
    width: 8 + Math.floor(Math.random() * 4),
    length: 12 + Math.floor(Math.random() * 6),
    frame: 0,
    active: true,
    honked: false,
  };
}

// Oncoming car (right lane) — heading toward you
export function createOncomingCar(playerSpeed) {
  const carKmh = ONCOMING_SPEED_MIN_KMH + Math.random() * (ONCOMING_SPEED_MAX_KMH - ONCOMING_SPEED_MIN_KMH);
  const carScrollSpeed = carKmh / SPEED_TO_KMH;
  // Closing speed = player speed + oncoming speed (they add up!)
  const relativeSpeed = playerSpeed + carScrollSpeed;

  // Spawn in the right (oncoming) lane
  const x = CAR_LANE_UP_CENTER + (Math.random() - 0.5) * (CAR_LANE_W - 14);

  return {
    x,
    y: -20,
    relativeSpeed,
    oncoming: true,
    color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
    width: 8 + Math.floor(Math.random() * 4),
    length: 12 + Math.floor(Math.random() * 6),
    frame: 0,
    active: true,
    honked: false,
  };
}

export function updateCar(car, player) {
  car.frame++;

  if (car.oncoming) {
    // Oncoming: moves downward (toward player)
    car.y += car.relativeSpeed;
    if (car.y > GAME_H + 30) car.active = false;
  } else {
    // Same direction: moves upward (overtaking)
    car.y -= car.relativeSpeed;
    if (car.y < -30) car.active = false;

    // Honk if player is in the car road and car is close behind
    if (!car.honked && player.x >= CAR_LEFT && player.x <= CAR_CENTER) {
      const dy = car.y - player.y;
      if (dy > 0 && dy < 50) {
        car.honked = true;
      }
    }
  }
}

export function checkCarCollision(car, player) {
  const hw = car.width / 2;
  const hl = car.length / 2;
  const dx = Math.abs(car.x - player.x);
  const dy = Math.abs(car.y - player.y);
  return dx < hw + 3 && dy < hl + 4;
}

export function drawCar(ctx, car) {
  const x = Math.round(car.x);
  const y = Math.round(car.y);
  const hw = Math.floor(car.width / 2);
  const hl = Math.floor(car.length / 2);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x - hw + 1, y - hl + 1, car.width, car.length);

  // Body
  ctx.fillStyle = car.color;
  ctx.fillRect(x - hw, y - hl, car.width, car.length);

  // Roof
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x - hw + 2, y - hl + 3, car.width - 4, car.length - 6);

  if (car.oncoming) {
    // Oncoming: headlights face you (top = front)
    ctx.fillStyle = '#ffffcc';
    ctx.fillRect(x - hw, y - hl, 2, 2);
    ctx.fillRect(x + hw - 2, y - hl, 2, 2);
    // Headlight glow
    ctx.fillStyle = 'rgba(255,255,200,0.3)';
    ctx.fillRect(x - hw - 1, y - hl - 2, car.width + 2, 3);
    // Tail lights (bottom = rear)
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(x - hw, y + hl - 2, 1, 2);
    ctx.fillRect(x + hw - 1, y + hl - 2, 1, 2);
    // Windshield
    ctx.fillStyle = 'rgba(150,200,255,0.5)';
    ctx.fillRect(x - hw + 2, y - hl + 2, car.width - 4, 2);
  } else {
    // Same direction: rear faces you (top = rear)
    ctx.fillStyle = '#ff3333';
    ctx.fillRect(x - hw, y - hl, 1, 2);
    ctx.fillRect(x + hw - 1, y - hl, 1, 2);
    // Headlights (bottom = front, facing away)
    ctx.fillStyle = '#ffffaa';
    ctx.fillRect(x - hw, y + hl - 2, 1, 2);
    ctx.fillRect(x + hw - 1, y + hl - 2, 1, 2);
    // Windshield
    ctx.fillStyle = 'rgba(150,200,255,0.5)';
    ctx.fillRect(x - hw + 2, y + hl - 3, car.width - 4, 2);
  }

  // Honk indicator (same-direction only)
  if (!car.oncoming && car.honked && car.frame % 8 < 4) {
    ctx.fillStyle = '#fff';
    ctx.font = '5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HONK', x, y - hl - 3);
    ctx.textAlign = 'left';
  }
}

// ---- POTHOLES ----

export function createPothole() {
  const onLeft = Math.random() > 0.5;
  const sideLeft = onLeft ? SIDE_L_LEFT : SIDE_R_LEFT;
  const x = sideLeft + 3 + Math.random() * (SIDEWALK_W - 6);

  return {
    x,
    y: -10 - Math.random() * 20,
    size: POTHOLE_SIZE + Math.floor(Math.random() * 2),
    active: true,
  };
}

export function updatePothole(pothole, playerSpeed) {
  pothole.y += playerSpeed;
  if (pothole.y > GAME_H + 10) {
    pothole.active = false;
  }
}

export function checkPotholeCollision(pothole, player) {
  const dx = Math.abs(pothole.x - player.x);
  const dy = Math.abs(pothole.y - player.y);
  return dx < pothole.size + 2 && dy < pothole.size + 3;
}

export function drawPothole(ctx, pothole) {
  const x = Math.round(pothole.x);
  const y = Math.round(pothole.y);
  const s = pothole.size;

  ctx.fillStyle = COLORS.potholeRim;
  for (let dy = -s - 1; dy <= s + 1; dy++) {
    for (let dx = -s - 1; dx <= s + 1; dx++) {
      if (dx * dx + dy * dy <= (s + 1) * (s + 1)) {
        ctx.fillRect(x + dx, y + dy, 1, 1);
      }
    }
  }

  ctx.fillStyle = COLORS.pothole;
  for (let dy = -s; dy <= s; dy++) {
    for (let dx = -s; dx <= s; dx++) {
      if (dx * dx + dy * dy <= s * s) {
        ctx.fillRect(x + dx, y + dy, 1, 1);
      }
    }
  }

  ctx.fillStyle = '#2a2015';
  ctx.fillRect(x - s, y, s * 2 + 1, 1);
  ctx.fillRect(x, y - s, 1, s * 2 + 1);
}
