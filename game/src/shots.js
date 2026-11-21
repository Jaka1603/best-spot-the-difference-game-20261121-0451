// DOUBLE LIGHT — staged states for the four screenshots.
// Each shot deals a real round from the URL seed and then poses the
// campaign mid-flight, so every screenshot is the game itself, not a
// mock-up. The names are the ?shot= values.

// Mark the first `count` dealt differences as found, in deal order.
function markFound(game, count) {
  const s = game.state;
  let n = 0;
  for (const d of s.diffs) {
    if (n >= count) break;
    d.found = true;
    n += 1;
  }
  s.foundCount = n;
  s.totalFound = n;
}

export function applyShot(game, kind) {
  const s = game.state;
  if (kind === 'title') {
    game.dealRound(0);
    s.screen = 'title';
    return;
  }
  if (kind === 'play') {
    game.dealRound(1);
    markFound(game, 3);
    s.screen = 'play';
    s.score = 345;
    s.roundScore = 345;
    s.streak = 3;
    s.bestStreak = 3;
    s.timeLeft = 57;
    s.timeTotal = 95;
    s.elapsed = 38;
    s.lastFind = s.diffs[2];
    s.findPulse = 1;
    s.message = 'Found +130 · streak x3';
    s.messageTime = 2.6;
    return;
  }
  if (kind === 'play2') {
    game.dealRound(4);
    markFound(game, 5);
    s.screen = 'play';
    s.score = 1240;
    s.roundScore = 650;
    s.streak = 5;
    s.bestStreak = 5;
    s.timeLeft = 21;
    s.timeTotal = 100;
    s.elapsed = 79;
    s.hintsLeft = 1;
    s.hintsUsed = 2;
    s.hintDiff = s.diffs.find((d) => !d.found) || null;
    s.hintPulse = 1;
    s.message = 'Hint spent −150';
    s.messageTime = 2.6;
    return;
  }
  if (kind === 'clear') {
    game.dealRound(2);
    markFound(game, s.diffs.length);
    s.screen = 'clear';
    s.score = 2085;
    s.roundScore = 1185;
    s.streak = 7;
    s.bestStreak = 7;
    s.timeLeft = 34;
    s.timeTotal = 100;
    s.elapsed = 66;
    s.message = 'Round clear! +170 time bonus';
    s.messageTime = 2.6;
    return;
  }
  // Unknown shot name: fall back to the title screen.
  game.dealRound(0);
  s.screen = 'title';
}
