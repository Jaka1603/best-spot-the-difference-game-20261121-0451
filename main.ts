// DOUBLE LIGHT — the entry point that hands the game in.
// It copies this repository's game/ and screenshots/ folders into the
// output directory and writes /output/dossier.json, the summary the judge
// reads, using the kit's vendored buildDossier helper.
// Run it with Node 22: `node main.ts`. Outside the grader's container,
// MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy one tree from the repository into the output directory, creating
// the destination first. Screenshots are optional on disk, but the game
// folder is the entry itself and must always be there.
function copyTree(from, to) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true });
}

mkdirSync(out, { recursive: true });
copyTree(join(here, 'game'), join(out, 'game'));
if (existsSync(join(here, 'screenshots'))) {
  copyTree(join(here, 'screenshots'), join(out, 'screenshots'));
} else {
  mkdirSync(join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: only text_max_bytes shapes the dossier's bytes;
// the other limits refuse an entry the scorer would refuse outright —
// more than four screenshots or one over 256 KiB, more than 993 files in
// game/ or 48 MiB of game files in all, or a path under game/ over
// 1000 bytes long.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
