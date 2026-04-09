import {
  GAME_W, GAME_H, ROAD_LEFT, ROAD_RIGHT, LANE_WIDTH, LANE_COUNT, COLORS,
} from './constants.js';

// Road markings scroll position
let markingOffset = 0;

export function updateRoad(scrollSpeed) {
  markingOffset = (markingOffset + scrollSpeed) % 20;
}

export function drawRoad(ctx) {
  // Grass
  ctx.fillStyle = COLORS.grass;
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  // Sidewalk
  ctx.fillStyle = COLORS.sidewalk;
  ctx.fillRect(ROAD_LEFT - 8, 0, 8, GAME_H);
  ctx.fillRect(ROAD_RIGHT, 0, 8, GAME_H);

  // Road surface
  ctx.fillStyle = COLORS.road;
  ctx.fillRect(ROAD_LEFT, 0, ROAD_RIGHT - ROAD_LEFT, GAME_H);

  // Road edges
  ctx.fillStyle = '#fff';
  ctx.fillRect(ROAD_LEFT, 0, 1, GAME_H);
  ctx.fillRect(ROAD_RIGHT - 1, 0, 1, GAME_H);

  // Lane markings (dashed)
  ctx.fillStyle = COLORS.roadLine;
  for (let lane = 1; lane < LANE_COUNT; lane++) {
    const lx = ROAD_LEFT + lane * LANE_WIDTH;
    for (let y = -20 + markingOffset; y < GAME_H; y += 20) {
      ctx.fillRect(lx, y, 1, 8);
    }
  }

  // Occasional road texture/grain
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  for (let i = 0; i < 20; i++) {
    const rx = ROAD_LEFT + Math.floor(Math.random() * (ROAD_RIGHT - ROAD_LEFT));
    const ry = Math.floor(Math.random() * GAME_H);
    ctx.fillRect(rx, ry, 1, 1);
  }
}

// Draw trees/bushes on the sides for scenery
let treeOffset = 0;
const trees = [];

export function initScenery() {
  for (let i = 0; i < 12; i++) {
    trees.push({
      x: Math.random() > 0.5 ? Math.random() * (ROAD_LEFT - 12) : ROAD_RIGHT + 10 + Math.random() * (GAME_W - ROAD_RIGHT - 12),
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
        ? Math.random() * (ROAD_LEFT - 12)
        : ROAD_RIGHT + 10 + Math.random() * (GAME_W - ROAD_RIGHT - 12);
    }
  }
}

export function drawScenery(ctx) {
  for (const tree of trees) {
    // Trunk
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(tree.x, tree.y, 2, tree.size);
    // Canopy
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
