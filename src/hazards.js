import {
  CAR_LEFT, CAR_RIGHT, CAR_W,
  CAR_SPEED_MIN_KMH, CAR_SPEED_MAX_KMH,
  SIDE_L_LEFT, SIDE_L_RIGHT, SIDE_R_LEFT, SIDE_R_RIGHT, SIDEWALK_W,
  POTHOLE_SIZE, SPEED_TO_KMH,
  GAME_H, COLORS,
} from './constants.js';

// ---- CARS ----
// Cars drive the same direction (downhill) but faster than the bike.
// They come from behind (bottom of screen) and overtake upward.

const CAR_COLORS = ['#3366cc', '#cc3333', '#33aa33', '#888888', '#ffcc00', '#222222', '#cc6600'];

export function createCar(playerSpeed) {
  const playerKmh = playerSpeed * SPEED_TO_KMH;
  // Car speed is always faster than the player
  const carKmh = Math.max(playerKmh + 20, CAR_SPEED_MIN_KMH + Math.random() * (CAR_SPEED_MAX_KMH - CAR_SPEED_MIN_KMH));
  const carScrollSpeed = carKmh / SPEED_TO_KMH;

  // Relative speed vs player (how fast it approaches from behind)
  const relativeSpeed = carScrollSpeed - playerSpeed;

  // Random position in car lane
  const x = CAR_LEFT + 6 + Math.random() * (CAR_W - 12);

  return {
    x,
    y: GAME_H + 20,      // spawn below screen (behind the player)
    relativeSpeed,
    color: CAR_COLORS[Math.floor(Math.random() * CAR_COLORS.length)],
    width: 8 + Math.floor(Math.random() * 4),  // car width varies
    length: 12 + Math.floor(Math.random() * 6), // car length varies
    frame: 0,
    active: true,
    honked: false,        // will honk if cyclist is in their way
  };
}

export function updateCar(car, player) {
  car.frame++;

  // Cars move upward relative to player (they're overtaking)
  car.y -= car.relativeSpeed;

  // Off screen top? Deactivate
  if (car.y < -30) {
    car.active = false;
  }

  // Honk if player is in the car road and car is close behind
  if (!car.honked && player.x >= CAR_LEFT && player.x <= CAR_RIGHT) {
    const dy = car.y - player.y;
    if (dy > 0 && dy < 50) {
      car.honked = true;
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

  // Roof (darker center)
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(x - hw + 2, y - hl + 3, car.width - 4, car.length - 6);

  // Windshield (lighter)
  ctx.fillStyle = 'rgba(150,200,255,0.5)';
  ctx.fillRect(x - hw + 2, y + hl - 3, car.width - 4, 2);

  // Rear lights (top = rear since car moves up)
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(x - hw, y - hl, 1, 2);
  ctx.fillRect(x + hw - 1, y - hl, 1, 2);

  // Headlights (bottom = front)
  ctx.fillStyle = '#ffffaa';
  ctx.fillRect(x - hw, y + hl - 2, 1, 2);
  ctx.fillRect(x + hw - 1, y + hl - 2, 1, 2);

  // Honk indicator
  if (car.honked && car.frame % 8 < 4) {
    ctx.fillStyle = '#fff';
    ctx.font = '5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HONK', x, y - hl - 3);
    ctx.textAlign = 'left';
  }
}

// ---- POTHOLES ----
// Hazards on the sidewalk — hit one and you crash

export function createPothole() {
  // Random position on either sidewalk
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

  // Rim
  ctx.fillStyle = COLORS.potholeRim;
  for (let dy = -s - 1; dy <= s + 1; dy++) {
    for (let dx = -s - 1; dx <= s + 1; dx++) {
      if (dx * dx + dy * dy <= (s + 1) * (s + 1)) {
        ctx.fillRect(x + dx, y + dy, 1, 1);
      }
    }
  }

  // Hole
  ctx.fillStyle = COLORS.pothole;
  for (let dy = -s; dy <= s; dy++) {
    for (let dx = -s; dx <= s; dx++) {
      if (dx * dx + dy * dy <= s * s) {
        ctx.fillRect(x + dx, y + dy, 1, 1);
      }
    }
  }

  // Crack lines
  ctx.fillStyle = '#2a2015';
  ctx.fillRect(x - s, y, s * 2 + 1, 1);
  ctx.fillRect(x, y - s, 1, s * 2 + 1);
}
