// DOUBLE LIGHT — everything the player sees.
// One drawGame(ctx, game) paints the whole 1280x720 stage from the
// current state: mat and panels, HUD, found/hint/wrong markers, the
// message strip, and the overlay card for the current screen.
import { BUTTONS, COLORS, HINT_PILL, MAT, PANEL, ROUNDS, TIMER_BAR, VIEW } from './config.js';
import { SCENES } from './scenes.js';

function rrPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, font, color, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function drawButton(ctx, rect, label, enabled = true) {
  const grad = ctx.createLinearGradient(0, rect.y, 0, rect.y + rect.height);
  if (enabled) {
    grad.addColorStop(0, '#ffe08a');
    grad.addColorStop(1, '#f0a832');
  } else {
    grad.addColorStop(0, '#5a6478');
    grad.addColorStop(1, '#3a4358');
  }
  rrPath(ctx, rect.x, rect.y, rect.width, rect.height, 10);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.stroke();
  text(ctx, label, rect.x + rect.width / 2, rect.y + rect.height / 2 + 7,
    'bold 20px system-ui, sans-serif', enabled ? '#1c2436' : '#c9d2e0', 'center');
}

function drawPanels(ctx, game) {
  const s = game.state;
  const scene = SCENES[s.sceneIndex];
  const chosen = new Set(s.diffs.map((d) => d.id));
  const empty = new Set();
  const sides = [
    { x: PANEL.leftX, active: empty },
    { x: PANEL.rightX, active: chosen },
  ];
  for (const side of sides) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(side.x, PANEL.y, PANEL.size, PANEL.size);
    ctx.clip();
    ctx.translate(side.x, PANEL.y);
    scene.paint(ctx, side.active);
    ctx.restore();
    ctx.lineWidth = 3;
    ctx.strokeStyle = COLORS.panelEdge;
    ctx.strokeRect(side.x, PANEL.y, PANEL.size, PANEL.size);
  }
}

