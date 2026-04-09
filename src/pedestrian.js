import {
  BIKE_LEFT, BIKE_RIGHT, BIKE_CENTER, BIKE_PATH_WIDTH,
  SIDEWALK_L_LEFT, SIDEWALK_L_RIGHT, SIDEWALK_R_LEFT, SIDEWALK_R_RIGHT,
  PED_ANC_CHANCE, PED_WALK_SPEED, PED_WANDER_CHANCE, PED_WANDER_SPEED,
  BELL_RANGE, GAME_H,
} from './constants.js';

export function createPedestrian(scrollSpeed) {
  const hasANC = Math.random() < PED_ANC_CHANCE;
  const onLeft = Math.random() > 0.5;

  const sidewalkCenter = onLeft
    ? (SIDEWALK_L_LEFT + SIDEWALK_L_RIGHT) / 2
    : (SIDEWALK_R_LEFT + SIDEWALK_R_RIGHT) / 2;

  const offset = (Math.random() - 0.5) * 10;

  // Spawn ahead of the player (top of screen or even above)
  // At higher speeds, they appear further ahead so you have time to react
  const spawnY = -10 - Math.random() * 20;

  // Some pedestrians are already wandering into the bike lane when they spawn
  const alreadyWandering = Math.random() < 0.35;
  let startX = sidewalkCenter + offset;

  if (alreadyWandering) {
    // Already partially or fully in the bike lane
    const progress = Math.random(); // 0 = sidewalk edge, 1 = middle of bike path
    if (onLeft) {
      startX = BIKE_LEFT + progress * (BIKE_PATH_WIDTH / 2);
    } else {
      startX = BIKE_RIGHT - progress * (BIKE_PATH_WIDTH / 2);
    }
  }

  return {
    x: startX,
    y: spawnY,
    homeX: sidewalkCenter + offset,
    onLeft,
    hasANC,
    wandering: alreadyWandering,
    scared: false,
    scaredTimer: 0,
    walkSpeed: PED_WALK_SPEED + Math.random() * 0.2,
    frame: 0,
    active: true,
  };
}

export function updatePedestrian(ped, player) {
  ped.frame++;

  // Pedestrians scroll down relative to player speed
  // They're walking the same direction but slower, so net movement is downward
  ped.y += player.speed - ped.walkSpeed;

  if (ped.scared) {
    // Heard the bell — hurry back to sidewalk
    ped.scaredTimer--;
    const retreatTarget = ped.homeX;
    const dx = retreatTarget - ped.x;
    if (Math.abs(dx) > 1) {
      ped.x += Math.sign(dx) * 1.5;
    }
    if (ped.scaredTimer <= 0) {
      ped.scared = false;
      ped.wandering = false;
    }
  } else if (ped.wandering) {
    // Drifting into / across bike lane
    ped.x += ped.onLeft ? PED_WANDER_SPEED : -PED_WANDER_SPEED;

    // If they've crossed all the way through, start drifting back (or just keep going)
    const pastBikeLane = ped.onLeft
      ? ped.x > BIKE_RIGHT + 5
      : ped.x < BIKE_LEFT - 5;

    if (pastBikeLane) {
      ped.wandering = false; // done wandering, just keep walking
    }
  } else {
    // Walking on sidewalk — random chance to wander into bike lane
    if (Math.random() < PED_WANDER_CHANCE) {
      ped.wandering = true;
    }

    // Slight natural lateral drift while walking
    ped.x += (Math.random() - 0.5) * 0.3;
  }

  // Off screen? Deactivate
  if (ped.y > GAME_H + 20) {
    ped.active = false;
  }
}

export function checkBellEffect(ped, player) {
  if (!player.bellActive) return;
  if (ped.hasANC) return;  // Can't hear the bell!
  if (ped.scared) return;

  const dx = ped.x - player.x;
  const dy = ped.y - player.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < BELL_RANGE) {
    ped.scared = true;
    ped.scaredTimer = 60;
  }
}

export function checkCollision(ped, player) {
  const dx = Math.abs(ped.x - player.x);
  const dy = Math.abs(ped.y - player.y);
  return dx < 5 && dy < 8;
}
