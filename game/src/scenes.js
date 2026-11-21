// DOUBLE LIGHT — the three pictures, painted as rich illustrations.
// Each scene is ONE base painting (under game/assets/), drawn into the
// panel through a per-scene source rect that lines the painting's own
// landmarks up with the shared difference anchors. The left panel always
// shows the original state; the right panel switches the round's chosen
// difference ids on. Differences are applied with region techniques over
// the same base, so the two panels can never drift apart anywhere else:
//   removal  — a clone-stamp patch sampled from nearby texture of the
//              same painting, feathered at the edges, or an overlay
//              element that is simply not drawn on the changed panel;
//   addition — a sprite whose texture is cropped from the painting
//              itself, pasted at the anchor with a soft shadow;
//   recolour — a tint patch clipped to the object's own shape.
// Anchors live in the 560x560 picture space and are shared by both
// panels; click targets and found markers derive from them alone.

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

// A soft round glow in a painterly colour, fading to nothing.
function glow(ctx, x, y, r, inner) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, inner);
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  disc(ctx, x, y, r);
}

// A tint patch clipped to a shape the caller has just pathed: the
// recolour technique. The caller builds the path, then calls this.
function tintPath(ctx, color, alpha) {
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 560, 560);
  ctx.restore();
}

// ------------------------------------------------------------- the art
// Per-scene framing: [sx, sy, sw, sh] of the 1600x1600 painting is
// stretched over the 560x560 panel. The harbour crop was measured so
// the painted lamp room lands exactly on anchor h1 and the painted
// roof on h7; the other two scenes frame the whole painting.
const ART_DEFS = [
  { key: 'harbour', src: 'assets/scene-harbour.jpg', rect: [265, 102, 1280, 1440], back: '#2a1a44' },
  { key: 'cove', src: 'assets/scene-cove.jpg', rect: [0, 0, 1600, 1600], back: '#0a1a33' },
  { key: 'market', src: 'assets/scene-market.jpg', rect: [0, 0, 1600, 1600], back: '#241145' },
];

const baseCanvases = {};
const sprites = {};

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

// Feathered clone-stamp: copy the base's own texture from (tx+ox,
// ty+oy) over the rect (tx, ty, w, h), with the alpha feathered to zero
// at all four edges so the patch melts into the painting.
function stampPatch(base, tx, ty, w, h, ox, oy) {
  const patch = makeCanvas(w, h);
  const p = patch.getContext('2d');
  p.drawImage(base, tx + ox, ty + oy, w, h, 0, 0, w, h);
  const feather = (horizontal) => {
    const g = horizontal
      ? p.createLinearGradient(0, 0, w, 0)
      : p.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(0, 0, 0, 0)');
    g.addColorStop(0.3, 'rgba(0, 0, 0, 1)');
    g.addColorStop(0.7, 'rgba(0, 0, 0, 1)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    p.globalCompositeOperation = 'destination-in';
    p.fillStyle = g;
    p.fillRect(0, 0, w, h);
    p.globalCompositeOperation = 'source-over';
  };
  feather(true);
  feather(false);
  return patch;
}

// A sprite whose texture is cropped from the scene's own base canvas,
// masked to the shape the caller's path describes.
function cropSprite(base, sx, sy, w, h, pathFn) {
  const c = makeCanvas(w, h);
  const x = c.getContext('2d');
  x.drawImage(base, sx, sy, w, h, 0, 0, w, h);
  x.globalCompositeOperation = 'destination-in';
  x.beginPath();
  pathFn(x, w, h);
  x.fillStyle = '#000';
  x.fill();
  x.globalCompositeOperation = 'source-over';
  return c;
}

// The cove's painted fence starts a little left of anchor c8. The base
// bakes in a repair shared by both panels: the painted leftmost post is
// stamped out with shore texture and the rails are drawn through, so
// the overlay post at the anchor is the one post that can vanish.
function repairCoveFence(x, base) {
  const patch = stampPatch(base, 334, 362, 32, 52, -56, 2);
  x.drawImage(patch, 334, 362);
  x.strokeStyle = '#4a3220';
  x.lineWidth = 4;
  strokeLine(x, 336, 382, 404, 382);
  strokeLine(x, 336, 396, 404, 396);
}

function buildBase(def, img) {
  const c = makeCanvas(560, 560);
  const x = c.getContext('2d');
  x.fillStyle = def.back;
  x.fillRect(0, 0, 560, 560);
  const [sx, sy, sw, sh] = def.rect;
  x.drawImage(img, sx, sy, sw, sh, 0, 0, 560, 560);
  if (def.key === 'cove') repairCoveFence(x, c);
  baseCanvases[def.key] = c;
  if (def.key === 'harbour') {
    // The crate sprite is textured with the pier's own sunlit planks.
    sprites.harbourCrate = cropSprite(c, 352, 450, 26, 24, (p, w, h) => {
      p.rect(0, 0, w, h);
    });
  }
  if (def.key === 'market') {
    // The market crate wears the deck's own boards, cut from a spot
    // the stall glow warms.
    sprites.marketCrate = cropSprite(c, 292, 442, 26, 24, (p, w, h) => {
      p.rect(0, 0, w, h);
    });
  }
  if (def.key === 'cove') {
    // The loose rock is a chip of the cove's own cliff-base stone.
    sprites.coveRock = cropSprite(c, 118, 392, 44, 18, (p, w, h) => {
      p.ellipse(w / 2, h / 2, w / 2 - 1, h / 2 - 1, 0, 0, Math.PI * 2);
    });
  }
}

function loadOne(def) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      buildBase(def, img);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = def.src;
  });
}

