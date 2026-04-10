import { GAME_W, GAME_H, SCALE, PED_SPAWN_INTERVAL_MIN, PED_SPAWN_INTERVAL_MAX, CAR_SPAWN_INTERVAL_MIN, CAR_SPAWN_INTERVAL_MAX, POTHOLE_SPAWN_CHANCE, RAMP_SPAWN_INTERVAL_MIN, RAMP_SPAWN_INTERVAL_MAX, BIRD_SPAWN_INTERVAL_MIN, BIRD_SPAWN_INTERVAL_MAX } from './constants.js';
import { initInput, consumeKey } from './input.js';
import { createPlayer, updatePlayer } from './player.js';
import { createPedestrian, updatePedestrian, checkBellEffect, checkCollision } from './pedestrian.js';
import { createCar, createOncomingCar, updateCar, checkCarCollision, drawCar } from './hazards.js';
import { createPothole, updatePothole, checkPotholeCollision, drawPothole } from './hazards.js';
import { createRamp, updateRamp, checkRampCollision, launchPlayer, drawRamp } from './hazards.js';
import { createBird, updateBird, checkBirdCollision, drawBird } from './hazards.js';
import { updateRoad, drawRoad, initScenery, updateScenery, drawScenery, trees } from './road.js';
import { drawBicycle, drawPedestrian, drawBellRing, drawSplat } from './sprites.js';
import { drawHUD, drawTitleScreen, drawGameOver } from './ui.js';
import { initTouch, setTouchGameState } from './touch.js';
import { initAudio, startMusic, stopMusic, playBell, playHonk, playCrash } from './audio.js';

// --- Setup canvas (fill entire screen, no bars) ---
const canvas = document.getElementById('game');
canvas.width = GAME_W * SCALE;
canvas.height = GAME_H * SCALE;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

canvas.style.width = '100vw';
canvas.style.height = '100dvh';

// --- Game state ---
let state = 'title';
let player = null;
let pedestrians = [];
let cars = [];
let potholes = [];
let pedSpawnTimer = 0;
let carSpawnTimer = 0;
let rampSpawnTimer = 0;
let birdSpawnTimer = 0;
let frame = 0;
let crashReason = '';
let splats = [];
let ramps = [];
let birds = [];

initInput();
initTouch();
initScenery();

function startGame() {
  initAudio();
  state = 'playing';
  setTouchGameState('playing');
  player = createPlayer();
  pedestrians = [];
  cars = [];
  potholes = [];
  splats = [];
  ramps = [];
  birds = [];
  pedSpawnTimer = 60;
  carSpawnTimer = 80;
  rampSpawnTimer = 120;
  birdSpawnTimer = 80;
  crashReason = '';
  startMusic();
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
  setTouchGameState('gameover');
  playCrash();
  stopMusic();
}

