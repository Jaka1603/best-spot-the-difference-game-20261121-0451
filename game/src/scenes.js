// DOUBLE LIGHT — the three pictures, painted fresh in code.
// Each scene is one paint(ctx, active) function. The left panel is always
// painted with an empty `active` set (the untouched picture); the right
// panel is painted with the round's chosen difference ids switched on, so
// every mutation is a small, visible change to the same base drawing.
// Anchors live in the 560x560 picture space and are shared by both panels.

function disc(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function blob(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function rrPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function poly(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function strokeLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Point on a quadratic curve — used to hang bulbs and bunting on the
// same sagging lines in both panels.
function qbez(p0, p1, p2, t) {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

function skyGradient(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, 340);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 560, 340);
}

function seaGradient(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 335, 0, 560);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 335, 560, 225);
}

// ---------------------------------------------------------------- scene 1
function paintHarbour(ctx, A) {
  skyGradient(ctx, [[0, '#241a4d'], [0.55, '#7a3a6e'], [0.85, '#e8734a'], [1, '#f9b264']]);

  // Early stars.
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  const stars = [[160, 40], [210, 90], [480, 50], [60, 110], [330, 45], [540, 110]];
  for (const [x, y] of stars) disc(ctx, x, y, 2);
  if (!A.has('h10')) disc(ctx, 90, 60, 2.5);

  // Clouds drift across the dusk sky; one of them can vanish.
  ctx.fillStyle = 'rgba(255, 214, 170, 0.55)';
  blob(ctx, 200, 70, 46, 12);
  blob(ctx, 330, 45, 34, 9);
  if (!A.has('h12')) {
    blob(ctx, 480, 80, 52, 13);
    blob(ctx, 505, 72, 28, 9);
  }

  // Low sun with a soft halo, sinking into the sea.
  ctx.fillStyle = 'rgba(255, 190, 90, 0.25)';
  disc(ctx, 415, 255, 70);
  ctx.fillStyle = '#ffd76a';
  disc(ctx, 415, 255, 44);
  ctx.fillStyle = '#fff3c4';
  disc(ctx, 415, 255, 30);

  seaGradient(ctx, '#1d4258', '#0b2233');
  // Sun glitter on the water.
  ctx.fillStyle = 'rgba(255, 200, 110, 0.5)';
  for (const [x, w] of [[392, 46], [402, 26], [388, 58], [410, 18]]) {
    ctx.fillRect(x, 345, w, 4);
  }
  ctx.fillRect(396, 380, 34, 3);
  ctx.fillRect(400, 420, 26, 3);
  ctx.fillRect(404, 465, 18, 3);
  // Wave strokes.
  ctx.strokeStyle = 'rgba(180, 220, 235, 0.35)';
  ctx.lineWidth = 2;
  for (const [x, y, len] of [[60, 380, 70], [180, 420, 90], [300, 500, 80], [470, 400, 60], [120, 500, 70]]) {
    strokeLine(ctx, x, y, x + len, y);
  }

  // Distant headland on the right.
  ctx.fillStyle = '#3a2350';
  poly(ctx, [[470, 335], [560, 298], [560, 335]]);

  // Lighthouse on the left point.
  ctx.fillStyle = '#f7efdd';
  poly(ctx, [[82, 355], [124, 355], [120, 175], [86, 175]]);
  ctx.fillStyle = '#d64545';
  ctx.fillRect(84, 300, 38, 20);
  ctx.fillRect(86, 232, 34, 20);
  ctx.fillStyle = '#2a3550';
  ctx.fillRect(74, 168, 58, 8);
  ctx.fillStyle = '#22304a';
  ctx.fillRect(92, 140, 22, 30);
  // The lamp: warm and glowing, or cold and dark.
  if (A.has('h1')) {
    ctx.fillStyle = '#2b3242';
    disc(ctx, 103, 155, 9);
  } else {
    ctx.fillStyle = 'rgba(255, 233, 163, 0.35)';
    disc(ctx, 103, 155, 20);
    ctx.fillStyle = '#ffe9a3';
    disc(ctx, 103, 155, 9);
  }
  ctx.fillStyle = '#d64545';
  poly(ctx, [[90, 140], [116, 140], [103, 126]]);
  // Flag on top — it can flip to the other side.
  ctx.strokeStyle = '#2a3550';
  ctx.lineWidth = 2;
  strokeLine(ctx, 103, 126, 103, 110);
  ctx.fillStyle = '#ffd76a';
  if (A.has('h7')) poly(ctx, [[103, 111], [79, 117], [103, 123]]);
  else poly(ctx, [[103, 111], [127, 117], [103, 123]]);

  // Three little houses along the shore.
  const houses = [
    { x: 300, y: 312, w: 70, h: 53 },
    { x: 380, y: 300, w: 74, h: 65 },
    { x: 460, y: 315, w: 70, h: 50 },
  ];
  for (const hs of houses) {
    ctx.fillStyle = '#e8d9b0';
    ctx.fillRect(hs.x, hs.y, hs.w, hs.h);
    ctx.fillStyle = '#b4503c';
    poly(ctx, [[hs.x - 6, hs.y], [hs.x + hs.w + 6, hs.y], [hs.x + hs.w / 2, hs.y - 26]]);
    ctx.fillStyle = '#4a3220';
    ctx.fillRect(hs.x + hs.w / 2 - 9, hs.y + hs.h - 28, 18, 28);
  }
  // Windows: two lit, one that can go dark.
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(318, 330, 16, 16);
  ctx.fillRect(344, 330, 16, 16);
  ctx.fillRect(428, 330, 16, 16);
  ctx.fillRect(478, 332, 16, 16);
  ctx.fillRect(504, 332, 16, 16);
  if (A.has('h3')) {
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(396, 330, 18, 18);
  } else {
    ctx.fillStyle = '#ffd76a';
    ctx.fillRect(396, 330, 18, 18);
  }
  // Chimney smoke that can clear away.
  ctx.fillStyle = '#7a6a58';
  ctx.fillRect(443, 276, 12, 30);
  if (!A.has('h8')) {
    ctx.fillStyle = 'rgba(230, 225, 215, 0.7)';
    disc(ctx, 449, 268, 8);
    disc(ctx, 456, 254, 10);
    disc(ctx, 449, 238, 9);
  }

  // Wooden pier reaching into the water.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(300, 430, 260, 40);
  ctx.fillStyle = '#8a6742';
  for (let x = 306; x < 560; x += 18) ctx.fillRect(x, 430, 3, 40);
  ctx.fillStyle = '#54371f';
  for (const x of [320, 400, 480, 540]) ctx.fillRect(x, 468, 10, 42);
  // Pier lamp: green, or red when switched.
  ctx.strokeStyle = '#2a3550';
  ctx.lineWidth = 3;
  strokeLine(ctx, 520, 432, 520, 404);
  ctx.fillStyle = A.has('h6') ? '#ff5d5d' : '#7dff9a';
  disc(ctx, 520, 410, 8);
  if (!A.has('h6')) {
    ctx.fillStyle = 'rgba(125, 255, 154, 0.25)';
    disc(ctx, 520, 410, 16);
  }
  // A crate waiting on the pier.
  if (!A.has('h11')) {
    ctx.fillStyle = '#a97c46';
    ctx.fillRect(465, 440, 26, 24);
    ctx.strokeStyle = '#6b4a2f';
    ctx.lineWidth = 2;
    ctx.strokeRect(465, 440, 26, 24);
    strokeLine(ctx, 465, 440, 491, 464);
  }

  // Sailboat with a sail that can change colour.
  ctx.fillStyle = '#5a3a22';
  poly(ctx, [[215, 405], [290, 405], [278, 425], [228, 425]]);
  ctx.fillStyle = A.has('h9') ? '#b03030' : '#ffd76a';
  ctx.fillRect(228, 411, 50, 5);
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 3;
  strokeLine(ctx, 252, 405, 252, 338);
  ctx.fillStyle = A.has('h2') ? '#2ec4b6' : '#fdf6e3';
  poly(ctx, [[252, 344], [252, 396], [296, 396]]);

  // Buoy bobbing in the water.
  if (!A.has('h4')) {
    ctx.fillStyle = '#e8734a';
    disc(ctx, 330, 495, 12);
    ctx.fillStyle = '#ffd76a';
    disc(ctx, 330, 480, 4);
    ctx.strokeStyle = '#e8734a';
    ctx.lineWidth = 3;
    strokeLine(ctx, 330, 484, 330, 472);
  }

  // Gulls over the bay; one can fly away.
  ctx.strokeStyle = '#2a2438';
  ctx.lineWidth = 2;
  const gulls = [[340, 70], [255, 120]];
  for (const [x, y] of gulls) {
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.quadraticCurveTo(x - 3, y - 6, x, y);
    ctx.quadraticCurveTo(x + 3, y - 6, x + 9, y);
    ctx.stroke();
  }
  if (!A.has('h5')) {
    ctx.beginPath();
    ctx.moveTo(291, 90);
    ctx.quadraticCurveTo(297, 84, 300, 90);
    ctx.quadraticCurveTo(303, 84, 309, 90);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------- scene 2
function paintCove(ctx, A) {
  skyGradient(ctx, [[0, '#050b20'], [0.6, '#0e2148'], [1, '#1a3a66']]);

  // Moon with a pale halo.
  ctx.fillStyle = 'rgba(244, 234, 210, 0.18)';
  disc(ctx, 450, 80, 46);
  ctx.fillStyle = '#f4ead2';
  disc(ctx, 450, 80, 32);
  ctx.fillStyle = '#d9cba6';
  disc(ctx, 440, 72, 6);
  disc(ctx, 460, 90, 5);
  disc(ctx, 452, 96, 3);

  // Stars; one can wink out.
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (const [x, y] of [[60, 50], [140, 90], [330, 40], [520, 140], [200, 140], [90, 180], [300, 110], [520, 60]]) {
    disc(ctx, x, y, 2);
  }
  if (!A.has('c4')) disc(ctx, 250, 50, 2.5);

  seaGradient(ctx, '#0a1f3a', '#061224');
  ctx.fillStyle = 'rgba(244, 234, 210, 0.35)';
  for (const [y, w] of [[360, 40], [400, 30], [450, 22], [500, 14]]) {
    ctx.fillRect(450 - w / 2, y, w, 3);
  }
  ctx.strokeStyle = 'rgba(150, 190, 230, 0.3)';
  ctx.lineWidth = 2;
  for (const [x, y, len] of [[40, 420, 80], [240, 470, 70], [420, 430, 60]]) {
    strokeLine(ctx, x, y, x + len, y);
  }

  // Rocky cliff on the left, holding the lighthouse.
  ctx.fillStyle = '#0d1526';
  poly(ctx, [[0, 560], [0, 320], [60, 280], [110, 250], [160, 290], [200, 330], [190, 560]]);
  ctx.strokeStyle = '#22304a';
  ctx.lineWidth = 2;
  strokeLine(ctx, 0, 320, 60, 280);
  strokeLine(ctx, 60, 280, 110, 250);

  // Lighthouse tower and lamp.
  ctx.fillStyle = '#e8e2d2';
  poly(ctx, [[92, 255], [138, 255], [132, 152], [98, 152]]);
  ctx.fillStyle = '#3a4a6b';
  ctx.fillRect(95, 210, 40, 14);
  ctx.fillStyle = '#22304a';
  ctx.fillRect(98, 128, 34, 26);
  ctx.fillStyle = '#ffe9a3';
  disc(ctx, 115, 141, 8);
  // The beam sweeps right — or, when switched, left.
  ctx.fillStyle = 'rgba(255, 233, 163, 0.20)';
  if (A.has('c1')) poly(ctx, [[112, 141], [0, 152], [0, 250]]);
  else poly(ctx, [[120, 141], [420, 152], [420, 250]]);

  // Cottage with warm windows on the right.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(385, 315, 135, 85);
  ctx.fillStyle = '#8a3a30';
  poly(ctx, [[375, 315], [530, 315], [452, 272]]);
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(440, 355, 26, 45);
  ctx.fillStyle = '#ffd76a';
  ctx.fillRect(480, 332, 26, 24);
  if (A.has('c2')) {
    ctx.fillStyle = '#22283a';
    ctx.fillRect(398, 332, 26, 24);
  } else {
    ctx.fillStyle = '#ffd76a';
    ctx.fillRect(398, 332, 26, 24);
  }
  // Chimney and its smoke.
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(498, 252, 12, 34);
  if (!A.has('c7')) {
    ctx.fillStyle = 'rgba(220, 220, 225, 0.65)';
    disc(ctx, 504, 242, 7);
    disc(ctx, 511, 229, 9);
    disc(ctx, 505, 216, 8);
  }

  // Fence posts along the cottage garden; one can go missing.
  ctx.fillStyle = '#4a3220';
  ctx.fillRect(330, 392, 190, 5);
  for (const x of [335, 360, 385, 410, 435, 460, 485, 510]) {
    if (x === 360 && A.has('c8')) continue;
    ctx.fillRect(x, 384, 7, 34);
  }
  // (When c8 is switched on, the post at x 360 above is skipped: the
  // gap in the fence is itself the difference, so nothing replaces it.)

  // Lantern post near the fence.
  ctx.strokeStyle = '#2a3550';
  ctx.lineWidth = 3;
  strokeLine(ctx, 330, 400, 330, 344);
  if (A.has('c10')) {
    ctx.fillStyle = '#2b3242';
    ctx.fillRect(322, 330, 16, 22);
  } else {
    ctx.fillStyle = 'rgba(255, 200, 110, 0.3)';
    disc(ctx, 330, 341, 18);
    ctx.fillStyle = '#ffb347';
    ctx.fillRect(322, 330, 16, 22);
  }

  // Rowboat with an oar that can be lost.
  ctx.fillStyle = '#7a4a26';
  poly(ctx, [[250, 445], [315, 445], [305, 462], [260, 462]]);
  ctx.fillStyle = '#5a3418';
  ctx.fillRect(258, 449, 50, 4);
  if (!A.has('c3')) {
    ctx.strokeStyle = '#8a6742';
    ctx.lineWidth = 4;
    strokeLine(ctx, 295, 448, 322, 424);
    ctx.fillStyle = '#8a6742';
    blob(ctx, 324, 422, 7, 4);
  }

  // Buoy light that can change colour.
  ctx.fillStyle = '#c94f3d';
  disc(ctx, 385, 488, 10);
  ctx.fillStyle = A.has('c6') ? '#ff5d5d' : '#ffb347';
  disc(ctx, 385, 474, 5);

  // A lone rock in the water.
  if (!A.has('c5')) {
    ctx.fillStyle = '#16233c';
    blob(ctx, 202, 505, 20, 8);
  }

  // Crab on the shore rock.
  ctx.fillStyle = '#16233c';
  blob(ctx, 152, 420, 26, 10);
  if (!A.has('c9')) {
    ctx.fillStyle = '#d64545';
    disc(ctx, 152, 414, 6);
    ctx.strokeStyle = '#d64545';
    ctx.lineWidth = 2;
    strokeLine(ctx, 146, 416, 138, 410);
    strokeLine(ctx, 158, 416, 166, 410);
    strokeLine(ctx, 146, 412, 140, 406);
    strokeLine(ctx, 158, 412, 164, 406);
  }

  // Rope coil on the sand.
  if (!A.has('c11')) {
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(255, 482, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(255, 482, 7, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// ---------------------------------------------------------------- scene 3
function paintMarket(ctx, A) {
  skyGradient(ctx, [[0, '#160b2e'], [0.6, '#2c1650'], [1, '#4a2566']]);

  // String lights sagging across the top.
  const s1a = { x: 0, y: 40 };
  const s1b = { x: 280, y: 95 };
  const s1c = { x: 560, y: 45 };
  ctx.strokeStyle = '#0d0d18';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(s1a.x, s1a.y);
  ctx.quadraticCurveTo(s1b.x, s1b.y, s1c.x, s1c.y);
  ctx.stroke();
  const bulbColors = ['#ffd76a', '#ff8fb0', '#7de3ff', '#b6ff9a', '#ffb347', '#c9a6ff'];
  const bulbTs = [0.12, 0.28, 0.44, 0.6, 0.76, 0.9];
  bulbTs.forEach((t, i) => {
    if (t === 0.28 && A.has('m2')) return; // one bulb burnt out
    const p = qbez(s1a, s1b, s1c, t);
    ctx.fillStyle = bulbColors[i % bulbColors.length];
    disc(ctx, p.x, p.y + 8, 5);
  });

  // Bunting flags on a second line.
  const s2a = { x: 0, y: 105 };
  const s2b = { x: 280, y: 140 };
  const s2c = { x: 560, y: 105 };
  ctx.beginPath();
  ctx.moveTo(s2a.x, s2a.y);
  ctx.quadraticCurveTo(s2b.x, s2b.y, s2c.x, s2c.y);
  ctx.stroke();
  const flagColors = ['#ff5d5d', '#ffd76a', '#37d67a', '#4da3ff', '#ff8fb0', '#b6ff9a'];
  const flagTs = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9];
  flagTs.forEach((t, i) => {
    if (t === 0.6 && A.has('m7')) return; // one flag torn away
    const p = qbez(s2a, s2b, s2c, t);
    ctx.fillStyle = flagColors[i % flagColors.length];
    poly(ctx, [[p.x - 8, p.y + 2], [p.x + 8, p.y + 2], [p.x, p.y + 18]]);
  });

  // Ferris wheel, the market's centrepiece.
  ctx.strokeStyle = '#c9ae72';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(430, 220, 105, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(430, 220, 80, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    strokeLine(ctx, 430, 220, 430 + Math.cos(a) * 105, 220 + Math.sin(a) * 105);
  }
  // Cabins around the rim; the top one can change colour.
  const cabinColors = ['#ff5d5d', '#ffd76a', '#37d67a', '#4da3ff'];
  for (let i = 0; i < 8; i += 1) {
    const a = -Math.PI / 2 + (i / 8) * Math.PI * 2;
    const cx = 430 + Math.cos(a) * 105;
    const cy = 220 + Math.sin(a) * 105;
    const isTop = i === 0;
    ctx.fillStyle = isTop && A.has('m1') ? '#4da3ff' : cabinColors[i % cabinColors.length];
    rrPath(ctx, cx - 11, cy - 9, 22, 18, 4);
    ctx.fill();
  }
  // Hub light that can change colour.
  ctx.fillStyle = A.has('m8') ? '#7de3ff' : '#ffd76a';
  disc(ctx, 430, 220, 13);
  ctx.fillStyle = '#8a6742';
  poly(ctx, [[400, 330], [460, 330], [438, 232], [422, 232]]);

  // Balloons tied near the wheel.
  if (!A.has('m6')) {
    ctx.strokeStyle = '#f7efdd';
    ctx.lineWidth = 1;
    strokeLine(ctx, 520, 122, 505, 88);
    strokeLine(ctx, 520, 122, 520, 74);
    strokeLine(ctx, 520, 122, 535, 90);
    ctx.fillStyle = '#ff5d5d';
    disc(ctx, 505, 84, 11);
    ctx.fillStyle = '#ffd76a';
    disc(ctx, 520, 68, 11);
    ctx.fillStyle = '#4da3ff';
    disc(ctx, 535, 86, 11);
  }

  // Stall A — striped awning, sign with a star.
  ctx.fillStyle = '#7a5230';
  ctx.fillRect(60, 380, 120, 40);
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(60, 380, 120, 6);
  for (let i = 0; i < 6; i += 1) {
    const stripe = i % 2 === 0
      ? (A.has('m3') ? '#2ec4b6' : '#d64545')
      : '#f7efdd';
    ctx.fillStyle = stripe;
    ctx.fillRect(55 + i * 22, 295, 22, 30);
  }
  ctx.fillStyle = '#22304a';
  ctx.fillRect(95, 250, 50, 26);
  if (!A.has('m10')) {
    ctx.fillStyle = '#ffd76a';
    poly(ctx, [[120, 254], [122, 260], [129, 260], [124, 264], [126, 271], [120, 267], [114, 271], [116, 264], [111, 260], [118, 260]]);
  }

  // Stall B — the fish counter.
  ctx.fillStyle = '#3a5a3a';
  ctx.fillRect(195, 380, 105, 40);
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#2c6b4f' : '#f7efdd';
    ctx.fillRect(192 + i * 22, 312, 22, 26);
  }
  ctx.fillStyle = '#9fc4d8';
  blob(ctx, 222, 386, 12, 5);
  blob(ctx, 272, 386, 12, 5);
  if (!A.has('m5')) {
    blob(ctx, 248, 388, 13, 5);
    poly(ctx, [[260, 388], [268, 382], [268, 394]]);
  }

  // Stall C — paper lantern hanging over the counter.
  ctx.fillStyle = '#4a2a5a';
  ctx.fillRect(310, 380, 100, 40);
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? '#7a4a8a' : '#f7efdd';
    ctx.fillRect(308 + i * 26, 308, 26, 26);
  }
  if (!A.has('m4')) {
    ctx.fillStyle = 'rgba(255, 93, 93, 0.3)';
    disc(ctx, 350, 300, 22);
    ctx.fillStyle = '#ff5d5d';
    disc(ctx, 350, 300, 14);
    ctx.fillStyle = '#ffd76a';
    disc(ctx, 350, 300, 5);
  }

  // Pier deck and posts.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(0, 430, 560, 70);
  ctx.fillStyle = '#8a6742';
  for (let x = 8; x < 560; x += 20) ctx.fillRect(x, 430, 3, 70);
  ctx.fillStyle = '#54371f';
  for (const x of [60, 180, 300, 420]) ctx.fillRect(x, 498, 12, 30);
  // Pier lamp that can go dark.
  ctx.strokeStyle = '#2a3550';
  ctx.lineWidth = 3;
  strokeLine(ctx, 500, 432, 500, 402);
  if (A.has('m11')) {
    ctx.fillStyle = '#2b3242';
    disc(ctx, 500, 398, 8);
  } else {
    ctx.fillStyle = 'rgba(255, 200, 110, 0.3)';
    disc(ctx, 500, 398, 16);
    ctx.fillStyle = '#ffd76a';
    disc(ctx, 500, 398, 8);
  }
  // Crate on the deck.
  if (!A.has('m9')) {
    ctx.fillStyle = '#a97c46';
    ctx.fillRect(78, 440, 26, 24);
    ctx.strokeStyle = '#6b4a2f';
    ctx.lineWidth = 2;
    ctx.strokeRect(78, 440, 26, 24);
  }

  // Water under the pier and a little boat.
  ctx.fillStyle = '#0d1f33';
  ctx.fillRect(0, 500, 560, 60);
  ctx.strokeStyle = 'rgba(150, 190, 230, 0.3)';
  ctx.lineWidth = 2;
  strokeLine(ctx, 40, 530, 120, 530);
  strokeLine(ctx, 420, 545, 500, 545);
  if (!A.has('m12')) {
    ctx.fillStyle = '#5a3a22';
    poly(ctx, [[275, 522], [325, 522], [315, 536], [285, 536]]);
    ctx.strokeStyle = '#3a2a18';
    ctx.lineWidth = 2;
    strokeLine(ctx, 300, 522, 300, 500);
    ctx.fillStyle = '#f7efdd';
    poly(ctx, [[300, 502], [300, 520], [318, 520]]);
  }
}

// ------------------------------------------------------------------- export
export const SCENES = [
  {
    name: 'Harbour Dusk',
    paint: paintHarbour,
    pool: [
      { id: 'h1', x: 103, y: 155, r: 18 },
      { id: 'h2', x: 272, y: 368, r: 24 },
      { id: 'h3', x: 398, y: 332, r: 16 },
      { id: 'h4', x: 330, y: 495, r: 18 },
      { id: 'h5', x: 300, y: 90, r: 18 },
      { id: 'h6', x: 520, y: 412, r: 16 },
      { id: 'h7', x: 103, y: 118, r: 15 },
      { id: 'h8', x: 452, y: 272, r: 18 },
      { id: 'h9', x: 252, y: 414, r: 18 },
      { id: 'h10', x: 90, y: 60, r: 14 },
      { id: 'h11', x: 478, y: 452, r: 18 },
      { id: 'h12', x: 480, y: 80, r: 22 },
    ],
  },
  {
    name: 'Lighthouse Cove',
    paint: paintCove,
    pool: [
      { id: 'c1', x: 260, y: 175, r: 22 },
      { id: 'c2', x: 411, y: 344, r: 16 },
      { id: 'c3', x: 312, y: 435, r: 18 },
      { id: 'c4', x: 250, y: 50, r: 14 },
      { id: 'c5', x: 202, y: 505, r: 16 },
      { id: 'c6', x: 385, y: 480, r: 16 },
      { id: 'c7', x: 508, y: 238, r: 18 },
      { id: 'c8', x: 360, y: 405, r: 16 },
      { id: 'c9', x: 152, y: 418, r: 16 },
      { id: 'c10', x: 330, y: 352, r: 16 },
      { id: 'c11', x: 255, y: 482, r: 16 },
    ],
  },
  {
    name: 'Night Market Pier',
    paint: paintMarket,
    pool: [
      { id: 'm1', x: 430, y: 115, r: 18 },
      { id: 'm2', x: 157, y: 63, r: 14 },
      { id: 'm3', x: 120, y: 310, r: 20 },
      { id: 'm4', x: 350, y: 300, r: 16 },
      { id: 'm5', x: 250, y: 387, r: 16 },
      { id: 'm6', x: 520, y: 88, r: 18 },
      { id: 'm7', x: 336, y: 122, r: 14 },
      { id: 'm8', x: 430, y: 220, r: 18 },
      { id: 'm9', x: 91, y: 452, r: 18 },
      { id: 'm10', x: 120, y: 263, r: 16 },
      { id: 'm11', x: 500, y: 398, r: 16 },
      { id: 'm12', x: 300, y: 525, r: 20 },
    ],
  },
];
