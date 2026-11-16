// Pure week/date helpers (no DOM, no clock reads) so dates.test.js can pass in any "today".
const pad = (n) => String(n).padStart(2, "0");

export const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
export const mondayOf = (d) => addDays(d, -((d.getDay() + 6) % 7));

// On Sat/Sun the useful week is the upcoming one.
export function currentWeek(today) {
  const isWeekend = [0, 6].includes(today.getDay());
  return mondayOf(isWeekend ? addDays(today, 2) : today);
}

/** Monday of the `?week=YYYY-MM-DD` date; a missing or malformed param means the current week. */
export function weekFromParam(param, today) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(param)) return currentWeek(today);
  const [year, month, day] = param.split("-").map(Number);
  return mondayOf(new Date(year, month - 1, day));
}
