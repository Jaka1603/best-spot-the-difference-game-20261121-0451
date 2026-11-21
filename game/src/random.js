// Small deterministic randomness for DOUBLE LIGHT.
// Every round's pick of differences comes from one seeded generator, so
// the same seed always deals the same hunt — the screenshots and the
// automated playthrough both lean on that.

// mulberry32: a tiny, well-behaved seeded PRNG. Returns a function that
// yields a float in [0, 1) on every call.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A shuffled copy of an array, driven by the given random function.
// The input array is never touched.
export function shuffled(array, rand) {
  const out = array.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

// Take the first `count` items of a shuffled copy.
export function pick(array, count, rand) {
  return shuffled(array, rand).slice(0, count);
}
