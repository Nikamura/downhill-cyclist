import { COLORS } from './constants.js';

// All sprites are drawn procedurally at pixel level

export function drawBicycle(ctx, x, y, frame, braking) {
  const f = Math.floor(frame / 6) % 4; // pedal animation

  // Wheels
  ctx.fillStyle = COLORS.playerWheel;
  drawCircle(ctx, x, y + 6, 4);       // rear wheel
  drawCircle(ctx, x, y - 5, 4);       // front wheel

  // Spokes animation
  ctx.fillStyle = '#666';
  const spokeAngle = (f * Math.PI) / 2;
  for (const wy of [y + 6, y - 5]) {
    ctx.fillRect(x + Math.round(Math.cos(spokeAngle) * 2), wy + Math.round(Math.sin(spokeAngle) * 2), 1, 1);
    ctx.fillRect(x - Math.round(Math.cos(spokeAngle) * 2), wy - Math.round(Math.sin(spokeAngle) * 2), 1, 1);
  }

  // Frame
  ctx.fillStyle = COLORS.player;
  drawLine(ctx, x, y + 6, x, y - 5);         // main tube
  drawLine(ctx, x, y, x - 2, y - 2);         // seat tube
  drawLine(ctx, x, y - 3, x + 2, y - 5);     // handlebar

  // Rider body
  ctx.fillStyle = '#e8d5b7'; // skin
  ctx.fillRect(x - 1, y - 1, 3, 1);          // head

  ctx.fillStyle = '#264653';
  ctx.fillRect(x - 1, y, 3, 3);              // torso
  ctx.fillRect(x - 2, y + 1, 1, 2);          // arm

  // Legs (pedaling animation)
  ctx.fillStyle = '#264653';
  const legOffset = f < 2 ? 1 : -1;
  ctx.fillRect(x - 1, y + 3, 1, 2 + legOffset);
  ctx.fillRect(x + 1, y + 3, 1, 2 - legOffset);

  // Brake indicator
  if (braking) {
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x - 1, y + 10, 3, 1);
  }
}

function drawSinglePed(ctx, x, y, bob, shirtColor, hasANC, scared, frame) {
  // Body
  ctx.fillStyle = shirtColor;
  ctx.fillRect(x - 2, y + bob, 5, 6);

  // Head
  ctx.fillStyle = '#e8d5b7';
  ctx.fillRect(x - 1, y - 2 + bob, 3, 3);

  // Eyes
  ctx.fillStyle = scared ? '#fff' : '#333';
  ctx.fillRect(x - 1, y - 1 + bob, 1, 1);
  ctx.fillRect(x + 1, y - 1 + bob, 1, 1);

  if (scared) {
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 1, y - 1 + bob, 1, 1);
    ctx.fillRect(x + 1, y - 1 + bob, 1, 1);
  }

  // AirPods (tiny white earbuds)
  if (hasANC) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 2, y - 1 + bob, 1, 2);  // left airpod
    ctx.fillRect(x + 2, y - 1 + bob, 1, 2);  // right airpod
  }

  // Legs
  ctx.fillStyle = '#555';
  const legAnim = Math.floor(frame / 10) % 2;
  ctx.fillRect(x - 1, y + 6 + bob, 1, 3 + legAnim);
  ctx.fillRect(x + 1, y + 6 + bob, 1, 3 - legAnim);
}

function drawDog(ctx, x, y, bob, frame, color) {
  const legAnim = Math.floor(frame / 6) % 2;

  // Body
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 4 + bob, 3, 2);

  // Head
  ctx.fillRect(x + 3, y + 3 + bob, 2, 2);

  // Ear
  ctx.fillStyle = '#555';
  ctx.fillRect(x + 3, y + 2 + bob, 1, 1);

  // Legs
  ctx.fillStyle = color;
  ctx.fillRect(x, y + 6 + bob, 1, 1 + legAnim);
  ctx.fillRect(x + 2, y + 6 + bob, 1, 1 - legAnim);

  // Tail (wagging)
  const wag = Math.floor(frame / 4) % 2;
  ctx.fillRect(x - 1 + wag, y + 3 + bob, 1, 1);
}

export function drawPedestrian(ctx, ped) {
  const { x, y, hasANC, scared, frame, type } = ped;
  const bob = Math.floor(frame / 8) % 2;
  const shirt = hasANC ? COLORS.pedANC : COLORS.ped;

  if (type === 'couple') {
    drawSinglePed(ctx, x - 3, y, bob, shirt, hasANC, scared, frame);
    const bob2 = Math.floor((frame + 4) / 8) % 2;
    drawSinglePed(ctx, x + 3, y, bob2, ped.partnerShirt, false, scared, frame + 5);
    return;
  }

  if (type === 'dogWalker') {
    drawSinglePed(ctx, x - 3, y, bob, shirt, hasANC, scared, frame);
    // Leash
    ctx.fillStyle = '#666';
    ctx.fillRect(x - 1, y + 3 + bob, 5, 1);
    // Dog
    const dogBob = Math.floor((frame + 3) / 8) % 2;
    drawDog(ctx, x + 4, y, dogBob, frame, ped.dogColor);
    return;
  }

  drawSinglePed(ctx, x, y, bob, shirt, hasANC, scared, frame);
}

export function drawSplat(ctx, x, y) {
  x = Math.round(x);
  y = Math.round(y);
  // Dark red splatter pattern
  ctx.fillStyle = '#8b0000';
  ctx.fillRect(x - 3, y - 1, 7, 3);
  ctx.fillRect(x - 1, y - 3, 3, 7);
  ctx.fillRect(x - 2, y - 2, 5, 5);
  // Darker center
  ctx.fillStyle = '#5a0000';
  ctx.fillRect(x - 1, y - 1, 3, 3);
  // Spatter dots
  ctx.fillStyle = '#8b0000';
  ctx.fillRect(x - 4, y - 3, 1, 1);
  ctx.fillRect(x + 4, y + 2, 1, 1);
  ctx.fillRect(x + 3, y - 2, 1, 1);
  ctx.fillRect(x - 3, y + 3, 1, 1);
  ctx.fillRect(x + 1, y + 4, 1, 1);
  ctx.fillRect(x - 5, y, 1, 1);
}

export function drawBellRing(ctx, x, y, progress) {
  // Expanding ring effect
  const radius = Math.floor(progress * 30);
  const alpha = 1 - progress;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = COLORS.bell;
  drawCircleOutline(ctx, x, y, radius);
  if (radius > 4) drawCircleOutline(ctx, x, y, radius - 3);
  ctx.globalAlpha = 1;
}

// Helpers for pixel-perfect drawing
function drawCircle(ctx, cx, cy, r) {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy <= r * r) {
        ctx.fillRect(cx + dx, cy + dy, 1, 1);
      }
    }
  }
}

function drawCircleOutline(ctx, cx, cy, r) {
  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      const dist = dx * dx + dy * dy;
      if (dist <= r * r && dist >= (r - 1) * (r - 1)) {
        ctx.fillRect(cx + dx, cy + dy, 1, 1);
      }
    }
  }
}

function drawLine(ctx, x0, y0, x1, y1) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (true) {
    ctx.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}
