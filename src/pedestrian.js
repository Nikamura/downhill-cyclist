import {
  BIKE_L_LEFT, BIKE_L_RIGHT, BIKE_W,
  BIKE_R_LEFT, BIKE_R_RIGHT,
  SIDE_L_LEFT, SIDE_L_RIGHT, SIDEWALK_W,
  SIDE_R_LEFT, SIDE_R_RIGHT,
  PED_ANC_CHANCE, PED_WALK_SPEED, PED_WANDER_CHANCE, PED_WANDER_SPEED,
  BELL_RANGE, GAME_H,
} from './constants.js';

export function createPedestrian() {
  const hasANC = Math.random() < PED_ANC_CHANCE;
  const onLeft = Math.random() > 0.5;

  const sideLeft = onLeft ? SIDE_L_LEFT : SIDE_R_LEFT;
  const sideRight = onLeft ? SIDE_L_RIGHT : SIDE_R_RIGHT;
  const bikeLeft = onLeft ? BIKE_L_LEFT : BIKE_R_LEFT;
  const bikeRight = onLeft ? BIKE_L_RIGHT : BIKE_R_RIGHT;

  const sidewalkCenter = (sideLeft + sideRight) / 2;
  const offset = (Math.random() - 0.5) * (SIDEWALK_W - 6);

  const spawnY = -10 - Math.random() * 20;

  // Some already wandering into adjacent bike lane
  const alreadyWandering = Math.random() < 0.35;
  let startX = sidewalkCenter + offset;

  if (alreadyWandering) {
    const progress = Math.random();
    // Drift from sidewalk toward the bike lane
    if (onLeft) {
      startX = bikeLeft + progress * (BIKE_W / 2);
    } else {
      startX = bikeRight - progress * (BIKE_W / 2);
    }
  }

  return {
    x: startX,
    y: spawnY,
    homeX: sidewalkCenter + offset,
    onLeft,
    hasANC,
    wandering: alreadyWandering,
    // Wander direction: left peds drift right, right peds drift left (into their bike lane)
    wanderDir: onLeft ? 1 : -1,
    scared: false,
    scaredTimer: 0,
    walkSpeed: PED_WALK_SPEED + Math.random() * 0.2,
    frame: 0,
    active: true,
  };
}

export function updatePedestrian(ped, player) {
  ped.frame++;

  ped.y += player.speed - ped.walkSpeed;

  if (ped.scared) {
    ped.scaredTimer--;
    const dx = ped.homeX - ped.x;
    if (Math.abs(dx) > 1) {
      ped.x += Math.sign(dx) * 1.5;
    }
    if (ped.scaredTimer <= 0) {
      ped.scared = false;
      ped.wandering = false;
    }
  } else if (ped.wandering) {
    ped.x += ped.wanderDir * PED_WANDER_SPEED;

    // If they've crossed the bike path, stop wandering
    const bikeRight = ped.onLeft ? BIKE_L_RIGHT : BIKE_R_RIGHT;
    const bikeLeft = ped.onLeft ? BIKE_L_LEFT : BIKE_R_LEFT;
    const past = ped.onLeft
      ? ped.x > bikeRight + 3
      : ped.x < bikeLeft - 3;

    if (past) {
      ped.wandering = false;
    }
  } else {
    if (Math.random() < PED_WANDER_CHANCE) {
      ped.wandering = true;
    }
    ped.x += (Math.random() - 0.5) * 0.3;
  }

  if (ped.y > GAME_H + 20) {
    ped.active = false;
  }
}

export function checkBellEffect(ped, player) {
  if (!player.bellActive) return;
  if (ped.hasANC) return;
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
