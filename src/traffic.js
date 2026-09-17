export const STOP = 423;
export const CAR_LENGTH = 62;
export const GAP = 24;
export function initialCars() {
  return [350, 205, 60, -100, -245, -390].map((x, id) => ({ id, x, v: 0 }));
}
// Coordinates locate the FRONT bumper; distances and velocities use scene units.
export function stepTraffic(cars, signal, dt) {
  if (signal === 'frozen') return cars;
  const sorted = [...cars].sort((a, b) => b.x - a.x);
  const result = [];
  for (const car of sorted) {
    const ahead = result.at(-1);
    const committed = car.x > STOP + 0.01;
    const line = signal !== 'G' && !committed ? STOP : Infinity;
    const limit = Math.min(line, ahead ? ahead.x - CAR_LENGTH - GAP : Infinity);
    const distance = Math.max(0, limit - car.x);
    const target = Math.min(committed ? 150 : 138, Math.sqrt(2 * 145 * distance));
    const acceleration = target > car.v ? 65 : 230;
    const v = car.v + Math.sign(target - car.v) * Math.min(Math.abs(target - car.v), acceleration * dt);
    const x = Math.max(car.x, Math.min(car.x + v * dt, limit));
    result.push({ ...car, x, v: x >= limit - 0.1 ? 0 : v });
  }
  let tail = Math.min(-90, ...result.map(c => c.x)) - CAR_LENGTH - GAP;
  for (const car of result) {
    if (car.x > 1090) { car.x = tail; tail -= CAR_LENGTH + GAP; }
  }
  return result;
}
