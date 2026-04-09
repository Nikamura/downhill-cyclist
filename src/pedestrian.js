import {
  ROAD_LEFT, ROAD_RIGHT, LANE_WIDTH, LANE_COUNT,
  PED_ANC_CHANCE, PED_WANDER_SPEED, BELL_RANGE,
} from './constants.js';

export function createPedestrian(scrollSpeed) {
  const fromLeft = Math.random() > 0.5;
  const hasANC = Math.random() < PED_ANC_CHANCE;

  // Pedestrians start from sidewalk and wander onto road
  const startX = fromLeft ? ROAD_LEFT - 8 : ROAD_RIGHT + 8;
  const targetLane = Math.floor(Math.random() * LANE_COUNT);
  const targetX = ROAD_LEFT + targetLane * LANE_WIDTH + LANE_WIDTH / 2;

  return {
    x: startX,
    y: -10,                        // spawn above screen
    targetX,
    hasANC,
    scared: false,
    scaredTimer: 0,
    wanderDir: fromLeft ? 1 : -1,
    speed: PED_WANDER_SPEED + Math.random() * 0.3,
    frame: 0,
    active: true,
  };
}

export function updatePedestrian(ped, player) {
  ped.frame++;

  // Move down relative to player speed (world scrolls)
  ped.y += player.speed;

  // If scared (heard bell), move out of the way
  if (ped.scared) {
    ped.scaredTimer--;
    // Run away from player
    const dx = ped.x < player.x ? -1.5 : 1.5;
    ped.x += dx;

    if (ped.scaredTimer <= 0) {
      ped.scared = false;
    }
  } else {
    // Wander towards road
    if (Math.abs(ped.x - ped.targetX) > 1) {
      ped.x += ped.wanderDir * ped.speed;
    } else {
      // Random lateral drift once on road
      ped.x += (Math.random() - 0.5) * 0.5;
    }
  }

  // Off screen? Deactivate
  if (ped.y > 260) {
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
    ped.scaredTimer = 60; // frames to stay scared
  }
}

export function checkCollision(ped, player) {
  const dx = Math.abs(ped.x - player.x);
  const dy = Math.abs(ped.y - player.y);
  return dx < 5 && dy < 8;
}
