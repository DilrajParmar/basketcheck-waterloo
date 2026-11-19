# BasketCheck: grocery price comparison for Waterloo Region

**Live site:** https://basketcheck-waterloo.pages.dev

BasketCheck lets students in Waterloo Region build a grocery cart once and see what it costs at six grocery chains, along with how long the trip takes from their residence or address.

## What it does
- Compares 1,051 grocery items across No Frills, Walmart, Your Independent Grocer, Zehrs, Sobeys and Real Canadian Superstore (31 stores)
- Like for like only: an item counts at a store only if that store sells the same brand in the same size
- Itemized receipt for each store, with sale prices marked, 13% HST on taxable items and the total
- Ranks stores by lowest price, shortest trip, or a balance of both, based on what matters more to you
- Real walking, biking and driving times from OpenStreetMap street routes, with presets for the UW campus and residences
- Meal starters, a budget mode with cheaper swaps, split the bill, shareable cart links and saved carts
- Works on phones and computers; no account needed, and carts stay in your own browser

## How the prices stay current
Prices are read from each chain's own website. Every week the prices most likely to have changed (sale prices first) are checked again, and each rechecked price keeps its source link and the date it was checked. Prices in this version were checked Oct 20 to Nov 18, 2026.

## Built with
- Plain HTML, CSS and JavaScript: no framework, no server, no build step for the site
- Python to merge the per-chain price lists into one data file
- Leaflet with Esri street map tiles; Esri and Photon for address search; OpenStreetMap routing (OSRM) for trip times
- Hosted free on Cloudflare Pages

## Testing
`scripts/browser-tests.js` clicks through every page in a real browser (about 1,400 checks: receipt math, HST, sorting, brand choices, typed amounts, address search, street map, saved carts, phone widths). Before each release the site is also checked on 12 phone, tablet and desktop screen sizes and with an accessibility checker. To run the included tests:
```
npm install playwright leaflet@1.9.4
npx playwright install chromium
node scripts/browser-tests.js
```

## Run it locally
Open `index.html` in a browser. In VS Code, the recommended **Live Server** extension reloads the page as you edit (right-click `index.html`, **Open with Live Server**).

## Project layout
```
index.html               page markup (Welcome, Shop, Checkout, Help)
css/styles.css           all styling
js/app.js                cart, totals, HST, map, ranking, routes
js/art.js                product illustrations (inline SVG)
data/data.js             prices and stores used by the page (generated)
data/prices.json         same data as plain JSON
scripts/build_data.py    rebuilds data/ from scripts/catalog/
scripts/catalog/         price lists per chain, item list, store locations
scripts/browser-tests.js automated browser tests
```

## Updating prices
Edit or replace the files in `scripts/catalog/`, then run:
```
python3 scripts/build_data.py
```

## Limitations
- Walmart's site blocks automated reading, so only some items have a Walmart price.
- Bus and ION times are estimates until GRT timetable data is added.
- Chains post one online price per region, so a particular store's shelf price can differ slightly.