function updatePlaying() {
  // --- Update ---
  const wasBellActive = player.bellActive;
  updatePlayer(player);
  if (!wasBellActive && player.bellActive) playBell();
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

  // Spawn cars — both lanes
  carSpawnTimer--;
  if (carSpawnTimer <= 0) {
    // Randomly pick same-direction or oncoming
    if (Math.random() < 0.5) {
      cars.push(createCar(player.speed));
    } else {
      cars.push(createOncomingCar(player.speed));
    }
    const interval = CAR_SPAWN_INTERVAL_MIN +
      Math.random() * (CAR_SPAWN_INTERVAL_MAX - CAR_SPAWN_INTERVAL_MIN);
    carSpawnTimer = Math.floor(interval);
  }

  // Spawn ramps
  rampSpawnTimer--;
  if (rampSpawnTimer <= 0) {
    ramps.push(createRamp());
    rampSpawnTimer = Math.floor(RAMP_SPAWN_INTERVAL_MIN +
      Math.random() * (RAMP_SPAWN_INTERVAL_MAX - RAMP_SPAWN_INTERVAL_MIN));
  }

  // Spawn birds
  birdSpawnTimer--;
  if (birdSpawnTimer <= 0) {
    birds.push(createBird());
    birdSpawnTimer = Math.floor(BIRD_SPAWN_INTERVAL_MIN +
      Math.random() * (BIRD_SPAWN_INTERVAL_MAX - BIRD_SPAWN_INTERVAL_MIN));
  }

  // Update ramps
  for (const ramp of ramps) {
    updateRamp(ramp, player.speed);
    if (ramp.active && !ramp.used && checkRampCollision(ramp, player)) {
      ramp.used = true;
      launchPlayer(player);
    }
  }

  // Update birds
  for (const bird of birds) {
    updateBird(bird, player.speed);
    if (bird.active && checkBirdCollision(bird, player)) {
      if (bird.pigeon) {
        // Pigeons don't crash you — just swirl your bike
        player.swirlTimer = 40;
        bird.active = false;
      } else {
        crash('Hit by a bird!');
        return;
      }
    }
  }

  // Update pedestrians
  for (const ped of pedestrians) {
    updatePedestrian(ped, player);
    checkBellEffect(ped, player);
    if (ped.active && !player.inAir && checkCollision(ped, player)) {
      crash('Hit a pedestrian!');
      return;
    }
  }

  // Update cars
  for (const car of cars) {
    const wasHonked = car.honked;
    updateCar(car, player);
    if (!wasHonked && car.honked) playHonk();
    if (car.active && !player.inAir && checkCarCollision(car, player)) {
      crash(car.oncoming ? 'Head-on collision!' : 'Hit by a car!');
      return;
    }
  }

  // Car vs pedestrian collisions — splat!
  for (const car of cars) {
    if (!car.active) continue;
    for (const ped of pedestrians) {
      if (!ped.active) continue;
      const dx = Math.abs(car.x - ped.x);
      const dy = Math.abs(car.y - ped.y);
      if (dx < car.width / 2 + (ped.collisionW || 3) - 2 && dy < car.length / 2 + 4) {
        splats.push({ x: ped.x, y: ped.y });
        ped.active = false;
      }
    }
  }

  // Update splats (scroll with road)
  for (let i = splats.length - 1; i >= 0; i--) {
    splats[i].y += player.speed;
    if (splats[i].y > GAME_H + 20) splats.splice(i, 1);
  }

  // Update potholes
  for (const pot of potholes) {
    updatePothole(pot, player.speed);
    if (pot.active && !player.inAir && checkPotholeCollision(pot, player)) {
      crash('Hit a pothole!');
      return;
    }
  }

  // Tree collisions (on grass) — skip when airborne
  if (!player.inAir) {
    for (const tree of trees) {
      const dx = Math.abs(player.x - (tree.x + 1));
      const dy = Math.abs(player.y - tree.y);
      if (dx < 4 && dy < tree.size + 3) {
        crash('Hit a tree!');
        return;
      }
    }
  }

  // Cleanup
  pedestrians = pedestrians.filter((p) => p.active);
  cars = cars.filter((c) => c.active);
  potholes = potholes.filter((p) => p.active);
  ramps = ramps.filter((r) => r.active);
  birds = birds.filter((b) => b.active);

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

  // Draw ramps (on road surface)
  for (const ramp of ramps) {
    drawRamp(ctx, ramp);
  }

  // Draw splats (on road surface)
  for (const s of splats) {
    drawSplat(ctx, s.x, s.y);
  }

  // Draw potholes (on the road surface)
  for (const pot of potholes) {
    drawPothole(ctx, pot);
  }

  // Draw pedestrians
  for (const ped of pedestrians) {
    drawPedestrian(ctx, ped);
  }

  // Draw player (with jump offset when airborne)
  if (player.inAir) {
    // Shadow on ground
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(player.x - 3, player.y + 4, 7, 3);
    // Draw bicycle elevated
    drawBicycle(ctx, player.x, player.y - player.jumpHeight, player.frame, player.braking);
  } else {
    drawBicycle(ctx, player.x, player.y, player.frame, player.braking);
  }

  if (player.bellActive) {
    drawBellRing(ctx, player.x, player.y, player.bellProgress);
  }

  // Draw birds (above ground level)
  for (const bird of birds) {
    drawBird(ctx, bird);
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
  for (const ramp of ramps) drawRamp(ctx, ramp);
  for (const s of splats) drawSplat(ctx, s.x, s.y);
  for (const pot of potholes) drawPothole(ctx, pot);
  for (const ped of pedestrians) {
    drawPedestrian(ctx, ped);
  }
  drawBicycle(ctx, player.x, player.y, player.frame, player.braking);
  for (const bird of birds) drawBird(ctx, bird);
  for (const car of cars) drawCar(ctx, car);
  drawGameOver(ctx, player, frame, crashReason);

  if (consumeKey('Enter') || consumeKey('Space')) {
    startGame();
  }
}

gameLoop();
