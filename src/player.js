import {
  BIKE_L_CENTER, BIKE_L_LEFT, BIKE_L_RIGHT,
  BIKE_R_LEFT, BIKE_R_RIGHT,
  CAR_LEFT, CAR_RIGHT,
  PLAY_LEFT, PLAY_RIGHT,
  PLAYER_SPEED, BASE_SCROLL_SPEED, SPEED_TO_KMH,
  GRAVITY_ACCEL, AIR_DRAG, PEDAL_ACCEL, BRAKE_DECEL, MIN_SPEED,
  BELL_COOLDOWN,
} from './constants.js';
import { isDown, consumeKey } from './input.js';

export function createPlayer() {
  return {
    x: BIKE_L_CENTER,
    y: 200,
    speed: BASE_SCROLL_SPEED,
    kmh: BASE_SCROLL_SPEED * SPEED_TO_KMH,
    pedaling: false,
    braking: false,
    bellCooldown: 0,
    bellActive: false,
    bellProgress: 0,
    frame: 0,
    score: 0,
    alive: true,
    maxKmh: 0,
    screenShake: 0,
    zone: 'bike', // 'sidewalk' | 'bike' | 'car'
  };
}

export function updatePlayer(player) {
  player.frame++;

  // --- Horizontal movement ---
  const steerSpeed = PLAYER_SPEED + player.speed * 0.15;
  if (isDown('ArrowLeft') || isDown('KeyA')) {
    player.x -= steerSpeed;
  }
  if (isDown('ArrowRight') || isDown('KeyD')) {
    player.x += steerSpeed;
  }

  // Can go across all zones
  player.x = Math.max(PLAY_LEFT + 3, Math.min(PLAY_RIGHT - 3, player.x));

  // Track which zone the player is in
  if (player.x >= CAR_LEFT && player.x <= CAR_RIGHT) {
    player.zone = 'car';
  } else if ((player.x >= BIKE_L_LEFT && player.x <= BIKE_L_RIGHT) ||
             (player.x >= BIKE_R_LEFT && player.x <= BIKE_R_RIGHT)) {
    player.zone = 'bike';
  } else {
    player.zone = 'sidewalk';
  }

  // --- Downhill physics ---
  let accel = GRAVITY_ACCEL;

  player.pedaling = isDown('ArrowUp') || isDown('KeyW');
  if (player.pedaling) {
    accel += PEDAL_ACCEL;
  }

  player.braking = isDown('ArrowDown') || isDown('KeyS');
  if (player.braking) {
    accel -= BRAKE_DECEL;
  }

  const drag = AIR_DRAG * player.speed * player.speed;
  accel -= drag;

  player.speed += accel;
  player.speed = Math.max(MIN_SPEED, player.speed);

  player.kmh = player.speed * SPEED_TO_KMH;
  player.maxKmh = Math.max(player.maxKmh, player.kmh);

  player.screenShake = Math.max(0, (player.kmh - 60) * 0.02);

  // --- Bell ---
  if (player.bellCooldown > 0) player.bellCooldown--;

  if (consumeKey('Space') && player.bellCooldown === 0) {
    player.bellActive = true;
    player.bellProgress = 0;
    player.bellCooldown = BELL_COOLDOWN;
  }

  if (player.bellActive) {
    player.bellProgress += 0.04;
    if (player.bellProgress >= 1) {
      player.bellActive = false;
    }
  }

  player.score += player.speed;
}
