import {
  CAR_LEFT, CAR_RIGHT, CAR_W, CAR_CENTER, CAR_LANE_W,
  CAR_LANE_DOWN_CENTER, CAR_LANE_UP_CENTER,
  CAR_SPEED_MIN_KMH, CAR_SPEED_MAX_KMH,
  ONCOMING_SPEED_MIN_KMH, ONCOMING_SPEED_MAX_KMH,
  SIDE_L_LEFT, SIDE_R_LEFT, SIDEWALK_W,
  POTHOLE_SIZE, SPEED_TO_KMH,
  GAME_H, GAME_W, COLORS,
  BIKE_L_CENTER, BIKE_R_CENTER, BIKE_W,
  RAMP_MIN_SPEED_KMH, JUMP_DURATION_BASE, JUMP_DURATION_SPEED_FACTOR,
  BIRD_SPEED_MIN, BIRD_SPEED_MAX,
  wrappedDx,
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
  const dx = wrappedDx(car.x, player.x);
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
  const dx = wrappedDx(pothole.x, player.x);
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

// ---- RAMPS ----

export function createRamp() {
  const onLeft = Math.random() > 0.5;
  const x = onLeft ? BIKE_L_CENTER : BIKE_R_CENTER;

  return {
    x,
    y: -15,
    width: BIKE_W - 4,
    length: 8,
    active: true,
    used: false,
  };
}

export function updateRamp(ramp, playerSpeed) {
  ramp.y += playerSpeed;
  if (ramp.y > GAME_H + 15) {
    ramp.active = false;
  }
}

export function checkRampCollision(ramp, player) {
  if (ramp.used || player.inAir) return false;
  const dx = wrappedDx(ramp.x, player.x);
  const dy = Math.abs(ramp.y - player.y);
  return dx < ramp.width / 2 + 2 && dy < ramp.length / 2 + 2;
}

export function launchPlayer(player) {
  player.inAir = true;
  const duration = Math.floor(JUMP_DURATION_BASE + player.kmh * JUMP_DURATION_SPEED_FACTOR);
  player.airDuration = duration;
  player.airTimer = duration;
  player.airTimeCurrent = 0;
  player.jumpHeight = 0;
}

export function drawRamp(ctx, ramp) {
  const x = Math.round(ramp.x);
  const y = Math.round(ramp.y);
  const hw = Math.floor(ramp.width / 2);
  const hl = Math.floor(ramp.length / 2);

  // Ramp base (darker)
  ctx.fillStyle = '#8B6914';
  ctx.fillRect(x - hw, y - hl, ramp.width, ramp.length);

  // Ramp surface (lighter, showing incline)
  ctx.fillStyle = '#C49A1A';
  ctx.fillRect(x - hw + 1, y - hl, ramp.width - 2, ramp.length - 2);

  // Incline stripes (showing slope direction)
  ctx.fillStyle = '#A07D15';
  for (let i = 0; i < ramp.length - 2; i += 2) {
    ctx.fillRect(x - hw + 1, y - hl + i, ramp.width - 2, 1);
  }

  // Front edge highlight (lip of the ramp)
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(x - hw, y - hl, ramp.width, 1);

  // Side edges
  ctx.fillStyle = '#6B5010';
  ctx.fillRect(x - hw, y - hl, 1, ramp.length);
  ctx.fillRect(x + hw - 1, y - hl, 1, ramp.length);
}

// ---- BIRDS ----

export function createBird() {
  const fromLeft = Math.random() > 0.5;
  const isPigeon = Math.random() < 0.3; // 30% chance pigeon

  if (isPigeon) {
    // Pigeons walk on the ground across bike lanes / sidewalks
    const spawnLeft = Math.random() > 0.5;
    return {
      x: spawnLeft ? -8 : GAME_W + 8,
      y: -10 - Math.random() * 30,
      speed: 0.4 + Math.random() * 0.4, // slower than flying birds
      dir: spawnLeft ? 1 : -1,
      frame: Math.floor(Math.random() * 20),
      active: true,
      pigeon: true,
    };
  }

  return {
    x: fromLeft ? -10 : GAME_W + 10,
    y: -10 - Math.random() * 30,
    speed: BIRD_SPEED_MIN + Math.random() * (BIRD_SPEED_MAX - BIRD_SPEED_MIN),
    dir: fromLeft ? 1 : -1,
    frame: Math.floor(Math.random() * 20),
    active: true,
    pigeon: false,
  };
}

export function updateBird(bird, playerSpeed) {
  bird.frame++;
  bird.x += bird.speed * bird.dir;
  bird.y += playerSpeed;

  if (bird.x < -20 || bird.x > GAME_W + 20 || bird.y > GAME_H + 20) {
    bird.active = false;
  }
}

export function checkBirdCollision(bird, player) {
  const dx = wrappedDx(bird.x, player.x);
  const dy = Math.abs(bird.y - player.y);
  if (dx >= 5 || dy >= 5) return false;

  // Pigeons are ground hazards — only hit when NOT in the air
  if (bird.pigeon) return !player.inAir;

  // Flying birds — only hit when in the air
  return player.inAir;
}

export function drawBird(ctx, bird) {
  const x = Math.round(bird.x);
  const y = Math.round(bird.y);

  if (bird.pigeon) {
    drawPigeon(ctx, x, y, bird.frame, bird.dir);
    return;
  }

  const wingPhase = Math.floor(bird.frame / 5) % 4;

  // Body
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x - 1, y, 3, 2);

  // Head
  ctx.fillRect(x + bird.dir * 2, y, 2, 1);

  // Beak
  ctx.fillStyle = '#cc8800';
  ctx.fillRect(x + bird.dir * 4, y, 1, 1);

  // Eye
  ctx.fillStyle = '#fff';
  ctx.fillRect(x + bird.dir * 2 + (bird.dir > 0 ? 1 : 0), y, 1, 1);

  // Wings (animated)
  ctx.fillStyle = '#333';
  let wingY;
  if (wingPhase === 0) wingY = -2;
  else if (wingPhase === 1) wingY = -1;
  else if (wingPhase === 2) wingY = 0;
  else wingY = -1;

  // Left wing
  ctx.fillRect(x - 3, y + wingY, 2, 1);
  ctx.fillRect(x - 4, y + wingY - (wingPhase < 2 ? 1 : 0), 1, 1);

  // Right wing
  ctx.fillRect(x + 2, y + wingY, 2, 1);
  ctx.fillRect(x + 4, y + wingY - (wingPhase < 2 ? 1 : 0), 1, 1);

  // Tail
  ctx.fillStyle = '#222';
  ctx.fillRect(x - bird.dir * 2, y + 1, 1, 1);
}

