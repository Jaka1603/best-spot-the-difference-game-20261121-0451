// DOUBLE LIGHT — one place for every number the screens agree on.
// The canvas is a fixed 1280x720 stage: an 88px HUD on top, two 560x560
// picture panels below it, and a one-line message strip at the bottom.
// Button rectangles here are part of the game's contract with its tests:
// they are never moved, only restyled.
export const VIEW = { width: 1280, height: 720 };

export const PANEL = {
  size: 560,
  y: 104,
  leftX: 40,
  rightX: 680,
};

export const MAT = { x: 24, y: 92, width: 1232, height: 584 };

export const TIMER_BAR = { x: 470, y: 56, width: 340, height: 12 };

export const HINT_PILL = { x: 1090, y: 12, width: 150, height: 38 };

export const BUTTONS = {
  start: { x: 520, y: 420, width: 240, height: 54, label: 'START HUNTING' },
  next: { x: 530, y: 396, width: 220, height: 52, label: 'NEXT ROUND' },
  result: { x: 530, y: 396, width: 220, height: 52, label: 'SEE THE RESULT' },
  retry: { x: 540, y: 388, width: 200, height: 52, label: 'TRY AGAIN' },
  again: { x: 540, y: 388, width: 200, height: 52, label: 'PLAY AGAIN' },
  resume: { x: 550, y: 384, width: 180, height: 50, label: 'RESUME' },
};

// Six rounds: the scene cycles 0, 1, 2, 0, 1, 2 while the hunt gets
// busier and the clock stays generous.
export const ROUNDS = [
  { diffs: 5, time: 90 },
  { diffs: 6, time: 95 },
  { diffs: 7, time: 100 },
  { diffs: 8, time: 95 },
  { diffs: 9, time: 100 },
  { diffs: 10, time: 105 },
];

export const BEST_KEY = 'double-light.best';

export const FIND_BASE = 100;
export const STREAK_STEP = 15;
export const WRONG_PENALTY_SECONDS = 5;
export const HINT_COST = 150;
export const HINTS_PER_ROUND = 3;
export const TIME_BONUS_PER_SECOND = 5;

export const COLORS = {
  page: '#0b1220',
  mat: '#f3e5c3',
  matEdge: '#c9ae72',
  ink: '#1c2436',
  gold: '#ffd76a',
  cream: '#f7efdd',
  muted: '#9aa7bd',
  green: '#37d67a',
  red: '#ff5d5d',
  blue: '#4da3ff',
  panelEdge: '#2a3550',
};
