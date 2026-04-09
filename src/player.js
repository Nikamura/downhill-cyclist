import {
  BIKE_L_CENTER, BIKE_L_LEFT, BIKE_L_RIGHT,
  BIKE_R_LEFT, BIKE_R_RIGHT,
  CAR_LEFT, CAR_RIGHT,
  SIDE_L_LEFT, SIDE_R_RIGHT,
  PLAY_LEFT, PLAY_RIGHT,
  PLAYER_SPEED, BASE_SCROLL_SPEED, SPEED_TO_KMH,
  GRAVITY_ACCEL, AIR_DRAG, PEDAL_ACCEL, BRAKE_DECEL, MIN_SPEED,
  BELL_COOLDOWN,
  GRASS_SLOPE_FORCE, GRASS_WOBBLE_AMP, GRASS_FRICTION, GRASS_SHAKE_BASE,
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
    zone: 'bike', // 'grass' | 'sidewalk' | 'bike' | 'car'
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
  if (player.x < SIDE_L_LEFT || player.x > SIDE_R_RIGHT) {
    player.zone = 'grass';
  } else if (player.x >= CAR_LEFT && player.x <= CAR_RIGHT) {
    player.zone = 'car';
  } else if ((player.x >= BIKE_L_LEFT && player.x <= BIKE_L_RIGHT) ||
             (player.x >= BIKE_R_LEFT && player.x <= BIKE_R_RIGHT)) {
    player.zone = 'bike';
  } else {
    player.zone = 'sidewalk';
  }

  // --- Grass slope physics: grass is sloped towards the road ---
  if (player.zone === 'grass') {
    const onLeft = player.x < SIDE_L_LEFT;
    const grassEdge = onLeft ? SIDE_L_LEFT : SIDE_R_RIGHT;
    const maxGrassDist = onLeft ? SIDE_L_LEFT - PLAY_LEFT : PLAY_RIGHT - SIDE_R_RIGHT;
    const distFromRoad = Math.abs(player.x - grassEdge);
    const normalizedDist = distFromRoad / maxGrassDist;

    // Slope always pushes towards the road
    const slopeDir = onLeft ? 1 : -1;
    const slopeForce = GRASS_SLOPE_FORCE * (0.3 + normalizedDist * 0.7);
    player.x += slopeForce * slopeDir;

    // Random wobble — unstable surface
    const wobble = (Math.random() - 0.5) * GRASS_WOBBLE_AMP * (0.6 + normalizedDist);
    player.x += wobble;
  }

  // Re-clamp after grass forces
  player.x = Math.max(PLAY_LEFT + 3, Math.min(PLAY_RIGHT - 3, player.x));

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

  // Grass rolling resistance
  if (player.zone === 'grass') {
    accel -= GRASS_FRICTION * player.speed;
  }

  player.speed += accel;
  player.speed = Math.max(MIN_SPEED, player.speed);

  player.kmh = player.speed * SPEED_TO_KMH;
  player.maxKmh = Math.max(player.maxKmh, player.kmh);

  // Extra screen shake on grass (bumpy terrain)
  const speedShake = Math.max(0, (player.kmh - 60) * 0.02);
  const grassShake = player.zone === 'grass' ? GRASS_SHAKE_BASE + player.speed * 0.15 : 0;
  player.screenShake = speedShake + grassShake;

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
