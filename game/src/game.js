// DOUBLE LIGHT — the campaign state machine.
// One Game owns a plain `state` object (the probe surface: window.__game
// exposes it directly) and the rules: deal a round from a seed, score
// finds with a streak bonus, punish wrong clicks, spend hints, and move
// between title / play / clear / over / victory / paused.
import {
  BEST_KEY,
  FIND_BASE,
  STREAK_STEP,
  WRONG_PENALTY_SECONDS,
  HINT_COST,
  HINTS_PER_ROUND,
  ROUNDS,
  TIME_BONUS_PER_SECOND,
} from './config.js';
import { mulberry32, pick } from './random.js';
import { SCENES } from './scenes.js';
import { Sfx } from './audio.js';

export class Game {
  constructor() {
    this.seed = 7;
    this.sfx = new Sfx();
    this.animTime = 0;
    this.best = 0;
    this.state = {
      screen: 'title',
      roundIndex: 0,
      sceneIndex: 0,
      diffs: [],
      foundCount: 0,
      score: 0,
      streak: 0,
      bestStreak: 0,
      mistakes: 0,
      hintsLeft: HINTS_PER_ROUND,
      hintsUsed: 0,
      timeLeft: ROUNDS[0].time,
      timeTotal: ROUNDS[0].time,
      elapsed: 0,
      message: 'Find every difference between the two pictures.',
      messageTime: 0,
      lastFind: null,
      findPulse: 0,
      hintDiff: null,
      hintPulse: 0,
      wrongMark: null,
      wrongTime: 0,
      roundScore: 0,
      tickSecond: -1,
      totalFound: 0,
    };
  }

  loadBest() {
    try {
      this.best = Number(window.localStorage.getItem(BEST_KEY) || 0) || 0;
    } catch {
      this.best = 0;
    }
  }

  saveBest() {
    if (this.state.score <= this.best) return;
    this.best = this.state.score;
    try {
      window.localStorage.setItem(BEST_KEY, String(this.best));
    } catch {
      // Best score is a nicety; a blocked store must not break the game.
    }
  }

  say(text, seconds = 2.6) {
    this.state.message = text;
    this.state.messageTime = seconds;
  }

  // Deal round `index`: pick its differences from the scene's pool with
  // a seed that mixes the campaign seed and the round number.
  dealRound(index) {
    const s = this.state;
    const plan = ROUNDS[index];
    s.roundIndex = index;
    s.sceneIndex = index % SCENES.length;
    const rand = mulberry32((this.seed + index * 7919) >>> 0);
    const chosen = pick(SCENES[s.sceneIndex].pool, plan.diffs, rand);
    s.diffs = chosen.map((d) => ({ id: d.id, x: d.x, y: d.y, r: d.r, found: false }));
    s.foundCount = 0;
    s.hintsLeft = HINTS_PER_ROUND;
    s.timeLeft = plan.time;
    s.timeTotal = plan.time;
    s.elapsed = 0;
    s.roundScore = 0;
    s.tickSecond = -1;
    s.hintDiff = null;
    s.hintPulse = 0;
    s.wrongMark = null;
    s.wrongTime = 0;
    s.lastFind = null;
    s.findPulse = 0;
    this.say(`Find ${plan.diffs} differences — ${SCENES[s.sceneIndex].name}.`);
  }

  startCampaign() {
    const s = this.state;
    s.score = 0;
    s.streak = 0;
    s.bestStreak = 0;
    s.mistakes = 0;
    s.hintsUsed = 0;
    s.totalFound = 0;
    this.dealRound(0);
    s.screen = 'play';
    this.sfx.click();
  }

  nextRound() {
    const s = this.state;
    if (s.roundIndex >= ROUNDS.length - 1) {
      s.screen = 'victory';
      this.saveBest();
      this.sfx.clear();
      this.say('You found them all — a perfect hunt!');
      return;
    }
    this.dealRound(s.roundIndex + 1);
    s.screen = 'play';
    this.sfx.click();
  }

  // A click inside a picture, in that picture's own 560x560 space.
  clickPanel(sx, sy) {
    const s = this.state;
    if (s.screen !== 'play') return;
    let best = null;
    let bestDist = Infinity;
    for (const d of s.diffs) {
      if (d.found) continue;
      const dist = Math.hypot(d.x - sx, d.y - sy);
      if (dist <= d.r && dist < bestDist) {
        best = d;
        bestDist = dist;
      }
    }
    if (best) {
      this.onFind(best);
      return;
    }
    // Clicking a difference already found is a free re-look, not a miss.
    for (const d of s.diffs) {
      if (d.found && Math.hypot(d.x - sx, d.y - sy) <= d.r) return;
    }
    this.onWrong(sx, sy);
  }

