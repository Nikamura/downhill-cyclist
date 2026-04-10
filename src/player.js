import {
  GAME_W,
  BIKE_L_CENTER, BIKE_L_LEFT, BIKE_L_RIGHT,
  BIKE_R_LEFT, BIKE_R_RIGHT,
  CAR_LEFT, CAR_RIGHT,
  SIDE_L_LEFT, SIDE_R_RIGHT,
  PLAYER_SPEED, BASE_SCROLL_SPEED, SPEED_TO_KMH,
  GRAVITY_ACCEL, AIR_DRAG, PEDAL_ACCEL, BRAKE_DECEL, MIN_SPEED,
  BELL_COOLDOWN,
  GRASS_SLOPE_FORCE, GRASS_WOBBLE_AMP, GRASS_FRICTION, GRASS_SHAKE_BASE,
  JUMP_MAX_HEIGHT,
  wrapX,
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
    swirlTimer: 0,
    inAir: false,
    airTimer: 0,
    airDuration: 0,
    airTimeCurrent: 0,
    bestAirTime: 0,
    jumpHeight: 0,
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

  // Pigeon swirl — loss of control
  if (player.swirlTimer > 0) {
    player.swirlTimer--;
    const intensity = player.swirlTimer / 40; // fades out
    player.x += (Math.random() - 0.5) * 4 * intensity;
    player.x += Math.sin(player.frame * 0.5) * 2 * intensity;
  }

  // Wrap horizontally (globe)
  player.x = wrapX(player.x);

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

  // --- Air state (from ramps) ---
  if (player.inAir) {
    player.airTimer--;
    player.airTimeCurrent += 1 / 60; // seconds
    const progress = 1 - player.airTimer / player.airDuration;
    player.jumpHeight = Math.sin(progress * Math.PI) * JUMP_MAX_HEIGHT;
    if (player.airTimer <= 0) {
      player.inAir = false;
      player.jumpHeight = 0;
      player.bestAirTime = Math.max(player.bestAirTime, player.airTimeCurrent);
    }
  }

  // --- Grass slope physics: grass is sloped towards the road ---
  // With wrapping, the two grass zones merge around the "back" of the globe
  if (!player.inAir && player.zone === 'grass') {
    const onLeft = player.x < SIDE_L_LEFT;
    const grassEdge = onLeft ? SIDE_L_LEFT : SIDE_R_RIGHT;
    const totalGrass = SIDE_L_LEFT + (GAME_W - SIDE_R_RIGHT);
    const halfGrass = totalGrass / 2;
    const distFromRoad = Math.abs(player.x - grassEdge);
    const normalizedDist = Math.min(1, distFromRoad / halfGrass);

    // Slope always pushes towards the nearest road edge
    const slopeDir = onLeft ? 1 : -1;
    const slopeForce = GRASS_SLOPE_FORCE * (0.3 + normalizedDist * 0.7);
    player.x += slopeForce * slopeDir;

    // Random wobble — unstable surface
    const wobble = (Math.random() - 0.5) * GRASS_WOBBLE_AMP * (0.6 + normalizedDist);
    player.x += wobble;
  }

  // Re-wrap after grass forces
  player.x = wrapX(player.x);

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
