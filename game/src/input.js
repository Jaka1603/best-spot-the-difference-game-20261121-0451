// DOUBLE LIGHT — mouse and keyboard.
// The lesson baked in here: a click that lands on the same frame as a
// screen change must be tested against the buttons of the screen that is
// showing NOW, not the one the last painted frame belonged to. So every
// pointer event repaints once before any hit-test runs.
import { BUTTONS, HINT_PILL, PANEL } from './config.js';

function inside(x, y, rect) {
  return x >= rect.x && x < rect.x + rect.width && y >= rect.y && y < rect.y + rect.height;
}

export function attachInput(canvas, game, draw) {
  function onPoint(clientX, clientY) {
    const box = canvas.getBoundingClientRect();
    const x = ((clientX - box.left) / box.width) * canvas.width;
    const y = ((clientY - box.top) / box.height) * canvas.height;
    // Fresh frame first: the hit-test below must see the current screen.
    draw();
    const s = game.state;
    if (s.screen === 'play') {
      if (inside(x, y, HINT_PILL)) {
        game.useHint();
        return;
      }
      const sides = [
        { name: 'left', x: PANEL.leftX },
        { name: 'right', x: PANEL.rightX },
      ];
      for (const side of sides) {
        if (x >= side.x && x < side.x + PANEL.size && y >= PANEL.y && y < PANEL.y + PANEL.size) {
          game.clickPanel(x - side.x, y - PANEL.y);
          return;
        }
      }
      return;
    }
    if (s.screen === 'title' && inside(x, y, BUTTONS.start)) {
      game.startCampaign();
    } else if (s.screen === 'clear' && inside(x, y, BUTTONS.next)) {
      game.nextRound();
    } else if (s.screen === 'over' && inside(x, y, BUTTONS.retry)) {
      game.startCampaign();
    } else if (s.screen === 'victory' && inside(x, y, BUTTONS.again)) {
      game.startCampaign();
    } else if (s.screen === 'paused' && inside(x, y, BUTTONS.resume)) {
      game.resume();
    }
  }

  canvas.addEventListener('click', (event) => {
    onPoint(event.clientX, event.clientY);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      game.primaryAction();
    } else if (key === 'h' || key === 'H') {
      game.useHint();
    } else if (key === 'p' || key === 'P' || key === 'Escape') {
      game.togglePause();
    } else if (key === 'm' || key === 'M') {
      game.toggleMute();
    } else if (key === 'r' || key === 'R') {
      if (game.state.screen !== 'title') game.startCampaign();
    }
  });
}
