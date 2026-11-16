// Pure data layer (no DOM) so menu.test.js can run the exact code the page runs.
export const API = "https://api.schoolnutritionandfitness.com/graphql";
const SITE_ID = "964";
const MENU_TYPE_ID = "56d9f77ceabc8894708b4567"; // "Breakfast & Lunch Menu"

// Each day lists: breakfast, fruit, MAIN, then sides / alternates (varies, 5-6 items).
const MAIN_ITEM_POSITION = 2;
export const mainItem = (products) => products[MAIN_ITEM_POSITION];

const QUERY = `query ($month: Int!, $year: Int!) {
  menuTypes(site: {depth_0_id: "${SITE_ID}"}, publish_location: "website") {
    id
    menu(month: $month, year: $year) { items { day product { name image_url1 } } }
  }
}`;

/** `month` is 0-indexed (Nov = 10), same as Date#getMonth. Resolves to Map<dayOfMonth, product[]>, or null if unpublished. */
export async function fetchMonth(year, month) {
  const resp = await fetch(API, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { year, month } }),
  });
  const { data, errors } = await resp.json();
  if (errors) throw new Error(errors[0].message);

  const { menu } = data.menuTypes.find((type) => type.id === MENU_TYPE_ID);
  if (!menu) return null;

  const productsByDay = new Map();
  for (const { day, product } of menu.items) {
    // The vendor sometimes spills into the next month (e.g. "Aug 32"); that day is published in its own month's menu.
    if (new Date(year, month, day).getMonth() !== month) continue;
    if (!productsByDay.has(day)) productsByDay.set(day, []);
    productsByDay.get(day).push(product);
  }
  return productsByDay;
}
