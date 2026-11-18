# Waterloo Basket Check

Build a grocery cart once and see what it costs at every grocery store in Waterloo Region that posts prices online, plus how long it takes to get to each one by walking, biking, bus or car.

## Features
- Shop page with 1051 common grocery items, search, aisles and a cart
- Itemized receipt for each store with subtotal, 13% HST on taxable items and total
- Stores ranked by Recommended (balance of price and trip time), Lowest price or Shortest trip
- Map of 66 grocery stores; drop a pin to change your starting point
- Missing items flagged per store; stores without online prices shown on the map only
- Saved carts (kept in the browser), Help / FAQ page

## Run it
Open `index.html` in a browser. In VS Code, install the recommended **Live Server** extension, right-click `index.html` and choose **Open with Live Server** so the page reloads as you edit.

## Project layout
```
index.html               page markup (Home, Shop, Compare stores, Help)
css/styles.css           all styling
js/app.js                cart, totals, HST, map, ranking, routing
js/art.js                product illustrations (inline SVG)
data/data.js             prices + stores used by the page (generated)
data/prices.json         same data as plain JSON
scripts/browser-tests.js automated tests
scripts/build_data.py    rebuilds data/ from scripts/catalog/
scripts/catalog/         raw price picks per chain + item list (spec.tsv)
```

## Updating prices
Edit or replace the files in `scripts/catalog/`, then run:
```
python3 scripts/build_data.py
```

## Tests
`scripts/browser-tests.js` clicks through every page in a real browser (about 1,400 checks: receipt math, HST, sorting, brand choices, typed amounts, address autofill, street map, saved carts, phone widths). To run it:
```
npm install playwright leaflet@1.9.4
npx playwright install chromium
node scripts/browser-tests.js
```

## Putting it online
See HOSTING.md for step-by-step instructions (free hosting on Cloudflare Pages, with GitHub Pages as the backup option).

## Notes
- Prices were collected from each chain's website on Oct 20 to Nov 17, 2026; they change often.
- Trip times are distance-based estimates, not live schedules.
- The street map uses Leaflet with Esri World Street Map tiles (no key needed), and address suggestions come from Photon (photon.komoot.io). Both need internet; without it the page falls back to the drawn map. If the site gets real traffic, check Esri's and Photon's usage terms or switch to a paid tile and search plan.
- The cart lasts for the open tab only (sessionStorage), so every new visit starts with an empty cart. The starting address also lasts for the tab only; saved carts are kept in localStorage.
- To do before publishing: add GRT bus routes and departure times (GTFS feed from grt.ca).
