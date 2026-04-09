import { GAME_W, GAME_H, COLORS, BELL_COOLDOWN } from './constants.js';

export function drawHUD(ctx, player) {
  // Score
  ctx.fillStyle = COLORS.uiBg;
  ctx.fillRect(2, 2, 50, 10);
  ctx.fillStyle = COLORS.ui;
  ctx.font = '8px monospace';
  ctx.fillText(`${Math.floor(player.score)}m`, 4, 10);

  // Speed indicator
  const speedPct = player.speed / 3.5;
  ctx.fillStyle = COLORS.uiBg;
  ctx.fillRect(GAME_W - 30, 2, 28, 10);
  ctx.fillStyle = player.braking ? '#ff4444' : '#44ff44';
  ctx.fillRect(GAME_W - 29, 3, Math.floor(26 * speedPct), 8);

  // Bell cooldown
  const bellReady = player.bellCooldown === 0;
  ctx.fillStyle = COLORS.uiBg;
  ctx.fillRect(2, 14, 30, 10);
  ctx.fillStyle = bellReady ? COLORS.bell : '#666';
  ctx.font = '7px monospace';
  ctx.fillText(bellReady ? 'BELL' : '...', 4, 22);
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
  ctx.fillText('← → dodge', GAME_W / 2, 110);
  ctx.fillText('↓ brake', GAME_W / 2, 122);
  ctx.fillText('SPACE ring bell', GAME_W / 2, 134);
  ctx.fillText('(some wear ANC!)', GAME_W / 2, 150);

  // Blinking prompt
  if (Math.floor(frame / 30) % 2 === 0) {
    ctx.fillStyle = COLORS.bell;
    ctx.fillText('PRESS ENTER', GAME_W / 2, 190);
  }

  ctx.textAlign = 'left';
}

export function drawGameOver(ctx, player, frame) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, GAME_W, GAME_H);

  ctx.fillStyle = '#e63946';
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CRASH!', GAME_W / 2, 80);

  ctx.fillStyle = COLORS.ui;
  ctx.font = '8px monospace';
  ctx.fillText(`Distance: ${Math.floor(player.score)}m`, GAME_W / 2, 110);

  if (Math.floor(frame / 30) % 2 === 0) {
    ctx.fillStyle = COLORS.bell;
    ctx.font = '6px monospace';
    ctx.fillText('PRESS ENTER', GAME_W / 2, 150);
  }

  ctx.textAlign = 'left';
}
