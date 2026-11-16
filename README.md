# School lunch menu

A hobby site that shows this week's school lunch, big and friendly enough for a toddler to point at.

## Features of the site

- **This week's lunch at a glance:** Mon-Fri as a 5-column grid (one column on phones). Each day shows the MAIN item's photo and name.
- **Weekends show the upcoming week:** opening the site on Saturday or Sunday lands on next Monday's week.
- **Week arrows:** ◀ ▶ jump back/forward one week.
  The week lives in the URL (`?week=YYYY-MM-DD`), so it can be bookmarked or shared, and the browser Back button works.
- **Weeks that cross a month just work.**
- **Plain-language empty states:**
  - 🚫 - the menu has no item for that day (the site doesn't guess why).
  - 🤷 "Not posted yet" - that month isn't published.
  - 🍽️ - an item with no photo.
- **Today is highlighted** with a rainbow border.
- **Hobby-quality, low-maintenance:** static HTML/CSS/JS, no build step, no backend, no dependencies.
  The browser calls the school nutrition vendor's public GraphQL API directly and hotlinks the photos.
- **Honest footer:** says it's a hobby site and links to the official web menu and the school site.

## Run locally

Serve over http, because the page uses ES modules:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Tests

`npm test` runs both test files:

- `dates.test.js`: offline unit tests for week selection, including the weekend rule and `?week=` parsing.
- `menu.test.js`: a *live contract test* that asks the real vendor API and checks the assumptions the site relies on (menu shape, 0-indexed months, MAIN item position, CORS).
  It checks structure, never dish names.

Run the live test when the site looks wrong for a new month:

```sh
MONTH=2026-12 npm test   # defaults to the current month; unpublished months are reported as skipped
```

Run only the offline tests:

```sh
node --test dates.test.js
```

## Files

| File | Purpose |
|---|---|
| `index.html`, `style.css`, `app.js` | the page |
| `favicon.png` | 16x16 apple icon |
| `dates.js` | week selection and date helpers (no DOM, no clock reads) |
| `menu.js` | vendor API query and parsing (no DOM; shared with the test) |
| `dates.test.js` | offline unit tests for `dates.js` |
| `menu.test.js` | live contract test for `menu.js` and the vendor API |