function drawPigeon(ctx, x, y, frame, dir) {
  const bob = Math.floor(frame / 8) % 2;
  const legAnim = Math.floor(frame / 6) % 2;

  // Body (plump, grey-blue)
  ctx.fillStyle = '#7788aa';
  ctx.fillRect(x - 2, y + bob, 4, 3);

  // Head (with head-bob)
  const headX = x + dir * 2;
  const headBob = Math.floor(frame / 5) % 2;
  ctx.fillStyle = '#8899bb';
  ctx.fillRect(headX, y - 1 + bob + headBob, 2, 2);

  // Eye
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(headX + (dir > 0 ? 1 : 0), y - 1 + bob + headBob, 1, 1);

  // Beak
  ctx.fillStyle = '#ccaa44';
  ctx.fillRect(headX + dir * 2, y + bob + headBob, 1, 1);

  // Iridescent neck patch (green/purple shimmer)
  ctx.fillStyle = frame % 20 < 10 ? '#55aa77' : '#8866aa';
  ctx.fillRect(x + dir, y + 1 + bob, 1, 1);

  // Legs
  ctx.fillStyle = '#cc6666';
  ctx.fillRect(x - 1, y + 3 + bob, 1, 1 + legAnim);
  ctx.fillRect(x + 1, y + 3 + bob, 1, 1 + (1 - legAnim));

  // Tail feathers
  ctx.fillStyle = '#556677';
  ctx.fillRect(x - dir * 2, y + 1 + bob, 1, 2);
}
