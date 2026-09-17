// The first scenario symbol selects the demonstration's starting state.
// Remaining symbols are consumed by this total, deterministic transition function.
export const TRANSITIONS = {
  R: { R: 'D', G: 'G', Y: 'D' },
  G: { R: 'D', G: 'D', Y: 'Y' },
  Y: { R: 'R', G: 'D', Y: 'D' },
  D: { R: 'D', G: 'D', Y: 'D' },
};
export const COLORS = { R: '#db5b52', G: '#23836a', Y: '#c28b20', D: '#687184' };
export const NAMES = { R: 'Red', G: 'Green', Y: 'Yellow', D: 'Trap state' };
export const NEXT = { R: 'G', G: 'Y', Y: 'R' };
export const DWELL = { R: 4200, G: 4200, Y: 1900, D: 4200 };
export const SCENARIOS = [
  { id: 'v1', label: 'Full cycle', seq: ['R', 'G', 'Y', 'R'], valid: true },
  { id: 'v2', label: 'Two cycles', seq: ['R', 'G', 'Y', 'R', 'G', 'Y'], valid: true },
  { id: 'v3', label: 'Cycle + extra green', seq: ['R', 'G', 'Y', 'R', 'G'], valid: true },
  { id: 'i1', label: 'Skips green', seq: ['R', 'Y'], valid: false },
  { id: 'i2', label: 'Reverses to red', seq: ['G', 'R'], valid: false },
  { id: 'i3', label: 'Falls back to green', seq: ['Y', 'G'], valid: false },
  { id: 'i4', label: 'Reverts early', seq: ['R', 'G', 'R'], valid: false },
  { id: 'i5', label: 'Repeats red', seq: ['R', 'R'], valid: false },
];
export function parseSequence(text) {
  const tokens = text.toUpperCase().split(/[\s,]+/).filter(Boolean);
  return { tokens, valid: tokens.length > 0 && tokens.every(t => ['R', 'G', 'Y'].includes(t)) };
}
export function advanceRun(run, seq) {
  if (run.state === 'D') return run;
  let index = run.index + 1;
  let state = run.state;
  let replays = run.replays;
  const entries = [];
  if (index >= seq.length) {
    replays += 1;
    entries.push({ reset: true, to: seq[0] });
    index = 0;
    state = seq[0];
    // Preserve the original replay behavior without doubling a shared end/start dwell.
    if (seq.length > 1 && run.state === seq[0]) index = 1;
    else return { ...run, state, index, replays, last: null, entries };
  }
  const input = seq[index];
  const to = TRANSITIONS[state][input];
  const last = { from: state, input, to, valid: to !== 'D' };
  entries.push(last);
  return { state: to, index, replays, tick: run.tick + 1, last, entries };
}
