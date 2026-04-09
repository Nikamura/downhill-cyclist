import { GAME_W, GAME_H, SCALE, PED_SPAWN_INTERVAL_MIN, PED_SPAWN_INTERVAL_MAX } from './constants.js';
import { initInput, consumeKey } from './input.js';
import { createPlayer, updatePlayer } from './player.js';
import { createPedestrian, updatePedestrian, checkBellEffect, checkCollision } from './pedestrian.js';
import { updateRoad, drawRoad, initScenery, updateScenery, drawScenery } from './road.js';
import { drawBicycle, drawPedestrian, drawBellRing } from './sprites.js';
import { drawHUD, drawTitleScreen, drawGameOver } from './ui.js';

// --- Setup canvas ---
const canvas = document.getElementById('game');
canvas.width = GAME_W * SCALE;
canvas.height = GAME_H * SCALE;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// --- Game state ---
let state = 'title'; // title | playing | gameover
let player = null;
let pedestrians = [];
let spawnTimer = 0;
let frame = 0;

initInput();
initScenery();

function startGame() {
  state = 'playing';
  player = createPlayer();
  pedestrians = [];
  spawnTimer = 60;
}

// --- Main loop ---
function gameLoop() {
  frame++;

  // Clear and set up scaling
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);

  switch (state) {
    case 'title':
      updateTitle();
      break;
    case 'playing':
      updatePlaying();
      break;
    case 'gameover':
      updateGameOver();
      break;
  }

  requestAnimationFrame(gameLoop);
}

function updateTitle() {
  drawTitleScreen(ctx, frame);
  if (consumeKey('Enter') || consumeKey('Space')) {
    startGame();
  }
}

function updatePlaying() {
  // Update
  updatePlayer(player);
  updateRoad(player.speed);
  updateScenery(player.speed);

  // Spawn pedestrians — more frequently at higher speeds
  spawnTimer--;
  if (spawnTimer <= 0) {
    pedestrians.push(createPedestrian(player.speed));
    // Scale spawn rate: at 30 km/h ~90 frames, at 150+ km/h ~20 frames
    const speedFactor = Math.min(1, (player.kmh - 30) / 150);
    const interval = PED_SPAWN_INTERVAL_MAX -
      speedFactor * (PED_SPAWN_INTERVAL_MAX - PED_SPAWN_INTERVAL_MIN);
    spawnTimer = Math.floor(interval + Math.random() * 20);
  }

  // Update pedestrians
  for (const ped of pedestrians) {
    updatePedestrian(ped, player);
    checkBellEffect(ped, player);

    if (ped.active && checkCollision(ped, player)) {
      player.alive = false;
      state = 'gameover';
    }
  }

  // Remove inactive
  pedestrians = pedestrians.filter((p) => p.active);

  // Draw — apply screen shake at high speed
  if (player.screenShake > 0.5) {
    const s = player.screenShake;
    ctx.setTransform(SCALE, 0, 0, SCALE,
      (Math.random() - 0.5) * s * SCALE,
      (Math.random() - 0.5) * s * SCALE,
    );
  }

  drawRoad(ctx);
  drawScenery(ctx);

  for (const ped of pedestrians) {
    drawPedestrian(ctx, ped.x, ped.y, ped.hasANC, ped.scared, ped.frame);
  }

  drawBicycle(ctx, player.x, player.y, player.frame, player.braking);

  if (player.bellActive) {
    drawBellRing(ctx, player.x, player.y, player.bellProgress);
  }

  // Reset transform for HUD (no shake on UI)
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  drawHUD(ctx, player);
}

function updateGameOver() {
  // Keep drawing the last frame
  drawRoad(ctx);
  drawScenery(ctx);
  for (const ped of pedestrians) {
    drawPedestrian(ctx, ped.x, ped.y, ped.hasANC, ped.scared, ped.frame);
  }
  drawBicycle(ctx, player.x, player.y, player.frame, player.braking);
  drawGameOver(ctx, player, frame);

  if (consumeKey('Enter') || consumeKey('Space')) {
    startGame();
  }
}

// Start
gameLoop();
