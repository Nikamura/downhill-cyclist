import {
  GAME_W, ROAD_LEFT, ROAD_RIGHT,
  PLAYER_SPEED, BASE_SCROLL_SPEED, SPEED_TO_KMH,
  GRAVITY_ACCEL, AIR_DRAG, PEDAL_ACCEL, BRAKE_DECEL, MIN_SPEED,
  BELL_COOLDOWN,
} from './constants.js';
import { isDown, consumeKey } from './input.js';

export function createPlayer() {
  return {
    x: GAME_W / 2,
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
    maxKmh: 0,          // track top speed for game over
    screenShake: 0,      // intensity increases with speed
  };
}

export function updatePlayer(player) {
  player.frame++;

  // --- Horizontal movement (faster steering at low speed, twitchier at high) ---
  const steerSpeed = PLAYER_SPEED + player.speed * 0.15;
  if (isDown('ArrowLeft') || isDown('KeyA')) {
    player.x -= steerSpeed;
  }
  if (isDown('ArrowRight') || isDown('KeyD')) {
    player.x += steerSpeed;
  }
  player.x = Math.max(ROAD_LEFT + 4, Math.min(ROAD_RIGHT - 4, player.x));

  // --- Downhill physics ---
  // 1. Gravity always pulls you faster (it's a hill!)
  let accel = GRAVITY_ACCEL;

  // 2. Pedaling — hold UP to be a maniac
  player.pedaling = isDown('ArrowUp') || isDown('KeyW');
  if (player.pedaling) {
    accel += PEDAL_ACCEL;
  }

  // 3. Braking
  player.braking = isDown('ArrowDown') || isDown('KeyS');
  if (player.braking) {
    accel -= BRAKE_DECEL;
  }

  // 4. Air drag — increases with speed² (this is what caps terminal velocity)
  const drag = AIR_DRAG * player.speed * player.speed;
  accel -= drag;

  // Apply
  player.speed += accel;
  player.speed = Math.max(MIN_SPEED, player.speed);
  // No hard cap — air drag is the natural limit, but pedaling can push past it

  // Convert to km/h for display
  player.kmh = player.speed * SPEED_TO_KMH;
  player.maxKmh = Math.max(player.maxKmh, player.kmh);

  // Screen shake scales with speed (subtle below 80, noticeable above 120)
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

  // Score = distance in meters
  player.score += player.speed;
}
