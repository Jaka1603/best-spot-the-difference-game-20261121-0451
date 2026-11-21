// DOUBLE LIGHT — boot and the fixed-step loop.
// The game runs on a 1/60s step no matter how fast the display refreshes,
// so the clock and the pulses behave the same on every machine.
// URL parameters: ?seed=N picks the round deals; ?shot=title|play|play2|
// clear poses a deterministic state for screenshots and sets
// window.__shotReady once the stage has been painted twice.
import { Game } from './game.js';
import { drawGame } from './render.js';
import { attachInput } from './input.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = new Game();
const params = new URLSearchParams(window.location.search);
// No ?seed= at all keeps the game's own default seed; only a finite
// number in the URL replaces it (Number(null) would silently give 0).
const seedText = params.get('seed');
const seedParam = seedText === null ? NaN : Number(seedText);
game.seed = Number.isFinite(seedParam) ? seedParam : 7;
game.loadBest();

// Round one is dealt up front so the title screen already shows a real
// pair of pictures behind its card.
game.dealRound(0);
game.state.screen = 'title';

const shot = params.get('shot');
if (shot) applyShot(game, shot);

// Probe surface for the automated playthrough.
window.__game = { state: game.state, game };

const draw = () => drawGame(ctx, game);
attachInput(canvas, game, draw);

// Fixed-step loop: accumulate real time, step the game in 1/60s slices.
const STEP = 1 / 60;
let last = performance.now();
let acc = 0;
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  acc += dt;
  while (acc >= STEP) {
    game.update(STEP);
    acc -= STEP;
  }
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Screenshot staging: paint the posed state twice, then signal readiness.
if (shot) {
  draw();
  draw();
  window.__shotReady = true;
}
