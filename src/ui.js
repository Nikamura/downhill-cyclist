import { GAME_W, GAME_H, COLORS, SPEED_TO_KMH } from './constants.js';

// --- Speedometer ---
// Analog gauge: semicircular arc with needle, tick marks, and digital km/h readout
// Positioned bottom-right corner

const SPEEDO_CX = GAME_W - 28;
const SPEEDO_CY = GAME_H - 14;
const SPEEDO_R = 22;
const SPEEDO_MAX = 250; // max on the dial (km/h)

function getSpeedColor(kmh) {
  if (kmh > 120) return COLORS.speedInsane;
  if (kmh > 70) return COLORS.speedFast;
  return COLORS.speedNormal;
}

function drawSpeedometer(ctx, player, frame) {
  const kmh = player.kmh;
  const shake = player.screenShake;

  // Gauge background
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  fillArc(ctx, SPEEDO_CX, SPEEDO_CY, SPEEDO_R + 3, Math.PI, 0);

  // Tick marks (every 50 km/h)
  for (let v = 0; v <= SPEEDO_MAX; v += 50) {
    const pct = v / SPEEDO_MAX;
    const angle = Math.PI + pct * Math.PI;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const inner = SPEEDO_R - 3;
    const outer = SPEEDO_R;

    ctx.fillStyle = '#888';
    drawPixelLine(ctx,
      SPEEDO_CX + Math.round(cos * inner), SPEEDO_CY + Math.round(sin * inner),
      SPEEDO_CX + Math.round(cos * outer), SPEEDO_CY + Math.round(sin * outer),
    );

    // Label
    ctx.fillStyle = '#999';
    ctx.font = '4px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(
      String(v),
      SPEEDO_CX + Math.round(cos * (SPEEDO_R - 7)),
      SPEEDO_CY + Math.round(sin * (SPEEDO_R - 7)) + 1,
    );
  }

  // Minor ticks (every 10 km/h)
  for (let v = 0; v <= SPEEDO_MAX; v += 10) {
    if (v % 50 === 0) continue;
    const pct = v / SPEEDO_MAX;
    const angle = Math.PI + pct * Math.PI;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    ctx.fillStyle = '#555';
    ctx.fillRect(
      SPEEDO_CX + Math.round(cos * (SPEEDO_R - 1)),
      SPEEDO_CY + Math.round(sin * (SPEEDO_R - 1)),
      1, 1,
    );
  }

  // Colored arc showing current speed zone
  const clampedKmh = Math.min(kmh, SPEEDO_MAX);
  const needlePct = clampedKmh / SPEEDO_MAX;

  // Draw colored segments
  for (let i = 0; i < Math.floor(needlePct * 40); i++) {
    const pct = i / 40;
    const angle = Math.PI + pct * Math.PI;
    const v = pct * SPEEDO_MAX;
    ctx.fillStyle = getSpeedColor(v);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(
      SPEEDO_CX + Math.round(Math.cos(angle) * (SPEEDO_R - 2)),
      SPEEDO_CY + Math.round(Math.sin(angle) * (SPEEDO_R - 2)),
      1, 1,
    );
  }
  ctx.globalAlpha = 1;

  // Needle — with shake at high speed
  const needleAngle = Math.PI + needlePct * Math.PI;
  const needleShakeX = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  const needleShakeY = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  const nx = SPEEDO_CX + Math.round(Math.cos(needleAngle) * (SPEEDO_R - 4) + needleShakeX);
  const ny = SPEEDO_CY + Math.round(Math.sin(needleAngle) * (SPEEDO_R - 4) + needleShakeY);

  ctx.fillStyle = getSpeedColor(kmh);
  drawPixelLine(ctx, SPEEDO_CX, SPEEDO_CY, nx, ny);
  // Needle dot center
  ctx.fillStyle = '#fff';
  ctx.fillRect(SPEEDO_CX, SPEEDO_CY, 1, 1);

  // Digital readout
  const displayKmh = Math.floor(kmh);
  ctx.fillStyle = getSpeedColor(kmh);
  ctx.font = '7px monospace';
  ctx.textAlign = 'center';

  // Shake the number at insane speeds
  const textShakeX = shake > 1 ? (Math.random() - 0.5) * shake * 0.5 : 0;
  ctx.fillText(
    `${displayKmh}`,
    SPEEDO_CX + textShakeX,
    SPEEDO_CY - 4,
  );
  ctx.fillStyle = '#aaa';
  ctx.font = '4px monospace';
  ctx.fillText('km/h', SPEEDO_CX, SPEEDO_CY + 4);

  ctx.textAlign = 'left';
}

// --- Rest of HUD ---

