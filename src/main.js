import { GAME_W, GAME_H, SCALE, PED_SPAWN_INTERVAL_MIN, PED_SPAWN_INTERVAL_MAX, CAR_SPAWN_INTERVAL_MIN, CAR_SPAWN_INTERVAL_MAX, POTHOLE_SPAWN_CHANCE } from './constants.js';
import { initInput, consumeKey } from './input.js';
import { createPlayer, updatePlayer } from './player.js';
import { createPedestrian, updatePedestrian, checkBellEffect, checkCollision } from './pedestrian.js';
import { createCar, updateCar, checkCarCollision, drawCar } from './hazards.js';
import { createPothole, updatePothole, checkPotholeCollision, drawPothole } from './hazards.js';
import { updateRoad, drawRoad, initScenery, updateScenery, drawScenery } from './road.js';
import { drawBicycle, drawPedestrian, drawBellRing } from './sprites.js';
import { drawHUD, drawTitleScreen, drawGameOver } from './ui.js';
import { initTouch } from './touch.js';

// --- Setup canvas (fill screen, maintain aspect ratio) ---
const canvas = document.getElementById('game');
canvas.width = GAME_W * SCALE;
canvas.height = GAME_H * SCALE;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function resizeCanvas() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gameAspect = GAME_W / GAME_H;
  const screenAspect = vw / vh;

  let cssW, cssH;
  if (screenAspect > gameAspect) {
    // screen is wider than game — fit to height
    cssH = vh;
    cssW = vh * gameAspect;
  } else {
    // screen is taller than game — fit to width
    cssW = vw;
    cssH = vw / gameAspect;
  }

  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// --- Game state ---
let state = 'title';
let player = null;
let pedestrians = [];
let cars = [];
let potholes = [];
let pedSpawnTimer = 0;
let carSpawnTimer = 0;
let frame = 0;
let crashReason = '';

initInput();
initTouch();
initScenery();

function startGame() {
  state = 'playing';
  player = createPlayer();
  pedestrians = [];
  cars = [];
  potholes = [];
  pedSpawnTimer = 60;
  carSpawnTimer = 80;
  crashReason = '';
}

// --- Main loop ---
function gameLoop() {
  frame++;
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

function crash(reason) {
  player.alive = false;
  crashReason = reason;
  state = 'gameover';
}

function updatePlaying() {
  // --- Update ---
  updatePlayer(player);
  updateRoad(player.speed);
  updateScenery(player.speed);

  // Spawn pedestrians
  pedSpawnTimer--;
  if (pedSpawnTimer <= 0) {
    pedestrians.push(createPedestrian());
    const speedFactor = Math.min(1, (player.kmh - 30) / 150);
    const interval = PED_SPAWN_INTERVAL_MAX -
      speedFactor * (PED_SPAWN_INTERVAL_MAX - PED_SPAWN_INTERVAL_MIN);
    pedSpawnTimer = Math.floor(interval + Math.random() * 20);

    // Chance to also spawn a pothole
    if (Math.random() < POTHOLE_SPAWN_CHANCE) {
      potholes.push(createPothole());
    }
  }

  // Spawn cars
  carSpawnTimer--;
  if (carSpawnTimer <= 0) {
    cars.push(createCar(player.speed));
    const interval = CAR_SPAWN_INTERVAL_MIN +
      Math.random() * (CAR_SPAWN_INTERVAL_MAX - CAR_SPAWN_INTERVAL_MIN);
    carSpawnTimer = Math.floor(interval);
  }

  // Update pedestrians
  for (const ped of pedestrians) {
    updatePedestrian(ped, player);
    checkBellEffect(ped, player);
    if (ped.active && checkCollision(ped, player)) {
      crash('Hit a pedestrian!');
      return;
    }
  }

  // Update cars
  for (const car of cars) {
    updateCar(car, player);
    if (car.active && checkCarCollision(car, player)) {
      crash('Hit by a car!');
      return;
    }
  }

  // Update potholes
  for (const pot of potholes) {
    updatePothole(pot, player.speed);
    if (pot.active && checkPotholeCollision(pot, player)) {
      crash('Hit a pothole!');
      return;
    }
  }

  // Cleanup
  pedestrians = pedestrians.filter((p) => p.active);
  cars = cars.filter((c) => c.active);
  potholes = potholes.filter((p) => p.active);

  // --- Draw ---
  // Screen shake at high speed
  if (player.screenShake > 0.5) {
    const s = player.screenShake;
    ctx.setTransform(SCALE, 0, 0, SCALE,
      (Math.random() - 0.5) * s * SCALE,
      (Math.random() - 0.5) * s * SCALE,
    );
  }

  drawRoad(ctx);
  drawScenery(ctx);

  // Draw potholes (on the road surface)
  for (const pot of potholes) {
    drawPothole(ctx, pot);
  }

  // Draw pedestrians
  for (const ped of pedestrians) {
    drawPedestrian(ctx, ped.x, ped.y, ped.hasANC, ped.scared, ped.frame);
  }

  // Draw player
  drawBicycle(ctx, player.x, player.y, player.frame, player.braking);

  if (player.bellActive) {
    drawBellRing(ctx, player.x, player.y, player.bellProgress);
  }

  // Draw cars (on top of player if they're overtaking)
  for (const car of cars) {
    drawCar(ctx, car);
  }

  // Reset transform for HUD (no shake)
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  drawHUD(ctx, player);
}

function updateGameOver() {
  drawRoad(ctx);
  drawScenery(ctx);
  for (const pot of potholes) drawPothole(ctx, pot);
  for (const ped of pedestrians) {
    drawPedestrian(ctx, ped.x, ped.y, ped.hasANC, ped.scared, ped.frame);
  }
  drawBicycle(ctx, player.x, player.y, player.frame, player.braking);
  for (const car of cars) drawCar(ctx, car);
  drawGameOver(ctx, player, frame, crashReason);

  if (consumeKey('Enter') || consumeKey('Space')) {
    startGame();
  }
}

gameLoop();
