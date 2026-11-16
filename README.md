# School lunch menu

A hobby site that shows this week's school lunch, big and friendly enough for a toddler to point at.

## Features of the site

- **This week's lunch at a glance:** Mon–Fri as a 5-column grid (one column on phones). Each day shows the MAIN item's photo and name.
- **Week arrows:** ◀ ▶ jump back/forward one week. The week lives in the URL (`?week=YYYY-MM-DD`), so it can be bookmarked or shared, and the browser Back button works.
- **Weeks that cross a month just work.**
- **Plain-language empty states:**
  - 🚫 — the menu has no item for that day (the site doesn't guess why).
  - 🤷 "Not posted yet" — that month isn't published.
  - 🍽️ — an item with no photo.
- **Today is highlighted** with a rainbow border.
- **Hobby-quality, low-maintenance:** static HTML/CSS/JS, no build step, no backend, no dependencies. The browser calls the school nutrition vendor's public GraphQL API directly and hotlinks the photos.
- **Honest footer:** says it's a hobby site and links to the official web menu and the school site.

## Run locally

Needs to be served over http (it uses an ES module):

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Tests

`npm test` is a *live contract test*: it asks the real vendor API and checks the assumptions the site relies on (menu shape, 0-indexed months, MAIN item position, CORS). It checks structure, never dish names.

Run it when the site looks wrong for a new month:

```sh
MONTH=2026-12 npm test   # defaults to the current month; unpublished months are reported as skipped
```

## Files

| File | Purpose |
|---|---|
| `index.html`, `style.css`, `app.js` | the page |
| `menu.js` | vendor API query + parsing (no DOM; shared with the test) |
| `menu.test.js` | live contract test |
