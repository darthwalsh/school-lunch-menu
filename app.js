import { fetchMonth, mainItem } from "./menu.js";

const grid = document.getElementById("grid");
const rangeEl = document.getElementById("range");

// Resolves to the month's Map<day, product[]>, or null if the month isn't published.
const monthCache = new Map();

function loadMonth(year, month) {
  const key = `${year}-${month}`;
  if (!monthCache.has(key)) {
    monthCache.set(key, fetchMonth(year, month).catch((err) => {
      monthCache.delete(key); // allow retry on next navigation
      throw err;
    }));
  }
  return monthCache.get(key);
}

const pad = (n) => String(n).padStart(2, "0");
const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d) => addDays(d, -((d.getDay() + 6) % 7));

function weekFromUrl() {
  const param = new URLSearchParams(location.search).get("week");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(param)) return mondayOf(new Date());
  const [year, month, day] = param.split("-").map(Number);
  return mondayOf(new Date(year, month - 1, day));
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className ?? "";
  if (text !== undefined) node.textContent = text;
  return node;
}

function dayCard(date, menu) {
  const card = el("section", "day");
  if (date.toDateString() === new Date().toDateString()) card.classList.add("today");
  card.append(el("h3", "", date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })));

  const products = menu?.get(date.getDate());
  if (menu === null) {
    card.append(el("div", "emoji", "🤷"), el("p", "", "Not posted yet"));
  } else if (!products) {
    card.append(el("div", "emoji", "🚫"));
  } else {
    const main = mainItem(products);
    if (main.image_url1) {
      const img = el("img");
      img.src = main.image_url1;
      img.alt = main.name;
      img.loading = "lazy";
      card.append(img);
    } else {
      card.append(el("div", "emoji", "🍽️"));
    }
    card.append(el("p", "", main.name));
  }
  return card;
}

let latestRender = 0;

async function render() {
  const thisRender = ++latestRender;
  const days = [0, 1, 2, 3, 4].map((i) => addDays(weekFromUrl(), i));
  const fmt = (d, opts) => d.toLocaleDateString(undefined, opts);
  rangeEl.textContent = `${fmt(days[0], { month: "short", day: "numeric" })} – ${fmt(days[4], { month: "short", day: "numeric" })}`;
  grid.replaceChildren(el("p", "", "Loading… 🍎"));

  try {
    // Cached per month, so only a week crossing a month boundary costs a second (parallel) request.
    const menus = await Promise.all(days.map((d) => loadMonth(d.getFullYear(), d.getMonth())));
    if (thisRender !== latestRender) return;
    grid.replaceChildren(...days.map((d, i) => dayCard(d, menus[i])));
  } catch (err) {
    console.error(err);
    if (thisRender === latestRender) grid.replaceChildren(el("p", "", "Oh no, couldn't load the menu 😢"));
  }
}

function go(weeks) {
  history.pushState(null, "", `?week=${toIso(addDays(weekFromUrl(), 7 * weeks))}`);
  render();
}

document.getElementById("prev").addEventListener("click", () => go(-1));
document.getElementById("next").addEventListener("click", () => go(1));
addEventListener("popstate", render);
render();