// Resolves once every painting is in (or has failed, in which case the
// scene falls back to its flat backdrop colour and the overlays).
export const ART_READY = Promise.all(ART_DEFS.map(loadOne));

function paintBase(ctx, key, back) {
  const c = baseCanvases[key];
  if (c) {
    ctx.drawImage(c, 0, 0);
  } else {
    ctx.fillStyle = back;
    ctx.fillRect(0, 0, 560, 560);
  }
}

// The title screen's backdrop: scene one's painting, cover-fit across
// the whole stage with its harbour band centred.
export function paintTitleBackdrop(ctx) {
  const c = baseCanvases.harbour;
  ctx.fillStyle = '#141d31';
  ctx.fillRect(0, 0, 1280, 720);
  if (c) ctx.drawImage(c, 0, 84, 560, 315, 0, 0, 1280, 720);
  const g = ctx.createLinearGradient(0, 0, 0, 720);
  g.addColorStop(0, 'rgba(6, 10, 20, 0.18)');
  g.addColorStop(1, 'rgba(6, 10, 20, 0.52)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1280, 720);
}

// ------------------------------------------------------------- harbour
// The painting carries the dusk sky, the sun, the sea, the lighthouse
// tower, the cottages and the pier. Everything that can change is an
// overlay at its anchor: the lamp's light, the flag, one cottage
// window, the sailboat, the buoy, a gull, the smoke, a star, a cloud,
// the pier lamp and a crate textured with the pier's own planks.
function paintHarbour(ctx, A) {
  paintBase(ctx, 'harbour', '#2a1a44');

  // h12 — a soft cloud that can clear away (left panel only).
  if (!A.has('h12')) {
    ctx.fillStyle = 'rgba(255, 214, 190, 0.5)';
    blob(ctx, 480, 80, 52, 13);
    blob(ctx, 505, 72, 28, 9);
    blob(ctx, 452, 84, 26, 8);
  }

  // h10 — one bright star that can wink out (left panel only).
  if (!A.has('h10')) {
    glow(ctx, 90, 60, 9, 'rgba(255, 255, 255, 0.55)');
    ctx.fillStyle = '#ffffff';
    disc(ctx, 90, 60, 2.5);
  }

  // Gulls over the bay; h5 is the one that can fly away.
  ctx.strokeStyle = '#2a2438';
  ctx.lineWidth = 2;
  const gull = (x, y) => {
    ctx.beginPath();
    ctx.moveTo(x - 9, y);
    ctx.quadraticCurveTo(x - 3, y - 6, x, y);
    ctx.quadraticCurveTo(x + 3, y - 6, x + 9, y);
    ctx.stroke();
  };
  gull(340, 70);
  gull(255, 120);
  if (!A.has('h5')) gull(300, 90);

  // h1 — the lighthouse lamp: lit on the left, dark glass on the right.
  // The crop puts the painted lamp room exactly here, so the lit state
  // is a glow and a bright core over the painting's own glass.
  if (!A.has('h1')) {
    glow(ctx, 103, 155, 30, 'rgba(255, 233, 163, 0.5)');
    ctx.fillStyle = '#ffe9a3';
    disc(ctx, 103, 155, 10);
    ctx.fillStyle = '#fff7d6';
    disc(ctx, 103, 155, 5);
  }

  // h7 — the flag on the lighthouse roof flips side.
  ctx.strokeStyle = '#2a3550';
  ctx.lineWidth = 2;
  strokeLine(ctx, 102, 141, 102, 102);
  ctx.fillStyle = '#ffd76a';
  if (A.has('h7')) poly(ctx, [[102, 104], [78, 110], [102, 116]]);
  else poly(ctx, [[102, 104], [126, 110], [102, 116]]);

  // h3 — the first cottage's window: lit on the left, dark on the
  // right. The frame is wide enough to cover the painted window, which
  // the crop parks just left of the anchor.
  rrPath(ctx, 366, 323, 44, 20, 2);
  if (A.has('h3')) {
    ctx.fillStyle = '#232838';
    ctx.fill();
  } else {
    const wg = ctx.createLinearGradient(0, 323, 0, 343);
    wg.addColorStop(0, '#ffe9a3');
    wg.addColorStop(1, '#f0a832');
    ctx.fillStyle = wg;
    ctx.fill();
    glow(ctx, 388, 333, 24, 'rgba(255, 200, 110, 0.35)');
  }
  rrPath(ctx, 366, 323, 44, 20, 2);
  ctx.strokeStyle = 'rgba(40, 30, 18, 0.8)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // h8 — chimney smoke that can clear away (left panel only). The
  // crop parks the middle cottage's chimney at (466, 293).
  if (!A.has('h8')) {
    ctx.fillStyle = 'rgba(232, 226, 216, 0.65)';
    disc(ctx, 465, 285, 7);
    disc(ctx, 460, 268, 9);
    disc(ctx, 468, 252, 10);
    disc(ctx, 460, 236, 8);
  }

  // The sailboat rides the glitter path in both panels. h2 tints its
  // sail teal through a patch clipped to the sail's own shape; h9
  // tints the hull stripe red the same way.
  ctx.fillStyle = 'rgba(20, 40, 55, 0.35)';
  blob(ctx, 254, 428, 42, 5);
  const hullGrad = ctx.createLinearGradient(0, 405, 0, 425);
  hullGrad.addColorStop(0, '#7a5230');
  hullGrad.addColorStop(1, '#4a2e18');
  ctx.fillStyle = hullGrad;
  poly(ctx, [[215, 405], [290, 405], [278, 425], [228, 425]]);
  ctx.beginPath();
  ctx.rect(228, 411, 50, 5);
  ctx.fillStyle = '#ffd76a';
  ctx.fill();
  if (A.has('h9')) tintPath(ctx, '#b03030', 0.85);
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 3;
  strokeLine(ctx, 252, 405, 252, 338);
  const sailGrad = ctx.createLinearGradient(252, 344, 296, 396);
  sailGrad.addColorStop(0, '#fffaf0');
  sailGrad.addColorStop(1, '#e8dcc2');
  ctx.beginPath();
  ctx.moveTo(252, 344);
  ctx.lineTo(252, 396);
  ctx.lineTo(296, 396);
  ctx.closePath();
  ctx.fillStyle = sailGrad;
  ctx.fill();
  if (A.has('h2')) tintPath(ctx, '#2ec4b6', 0.8);

  // h4 — a buoy bobbing in the water (left panel only).
  if (!A.has('h4')) {
    ctx.strokeStyle = 'rgba(200, 225, 240, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(330, 503, 18, 4, 0, 0, Math.PI * 2);
    ctx.stroke();
    const bg = ctx.createLinearGradient(0, 484, 0, 506);
    bg.addColorStop(0, '#f08a5c');
    bg.addColorStop(1, '#c4502e');
    ctx.fillStyle = bg;
    disc(ctx, 330, 495, 12);
    ctx.strokeStyle = '#e8734a';
    ctx.lineWidth = 3;
    strokeLine(ctx, 330, 484, 330, 472);
    ctx.fillStyle = '#ffd76a';
    disc(ctx, 330, 480, 4);
  }

  // h6 — the pier lamp: green on the left, red on the right, drawn as
  // a green lamp with a red tint patch over its glass when switched;
  // the halo follows the lamp's colour either way.
  ctx.strokeStyle = '#2a3550';
  ctx.lineWidth = 3;
  strokeLine(ctx, 520, 470, 520, 404);
  if (A.has('h6')) {
    glow(ctx, 520, 410, 17, 'rgba(255, 93, 93, 0.35)');
    ctx.fillStyle = '#7dff9a';
    disc(ctx, 520, 410, 8);
    ctx.beginPath();
    ctx.arc(520, 410, 9, 0, Math.PI * 2);
    tintPath(ctx, '#ff5d5d', 0.9);
  } else {
    glow(ctx, 520, 410, 17, 'rgba(125, 255, 154, 0.35)');
    ctx.fillStyle = '#7dff9a';
    disc(ctx, 520, 410, 8);
  }

  // h11 — a crate on the pier (left panel only): a sprite textured
  // with the pier's own planks, pasted with a soft shadow and frame.
  if (!A.has('h11')) {
    ctx.fillStyle = 'rgba(10, 16, 24, 0.35)';
    blob(ctx, 480, 468, 20, 4);
    const spr = sprites.harbourCrate;
    if (spr) ctx.drawImage(spr, 465, 440);
    ctx.strokeStyle = '#6b4a2f';
    ctx.lineWidth = 2;
    ctx.strokeRect(465, 440, 26, 24);
    strokeLine(ctx, 465, 440, 491, 464);
    strokeLine(ctx, 491, 440, 465, 464);
  }
}

// --------------------------------------------------------------- cove
// The painting carries the moon, the cliff, the lighthouse, the
// cottage and the fence (with its leftmost post already repaired away
// in the base, so the overlay post at c8 is the one that can vanish).
// The beam, the cottage window, the boat, the crab and the small shore
// props are overlays at their anchors.
function paintCove(ctx, A) {
  paintBase(ctx, 'cove', '#0a1a33');

  // c4 — one bright star that can wink out (left panel only).
  if (!A.has('c4')) {
    glow(ctx, 250, 50, 9, 'rgba(255, 255, 255, 0.55)');
    ctx.fillStyle = '#ffffff';
    disc(ctx, 250, 50, 2.5);
  }

  // c1 — the beam sweeps right, or, when switched, left. It leaves
  // from the painted lamp room, which the framing parks at (131, 66),
  // and the right sweep's cone widens enough to pass through the
  // shared anchor at (260, 175).
  ctx.fillStyle = 'rgba(255, 233, 163, 0.16)';
  if (A.has('c1')) poly(ctx, [[128, 52], [0, 80], [0, 345]]);
  else poly(ctx, [[132, 52], [430, 80], [430, 345]]);
  ctx.fillStyle = 'rgba(255, 233, 163, 0.10)';
  if (A.has('c1')) poly(ctx, [[128, 56], [0, 130], [0, 270]]);
  else poly(ctx, [[132, 56], [430, 130], [430, 270]]);

  // c2 — the cottage's left window: lit on the left, dark on the
  // right, framed on the painted cottage's own left wall.
  rrPath(ctx, 406, 335, 18, 18, 2);
  if (A.has('c2')) {
    ctx.fillStyle = '#22283a';
    ctx.fill();
  } else {
    const wg = ctx.createLinearGradient(0, 335, 0, 353);
    wg.addColorStop(0, '#ffe9a3');
    wg.addColorStop(1, '#f0a832');
    ctx.fillStyle = wg;
    ctx.fill();
    glow(ctx, 415, 344, 22, 'rgba(255, 200, 110, 0.32)');
  }
  rrPath(ctx, 406, 335, 18, 18, 2);
  ctx.strokeStyle = 'rgba(30, 22, 14, 0.85)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // c7 — chimney smoke that can clear away (left panel only). The
  // framing parks the cottage chimney at (509, 280).
  if (!A.has('c7')) {
    ctx.fillStyle = 'rgba(220, 220, 225, 0.6)';
    disc(ctx, 506, 258, 7);
    disc(ctx, 513, 242, 9);
    disc(ctx, 506, 226, 8);
  }

  // c8 — the fence post at the anchor (left panel only). The base
  // already repaired the painted post away and drew the rails
  // through, so the fence simply gains a gap here when switched.
  if (!A.has('c8')) {
    const pg = ctx.createLinearGradient(357, 0, 364, 0);
    pg.addColorStop(0, '#5a4030');
    pg.addColorStop(0.5, '#7a5a3a');
    pg.addColorStop(1, '#4a3220');
    ctx.fillStyle = pg;
    ctx.fillRect(357, 371, 7, 47);
    ctx.fillStyle = '#6b4a2f';
    ctx.fillRect(356, 369, 9, 5);
  }

  // c10 — the lantern post at the shore: lit on the left, dark on
  // the right.
  ctx.strokeStyle = '#2a3550';
  ctx.lineWidth = 3;
  strokeLine(ctx, 330, 400, 330, 344);
  if (A.has('c10')) {
    ctx.fillStyle = '#2b3242';
    ctx.fillRect(322, 330, 16, 22);
  } else {
    glow(ctx, 330, 341, 20, 'rgba(255, 200, 110, 0.4)');
    ctx.fillStyle = '#ffb347';
    ctx.fillRect(322, 330, 16, 22);
    ctx.fillStyle = '#ffe9a3';
    ctx.fillRect(326, 334, 8, 14);
  }
  ctx.strokeStyle = 'rgba(16, 20, 30, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(322, 330, 16, 22);

  // The rowboat rides the shallows in both panels; c3 is its oar,
  // which can be lost (left panel only).
  ctx.fillStyle = 'rgba(12, 24, 40, 0.35)';
  blob(ctx, 283, 465, 38, 4);
  const boatGrad = ctx.createLinearGradient(0, 445, 0, 462);
  boatGrad.addColorStop(0, '#8a5a30');
  boatGrad.addColorStop(1, '#5a3418');
  ctx.fillStyle = boatGrad;
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

  // c11 — a rope coil on a mooring post (coil on the left only).
  ctx.fillStyle = '#3a2a18';
  ctx.fillRect(251, 464, 8, 30);
  ctx.fillStyle = '#54371f';
  ctx.fillRect(250, 462, 10, 5);
  if (!A.has('c11')) {
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(255, 480, 11, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(255, 480, 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  // c5 — a loose rock in the shallows (left panel only): a sprite
  // chipped from the painting's own cliff-base stone.
  if (!A.has('c5')) {
    ctx.fillStyle = 'rgba(10, 18, 30, 0.3)';
    blob(ctx, 203, 512, 22, 4);
    const rock = sprites.coveRock;
    if (rock) ctx.drawImage(rock, 180, 496);
    else {
      ctx.fillStyle = '#16233c';
      blob(ctx, 202, 505, 20, 8);
    }
  }

  // c9 — a crab on its shore rock: the rock is dressing in both
  // panels, the crab itself can vanish.
  ctx.fillStyle = '#141f33';
  blob(ctx, 152, 422, 26, 9);
  ctx.fillStyle = 'rgba(190, 215, 240, 0.18)';
  blob(ctx, 146, 418, 14, 4);
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

  // c6 — the buoy: its light burns amber on the left, red on the
  // right, a tint patch over the lamp's own disc; the halo follows.
  ctx.fillStyle = 'rgba(160, 190, 225, 0.25)';
  blob(ctx, 385, 494, 15, 3);
  ctx.fillStyle = '#c94f3d';
  disc(ctx, 385, 488, 10);
  if (A.has('c6')) {
    glow(ctx, 385, 474, 11, 'rgba(255, 93, 93, 0.5)');
    ctx.fillStyle = '#ffb347';
    disc(ctx, 385, 474, 5);
    ctx.beginPath();
    ctx.arc(385, 474, 6, 0, Math.PI * 2);
    tintPath(ctx, '#ff5d5d', 0.9);
  } else {
    glow(ctx, 385, 474, 11, 'rgba(255, 179, 71, 0.5)');
    ctx.fillStyle = '#ffb347';
    disc(ctx, 385, 474, 5);
  }
}

// ------------------------------------------------------------- market
// The painting carries the violet sky, the string lights, the three
// tall stalls, the pier deck and the water. Every difference is an
// overlay at its anchor: two of the painted bulbs, a garland under
// the first stall's awning, a lantern in the second stall, a basket
// on its counter, balloons, a pennant on the wire, a patch on the
// third stall's awning, a crate, a star on a sign, the pier lamp and
// a little boat.
function paintMarket(ctx, A) {
  paintBase(ctx, 'market', '#241145');

  // m2 — a bulb on the top wire that can burn out. The framing parks
  // a painted wire arc just above the anchor, so the overlay bulb
  // hangs from it on a short cord: lit on the left, dark on the
  // right.
  ctx.strokeStyle = '#0d0d18';
  ctx.lineWidth = 1.5;
  strokeLine(ctx, 150, 47, 157, 58);
  if (A.has('m2')) {
    ctx.fillStyle = '#2b3242';
    disc(ctx, 157, 66, 5);
  } else {
    glow(ctx, 157, 66, 13, 'rgba(255, 190, 90, 0.55)');
    ctx.fillStyle = '#ffd76a';
    disc(ctx, 157, 66, 5);
  }

  // m1 — one of the painted string bulbs changes colour: warm amber
  // on the left, cool cyan on the right, as glow and core laid over
  // the painting's own bulb at (434, 104).
  if (A.has('m1')) {
    glow(ctx, 434, 104, 17, 'rgba(125, 227, 255, 0.55)');
    ctx.fillStyle = '#aee9ff';
    disc(ctx, 434, 104, 5);
  } else {
    glow(ctx, 434, 104, 17, 'rgba(255, 190, 90, 0.5)');
    ctx.fillStyle = '#ffd76a';
    disc(ctx, 434, 104, 5);
  }

  // m7 — a pennant on the bulb wire that can be torn away (left
  // panel only). The framing parks the wire itself at the anchor.
  if (!A.has('m7')) {
    ctx.fillStyle = '#37d67a';
    poly(ctx, [[328, 117], [344, 117], [336, 136]]);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    poly(ctx, [[336, 117], [344, 117], [336, 136]]);
  }

  // m6 — balloons tied to the top wire (left panel only).
  if (!A.has('m6')) {
    ctx.strokeStyle = 'rgba(247, 239, 221, 0.75)';
    ctx.lineWidth = 1;
    strokeLine(ctx, 520, 122, 505, 92);
    strokeLine(ctx, 520, 122, 520, 78);
    strokeLine(ctx, 520, 122, 535, 94);
    const balloon = (x, y, color) => {
      ctx.fillStyle = color;
      disc(ctx, x, y, 11);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      disc(ctx, x - 4, y - 4, 3.5);
    };
    balloon(505, 84, '#ff5d5d');
    balloon(520, 68, '#ffd76a');
    balloon(535, 86, '#4da3ff');
  }

  // m10 — the sign over the first stall: a plain board in both
  // panels, its gold star can vanish.
  ctx.fillStyle = '#22304a';
  ctx.fillRect(95, 250, 50, 26);
  ctx.strokeStyle = '#101828';
  ctx.lineWidth = 2;
  ctx.strokeRect(95, 250, 50, 26);
  if (!A.has('m10')) {
    ctx.fillStyle = '#ffd76a';
    poly(ctx, [[120, 254], [122, 260], [129, 260], [124, 264], [126, 271], [120, 267], [114, 271], [116, 264], [111, 260], [118, 260]]);
  }

  // m3 — a garland swag under the first stall's awning (left panel
  // only): a sagging cord and five little pennants.
  if (!A.has('m3')) {
    ctx.strokeStyle = '#0d0d18';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(62, 302);
    ctx.quadraticCurveTo(120, 320, 178, 302);
    ctx.stroke();
    const swag = [[74, 307], [97, 312], [120, 314], [143, 312], [166, 307]];
    const swagColors = ['#ff5d5d', '#ffd76a', '#37d67a', '#4da3ff', '#ff8fb0'];
    swag.forEach(([x, y], i) => {
      ctx.fillStyle = swagColors[i];
      poly(ctx, [[x - 6, y], [x + 6, y], [x, y + 12]]);
    });
  }

  // m4 — a paper lantern glowing inside the second stall (left
  // panel only), hanging from its awning's edge.
  if (!A.has('m4')) {
    ctx.strokeStyle = '#0d0d18';
    ctx.lineWidth = 1.5;
    strokeLine(ctx, 350, 296, 350, 300);
    glow(ctx, 350, 308, 22, 'rgba(255, 93, 93, 0.4)');
    ctx.fillStyle = '#ff5d5d';
    disc(ctx, 350, 308, 13);
    ctx.fillStyle = '#ff8a7a';
    disc(ctx, 350, 308, 9);
    ctx.fillStyle = '#ffd76a';
    disc(ctx, 350, 308, 4);
  }

  // m8 — a sewn patch on the third stall's awning (left panel
  // only): cream cloth with a dashed stitch, turned a few degrees.
  if (!A.has('m8')) {
    ctx.save();
    ctx.translate(430, 219);
    ctx.rotate(-0.06);
    ctx.fillStyle = 'rgba(243, 229, 195, 0.95)';
    ctx.fillRect(-14, -13, 28, 26);
    ctx.strokeStyle = '#b4503c';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);
    ctx.strokeRect(-11, -10, 22, 20);
    ctx.setLineDash([]);
    ctx.restore();
  }

  // m5 — a woven basket hanging on the second stall's counter
  // front (left panel only).
  if (!A.has('m5')) {
    ctx.fillStyle = 'rgba(10, 8, 16, 0.3)';
    blob(ctx, 250, 402, 20, 3);
    const basketGrad = ctx.createLinearGradient(0, 374, 0, 400);
    basketGrad.addColorStop(0, '#c9a86a');
    basketGrad.addColorStop(1, '#8a6a3a');
    ctx.fillStyle = basketGrad;
    poly(ctx, [[232, 374], [268, 374], [262, 400], [238, 400]]);
    ctx.strokeStyle = 'rgba(90, 64, 32, 0.7)';
    ctx.lineWidth = 1.5;
    strokeLine(ctx, 235, 383, 265, 383);
    strokeLine(ctx, 237, 392, 263, 392);
    ctx.fillStyle = '#a97c46';
    ctx.fillRect(230, 371, 40, 6);
  }

  // m11 — the pier lamp in front of the third stall: lit on the
  // left, dark on the right.
  ctx.strokeStyle = '#2a3550';
  ctx.lineWidth = 3;
  strokeLine(ctx, 500, 432, 500, 402);
  if (A.has('m11')) {
    ctx.fillStyle = '#2b3242';
    disc(ctx, 500, 398, 8);
  } else {
    glow(ctx, 500, 398, 17, 'rgba(255, 200, 110, 0.45)');
    ctx.fillStyle = '#ffd76a';
    disc(ctx, 500, 398, 8);
  }

  // m9 — a crate on the deck (left panel only): a sprite textured
  // with the deck's own boards, pasted with a soft shadow.
  if (!A.has('m9')) {
    ctx.fillStyle = 'rgba(8, 8, 18, 0.35)';
    blob(ctx, 92, 466, 19, 4);
    const spr = sprites.marketCrate;
    if (spr) ctx.drawImage(spr, 77, 439);
    ctx.strokeStyle = '#6b4a2f';
    ctx.lineWidth = 2;
    ctx.strokeRect(78, 440, 26, 24);
    strokeLine(ctx, 78, 440, 104, 464);
  }

  // m12 — a little boat on the water under the pier (left only).
  if (!A.has('m12')) {
    ctx.fillStyle = 'rgba(16, 28, 48, 0.4)';
    blob(ctx, 300, 540, 30, 3);
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
