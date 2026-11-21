# DOUBLE LIGHT — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Jaka1603/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Jaka1603/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

Two pictures sit side by side on a cream mat. They look identical — they
are not. **DOUBLE LIGHT** is a spot-the-difference hunt across three
richly painted illustrated scenes: a harbour at dusk, a rocky lighthouse cove
at night, and a night market on the pier. Find every hidden change before
the clock runs out. Each picture starts as one painting; the changes are
worked into it with clone-stamp patches, sprites cut from the painting
itself, and tint patches clipped to a shape, so the pair never drifts.

## How it plays

- **6 rounds, 3 scenes.** The scenes cycle Harbour Dusk → Lighthouse Cove
  → Night Market Pier, twice. Each round hides more differences (5, then
  6, 7, 8, 9, 10) against a 90–105 second clock.
- **Two panels, one truth.** The left picture is the original; the right
  one carries the changes. Click a difference on either panel to ring it
  in green on both.
- **Streak scoring.** A find is worth 100 points, plus 15 more for every
  step of your current streak (second find in a row +115, third +130…).
  A wrong click costs 5 seconds and breaks the streak.
- **Hints.** Three per round, 150 points each — a pulsing blue ring points
  at one difference you have not found yet.
- **Round bonus.** Clearing a round pays +5 points per second left on the
  clock. Run out of time and the hunt is over; clear all six rounds and
  the result screen shows your final score.
- **Your best score** is kept in the browser, and every sound — the find
  chime that climbs with your streak, the wrong-click buzz, the last-seconds
  tick — is synthesized live with WebAudio. No audio files, no network.

## Controls

- **Mouse:** click a difference, or the on-screen buttons.
- **Enter / Space:** the main action (start, next round, try again).
- **H:** hint · **P / Esc:** pause · **M:** mute · **R:** restart the campaign.

## Run it

```sh
node serve.ts
```

Then open <http://localhost:8080> in a desktop browser. The game is plain
static files under `game/` — no build step, no network request.

`?seed=N` picks the round deals (the same seed always deals the same
hunt); `?shot=title|play|play2|clear` poses a deterministic state for
screenshots.