function drawMarkers(ctx, game) {
  const s = game.state;
  const panelXs = [PANEL.leftX, PANEL.rightX];
  // Found differences: a green ring on both pictures, numbered in order.
  // The newest find's ring starts wide and settles as findPulse decays.
  s.diffs.forEach((d, i) => {
    if (!d.found) return;
    const pop = s.lastFind && d.id === s.lastFind.id ? s.findPulse * 6 : 0;
    for (const px of panelXs) {
      const cx = px + d.x;
      const cy = PANEL.y + d.y;
      ctx.beginPath();
      ctx.arc(cx, cy, d.r + 7 + pop, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = COLORS.green;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + d.r * 0.7, cy - d.r * 0.7, 10, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.green;
      ctx.fill();
      text(ctx, String(i + 1), cx + d.r * 0.7, cy - d.r * 0.7 + 4,
        'bold 12px system-ui, sans-serif', '#0b1220', 'center');
    }
  });
  // Hint: a pulsing blue ring around the hinted difference, both panels.
  if (s.hintDiff && s.hintPulse > 0) {
    const pulse = s.hintDiff.r + 10 + 4 * Math.sin(game.animTime * 5);
    ctx.save();
    ctx.globalAlpha = Math.min(1, s.hintPulse);
    for (const px of panelXs) {
      ctx.beginPath();
      ctx.arc(px + s.hintDiff.x, PANEL.y + s.hintDiff.y, pulse, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = COLORS.blue;
      ctx.stroke();
    }
    ctx.restore();
  }
  // Wrong click: a red cross on both pictures, fading fast.
  if (s.wrongMark && s.wrongTime > 0) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, s.wrongTime / 0.9);
    ctx.strokeStyle = COLORS.red;
    ctx.lineWidth = 4;
    for (const px of panelXs) {
      const cx = px + s.wrongMark.x;
      const cy = PANEL.y + s.wrongMark.y;
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 12);
      ctx.lineTo(cx + 12, cy + 12);
      ctx.moveTo(cx + 12, cy - 12);
      ctx.lineTo(cx - 12, cy + 12);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawHud(ctx, game) {
  const s = game.state;
  const scene = SCENES[s.sceneIndex];
  text(ctx, 'DOUBLE LIGHT', 40, 34, 'bold 26px Georgia, serif', COLORS.gold);
  text(ctx, `Round ${s.roundIndex + 1} of 6 — ${scene.name}`, 40, 62,
    '15px system-ui, sans-serif', COLORS.muted);
  const left = s.diffs.length - s.foundCount;
  text(ctx, `FOUND ${s.foundCount} OF ${s.diffs.length} — ${left} TO GO`, 640, 32,
    'bold 17px system-ui, sans-serif', COLORS.cream, 'center');
  // Timer bar and the seconds beside it.
  const frac = Math.max(0, Math.min(1, s.timeLeft / s.timeTotal));
  ctx.fillStyle = '#22304a';
  ctx.fillRect(TIMER_BAR.x, TIMER_BAR.y, TIMER_BAR.width, TIMER_BAR.height);
  ctx.fillStyle = frac > 0.5 ? COLORS.green : frac > 0.25 ? COLORS.gold : COLORS.red;
  ctx.fillRect(TIMER_BAR.x, TIMER_BAR.y, TIMER_BAR.width * frac, TIMER_BAR.height);
  const secs = Math.max(0, Math.ceil(s.timeLeft));
  const secColor = s.timeLeft > 30 ? COLORS.gold : s.timeLeft > 15 ? '#ff9a3c' : COLORS.red;
  text(ctx, `${secs}s`, TIMER_BAR.x + TIMER_BAR.width + 12, TIMER_BAR.y + 12,
    'bold 18px system-ui, sans-serif', secColor);
  // Score, right side.
  text(ctx, 'SCORE', 1078, 26, '12px system-ui, sans-serif', COLORS.muted, 'right');
  text(ctx, String(s.score), 1078, 56, 'bold 26px system-ui, sans-serif', COLORS.cream, 'right');
  // Hint pill.
  const pill = HINT_PILL;
  const canHint = s.screen === 'play' && s.hintsLeft > 0;
  rrPath(ctx, pill.x, pill.y, pill.width, pill.height, 19);
  ctx.fillStyle = canHint ? '#2c5f9e' : '#3a4358';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = canHint ? '#7db8ff' : '#5a6478';
  ctx.stroke();
  text(ctx, `HINT ×${s.hintsLeft}`, pill.x + pill.width / 2, pill.y + 24,
    'bold 15px system-ui, sans-serif', '#ffffff', 'center');
}

function drawMessage(ctx, game) {
  const s = game.state;
  const line = s.messageTime > 0
    ? s.message
    : 'Click a difference — or press H for a hint.';
  text(ctx, line, 640, 708, '15px system-ui, sans-serif', COLORS.gold, 'center');
}

function dimAndCard(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(6, 10, 20, 0.66)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  rrPath(ctx, x, y, w, h, 16);
  ctx.fillStyle = '#141d31';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#3a4a6b';
  ctx.stroke();
}

function drawOverlay(ctx, game) {
  const s = game.state;
  if (s.screen === 'title') {
    dimAndCard(ctx, 390, 288, 500, 240);
    text(ctx, 'DOUBLE LIGHT', 640, 340, 'bold 44px Georgia, serif', COLORS.gold, 'center');
    text(ctx, 'Spot every difference. Beat the clock.', 640, 372,
      '17px system-ui, sans-serif', COLORS.cream, 'center');
    text(ctx, '6 rounds · 3 scenes · hints cost 150', 640, 398,
      '14px system-ui, sans-serif', COLORS.muted, 'center');
    drawButton(ctx, BUTTONS.start, BUTTONS.start.label);
    if (game.best > 0) {
      text(ctx, `BEST ${game.best}`, 640, 505, 'bold 14px system-ui, sans-serif', COLORS.gold, 'center');
    }
  } else if (s.screen === 'clear') {
    dimAndCard(ctx, 390, 270, 500, 220);
    text(ctx, 'ROUND CLEAR!', 640, 322, 'bold 36px Georgia, serif', COLORS.green, 'center');
    text(ctx, `Round score +${s.roundScore}`, 640, 354, '18px system-ui, sans-serif', COLORS.cream, 'center');
    text(ctx, `Total score ${s.score} · ${s.timeLeft > 0 ? Math.ceil(s.timeLeft) + 's to spare' : ''}`, 640, 380,
      '15px system-ui, sans-serif', COLORS.muted, 'center');
    const last = s.roundIndex >= ROUNDS.length - 1;
    const btn = last ? BUTTONS.result : BUTTONS.next;
    drawButton(ctx, btn, btn.label);
  } else if (s.screen === 'over') {
    dimAndCard(ctx, 390, 270, 500, 220);
    text(ctx, "TIME'S UP", 640, 322, 'bold 36px Georgia, serif', COLORS.red, 'center');
    text(ctx, `You found ${s.foundCount} of ${s.diffs.length} in round ${s.roundIndex + 1}`, 640, 354,
      '18px system-ui, sans-serif', COLORS.cream, 'center');
    text(ctx, `Score ${s.score} · Best ${game.best}`, 640, 380,
      '15px system-ui, sans-serif', COLORS.muted, 'center');
    drawButton(ctx, BUTTONS.retry, BUTTONS.retry.label);
  } else if (s.screen === 'victory') {
    dimAndCard(ctx, 390, 270, 500, 220);
    text(ctx, 'YOU FOUND THEM ALL!', 640, 322, 'bold 32px Georgia, serif', COLORS.gold, 'center');
    text(ctx, `Final score ${s.score} · ${s.totalFound} differences found`, 640, 354,
      '18px system-ui, sans-serif', COLORS.cream, 'center');
    text(ctx, `Best ${game.best} · Best streak x${s.bestStreak}`, 640, 380,
      '15px system-ui, sans-serif', COLORS.muted, 'center');
    drawButton(ctx, BUTTONS.again, BUTTONS.again.label);
  } else if (s.screen === 'paused') {
    dimAndCard(ctx, 390, 280, 500, 200);
    text(ctx, 'PAUSED', 640, 332, 'bold 36px Georgia, serif', COLORS.gold, 'center');
    text(ctx, 'Press P or tap RESUME to continue', 640, 366,
      '15px system-ui, sans-serif', COLORS.muted, 'center');
    drawButton(ctx, BUTTONS.resume, BUTTONS.resume.label);
  }
}

export function drawGame(ctx, game) {
  ctx.fillStyle = COLORS.page;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  // Cream mat under the two pictures.
  rrPath(ctx, MAT.x, MAT.y, MAT.width, MAT.height, 14);
  ctx.fillStyle = COLORS.mat;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = COLORS.matEdge;
  ctx.stroke();
  drawPanels(ctx, game);
  drawMarkers(ctx, game);
  drawHud(ctx, game);
  drawMessage(ctx, game);
  drawOverlay(ctx, game);
}
