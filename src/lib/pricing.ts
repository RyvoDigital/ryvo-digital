// Launch pricing (Manuel, 16 Oct 2026; plan decisions log).
// Monthly: €350 for the first automation; each added one costs its add-on.
//   monthly = 350 + Σ add-ons of the chosen − the highest add-on among them
// Setup (one-time): €1,000 for the first automation, +€500 when Reactivation is
// added to another, +€750 for each other extra.
export const ADD_ON = [300, 300, 200, 200, 150]; // 01 … 05
export const BASE_MONTHLY = 350;

export function monthly(chosen: number[]) {
  if (!chosen.length) return 0;
  const adds = chosen.map((i) => ADD_ON[i]);
  return BASE_MONTHLY + adds.reduce((s, a) => s + a, 0) - Math.max(...adds);
}

export function setup(chosen: number[]) {
  if (!chosen.length) return 0;
  const reactivationExtra = chosen.includes(1) && chosen.length > 1;
  const others = chosen.length - 1 - (reactivationExtra ? 1 : 0);
  return 1000 + (reactivationExtra ? 500 : 0) + 750 * others;
}
