import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { currentWeek, toIso, weekFromParam } from "./dates.js";

// Nov 2026: Mon 9 ... Fri 13, Sat 14, Sun 15, Mon 16. Noon avoids any midnight/DST edge.
const nov = (day) => new Date(2026, 10, day, 12);

describe("currentWeek", () => {
  it("steps Fri -> Sat -> Sun -> Mon: past week through Friday, upcoming week from Saturday", () => {
    const steps = [
      ["Fri", 13, "2026-11-09"],
      ["Sat", 14, "2026-11-16"],
      ["Sun", 15, "2026-11-16"],
      ["Mon", 16, "2026-11-16"],
    ];
    for (const [name, day, expectedMonday] of steps) {
      assert.equal(toIso(currentWeek(nov(day))), expectedMonday, name);
    }
  });

  it("every weekday Mon-Fri shows that week's Monday", () => {
    assert.deepEqual([9, 10, 11, 12, 13].map((day) => toIso(currentWeek(nov(day)))), Array(5).fill("2026-11-09"));
  });

  it("weekend at month end rolls into the next month", () => {
    assert.equal(toIso(currentWeek(new Date(2026, 9, 31, 12))), "2026-11-02"); // Sat Oct 31
  });
});

describe("weekFromParam", () => {
  const saturday = nov(14);

  it("explicit date snaps to its own week's Monday, even a weekend date", () => {
    assert.equal(toIso(weekFromParam("2026-11-14", saturday)), "2026-11-09");
    assert.equal(toIso(weekFromParam("2026-11-11", saturday)), "2026-11-09");
  });

  it("missing or malformed param falls back to the weekend-aware current week", () => {
    for (const param of [null, "", "garbage", "2026-1-5", "2026-11-14T00:00"]) {
      assert.equal(toIso(weekFromParam(param, saturday)), "2026-11-16", String(param));
    }
  });
});
