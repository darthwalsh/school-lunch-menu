// Live contract test: written-down assumptions about the vendor API that the site silently relies on.
// Run when the site looks wrong for a new month:  MONTH=2026-12 npm test   (defaults to the current month)
// Checks structure only, never dish names, so a new menu shouldn't cause false alarms.
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { API, fetchMonth, mainItem } from "./menu.js";

const [year, monthNumber] = (process.env.MONTH ?? new Date().toISOString().slice(0, 7)).split("-").map(Number);
const month = monthNumber - 1; // the API and Date both use 0-indexed months

describe(`menu ${year}-${String(monthNumber).padStart(2, "0")}`, () => {
  let menu;
  before(async () => {
    menu = await fetchMonth(year, month);
  });

  it("is published", (t) => {
    if (menu === null) return t.skip("month not published yet");
    assert.ok(menu.size > 0, "published menu has no days");
  });

  it("only has school days (Mon-Fri); a weekend means `month` is off by one", (t) => {
    if (menu === null) return t.skip("month not published yet");
    const weekends = [...menu.keys()].filter((day) => [0, 6].includes(new Date(year, month, day).getDay()));
    assert.deepEqual(weekends, []);
  });

  it("every product has a name and a null/empty/http(s) image_url1", (t) => {
    if (menu === null) return t.skip("month not published yet");
    const bad = [...menu].flatMap(([day, products]) =>
      products
        .filter((p) => typeof p.name !== "string" || p.name === "" || !(!p.image_url1 || /^https?:\/\//.test(p.image_url1)))
        .map((p) => `day ${day}: ${JSON.stringify(p)}`),
    );
    assert.deepEqual(bad, []);
  });

  it("layout: breakfast first, MAIN (index 2) is not the salad bar", (t) => {
    if (menu === null) return t.skip("month not published yet");
    const bad = [...menu].flatMap(([day, products]) => {
      const names = products.map((p) => p.name);
      const problems = [];
      if (products.length < 4) problems.push("fewer than 4 items");
      if (!/^breakfast/i.test(names[0])) problems.push(`items[0] is not breakfast`);
      if (/celery/i.test(mainItem(products).name)) problems.push(`MAIN looks like the salad bar`);
      return problems.map((problem) => `day ${day}: ${problem}: ${JSON.stringify(names)}`);
    });
    assert.deepEqual(bad, []);
  });
});

describe("CORS", () => {
  it("preflight allows any web origin to POST JSON", async () => {
    const origin = "https://example.test";
    const resp = await fetch(API, {
      method: "OPTIONS",
      headers: {
        origin,
        "access-control-request-method": "POST",
        "access-control-request-headers": "content-type",
      },
    });
    assert.equal(resp.headers.get("access-control-allow-origin"), origin);
    assert.match(resp.headers.get("access-control-allow-headers"), /content-type/i);
  });
});
