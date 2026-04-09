import {
  GAME_W, GAME_H,
  SIDE_L_LEFT, SIDE_L_RIGHT, SIDEWALK_W,
  BIKE_L_LEFT, BIKE_L_RIGHT, BIKE_W,
  CAR_LEFT, CAR_RIGHT, CAR_W,
  BIKE_R_LEFT, BIKE_R_RIGHT,
  SIDE_R_LEFT, SIDE_R_RIGHT,
  COLORS,
} from './constants.js';

let markingOffset = 0;

export function updateRoad(scrollSpeed) {
  markingOffset = (markingOffset + scrollSpeed) % 16;
}

export function drawRoad(ctx) {
  // Grass background
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  // --- Left sidewalk ---
  ctx.fillStyle = COLORS.sidewalk;
  ctx.fillRect(SIDE_L_LEFT, 0, SIDEWALK_W, GAME_H);
  ctx.fillStyle = COLORS.sidewalkLine;
  for (let y = -16 + markingOffset; y < GAME_H; y += 16) {
    ctx.fillRect(SIDE_L_LEFT, y, SIDEWALK_W, 1);
  }

  // --- Left bike path ---
  ctx.fillStyle = COLORS.bikePath;
  ctx.fillRect(BIKE_L_LEFT, 0, BIKE_W, GAME_H);
  ctx.fillStyle = COLORS.bikePathEdge;
  ctx.fillRect(BIKE_L_LEFT, 0, 1, GAME_H);
  ctx.fillRect(BIKE_L_RIGHT - 1, 0, 1, GAME_H);
  // Center dashes
  ctx.fillStyle = '#aaa';
  const blc = BIKE_L_LEFT + Math.floor(BIKE_W / 2);
  for (let y = -16 + markingOffset; y < GAME_H; y += 16) {
    ctx.fillRect(blc, y, 1, 6);
  }

  // --- Car road (center) ---
  ctx.fillStyle = COLORS.carRoad;
  ctx.fillRect(CAR_LEFT, 0, CAR_W, GAME_H);
  ctx.fillStyle = COLORS.carRoadEdge;
  ctx.fillRect(CAR_LEFT, 0, 1, GAME_H);
  ctx.fillRect(CAR_RIGHT - 1, 0, 1, GAME_H);
  // Yellow center dashes
  ctx.fillStyle = COLORS.carRoadLine;
  const cc = CAR_LEFT + Math.floor(CAR_W / 2);
  for (let y = -16 + markingOffset; y < GAME_H; y += 20) {
    ctx.fillRect(cc, y, 1, 8);
  }
  // Road texture
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(CAR_LEFT + Math.floor(Math.random() * CAR_W), Math.floor(Math.random() * GAME_H), 1, 1);
  }

  // --- Right bike path ---
  ctx.fillStyle = COLORS.bikePath;
  ctx.fillRect(BIKE_R_LEFT, 0, BIKE_W, GAME_H);
  ctx.fillStyle = COLORS.bikePathEdge;
  ctx.fillRect(BIKE_R_LEFT, 0, 1, GAME_H);
  ctx.fillRect(BIKE_R_RIGHT - 1, 0, 1, GAME_H);
  const brc = BIKE_R_LEFT + Math.floor(BIKE_W / 2);
  ctx.fillStyle = '#aaa';
  for (let y = -16 + markingOffset; y < GAME_H; y += 16) {
    ctx.fillRect(brc, y, 1, 6);
  }

  // --- Right sidewalk ---
  ctx.fillStyle = COLORS.sidewalk;
  ctx.fillRect(SIDE_R_LEFT, 0, SIDEWALK_W, GAME_H);
  ctx.fillStyle = COLORS.sidewalkLine;
  for (let y = -16 + markingOffset; y < GAME_H; y += 16) {
    ctx.fillRect(SIDE_R_LEFT, y, SIDEWALK_W, 1);
  }

  // --- Curbs (grass edges) ---
  ctx.fillStyle = COLORS.curb;
  ctx.fillRect(SIDE_L_LEFT - 1, 0, 1, GAME_H);
  ctx.fillRect(SIDE_R_RIGHT, 0, 1, GAME_H);
}

// --- Scenery: trees on grass ---
const trees = [];

export function initScenery() {
  for (let i = 0; i < 14; i++) {
    trees.push({
      x: Math.random() > 0.5
        ? Math.random() * (SIDE_L_LEFT - 6)
        : SIDE_R_RIGHT + 3 + Math.random() * (GAME_W - SIDE_R_RIGHT - 6),
      y: Math.random() * GAME_H,
      size: 3 + Math.floor(Math.random() * 4),
    });
  }
}

export function updateScenery(scrollSpeed) {
  for (const tree of trees) {
    tree.y += scrollSpeed;
    if (tree.y > GAME_H + 10) {
      tree.y = -10;
      tree.x = Math.random() > 0.5
        ? Math.random() * (SIDE_L_LEFT - 6)
        : SIDE_R_RIGHT + 3 + Math.random() * (GAME_W - SIDE_R_RIGHT - 6);
    }
  }
}

export function drawScenery(ctx) {
  for (const tree of trees) {
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(tree.x, tree.y, 2, tree.size);
    ctx.fillStyle = '#3a6a2a';
    const r = tree.size - 1;
    for (let dy = -r; dy <= 0; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          ctx.fillRect(tree.x + 1 + dx, tree.y + dy, 1, 1);
        }
      }
    }
  }
}
