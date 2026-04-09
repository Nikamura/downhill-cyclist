import {
  GAME_W, GAME_H,
  BIKE_LEFT, BIKE_RIGHT, BIKE_PATH_WIDTH,
  SIDEWALK_L_LEFT, SIDEWALK_L_RIGHT, SIDEWALK_R_LEFT, SIDEWALK_R_RIGHT,
  SIDEWALK_WIDTH, COLORS,
} from './constants.js';

let markingOffset = 0;

export function updateRoad(scrollSpeed) {
  markingOffset = (markingOffset + scrollSpeed) % 16;
}

export function drawRoad(ctx) {
  // Grass background
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  // Left sidewalk
  ctx.fillStyle = COLORS.sidewalk;
  ctx.fillRect(SIDEWALK_L_LEFT, 0, SIDEWALK_WIDTH, GAME_H);

  // Right sidewalk
  ctx.fillRect(SIDEWALK_R_LEFT, 0, SIDEWALK_WIDTH, GAME_H);

  // Sidewalk tile pattern (horizontal lines scrolling)
  ctx.fillStyle = COLORS.sidewalkLine;
  for (let y = -16 + markingOffset; y < GAME_H; y += 16) {
    ctx.fillRect(SIDEWALK_L_LEFT, y, SIDEWALK_WIDTH, 1);
    ctx.fillRect(SIDEWALK_R_LEFT, y, SIDEWALK_WIDTH, 1);
  }

  // Bike path surface
  ctx.fillStyle = COLORS.bikePath;
  ctx.fillRect(BIKE_LEFT, 0, BIKE_PATH_WIDTH, GAME_H);

  // Bike path edges
  ctx.fillStyle = COLORS.bikePathEdge;
  ctx.fillRect(BIKE_LEFT, 0, 1, GAME_H);
  ctx.fillRect(BIKE_RIGHT - 1, 0, 1, GAME_H);

  // Center dashed line
  ctx.fillStyle = '#aaa';
  const cx = BIKE_LEFT + Math.floor(BIKE_PATH_WIDTH / 2);
  for (let y = -16 + markingOffset; y < GAME_H; y += 16) {
    ctx.fillRect(cx, y, 1, 6);
  }

  // Bike path texture
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  for (let i = 0; i < 10; i++) {
    const rx = BIKE_LEFT + Math.floor(Math.random() * BIKE_PATH_WIDTH);
    const ry = Math.floor(Math.random() * GAME_H);
    ctx.fillRect(rx, ry, 1, 1);
  }

  // Curb between sidewalk and grass
  ctx.fillStyle = '#9a8a6a';
  ctx.fillRect(SIDEWALK_L_LEFT, 0, 1, GAME_H);
  ctx.fillRect(SIDEWALK_R_RIGHT - 1, 0, 1, GAME_H);
}

// Scenery — trees on the grass areas outside sidewalks
const trees = [];

export function initScenery() {
  for (let i = 0; i < 14; i++) {
    trees.push({
      x: Math.random() > 0.5
        ? Math.random() * (SIDEWALK_L_LEFT - 6)
        : SIDEWALK_R_RIGHT + 2 + Math.random() * (GAME_W - SIDEWALK_R_RIGHT - 6),
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
        ? Math.random() * (SIDEWALK_L_LEFT - 6)
        : SIDEWALK_R_RIGHT + 2 + Math.random() * (GAME_W - SIDEWALK_R_RIGHT - 6);
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