export function drawHUD(ctx, player) {
  // Distance
  ctx.fillStyle = COLORS.uiBg;
  ctx.fillRect(2, 2, 50, 10);
  ctx.fillStyle = COLORS.ui;
  ctx.font = '8px monospace';
  ctx.fillText(`${Math.floor(player.score)}m`, 4, 10);

  // Bell cooldown
  const bellReady = player.bellCooldown === 0;
  ctx.fillStyle = COLORS.uiBg;
  ctx.fillRect(2, 14, 30, 10);
  ctx.fillStyle = bellReady ? COLORS.bell : '#666';
  ctx.font = '7px monospace';
  ctx.fillText(bellReady ? 'BELL' : '...', 4, 22);

  // Pedaling indicator
  if (player.pedaling) {
    ctx.fillStyle = COLORS.speedInsane;
    ctx.font = '5px monospace';
    ctx.fillText('PEDAL!', 2, 32);
  }

  // Air time display
  if (player.inAir) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(GAME_W / 2 - 25, 50, 50, 12);
    ctx.fillStyle = '#00ffff';
    ctx.font = '7px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`AIR ${player.airTimeCurrent.toFixed(1)}s`, GAME_W / 2, 59);
    ctx.textAlign = 'left';
  } else if (player.bestAirTime > 0) {
    ctx.fillStyle = '#448';
    ctx.font = '5px monospace';
    ctx.fillText(`best air: ${player.bestAirTime.toFixed(1)}s`, 2, 48);
  }

  // Zone warning
  if (player.zone === 'grass') {
    ctx.fillStyle = '#44cc44';
    ctx.font = '5px monospace';
    ctx.fillText('GRASS!', 2, 40);
  } else if (player.zone === 'car') {
    ctx.fillStyle = '#ff4444';
    ctx.font = '5px monospace';
    ctx.fillText('CAR LANE!', 2, 40);
  } else if (player.zone === 'sidewalk') {
    ctx.fillStyle = '#ffaa44';
    ctx.font = '5px monospace';
    ctx.fillText('SIDEWALK', 2, 40);
  }

}

export function drawTitleScreen(ctx, frame) {
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  ctx.fillStyle = COLORS.ui;
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('DOWNHILL', GAME_W / 2, 60);
  ctx.fillText('CYCLIST', GAME_W / 2, 76);

  ctx.font = '6px monospace';
  ctx.fillStyle = '#aaa';
  ctx.fillText('← → swerve', GAME_W / 2, 106);
  ctx.fillText('↑ PEDAL (maniac)', GAME_W / 2, 118);
  ctx.fillText('↓ brake', GAME_W / 2, 130);
  ctx.fillText('SPACE ring bell', GAME_W / 2, 142);

  ctx.fillStyle = '#888';
  ctx.font = '5px monospace';
  ctx.fillText('GRASS: sloped! (trees!)', GAME_W / 2, 153);
  ctx.fillText('SIDEWALK: potholes!', GAME_W / 2, 163);
  ctx.fillText('BIKE PATH: ramps + people', GAME_W / 2, 173);
  ctx.fillText('CAR ROAD: cars! BIRDS!', GAME_W / 2, 183);
  ctx.fillText('ramps = jump! dodge birds!', GAME_W / 2, 193);

  if (Math.floor(frame / 30) % 2 === 0) {
    ctx.fillStyle = COLORS.bell;
    ctx.fillText('PRESS ENTER', GAME_W / 2, 195);
  }

  ctx.textAlign = 'left';
}

export function drawGameOver(ctx, player, frame, crashReason) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  ctx.fillStyle = '#e63946';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CRASH!', GAME_W / 2, 65);

  if (crashReason) {
    ctx.fillStyle = '#ffaa44';
    ctx.font = '6px monospace';
    ctx.fillText(crashReason, GAME_W / 2, 78);
  }

  ctx.fillStyle = COLORS.ui;
  ctx.font = '8px monospace';
  ctx.fillText(`Distance: ${Math.floor(player.score)}m`, GAME_W / 2, 95);

  ctx.fillStyle = getSpeedColor(player.kmh);
  ctx.fillText(`Speed: ${Math.floor(player.kmh)} km/h`, GAME_W / 2, 110);

  ctx.fillStyle = COLORS.speedInsane;
  ctx.fillText(`Top: ${Math.floor(player.maxKmh)} km/h`, GAME_W / 2, 125);

  if (player.bestAirTime > 0) {
    ctx.fillStyle = '#00ffff';
    ctx.fillText(`Best air: ${player.bestAirTime.toFixed(1)}s`, GAME_W / 2, 140);
  }

  if (Math.floor(frame / 30) % 2 === 0) {
    ctx.fillStyle = COLORS.bell;
    ctx.font = '6px monospace';
    ctx.fillText('PRESS ENTER', GAME_W / 2, 160);
  }

  ctx.textAlign = 'left';
}

// --- Pixel helpers ---

function fillArc(ctx, cx, cy, r, startAngle, endAngle) {
  for (let dy = -r; dy <= 0; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy <= r * r) {
        const angle = Math.atan2(dy, dx);
        if (angle >= startAngle - Math.PI || angle <= endAngle - Math.PI) {
          ctx.fillRect(cx + dx, cy + dy, 1, 1);
        }
      }
    }
  }
}

function drawPixelLine(ctx, x0, y0, x1, y1) {
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
