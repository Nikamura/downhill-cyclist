import {
  GAME_W, ROAD_LEFT, ROAD_RIGHT,
  PLAYER_SPEED, BRAKE_DECEL, BASE_SCROLL_SPEED, MAX_SCROLL_SPEED, SCROLL_ACCEL,
  BELL_COOLDOWN,
} from './constants.js';
import { isDown, consumeKey } from './input.js';

export function createPlayer() {
  return {
    x: GAME_W / 2,
    y: 200,             // fixed screen Y (near bottom)
    lane: 1,            // 0=left, 1=center, 2=right
    speed: BASE_SCROLL_SPEED,
    braking: false,
    bellCooldown: 0,
    bellActive: false,   // true when a bell ring is in progress
    bellProgress: 0,
    frame: 0,
    score: 0,
    alive: true,
  };
}

export function updatePlayer(player, dt) {
  player.frame++;

  // Horizontal movement
  if (isDown('ArrowLeft') || isDown('KeyA')) {
    player.x -= PLAYER_SPEED;
  }
  if (isDown('ArrowRight') || isDown('KeyD')) {
    player.x += PLAYER_SPEED;
  }

  // Clamp to road
  player.x = Math.max(ROAD_LEFT + 4, Math.min(ROAD_RIGHT - 4, player.x));

  // Braking
  player.braking = isDown('ArrowDown') || isDown('KeyS');
  if (player.braking) {
    player.speed = Math.max(BASE_SCROLL_SPEED * 0.3, player.speed - BRAKE_DECEL);
  } else {
    // Gradually accelerate downhill
    player.speed = Math.min(MAX_SCROLL_SPEED, player.speed + SCROLL_ACCEL);
  }

  // Bell
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

  // Score increases with speed
  player.score += player.speed;
}