  onFind(d) {
    const s = this.state;
    d.found = true;
    s.foundCount += 1;
    s.totalFound += 1;
    s.streak += 1;
    if (s.streak > s.bestStreak) s.bestStreak = s.streak;
    const points = FIND_BASE + (s.streak - 1) * STREAK_STEP;
    s.score += points;
    s.roundScore += points;
    s.lastFind = d;
    s.findPulse = 1;
    this.say(`Found +${points} · streak x${s.streak}`);
    this.sfx.find(s.streak);
    if (s.hintDiff && s.hintDiff.id === d.id) {
      s.hintDiff = null;
      s.hintPulse = 0;
    }
    if (s.foundCount >= s.diffs.length) this.clearRound();
  }

  clearRound() {
    const s = this.state;
    const bonus = Math.ceil(s.timeLeft) * TIME_BONUS_PER_SECOND;
    s.score += bonus;
    s.roundScore += bonus;
    s.screen = 'clear';
    this.say(`Round clear! +${bonus} time bonus`);
    this.sfx.clear();
  }

  onWrong(sx, sy) {
    const s = this.state;
    s.mistakes += 1;
    s.streak = 0;
    s.timeLeft = Math.max(0, s.timeLeft - WRONG_PENALTY_SECONDS);
    s.wrongMark = { x: sx, y: sy };
    s.wrongTime = 0.9;
    this.say(`Not a difference −${WRONG_PENALTY_SECONDS}s`);
    this.sfx.wrong();
    if (s.timeLeft <= 0) this.gameOver();
  }

  useHint() {
    const s = this.state;
    if (s.screen !== 'play' || s.hintsLeft <= 0) return false;
    const target = s.diffs.find((d) => !d.found);
    if (!target) return false;
    s.hintsLeft -= 1;
    s.hintsUsed += 1;
    s.score = Math.max(0, s.score - HINT_COST);
    s.hintDiff = target;
    s.hintPulse = 1;
    this.say('Hint spent −150');
    this.sfx.hint();
    return true;
  }

  gameOver() {
    const s = this.state;
    s.timeLeft = 0;
    s.screen = 'over';
    this.saveBest();
    this.say("Time's up!");
    this.sfx.over();
  }

  togglePause() {
    const s = this.state;
    if (s.screen === 'play') {
      s.screen = 'paused';
      this.sfx.click();
    } else if (s.screen === 'paused') {
      s.screen = 'play';
      this.sfx.click();
    }
  }

  resume() {
    if (this.state.screen === 'paused') {
      this.state.screen = 'play';
      this.sfx.click();
    }
  }

  toggleMute() {
    this.sfx.setMuted(!this.sfx.muted);
    this.say(this.sfx.muted ? 'Sound off (M to turn back on)' : 'Sound on');
  }

  // The primary button / Enter / Space for the current screen.
  primaryAction() {
    const s = this.state;
    if (s.screen === 'title' || s.screen === 'over' || s.screen === 'victory') {
      this.startCampaign();
    } else if (s.screen === 'clear') {
      this.nextRound();
    } else if (s.screen === 'paused') {
      this.resume();
    }
  }

  // Fixed-step update, called with dt = 1/60.
  update(dt) {
    const s = this.state;
    this.animTime += dt;
    if (s.findPulse > 0) s.findPulse = Math.max(0, s.findPulse - dt * 1.4);
    if (s.hintPulse > 0) s.hintPulse = Math.max(0, s.hintPulse - dt * 0.5);
    if (s.wrongTime > 0) s.wrongTime = Math.max(0, s.wrongTime - dt);
    if (s.messageTime > 0) s.messageTime = Math.max(0, s.messageTime - dt);
    if (s.screen !== 'play') return;
    s.timeLeft -= dt;
    s.elapsed += dt;
    if (s.timeLeft <= 10 && s.timeLeft > 0) {
      const whole = Math.ceil(s.timeLeft);
      if (whole !== s.tickSecond) {
        s.tickSecond = whole;
        this.sfx.tick();
      }
    }
    if (s.timeLeft <= 0) this.gameOver();
  }
}
