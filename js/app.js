(function(){
const {ASOF, CHAINS, ITEMS, STORES} = DATA;
const CATS = ["Produce","Dairy & Eggs","Bakery","Meat & Seafood","Pantry","Snacks","Frozen","Drinks","Household","Personal Care","Baby & Pet"];
const CATKEY = {"Produce":"produce","Dairy & Eggs":"dairy","Bakery":"bakery","Meat & Seafood":"meat","Pantry":"pantry","Snacks":"snacks","Frozen":"frozen","Drinks":"drinks","Household":"household","Personal Care":"personal","Baby & Pet":"babypet"};
const ICON = {
  produce:'<path d="M12 21c-4.5 0-8-3.4-8-8 0-4.3 3.3-7.5 8-7.5s8 3.2 8 7.5c0 4.6-3.5 8-8 8Z"/><path d="M12 5.5c0-1.7 1-3 2.6-3.5"/><path d="M12 5.5c-1.8-1.6-4-1.7-5.5-.8 1.2 1.6 3.3 2 5.5.8Z"/>',
  dairy:'<path d="M8 2h8v3l2 3v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V8l2-3V2Z"/><path d="M6 8h12"/><path d="M9 13h6v5H9z"/>',
  bakery:'<path d="M4 11a5 5 0 0 1 3.5-6.6C9 4 10.5 4 12 4s3 0 4.5.4A5 5 0 0 1 20 11v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8Z"/><path d="M9 9v7M12 9v7M15 9v7"/>',
  meat:'<path d="M15.5 3.5c3 0 5 2 5 5 0 4-4.5 8.5-9 8.5-1.2 0-2.2-.3-3-.9L5.4 19.2a1.8 1.8 0 1 1-2.5-2.5l3.1-3.1c-.6-.8-.9-1.8-.9-3 0-4.5 4.5-7.1 10.4-7.1Z"/><circle cx="14" cy="9" r="2"/>',
  pantry:'<path d="M7 4h10v3H7z"/><path d="M6 7h12l-1 14H7L6 7Z"/><path d="M9 12h6M9 16h6"/>',
  snacks:'<path d="M7 3h10l1 18H6L7 3Z"/><path d="M7 6c3 1.5 7 1.5 10 0"/><circle cx="12" cy="13" r="3"/>',
  frozen:'<path d="M12 2v20M4 6.5l16 11M20 6.5l-16 11"/><path d="m9 4 3 2 3-2M9 20l3-2 3 2"/>',
  drinks:'<path d="M9 2h6v4l2 3v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l2-3V2Z"/><path d="M7 13h10"/>',
  household:'<rect x="4" y="5" width="12" height="15" rx="6"/><circle cx="10" cy="12.5" r="2"/><path d="M16 8h3a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-3"/>',
  personal:'<path d="M9 2h6v4H9z"/><path d="M8 6h8l1 3v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V9l1-3Z"/><path d="M10 13h4"/>',
  babypet:'<circle cx="7" cy="9" r="2"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="9" r="2"/><path d="M8 17c0-3 2-5 4-5s4 2 4 5c0 2-2 3-4 3s-4-1-4-3Z"/>'
};
const icon = (k)=>`<svg viewBox="0 0 24 24" fill="none" stroke="var(--i-${k})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
const money = v => "$" + v.toFixed(2);
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const CH = Object.fromEntries(CHAINS.map(c=>[c.id,c]));
const PRICED = STORES.filter(s=>s.chain);
const byId = Object.fromEntries(ITEMS.map(i=>[i.id,i]));
/* brand choices: items with "opts" can be priced as a different brand. it.prices always returns the chosen brand's price at each chain,
   so totals, receipts and the shop all follow the choice. opts[0] is the default; "cheap" = the cheapest of the listed brands at each chain. */
const BRAND = {};
const CHEAP_KEY = "cheap";
function optPrices(it, key){
  if (!it.opts || !key || key===it.opts[0].k) return it.opts ? it.opts[0].prices : it._base;
  if (key===CHEAP_KEY){ if (!it._cheap){ it._cheap={}; for (const o of it.opts) for (const [c,p] of Object.entries(o.prices)) if (!it._cheap[c] || p.price<it._cheap[c].price) it._cheap[c]=p; } return it._cheap; }
  const o=it.opts.find(o=>o.k===key); return o ? o.prices : it.opts[0].prices;
}
for (const it of ITEMS){ it._base=it.prices; if (it.opts && it.opts.length){ it.opts[0].prices = it.opts[0].prices || it._base; Object.defineProperty(it, "prices", {get(){ return optPrices(it, BRAND[it.id]); }}); } }
const brandOpts = it => it.opts ? it.opts.map(o=>({k:o.k, label:o.label})).concat(it.opts.length>1 && !it.cheapDefault?[{k:CHEAP_KEY, label:"Cheapest available"}]:[]) : [];
const brandKey = it => BRAND[it.id] || (it.opts ? it.opts[0].k : "");
function setBrand(id, k){ const it=byId[id]; if (!it || !it.opts) return; if (!brandOpts(it).some(o=>o.k===k) || k===it.opts[0].k) delete BRAND[id]; else BRAND[id]=k; try { sessionStorage.setItem("wbc-brand", JSON.stringify(BRAND)); } catch(e){} }
try { const b=JSON.parse(sessionStorage.getItem("wbc-brand")||"{}"); for (const k in b) setBrand(k, String(b[k])); } catch(e){}
const brandSelect = (it, cls) => it.opts && it.opts.length>1 ? `<label class="brandsel ${cls||""}"><span>Brand</span><select data-b="${it.id}" aria-label="Brand of ${esc(it.name)}">${brandOpts(it).map(o=>`<option value="${esc(o.k)}"${o.k===brandKey(it)?" selected":""}>${esc(o.label)}</option>`).join("")}</select></label>` : "";
function wireBrand(root, rerender){ root.querySelectorAll("select[data-b]").forEach(sel=>sel.onchange=()=>{ setBrand(sel.dataset.b, sel.value); renderHeader(); rerender(); }); }

/* ---------- state */
const START_PRESETS = [
  {id:"dc", name:"UW campus (Davis Centre)", lat:43.4728, lon:-80.5422},
  {id:"v1", name:"UW Village 1 (V1)", lat:43.4705, lon:-80.5505},
  /* residences below: Esri geocoder, Nov 10 2026 (REV by name; UWP and CLV by the postal codes on UW Campus Housing's mailing-address page; CMH by its street address) */
  {id:"rev", name:"UW Ron Eydt Village (REV)", lat:43.47025, lon:-80.55399},
  {id:"mkv", name:"UW Mackenzie King Village (MKV)", lat:43.4704, lon:-80.5523}, /* between REV and V1, as Sifio described */
  {id:"uwp", name:"UW Place (UWP)", lat:43.47038, lon:-80.53382},
  {id:"cmh", name:"UW Claudette Millar Hall (CMH)", lat:43.47024, lon:-80.53601},
  {id:"clv", name:"UW Columbia Lake Village", lat:43.47097, lon:-80.55933},
  {id:"lau", name:"Laurier campus", lat:43.4738, lon:-80.5275},
  {id:"lester", name:"Lester & Sunview (student housing)", lat:43.4765, lon:-80.5355},
  {id:"up", name:"Uptown Waterloo", lat:43.4655, lon:-80.5225},
  {id:"dtk", name:"Downtown Kitchener", lat:43.451, lon:-80.4925}
];
const S = { cart:{}, start:{...START_PRESETS[0]}, pending:null, mode:"walk", zoom:"near", sort:"rec", aisle:"All", q:"", shopSort:"aisle", open:null, cmp:{}, gmap:null };
const QMAX = 99;
const TIME_RATE = 0.20; /* Recommended: how much each minute of round trip counts against the basket cost. Internal only: never shown on the page, and never a dollar value for time */
/* the cart lasts for this tab only (survives a reload, not a fresh open); saved carts and your start point are what's kept */
// the cart always starts empty on a fresh open
try { localStorage.removeItem("wbc-cart"); } catch(e){}
try { const raw = sessionStorage.getItem("wbc-cart"); const saved = JSON.parse(raw||"{}"); for (const k in saved) if (byId[k]) { const q=cleanQty(byId[k], saved[k]); if (q>0) S.cart[k]=q; } } catch(e){}
function saveCart(){ try { sessionStorage.setItem("wbc-cart", JSON.stringify(S.cart)); } catch(e){} }
/* the starting point lasts for this tab only, like the cart */
try { localStorage.removeItem("wbc-start"); } catch(e){}
try { const st = JSON.parse(sessionStorage.getItem("wbc-start")||"null"); if (st && isFinite(st.lat) && isFinite(st.lon) && st.name){ S.start = {id:String(st.id), name:String(st.name), lat:+st.lat, lon:+st.lon}; S.startPicked=true; } } catch(e){}
function setStart(st){ S.start=st; S.startPicked=true; S.pending=null; try { sessionStorage.setItem("wbc-start", JSON.stringify(st)); } catch(e){} renderCheckout(); }
const cartCount = () => Object.values(S.cart).filter(q=>q>0).length;

/* ---------- pricing */
function itemPrice(item, chain){ const p = item.prices[chain]; return p ? p.price : null; }
const nStores = it => Object.keys(it.prices).length;
function avgElsewhere(it){ const v=Object.values(it.prices).map(p=>p.price); return v.reduce((a,b)=>a+b,0)/v.length; }
function lowest(item){ let best=null; for (const c of CHAINS){ const v=itemPrice(item,c.id); if(v!=null && (best==null||v<best.v)) best={v,c:c.id}; } return best; }
function highest(item){ let m=0; for (const c of CHAINS){ const v=itemPrice(item,c.id); if(v!=null && v>m) m=v; } return m; }
/* Ontario HST: basic groceries are zero-rated; snacks like chips, pop and household goods are taxed at 13% */
const HST = 0.13;
const taxRate = it => it.tax===0.05 ? 0.05 : it.tax ? HST : 0;
function chainTotal(chain){ let t=0, sale=0, est=0, tax=0; const lines=[], missing=[]; for (const [id,q] of Object.entries(S.cart)){ if(!(q>0)) continue; const it=byId[id]; const p=it.prices[chain]; if(!p){ missing.push({it,q}); est+=avgElsewhere(it)*q*(1+taxRate(it)); continue; } t+=p.price*q; tax+=p.price*q*taxRate(it); if(p.regular && p.regular>p.price) sale+=(p.regular-p.price)*q; lines.push({it,q,p}); } const ord=(a,b)=>CATS.indexOf(a.it.cat)-CATS.indexOf(b.it.cat); lines.sort(ord); missing.sort(ord); return {t:t+tax,sub:t,tax,sale,lines,missing,full:t+tax+est}; }
const qtyLabel = (it,q) => it.unit==="per_kg" ? `${q} kg` : `${q}`;
/* typed amounts: whole numbers for items sold each, up to 2 decimals for kg; 0 or blank removes the item */
function cleanQty(it, raw){ const t = String(raw ?? "").trim(); if (t === "") return 0; const v = parseFloat(t.replace(",", ".")); if (!isFinite(v) || v < 0) return null; if (v === 0) return 0; const r = it.unit==="per_kg" ? Math.max(0.01, Math.round(v*100)/100) : Math.max(1, Math.round(v)); return Math.min(QMAX, r); }
function setQty(id, q){ if (q > 0) S.cart[id] = q; else delete S.cart[id]; saveCart(); renderHeader(); }
const qtyInput = (it, q, label) => `<input class="qty" type="number" data-q="${it.id}" value="${q}" min="0" max="${QMAX}" step="${it.unit==="per_kg"?"0.01":"1"}" inputmode="${it.unit==="per_kg"?"decimal":"numeric"}" aria-label="${esc(label)}">`;
/* a typed amount updates the cart in place (so a click on + or − right after still lands); the list is only redrawn when an item is removed */
function wireQty(root, refresh, rerender){ root.querySelectorAll("input[data-q]").forEach(inp => {
  const commit = () => { const it = byId[inp.dataset.q], bad = inp.validity && inp.validity.badInput, q = bad ? null : cleanQty(it, inp.value); if (q === null) { inp.value = S.cart[it.id]||0; return; } if (q === (S.cart[it.id]||0)) { inp.value = q || ""; if (!q) rerender(); return; } const snap = {...S.cart}; setQty(it.id, q); if (q) { inp.value = q; refresh(); } else { if (typeof offerUndo==="function") offerUndo(`Removed ${it.name} from your cart.`, snap); rerender(); } };
  inp.addEventListener("change", commit);
  inp.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); inp.blur(); } else if (e.key === "Escape") { inp.value = S.cart[inp.dataset.q]||0; inp.blur(); } });
  inp.addEventListener("focus", () => inp.select());
}); }
/* ---------- unit prices: per 100 g, per 100 ml or per item, from the pack size (it.uq is set by build.py) */
function unitPrice(it, price){
  if (price==null) return null;
  if (it.unit==="per_kg") return {k:0, v:price/10, lab:"/100 g"};
  const u=it.uq; if (!u) return null;
  if (u[1]==="g") return {k:0, v:price/u[0]*100, lab:"/100 g"};
  if (u[1]==="ml") return {k:1, v:price/u[0]*100, lab:"/100 ml"};
  return {k:2, v:price/u[0], lab:"/"+(u[2]||"item")};
}
const fmtUnit = up => up ? `${money(up.v)}${up.lab}` : "";
const unitLabel = (it) => it.unit==="per_kg" ? "/kg" : "ea";

/* ---------- travel */
/* fallback speeds, tuned Nov 17 2026 against OpenStreetMap street routes from UW to 5 stores (the old 5 / 16 / 35 km/h ran 1 to 7 min short) */
const SPEED = {walk:4.7, bike:14, bus:22, car:30}, OVER = {walk:0, bike:1, bus:13, car:3};
const MODE_WORD = {walk:"walk", bike:"bike ride", bus:"bus / ION trip", car:"drive"};
function km(a,b){ const R=6371,r=Math.PI/180,dLa=(b.lat-a.lat)*r,dLo=(b.lon-a.lon)*r; const h=Math.sin(dLa/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLo/2)**2; return 2*R*Math.asin(Math.sqrt(h)); }
/* closest other store (by the chosen travel mode) that sells this item, for a second stop */
function nearestFor(it, from){ let best=null; for (const s2 of PRICED){ if (s2===from || itemPrice(it, s2.chain)==null) continue; const there=trip(s2, from).min; if (!best || there<best.there) best={s:s2, there}; } if (best) best.home=trip(best.s).min; return best; }
/* real route times: on the hosted site, one request to the OpenStreetMap routing servers (FOSSGIS) gives walk, bike or drive
   times from the starting point to every store. Bus stays an estimate. If the request fails, the straight-line estimate is used. */
const ROUTE_URL = {walk:"https://routing.openstreetmap.de/routed-foot", bike:"https://routing.openstreetmap.de/routed-bike", car:"https://routing.openstreetmap.de/routed-car"};
const ROUTES = {}; let routeBusy = "";
const routeKey = () => `${S.mode}|${(+S.start.lat).toFixed(5)},${(+S.start.lon).toFixed(5)}`;
const routed = () => !!ROUTES[routeKey()];
function loadRoutes(){
  if (!ROUTE_URL[S.mode] || !/^https?:$/.test(location.protocol) || typeof fetch!=="function") return;
  const key=routeKey(); if (key in ROUTES || routeBusy===key) return; routeBusy=key;
  const pts=[S.start,...PRICED].map(p=>`${(+p.lon).toFixed(5)},${(+p.lat).toFixed(5)}`).join(";");
  const ctl=new AbortController(), timer=setTimeout(()=>ctl.abort(), 6000);
  fetch(`${ROUTE_URL[S.mode]}/table/v1/driving/${pts}?sources=0&annotations=duration,distance`, {signal:ctl.signal})
    .then(r=>r.ok ? r.json() : Promise.reject(r.status))
    .then(j=>{ if (!j || j.code!=="Ok" || !j.durations) throw 0; const m=new Map(), mode=key.split("|")[0];
      PRICED.forEach((st,i)=>{ const sec=j.durations[0][i+1], dist=j.distances ? j.distances[0][i+1] : null;
        if (sec!=null && isFinite(sec)) m.set(st, {d: dist!=null && isFinite(dist) ? dist/1000 : null, min: Math.max(1, Math.round(sec/60 + OVER[mode]))}); });
      ROUTES[key] = m.size ? m : null; })
    .catch(()=>{ ROUTES[key]=null; })
    .finally(()=>{ clearTimeout(timer); if (routeBusy===key) routeBusy=""; if (routeKey()===key && ROUTES[key] && !$("#p-checkout").hidden) renderCheckout(); });
}
function trip(store, from=S.start){
  if (from===S.start){ const r=ROUTES[routeKey()], t=r && r.get(store); if (t) return {d: t.d!=null ? t.d : km(from,store)*1.3, min: t.min}; }
  const d=km(from,store)*1.3; return {d, min:Math.max(1, Math.round(d/SPEED[S.mode]*60+OVER[S.mode]))}; }
const fmtMin = m => m<60 ? `${m} min` : `${Math.floor(m/60)} h ${m%60} min`;

/* ---------- routing */
function route(){
  let p = (location.hash||"#home").slice(1);
  if (p.startsWith("share=")){ S.shared = readShare(p.slice(6)); p="checkout"; try { history.replaceState(null, "", "#checkout"); } catch(e){ location.hash="#checkout"; return; } }
  const page = ["home","shop","checkout","faq","privacy","terms"].includes(p) ? p : "home";
  document.querySelectorAll(".page").forEach(el=>el.hidden = el.id !== "p-"+page);
  document.querySelectorAll(".nav a").forEach(a=>{ if(a.dataset.p===page) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  $("#cartbar").hidden = page!=="shop" || cartCount()===0;
  if (page!=="checkout") showMbar(false);
  if (S.page && S.page!==page) hideUndo(); S.page=page;
  if (page==="checkout") renderCheckout();
  if (page==="shop") renderShop();
  window.scrollTo(0,0);
}
window.addEventListener("hashchange", route);
/* a link to the page already open (e.g. Cart while on checkout) fires no hashchange, so jump back to the top ourselves */
document.addEventListener("click", e=>{ const a=e.target.closest('a[href^="#"]'); if (a && a.getAttribute("href")===(location.hash||"#home") && a.getAttribute("href").length>1) window.scrollTo(0,0); });

/* ---------- header + welcome */
function renderHeader(){
  $("#cartN").textContent = cartCount();
  const n = cartCount();
  $("#barN").textContent = n; $("#barWord").textContent = n===1 ? "item" : "items";
  if (n){ { const full=CHAINS.map(c=>chainTotal(c.id)).filter(r=>!r.missing.length); $("#barLow").textContent = full.length? money(Math.min(...full.map(r=>r.t))) : "n/a (no store has every item)"; } }
  if (location.hash==="#shop") $("#cartbar").hidden = n===0;
}
function renderWelcome(){
  $("#asof").textContent = ASOF; $("#asofFoot").textContent = ASOF;
  $("#itemCount").textContent = ITEMS.length;
  $("#chainList").textContent = CHAINS.map(c=>c.name).join(", ").replace(/, ([^,]*)$/, " and $1");
  $("#lowOf").textContent = `Lowest of ${CHAINS.length} chains`;
  $("#storeCount").textContent = `${PRICED.length} store locations compared`;
  $("#chainStrip").innerHTML = CHAINS.map(c=>`<span class="storepill"><i class="dot" style="background:${c.color}"></i>${esc(c.name)} <span>${PRICED.filter(s=>s.chain===c.id).length} location${PRICED.filter(s=>s.chain===c.id).length===1?"":"s"}</span></span>`).join("");
  const picks = ["eggs","milk","bread_white","banana","rice"].map(id=>byId[id]).filter(Boolean);
  $("#flyerRows").innerHTML = picks.map(it=>{ const lo=lowest(it); return `<a class="low" href="#shop" style="text-decoration:none;color:inherit"><span class="pic">${ART(it.id)||""}</span><span class="pr">${money(lo.v)}${it.unit==="per_kg"?"<small style='font-size:.8rem;font-weight:600'>/kg</small>":""}</span><b style="font-weight:600">${esc(it.name)}</b><span class="at">${esc(it.size)} · at ${esc(CH[lo.c].name)}</span></a>`; }).join("");
  const AISLE_PIC = {"Produce":"banana","Dairy & Eggs":"milk","Bakery":"bread_white","Meat & Seafood":"chicken_breast","Pantry":"sauce","Snacks":"chips","Frozen":"frozen_veg","Drinks":"oj","Household":"paper_towel","Personal Care":"lst_cool_1l","Baby & Pet":"gb_puffs_bv"};
  $("#aisleTiles").innerHTML = CATS.map(c=>`<a class="aisle" href="#shop" data-aisle="${esc(c)}"><span class="pic">${ART(AISLE_PIC[c])||""}</span>${esc(c)}</a>`).join("");
  $("#aisleTiles").querySelectorAll("[data-aisle]").forEach(a=>a.addEventListener("click",()=>{ if (typeof exitMeal==="function") exitMeal(); S.aisle=a.dataset.aisle; renderRail(); }));
  /* a real comparison of a small sample cart, worked out from the same prices as the rest of the site */
  const SAMPLE = {milk:1, eggs:1, bread_white:1, banana:1, pb:1};
  const keep=S.cart; S.cart=SAMPLE; const tot=CHAINS.map(c=>({c, r:chainTotal(c.id)})); S.cart=keep;
  const full=tot.filter(x=>!x.r.missing.length).sort((a,b)=>a.r.t-b.r.t), best=full[0];
  const names=Object.keys(SAMPLE).map(id=>byId[id]).filter(Boolean).map(it=>it.name+(it.unit==="per_kg"?" (1 kg)":"")+(it.size&&it.unit!=="per_kg"?` (${it.size})`:""));
  $("#demo").innerHTML = best ? `<h2>Sample cart</h2><p class="items">${esc(names.join(", "))}</p><table>${full.map(x=>`<tr class="${x===best?"best":""}"><td><i class="dot" style="background:${x.c.color}"></i> ${esc(x.c.name)}${x===best?' <span class="chip tag">Lowest</span>':""}</td><td class="n">${money(x.r.t)}</td></tr>`).join("")}</table><p class="note">Prices checked ${esc(ASOF)}. Totals include HST where it applies. The same five items cost ${money(full.at(-1).r.t-best.r.t)} more at the priciest chain. Your own cart is compared the same way.</p>` : "";
}

/* ---------- shop */
function renderRail(){
  const counts = Object.fromEntries(CATS.map(c=>[c, ITEMS.filter(i=>i.cat===c).length]));
  $("#rail").innerHTML = ["All",...CATS].filter(c=>c==="All"||counts[c]).map(c=>`<button type="button" data-a="${esc(c)}" aria-pressed="${S.aisle===c}"><span>${c==="All"?"All aisles":esc(c)}</span><span class="cnt">${c==="All"?ITEMS.length:counts[c]}</span></button>`).join("");
  $("#rail").querySelectorAll("button").forEach(b=>b.onclick=()=>{ if (typeof exitMeal==="function") exitMeal(); S.aisle=b.dataset.a; renderRail(); renderShop(); });
}
/* search names, sizes, keywords, tags and store product names; the aisle name only counts when no item name has every word (so "eggs" finds eggs, not the whole Dairy & Eggs aisle, and "dairy" still finds the aisle) */
function matches(it,q,withCat){ if(!q) return true; const tags=(it.tags||[]).join(", ").toLowerCase(), hay=(it.name+" "+it.size+" "+(withCat?it.cat+" ":"")+(it.kw||"")+" "+tags+" "+Object.values(it.prices).map(p=>p.product).join(" ")).toLowerCase(); return q.toLowerCase().split(/\s+/).filter(Boolean).every(w=>wordStart(w).test(hay) || wordForms(w).some(f=>wordStart(f).test(tags))); }
/* for tags only, "snacks" also finds "snack" and "potatoes" finds "potato" */
const wordForms = w => [w, ...(w.length>3 && /s$/.test(w) ? [w.slice(0,-1)] : []), ...(w.length>4 && /es$/.test(w) ? [w.slice(0,-2)] : [])];
const wordStart = w => new RegExp("(^|[^a-z0-9])"+w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"));
function anySale(it){ return Object.values(it.prices).some(p=>p.regular && p.regular>p.price); }
/* forgiving search: when nothing matches, each word that isn't the start of a known word is swapped for the closest one (1 typo for short words, 2 for longer) */
let VOCAB = null;
function vocab(){ if (VOCAB) return VOCAB; VOCAB = new Map(); for (const it of ITEMS) for (const w of ((it.name+" "+(it.tags||[]).join(" ")).toLowerCase().match(/[a-z]{3,}/g)||[])) VOCAB.set(w, (VOCAB.get(w)||0)+1); return VOCAB; }
function editDist(a, b){ const d=[]; for (let i=0;i<=a.length;i++){ d[i]=[i]; for (let j=1;j<=b.length;j++) d[i][j] = i ? Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1]+(a[i-1]===b[j-1]?0:1), (i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]) ? d[i-2][j-2]+1 : 99) : j; } return d[a.length][b.length]; }
function closeWords(w){ const max = w.length<=4 ? 1 : 2, out=[]; for (const [v,c] of vocab()){ if (Math.abs(v.length-w.length)>max) continue; const d=editDist(w,v); if (d<=max) out.push({v,d,c,sub:isSubseq(w,v),pre:prefixLen(w,v)}); } out.sort((a,b)=>a.d-b.d || b.sub-a.sub || b.pre-a.pre || b.c-a.c); return out.filter((x,i)=>!i || (x.d<=out[0].d && (x.sub || x.pre>=2))).map(x=>x.v); }
/* a missed letter ("banna") keeps the rest in order, and typos rarely touch the first letters */
const isSubseq = (w,v) => { let i=0; for (const ch of v) if (ch===w[i]) i++; return i===w.length; };
const prefixLen = (a,b) => { let i=0; while (i<a.length && a[i]===b[i]) i++; return i; };
function fixQuery(q){ const ws=q.toLowerCase().split(/\s+/).filter(Boolean); const V=[...vocab().keys()]; let changed=false, alts=[];
  const out = ws.map(w=>{ if (w.length<3 || !/^[a-z]+$/.test(w) || V.some(v=>v.startsWith(w))) return w; const c=closeWords(w); if (!c.length) return null; changed=true; if (!alts.length) alts=c.slice(1,4).map(a=>ws.map(x=>x===w?a:x).join(" ")); return c[0]; });
  return changed && !out.includes(null) ? {q:out.join(" "), alts} : null; }
function findItems(q, inAisle){ const qw=q.toLowerCase().split(/\s+/).filter(Boolean); const byName = qw.length && ITEMS.some(it=>qw.every(w=>wordStart(w).test(it.name.toLowerCase()))); return ITEMS.filter(it=>inAisle(it) && matches(it,q,!byName)); }
/* diet: vegetarian leaves out meat, fish, gelatin and meat-flavoured items found by name; vegan is only items we tagged vegan.
   Household, personal care and pet items stay in unless their name has meat in it (like chicken cat food). */
const NONFOOD = new Set(["Household","Personal Care","Baby & Pet"]);
const MEATY = /chicken|beef|pork|bacon|\bham\b|turkey|sausage|pepperoni|salami|\bfish|tuna|salmon|shrimp|anchov|meat|jerky|gelatin|jell-?o|marshmallow|gumm|caesar|worcestershire|lard|prosciutto|chorizo|bologna|crab|wiener|hot dogs?\b|spam\b|pizza pop|dumpling|wonton|broth|bouillon|ramen|ramyun|mr\. noodles|instant noodle|cup noodle|bowl noodle|lucky charms|rice side dish|frozen entr|ravioli/i;
const isVeg = it => it.cat!=="Meat & Seafood" && !MEATY.test(it.name+" "+Object.values(it.prices).map(p=>p.product).join(" "));
const isVegan = it => isVeg(it) && (NONFOOD.has(it.cat) || (it.tags||[]).some(t=>t==="vegan"||t==="plant-based"));
S.diet = "";
const dietOk = it => S.diet==="veg" ? isVeg(it) : S.diet==="vegan" ? isVegan(it) : true;
function renderShop(){
  const inAisle = it=>(S.aisle==="All"||it.cat===S.aisle) && dietOk(it);
  const meal = S.meal!=null ? MEALS[S.meal] : null;
  let list = meal ? Object.keys(meal.items).map(id=>byId[id]) : findItems(S.q, inAisle), fixed = null;
  if (typeof renderMealBox==="function") renderMealBox();
  if (!meal && !list.length && S.q){ const f=fixQuery(S.q); if (f){ const l2=findItems(f.q, inAisle); if (l2.length){ list=l2; fixed=f; } } }
  if (typeof renderTags==="function") renderTags();
  if (S.shopSort==="low") list.sort((a,b)=>lowest(a).v-lowest(b).v);
  else if (S.shopSort==="name") list.sort((a,b)=>a.name.localeCompare(b.name));
  else if (S.shopSort==="sale") list.sort((a,b)=>anySale(b)-anySale(a));
  else if (S.shopSort==="unit") list.sort((a,b)=>{ const x=unitPrice(a,lowest(a).v), y=unitPrice(b,lowest(b).v); if (!x||!y) return (!x)-(!y); return x.k-y.k || x.v-y.v; });
  else if (!meal) list.sort((a,b)=>CATS.indexOf(a.cat)-CATS.indexOf(b.cat));
  $("#dietrow").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed", String(b.dataset.diet===S.diet)));
  $("#aisleTitle").textContent = (S.diet && !meal ? (S.diet==="veg"?"Vegetarian · ":"Vegan · ") : "") + (meal ? `What you need for ${meal.name.toLowerCase()} · ${list.length} items` : (S.q ? `Results for “${fixed?fixed.q:S.q}”` : (S.aisle==="All" ? "All aisles" : S.aisle)) + ` · ${list.length} item${list.length===1?"":"s"}`);
  const tryQ = q => `<button type="button" class="linkish" data-tryq="${esc(q)}">${esc(q)}</button>`;
  if (!list.length && S.diet && !meal){ $("#grid").innerHTML = `<div class="empty" style="grid-column:1/-1">No ${S.diet==="veg"?"vegetarian":"vegan"} items here. <button type="button" class="linkish" id="dietOff">Show all items</button></div>`; $("#dietOff").onclick=()=>{ S.diet=""; renderShop(); }; return; }
  if (!list.length){ $("#grid").innerHTML = `<div class="empty" style="grid-column:1/-1">No items match “${esc(S.q)}”. Try a simpler word like ${tryQ("cheese")} or ${tryQ("bread")}.</div>`; wireTry(); return; }
  $("#grid").innerHTML = (S.diet && !meal ? `<p class="fuzzy dietnote">${S.diet==="veg" ? "Showing items without meat, fish or gelatin, judged from the product names." : "Showing items we've checked are vegan. Some vegan items may not be tagged yet."} Always check the label, especially for allergies.</p>` : "") + (fixed ? `<p class="fuzzy" role="status">No items match “${esc(S.q)}”, so here are results for <b>“${esc(fixed.q)}”</b>.${fixed.alts.length?` Or did you mean ${fixed.alts.map(tryQ).join(", ")}?`:""}</p>` : "") + list.map(it=>{
    const k=CATKEY[it.cat], lo=lowest(it), hi=highest(it), q=S.cart[it.id]||0, step=it.unit==="per_kg"?0.5:1;
    const cmp = S.cmp[it.id] ? `<div class="cmp">${CHAINS.map(c=>{ const p=it.prices[c.id]; if(!p) return `<div><span><i class="dot" style="background:${c.color};width:8px;height:8px"></i> ${esc(c.short)}</span><span class="p" style="color:var(--muted)">not listed</span></div>`; const sale=p.regular&&p.regular>p.price; return `<div><span><i class="dot" style="background:${c.color};width:8px;height:8px"></i> ${esc(c.short)}</span><span class="p ${sale?"salep":""}">${money(p.price)}${it.unit==="per_kg"?"/kg":""}</span><span class="pn">${esc(p.product)}${p.size?" · "+esc(p.size):""}${it.unit!=="per_kg"&&unitPrice(it,p.price)?" · "+fmtUnit(unitPrice(it,p.price)):""}</span></div>`; }).join("")}</div>` : "";
    return `<article class="card">
      <div class="thumb" style="background:var(--c-${k})">${ART(it.id)||icon(k)}${anySale(it)?'<span class="salebadge">Sale</span>':""}</div>
      <div class="body"><span class="label" style="font-size:.66rem">${esc(it.cat)}</span><div class="name">${esc(it.name)}</div><div class="size">${esc(it.size)}</div>${brandSelect(it)}
        <div class="from"><span class="rmeta">from</span><span class="price">${money(lo.v)}</span><span class="rmeta">${it.unit==="per_kg"?"/kg":""}</span></div>${it.unit!=="per_kg"&&unitPrice(it,lo.v)?`<div class="unitp">${fmtUnit(unitPrice(it,lo.v))}</div>`:""}
        <div class="range">${money(lo.v)} – ${money(hi)} · sold at ${nStores(it)} of ${CHAINS.length} chains</div>
        ${meal ? (()=>{ const nd=mealNeed(it.id), hv=`<label class="have"><input type="checkbox" data-have="${it.id}"${S.have[it.id]?" checked":""}> I already have this</label>`; return S.have[it.id] ? `<div class="need got">Skipped, you have this at home</div>${hv}` : (q>=nd ? `<div class="need got">✓ Enough in your cart for ${S.serves}</div>` : `<div class="need">You'll need ${fmtNeed(it,nd)} for ${S.serves} ${S.serves===1?"person":"people"}${q>0?` (you have ${q})`:""}</div>`) + hv; })() : ""}
        <button class="compare" type="button" data-cmp="${it.id}" aria-expanded="${!!S.cmp[it.id]}">${S.cmp[it.id]?"Hide store prices":"Compare store prices"}</button>${cmp}</div>
      <div class="foot">${q>0 ? `<div class="stepper"><button type="button" data-d="${it.id}" aria-label="Less ${esc(it.name)}">−</button><label>${qtyInput(it,q,`Amount of ${it.name} in cart${it.unit==="per_kg"?" in kg":""}`)}<span>${it.unit==="per_kg"?"kg":"in cart"}</span></label><button type="button" data-i="${it.id}" aria-label="More ${esc(it.name)}">+</button></div>` : `<button class="btn add" type="button" data-i="${it.id}">Add to cart</button>`}</div>
    </article>`;
  }).join("");
  $("#grid").querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{ const it=byId[b.dataset.i]; const st=it.unit==="per_kg"?0.5:1; S.cart[it.id]=Math.min(QMAX, +(((S.cart[it.id]||0)+(S.cart[it.id]?st:1)).toFixed(2))); saveCart(); renderHeader(); renderShop(); });
  $("#grid").querySelectorAll("[data-d]").forEach(b=>b.onclick=()=>{ const it=byId[b.dataset.d]; const st=it.unit==="per_kg"?0.5:1; const nq=+((S.cart[it.id]||0)-st).toFixed(2); const snap={...S.cart}; if(nq<=0){ delete S.cart[it.id]; offerUndo(`Removed ${it.name} from your cart.`, snap); } else S.cart[it.id]=nq; saveCart(); renderHeader(); renderShop(); });
  wireQty($("#grid"), () => {}, () => renderShop());
  wireBrand($("#grid"), () => renderShop());
  $("#grid").querySelectorAll("[data-have]").forEach(c=>c.onchange=()=>{ if (c.checked) S.have[c.dataset.have]=true; else delete S.have[c.dataset.have]; $("#mealMsg").innerHTML=""; renderShop(); });
  $("#grid").querySelectorAll("[data-cmp]").forEach(b=>b.onclick=()=>{ S.cmp[b.dataset.cmp]=!S.cmp[b.dataset.cmp]; renderShop(); });
  wireTry();
}
function wireTry(){ $("#grid").querySelectorAll("[data-tryq]").forEach(b=>b.onclick=()=>{ S.q=b.dataset.tryq; $("#q").value=S.q; renderShop(); }); }
$("#dietrow").addEventListener("click", e=>{ const b=e.target.closest("button[data-diet]"); if(!b) return; S.diet = S.diet===b.dataset.diet ? "" : b.dataset.diet; exitMeal(); renderShop(); });
$("#q").addEventListener("input", e=>{ exitMeal(); S.q=e.target.value.trim(); if(S.q && S.aisle!=="All"){ S.aisle="All"; renderRail(); } renderShop(); });
const POPULAR = ["Breakfast","Snacks","Quick meal","Lunchbox","Protein","Vegan","Dairy-free","Frozen dessert","Party","Baking"];
function renderTags(){ $("#tagrow").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed", S.q.toLowerCase()===b.dataset.t.toLowerCase())); }
$("#tagrow").insertAdjacentHTML("beforeend", POPULAR.map(t=>`<button type="button" data-t="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join(""));
$("#tagrow").addEventListener("click", e=>{ const b=e.target.closest("button[data-t]"); if(!b) return; const on=b.getAttribute("aria-pressed")==="true"; exitMeal(); S.q=on?"":b.dataset.t; $("#q").value=S.q; if(S.q && S.aisle!=="All"){ S.aisle="All"; renderRail(); } renderShop(); });
/* meal starters: a button shows a meal's groceries, sized for how many people it serves; nothing is added until "Add all to cart".
   items: people one pack feeds, or for items sold by weight, kg per person */
const MEALS = [
  {name:"Pasta night", portion:"A hearty plate each: about 100 g of dry spaghetti with ¼ lb of beef in the sauce.", items:{spaghetti:9, sauce:4, beef:4, parmesan:20, onion:12, garlic:12}},
  {name:"Tacos", portion:"About 2 large tacos each, with ¼ lb of beef between them.", items:{tortilla:4, beef:4, salsa:8, cheddar:8, lettuce:6, tomato:0.08, sour_cream:8}},
  {name:"Chicken stir fry", portion:"About 150 g of chicken and a big scoop of rice each (75 g before cooking).", items:{chicken_breast:0.15, rice:26, frozen_veg:5, soy:20, garlic:12, onion:12}},
  {name:"Chili", portion:"A big bowl each, about 1½ cups.", items:{beef:5, kidney_beans:2.5, diced_tom:5, onion:12, pepper:0.08, sour_cream:10}},
  {name:"Big breakfast", portion:"2 eggs, 3 strips of bacon, 2 slices of toast and a glass of juice each.", items:{eggs:6, bacon:4, bread_white:10, butter:20, oj:5}},
  {name:"Grilled cheese and soup", portion:"One grilled cheese sandwich and a bowl of soup each.", items:{bread_white:10, cheese_slices:12, butter:20, tomato_soup:2}},
  {name:"Burger night", portion:"2 cheeseburgers each.", items:{burgers:5, buns:4, cheese_slices:12, ketchup:20, mustard:20, pickles:15, lettuce:8}},
  {name:"Overnight oats", portion:"One jar each: ½ cup of oats, ½ cup of yogurt and a handful of berries.", items:{oats:25, greek:5, frozen_berry:8, honey:25, almond:15}},
  {name:"Sandwich lunches", portion:"One sandwich each, with about 50 g of turkey.", items:{bread_ww:10, deli_turkey:3, cheese_slices:20, lettuce:10, tomato:0.05, mayo:40}},
].map(m=>({...m, items:Object.fromEntries(Object.entries(m.items).filter(([id])=>byId[id]))}));
const listWords = a => a.length>1 ? a.slice(0,-1).join(", ")+" and "+a.at(-1) : (a[0]||"");
const SERVES_MAX = 20;
S.meal = null; S.serves = 4; S.have = {};
function mealNeed(id, n=S.serves){ const it=byId[id], v=MEALS[S.meal].items[id]; return it.unit==="per_kg" ? cleanQty(it, Math.max(0.2, Math.ceil(n*v*10-1e-9)/10)) : cleanQty(it, Math.ceil(n/v-1e-9)); }
const fmtNeed = (it, q) => it.unit==="per_kg" ? `about ${q} kg` : String(q);
const mealShort = () => MEALS[S.meal].items ? Object.keys(MEALS[S.meal].items).filter(id=>!S.have[id] && (S.cart[id]||0) < mealNeed(id)) : [];
/* a number box whose starting value is replaced by the first digit typed */
function freshNum(inp){ inp.addEventListener("focus", ()=>{ inp.dataset.fresh="1"; inp.select(); });
  inp.addEventListener("beforeinput", e=>{ if (inp.dataset.fresh && /^insert/.test(e.inputType) && inp.selectionStart===inp.selectionEnd) inp.value=""; inp.dataset.fresh=""; });
  inp.addEventListener("keydown", e=>{ if (e.key==="Enter"){ e.preventDefault(); inp.blur(); } }); }
function exitMeal(){ if (S.meal==null) return; S.meal=null; $("#mealMsg").innerHTML=""; renderMealRow(); }
function renderMealRow(){ $("#mealrow").querySelectorAll("button[data-meal]").forEach(b=>b.setAttribute("aria-pressed", String(+b.dataset.meal===S.meal))); }
function renderMealBox(){
  const box=$("#mealBox"); if (S.meal==null){ box.hidden=true; box.innerHTML=""; delete box.dataset.m; return; }
  const m=MEALS[S.meal], n=S.serves;
  if (box.dataset.m!==String(S.meal)){ box.dataset.m=String(S.meal); box.hidden=false;
    box.innerHTML=`<div class="mhead"><h2>${esc(m.name)}</h2><button type="button" class="linkish" id="mealClose">Back to all items</button></div>
      <div class="serves"><label for="serves">Serves</label><span class="numstep"><button type="button" id="servesLess" aria-label="Fewer people">−</button><input id="serves" type="text" inputmode="numeric" maxlength="2" autocomplete="off" value="${n}"><button type="button" id="servesMore" aria-label="More people">+</button></span><span id="servesWord">${n===1?"person":"people"}</span></div>
      <p class="portion" id="portion"></p>
      <p class="rmeta">Amounts below are rounded up to whole packs, so staples like garlic or soy sauce will last for more meals.</p>
      <div class="mfoot"><button type="button" class="btn" id="mealAdd"></button><a href="#checkout" id="mealGo" hidden>Compare stores</a></div>`;
    $("#mealClose").onclick=()=>{ exitMeal(); renderShop(); $("#mealrow").scrollIntoView({block:"nearest"}); };
    const setN=v=>{ S.serves=Math.min(SERVES_MAX, Math.max(1, v)); $("#serves").value=S.serves; $("#mealMsg").innerHTML=""; renderShop(); };
    $("#servesLess").onclick=()=>setN(S.serves-1); $("#servesMore").onclick=()=>setN(S.serves+1);
    const inp=$("#serves"); freshNum(inp);
    inp.addEventListener("input", ()=>{ const v=parseInt(inp.value,10); if (v>=1){ S.serves=Math.min(SERVES_MAX, v); $("#mealMsg").innerHTML=""; renderShop(); } });
    inp.addEventListener("blur", ()=>{ inp.value=S.serves; });
    $("#mealAdd").onclick=()=>{ const added=[], had=[], home=[];
      for (const id of Object.keys(m.items)){ const it=byId[id], need=mealNeed(id); if (S.have[id]){ home.push(it.name.toLowerCase()); continue; } if ((S.cart[id]||0) >= need){ had.push(it.name.toLowerCase()); continue; } S.cart[id]=need; added.push(it.name.toLowerCase()); }
      saveCart(); renderHeader(); renderShop();
      $("#mealMsg").innerHTML = (added.length ? `Added ${esc(listWords(added))} to your cart.` : `Everything for ${esc(m.name.toLowerCase())} is already in your cart.`) + (added.length && had.length ? ` You already had enough ${esc(listWords(had))}.` : "") + (added.length && home.length ? ` Skipped ${esc(listWords(home))}, which you have at home.` : "") + ` <a href="#checkout">Compare stores</a>`; };
  }
  $("#servesLess").disabled = n<=1; $("#servesMore").disabled = n>=SERVES_MAX;
  $("#servesWord").textContent = n===1 ? "person" : "people";
  $("#portion").textContent = m.portion;
  const short=mealShort(), all=Object.keys(m.items).filter(id=>!S.have[id]).length;
  $("#mealAdd").disabled = !short.length;
  $("#mealAdd").textContent = !all ? "You have everything ✓" : !short.length ? "All in your cart ✓" : short.length===all ? `Add all ${all} items to cart` : `Add the other ${short.length} item${short.length===1?"":"s"} to cart`;
  $("#mealGo").hidden = !!all && short.length===all;
}
$("#mealrow").insertAdjacentHTML("beforeend", MEALS.map((m,i)=>`<button type="button" data-meal="${i}" aria-pressed="false" title="Shows the groceries for ${esc(m.name.toLowerCase())}">${esc(m.name)}</button>`).join(""));
$("#mealrow").addEventListener("click", e=>{ const b=e.target.closest("button[data-meal]"); if(!b) return; const i=+b.dataset.meal;
  if (S.meal===i){ exitMeal(); renderShop(); return; }
  S.meal=i; S.have={}; $("#mealMsg").innerHTML=""; S.q=""; $("#q").value=""; if (S.aisle!=="All"){ S.aisle="All"; renderRail(); }
  renderMealRow(); renderShop(); });
$("#shopSort").addEventListener("change", e=>{ S.shopSort=e.target.value; renderShop(); });

/* ---------- checkout: cart */
function renderCart(){
  renderSaved();
  const ids = Object.keys(S.cart).filter(id=>S.cart[id]>0).sort((a,b)=>CATS.indexOf(byId[a].cat)-CATS.indexOf(byId[b].cat));
  $("#cartList").innerHTML = ids.length ? ids.map(id=>{ const it=byId[id], q=S.cart[id]; return `<li><span style="display:flex;gap:10px;align-items:center"><span class="fthumb" style="width:44px;height:33px;flex:none;background:var(--c-${CATKEY[it.cat]})">${ART(it.id)||""}</span><span>${esc(it.name)}<span class="prod">${esc(it.size)}</span></span></span>
      <span class="mini"><button type="button" data-cd="${id}" aria-label="Less">−</button><label>${qtyInput(it,q,`Amount of ${it.name}${it.unit==="per_kg"?" in kg":""}`)}${it.unit==="per_kg"?"<span>kg</span>":""}</label><button type="button" data-ci="${id}" aria-label="More">+</button></span>
      <button class="x" type="button" data-cx="${id}" aria-label="Remove ${esc(it.name)}">×</button>${brandSelect(it,"small row")}</li>`; }).join("")
    : `<li style="grid-template-columns:1fr"><span class="rmeta">Your cart is empty. <a href="#shop">Add groceries</a> to compare stores.</span></li>`;
  const bump = (id, dir) => { const it=byId[id], st=it.unit==="per_kg"?0.5:1; const nq=Math.min(QMAX, +((S.cart[id]||0)+dir*st).toFixed(2)); const snap={...S.cart}; if(nq<=0){ delete S.cart[id]; offerUndo(`Removed ${it.name} from your cart.`, snap); } else S.cart[id]=nq; saveCart(); renderHeader(); renderCheckout(); };
  $("#cartList").querySelectorAll("[data-ci]").forEach(b=>b.onclick=()=>bump(b.dataset.ci,1));
  $("#cartList").querySelectorAll("[data-cd]").forEach(b=>b.onclick=()=>bump(b.dataset.cd,-1));
  wireQty($("#cartList"), () => renderResults(), () => renderCheckout());
  wireBrand($("#cartList"), () => renderCheckout());
  $("#cartList").querySelectorAll("[data-cx]").forEach(b=>b.onclick=()=>{ const snap={...S.cart}; delete S.cart[b.dataset.cx]; offerUndo(`Removed ${byId[b.dataset.cx].name} from your cart.`, snap); saveCart(); renderHeader(); renderCheckout(); });
}
/* ---------- pickup and delivery: where to order online. Only fees we could read on the store's own help pages are shown. */
const PICKUP = {
  nofrills: {svc:"PC Express", url:"https://www.nofrills.ca/", how:"pickup or delivery"},
  zehrs: {svc:"PC Express", url:"https://www.zehrs.ca/", how:"pickup or delivery"},
  independent: {svc:"PC Express", url:"https://www.yourindependentgrocer.ca/", how:"pickup or delivery"},
  superstore: {svc:"PC Express", url:"https://www.realcanadiansuperstore.ca/", how:"pickup or delivery"},
  sobeys: {svc:"Voilà by Sobeys", url:"https://voila.ca/", how:"delivery", extra:"Voilà delivers from its own warehouse, so prices can differ a little from the store."},
  walmart: {svc:"Walmart", url:"https://www.walmart.ca/en", how:"pickup or delivery", fees:"Same Day Delivery is $8.97. Orders under $35 have a $7.97 small order fee (pickup or delivery). Walmart help pages, checked Nov 10, 2026."},
};
const SUPPORT_EMAIL = "basketcheck.support@gmail.com";
/* "Report a wrong price": opens the visitor's own email app with the store filled in; nothing is sent by the site */
function reportUrl(s){ return "mailto:"+SUPPORT_EMAIL+"?subject="+encodeURIComponent("Wrong price at "+s.name)+"&body="+encodeURIComponent("Item:\nPrice on BasketCheck:\nPrice at the store or on its website:\nDate you checked:\n"); }
function pickupBox(c){ const p=PICKUP[c.id]; if (!p) return "";
  return `<div class="pickup"><span><b>Order online for ${p.how}</b> with ${esc(p.svc)}${p.svc==="PC Express"?" (what's offered depends on the store)":""}. ${p.fees ? esc(p.fees) : "Fees and the minimum order are shown on their site before you pay."}${p.extra?" "+esc(p.extra):""}</span><a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.svc)}</a></div>`; }
/* ---------- saved carts (kept in this browser) */
let SAVED = [];
try { SAVED = JSON.parse(localStorage.getItem("wbc-saved")||"[]").filter(x=>x&&x.name&&x.cart); } catch(e){}
const storeSaved = () => { try { localStorage.setItem("wbc-saved", JSON.stringify(SAVED)); } catch(e){} };
$("#wipeData").onclick = ()=>{ try { ["wbc-saved","wbc-cart","wbc-start"].forEach(k=>localStorage.removeItem(k)); ["wbc-cart","wbc-start","wbc-pref","wbc-brand","wbc-budget"].forEach(k=>sessionStorage.removeItem(k)); } catch(e){} S.budget=0; $("#budget").value="";
  SAVED.length=0; S.cart={}; S.start={...START_PRESETS[0]}; S.startPicked=false; S.pending=null; hideUndo(); renderSaved(); renderHeader(); $("#wipeMsg").textContent="Done. Your saved carts, cart and address have been deleted from this browser."; };
/* compares a saved cart's prices (lowest at any store, when saved) with today's */
function priceChanges(x){ const out=[]; if (!x.prices) return out;
  for (const k in x.prices){ const it=byId[k], lo=it && lowest(it); if (!lo || !(x.cart[k]>0)) continue; const d=Math.round((lo.v - x.prices[k])*100)/100; if (Math.abs(d)>=0.01) out.push({it, d, now:lo.v}); }
  return out.sort((a,b)=>Math.abs(b.d)-Math.abs(a.d)); }
function changeBadge(x){ const ch=priceChanges(x); if (!ch.length) return x.prices ? `<span class="pnone">Prices unchanged</span>` : ""; const up=ch.filter(c=>c.d>0).length, dn=ch.length-up;
  return `<span class="pchg">Prices changed: ${[up?`${up} up`:"", dn?`${dn} down`:""].filter(Boolean).join(", ")}</span>`; }
function renderSaved(){
  const n = c => Object.values(c).filter(q=>q>0).length;
  $("#savedList").innerHTML = SAVED.length ? SAVED.map((x,i)=>`<li><span>${esc(x.name)}<span class="prod">${n(x.cart)} item${n(x.cart)===1?"":"s"} · saved ${esc(x.when)}</span>${changeBadge(x)}</span><button class="compare" type="button" data-sl="${i}">Load</button><button class="compare" type="button" data-sd="${i}" style="color:var(--muted)">Delete</button></li>`).join("")
    : `<li style="grid-template-columns:1fr"><span class="rmeta">Save your usual groceries here and load them again any time.</span></li>`;
  $("#savedList").querySelectorAll("[data-sl]").forEach(b=>b.onclick=()=>{ const x=SAVED[+b.dataset.sl]; S.cart={}; for (const k in x.cart) if (byId[k]) { const q=cleanQty(byId[k], x.cart[k]); if (q>0) S.cart[k]=q; } for (const k of Object.keys(BRAND)) setBrand(k, ""); if (x.brand && typeof x.brand==="object") for (const k in x.brand) setBrand(k, String(x.brand[k])); saveCart(); renderHeader(); renderCheckout();
    const ch=priceChanges(x), box=$("#savedChg"); if (box){ box.hidden=!ch.length; box.innerHTML = ch.length ? `<b>Since you saved “${esc(x.name)}”:</b><ul>${ch.slice(0,8).map(c=>`<li>${esc(c.it.name)} ${c.d>0?"went up":"went down"} ${money(Math.abs(c.d))}${c.it.unit==="per_kg"?"/kg":""} (lowest now ${money(c.now)})</li>`).join("")}</ul>${ch.length>8?`<span class="rmeta">and ${ch.length-8} more.</span>`:""}` : ""; } });
  $("#savedList").querySelectorAll("[data-sd]").forEach(b=>b.onclick=()=>{ SAVED.splice(+b.dataset.sd,1); storeSaved(); renderSaved(); });
  if ($("#savedNote")) $("#savedNote").textContent = SAVED.length ? `${SAVED.length} saved` : "None yet";
}
$("#saveForm").onsubmit = e => { e.preventDefault(); if (!cartCount()){ $("#saveName").placeholder="Add items to your cart first"; return; } const name=$("#saveName").value.trim() || `Cart ${SAVED.length+1}`;
  const when=new Date().toLocaleDateString("en-CA",{month:"short",day:"numeric"}); const i=SAVED.findIndex(x=>x.name.toLowerCase()===name.toLowerCase());
  const entry={name, when, cart:{...S.cart}, prices:Object.fromEntries(Object.keys(S.cart).filter(k=>byId[k]&&lowest(byId[k])).map(k=>[k, lowest(byId[k]).v])), brand:Object.fromEntries(Object.entries(BRAND).filter(([k])=>S.cart[k]))}; if (i>=0) SAVED[i]=entry; else SAVED.unshift(entry); storeSaved(); $("#saveName").value=""; $("#saveName").placeholder="Name this cart, e.g. Weekly shop"; renderSaved(); };
$("#clearCart").onclick = ()=>{ const n=cartCount(); if (n) offerUndo(`Cleared ${n} item${n===1?"":"s"} from your cart.`, {...S.cart}); S.cart={}; saveCart(); renderHeader(); renderCheckout(); };
/* undo: the last removal or clear can be taken back for 8 seconds */
let undoSnap=null, undoTimer=0;
function offerUndo(msg, snap){ undoSnap=snap; const u=$("#undo"); u.innerHTML=`<span>${esc(msg)}</span><button type="button" id="undoBtn">Undo</button>`; u.hidden=false; clearTimeout(undoTimer); undoTimer=setTimeout(hideUndo, 8000);
  $("#undoBtn").onclick=()=>{ if (!undoSnap) return; S.cart={...undoSnap}; saveCart(); hideUndo(); renderHeader(); if (!$("#p-checkout").hidden) renderCheckout(); else if (!$("#p-shop").hidden) renderShop(); }; }
function hideUndo(){ clearTimeout(undoTimer); undoSnap=null; $("#undo").hidden=true; $("#undo").innerHTML=""; }

/* ---------- budget and cheaper swaps (the reference is the lowest total for the whole cart) */
S.budget = 0; S.people = 1; S.shared = null;
try { const b=parseFloat(sessionStorage.getItem("wbc-budget")); if (b>0) S.budget=b; } catch(e){}
if (S.budget) $("#budget").value = S.budget;
$("#budget").addEventListener("input", e=>{ const v=parseFloat(String(e.target.value).replace(",", ".")); S.budget = isFinite(v)&&v>0 ? Math.min(5000, v) : 0; try { sessionStorage.setItem("wbc-budget", String(S.budget)); } catch(e){} renderBudget(); });
function refStore(){ const R=rows(); const full=R.filter(r=>!r.b.missing.length).sort((a,b)=>a.b.t-b.b.t||a.tr.min-b.tr.min); return full[0] ? {r:full[0], total:full[0].b.t, full:true} : (()=>{ const r=[...R].sort((a,b)=>a.b.full-b.b.full||a.tr.min-b.tr.min)[0]; return {r, total:r.b.full, full:false}; })(); }
const GENERIC = new Set(["pantry","snacks","breakfast","household","frozen","sweet","dinner","drinks","dairy","quick meal","vegan","protein","party","vegetarian","lunch","meat","sandwich","baking","cleaning","kids","salty","bbq","personal care","bakery","canned","lunchbox","dessert","microwave","healthy","side","fresh","toast","on the go","movie night","spicy","italian","cooking","kitchen","salad","dip","condiment","condiments","fruit","vegetables","veggies","caffeine","gift","canadian","asian"]);
const typeTag = it => (it.tags||[]).find(t=>!GENERIC.has(t)) || "";
function swapIdeas(chain){
  const out=[];
  for (const [id,q] of Object.entries(S.cart)){ if (!(q>0)) continue; const a=byId[id], pa=a.prices[chain]; if (!pa) continue;
    if (a.opts && brandKey(a)!==CHEAP_KEY && brandOpts(a).some(o=>o.k===CHEAP_KEY)){ const pc=optPrices(a,CHEAP_KEY)[chain]; const save=pc ? (pa.price-pc.price)*q*(1+taxRate(a)) : 0; if (save>=0.25){ out.push({a, save, brand:true, label:`“Cheapest available” brand (${pc.product})`}); continue; } }
    const t=typeTag(a); if (!t || a.unit==="per_kg" || !a.uq) continue;
    const ua=unitPrice(a,pa.price); let best=null;
    for (const b of ITEMS){ if (b===a || S.cart[b.id] || b.cat!==a.cat || b.unit==="per_kg" || !b.uq || b.uq[1]!==a.uq[1] || typeTag(b)!==t) continue;
      const r=b.uq[0]/a.uq[0]; if (r<0.75 || r>1.34) continue; const pb=b.prices[chain]; if (!pb) continue;
      if (unitPrice(b,pb.price).v > ua.v) continue;
      const save = pa.price*q*(1+taxRate(a)) - pb.price*q*(1+taxRate(b));
      if (save>=0.5 && (!best || save>best.save)) best={a, b, save, label:`${b.name} (${b.size})`}; }
    if (best) out.push(best); }
  return out.sort((x,y)=>y.save-x.save).slice(0,5);
}
function renderBudget(){
  renderFoldNotes();
  const out=$("#budgetOut"), sw=$("#swaps");
  if (!cartCount()){ out.innerHTML=`<p class="rmeta" style="margin:0">Add groceries to see how your cart fits your budget.</p>`; sw.innerHTML=""; renderShare(); return; }
  const ref=refStore();
  let html = ref.full ? `Lowest total for your whole cart: <b>${money(ref.total)}</b> at ${esc(ref.r.s.name)}.` : `No single store has every item. Lowest estimate: <b>${money(ref.total)}</b> at ${esc(ref.r.s.name)}.`;
  if (S.budget>0){ const left=S.budget-ref.total; html += `<div class="bar${left<0?" over":""}" role="img" aria-label="${Math.round(ref.total/S.budget*100)}% of your budget"><i style="width:${Math.min(100, ref.total/S.budget*100).toFixed(1)}%"></i></div><b class="${left<0?"overtxt":"undertxt"}">${left>=0 ? `${money(left)} under your ${money(S.budget)} budget` : `${money(-left)} over your ${money(S.budget)} budget`}</b>`; }
  out.innerHTML = html;
  const ideas = swapIdeas(ref.r.s.chain);
  sw.innerHTML = ideas.length ? `<h3>Cheaper swaps at ${esc(CH[ref.r.s.chain].short)}</h3><ul class="swaplist">${ideas.map((x,i)=>`<li><span>${esc(x.a.name)} to <b>${esc(x.label)}</b><span class="prod">saves ${money(x.save)}</span></span><button class="compare" type="button" data-sw="${i}">Swap</button></li>`).join("")}</ul>` : `<p class="rmeta" style="margin:0">No cheaper swaps found for this cart at ${esc(CH[ref.r.s.chain].short)}.</p>`;
  sw.querySelectorAll("[data-sw]").forEach(btn=>btn.onclick=()=>{ const x=ideas[+btn.dataset.sw]; if (x.brand) setBrand(x.a.id, CHEAP_KEY); else { const q=S.cart[x.a.id]; delete S.cart[x.a.id]; S.cart[x.b.id]=cleanQty(x.b, q)||1; } saveCart(); renderHeader(); renderCheckout(); });
  renderShare(ref);
}
/* share link: the cart is written into the link (#share=id*qty*brand.id*qty...) */
const encPart = v => encodeURIComponent(v).replace(/\./g,"%2E").replace(/\*/g,"%2A");
function shareCode(){ return Object.entries(S.cart).filter(([,q])=>q>0).map(([id,q])=>id+"*"+q+(BRAND[id]?"*"+encPart(BRAND[id]):"")).join("."); }
function readShare(code){ const out={cart:{}, brand:{}}; for (const part of String(code).split(".")){ const [id,q,b]=part.split("*"); const it=byId[id]; if (!it) continue; const v=cleanQty(it, q); if (v>0){ out.cart[id]=v; if (b) { try { out.brand[id]=decodeURIComponent(b); } catch(e){} } } } return Object.keys(out.cart).length ? out : null; }
const shareUrl = () => location.href.split("#")[0] + "#share=" + shareCode();
function renderShare(ref){
  const n=cartCount();
  $("#shareLink").value = n ? shareUrl() : ""; $("#copyShare").disabled = !n;
  if (!n){ $("#peopleOut").innerHTML=""; return; }
  ref = ref || refStore(); const k=S.people;
  $("#peopleOut").innerHTML = k>1 ? `<b>${money(ref.total/k)} each</b> for ${k} people including you, from the lowest total of ${money(ref.total)} at ${esc(ref.r.s.name)} (HST included).` : `<span class="rmeta">Type 2 or more (counting yourself) to see each person's share.</span>`;
}
freshNum($("#people"));
$("#people").addEventListener("input", e=>{ const v=parseInt(e.target.value,10); if (v>=1){ S.people=Math.min(20, v); renderShare(); } });
$("#people").addEventListener("blur", e=>{ e.target.value=S.people; });
$("#copyShare").onclick = ()=>{ const v=$("#shareLink").value; if (!v) return; const done=t=>{ $("#shareMsg").textContent=t; };
  const fallback=()=>{ const i=$("#shareLink"); i.focus(); i.select(); let ok=false; try { ok=document.execCommand("copy"); } catch(e){} done(ok ? "Link copied." : "Link selected. Press Ctrl+C (or Cmd+C) to copy it."); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(()=>done("Link copied."), fallback); else fallback(); };
function renderSharedBanner(){
  const el=$("#sharedBanner"), sh=S.shared;
  if (!sh){ el.hidden=true; el.innerHTML=""; return; }
  const n=Object.keys(sh.cart).length, mine=cartCount();
  el.hidden=false;
  el.innerHTML = `<span><b>Someone shared a cart with ${n} item${n===1?"":"s"}.</b> ${mine?`Loading it replaces your current cart (${mine} item${mine===1?"":"s"}).`:"Load it to compare stores for it."}</span><span style="display:flex;gap:8px"><button class="btn small ghost" type="button" id="skipShared">No thanks</button><button class="btn small" type="button" id="loadShared">Load shared cart</button></span>`;
  $("#skipShared").onclick=()=>{ S.shared=null; renderSharedBanner(); };
  $("#loadShared").onclick=()=>{ S.cart={...sh.cart}; for (const k of Object.keys(BRAND)) setBrand(k, ""); for (const k in sh.brand) setBrand(k, sh.brand[k]); S.shared=null; saveCart(); renderHeader(); renderCheckout(); };
}

/* ---------- split my cart: two stores close together that beat the cheapest single store by $2 or more */
const SPLIT_KM = 2, SPLIT_MIN_SAVE = 2, SPLIT_EXTRA_MIN = 30;
function bestSplit(R){
  const ids=Object.keys(S.cart).filter(id=>S.cart[id]>0); if (ids.length<2) return null;
  const perMin=TIME_RATE;
  const singles=R.filter(r=>!r.b.missing.length), base=singles.length ? singles.reduce((m,r)=>r.b.t<m.b.t||(r.b.t===m.b.t&&r.tr.min<m.tr.min)?r:m) : null;
  let best=null;
  for (const a of PRICED) for (const b of PRICED){
    if (a===b || a.chain===b.chain || km(a,b)>SPLIT_KM) continue;
    let tot=0; const A=[], B=[];
    for (const id of ids){ const it=byId[id], q=S.cart[id], pa=it.prices[a.chain], pb=it.prices[b.chain]; if (!pa && !pb){ tot=Infinity; break; }
      const ca=pa ? pa.price*q*(1+taxRate(it)) : Infinity, cb=pb ? pb.price*q*(1+taxRate(it)) : Infinity;
      if (ca<=cb){ tot+=ca; A.push({it,q,p:pa}); } else { tot+=cb; B.push({it,q,p:pb}); } }
    if (!isFinite(tot) || !A.length || !B.length) continue;
    const mins = trip(a).min + trip(b, a).min + trip(b).min, score = tot + perMin*mins;
    if (base && mins > 2*base.tr.min + SPLIT_EXTRA_MIN) continue;  /* keep the two-stop trip close to a normal shop */
    if (!best || score<best.score) best={a, b, A, B, tot, mins, score}; }
  /* only worth it if it saves $2+ and still beats the cheapest single store once trip time is weighed the same way as Recommended */
  if (!best || (base && (base.b.t-best.tot < SPLIT_MIN_SAVE || best.score >= base.b.t + perMin*2*base.tr.min))) return null;
  const ord=(x,y)=>CATS.indexOf(x.it.cat)-CATS.indexOf(y.it.cat); best.A.sort(ord); best.B.sort(ord);
  best.base=base; return best;
}
function renderSplit(R){
  const el=$("#split"), sp=bestSplit(R);
  if (!sp){ el.hidden=true; el.innerHTML=""; return; }
  const nm=s=>esc(s.name), apart=km(sp.a,sp.b).toFixed(1), w={walk:"of walking", bike:"of biking", bus:"by bus or ION", car:"of driving"}[S.mode];
  const head = sp.base
    ? `<b>Split your cart and save ${money(sp.base.b.t-sp.tot)}.</b> Buy ${sp.A.length} item${sp.A.length===1?"":"s"} at ${nm(sp.a)} and ${sp.B.length} at ${nm(sp.b)}, about ${apart} km apart. Total ${money(sp.tot)} with HST, vs ${money(sp.base.b.t)} for everything at ${nm(sp.base.s)}.`
    : `<b>Get your whole cart in two stops.</b> No single store has every item, but ${nm(sp.a)} and ${nm(sp.b)}, about ${apart} km apart, have it all between them for ${money(sp.tot)} with HST.`;
  const tripTxt = `Going from ${esc(S.start.name)} to both stores and back is about ${fmtMin(sp.mins)} ${w}${sp.base?`, vs ${fmtMin(2*sp.base.tr.min)} there and back to ${nm(sp.base.s)}`:""}.`;
  const col=(s,L)=>`<div><h4><i class="dot" style="background:${CH[s.chain].color}"></i>${nm(s)}</h4><ul>${L.map(l=>`<li>${esc(l.it.name)} <span class="rmeta">${qtyLabel(l.it,l.q)} × ${money(l.p.price)}${l.it.unit==="per_kg"?"/kg":""}</span></li>`).join("")}</ul></div>`;
  const url = `https://www.google.com/maps/dir/?api=1&origin=${S.start.lat},${S.start.lon}&destination=${S.start.lat},${S.start.lon}&waypoints=${encodeURIComponent(storeDest(sp.a)+"|"+storeDest(sp.b))}&travelmode=${GMODE[S.mode]}`;
  el.hidden=false;
  el.innerHTML = `<div>${head} ${tripTxt}</div>${S.splitOpen?`<div class="cols">${col(sp.a,sp.A)}${col(sp.b,sp.B)}</div>`:""}<div class="acts"><button class="compare" type="button" id="splitToggle" aria-expanded="${!!S.splitOpen}">${S.splitOpen?"Hide":"Show"} which items go where</button><a href="${url}" target="_blank" rel="noopener">Two-stop directions in Google Maps</a></div>`;
  $("#splitToggle").onclick=()=>{ S.splitOpen=!S.splitOpen; renderSplit(rows()); };
}

/* ---------- checkout: start + mode */
function renderStart(){
  const custom = !START_PRESETS.some(p=>p.id===S.start.id);
  $("#startSel").innerHTML = START_PRESETS.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("") + (custom?`<option value="pin">${S.start.id==="addr" ? "Your address: "+esc(S.start.name) : `Pin on map (${S.start.lat.toFixed(4)}, ${S.start.lon.toFixed(4)})`}</option>`:"");
  $("#startSel").value = custom ? "pin" : S.start.id;
}
$("#startSel").addEventListener("change", e=>{ const p=START_PRESETS.find(x=>x.id===e.target.value); if(!p) return; setStart({...p}); });
/* travel mode: the list is redrawn in place, and if the bar is stuck above the list the page is nudged so the list stays exactly where it was (the best-pick card above it can change height) */
document.querySelectorAll("#mode button").forEach(b=>b.onclick=()=>{ const list=$("#receipts"), before=list.getBoundingClientRect().top, stuck=before<innerHeight && $("#modeBar").getBoundingClientRect().top<=parseFloat(getComputedStyle($("#modeBar")).top)+1;
  S.mode=b.dataset.m; document.querySelectorAll("#mode button").forEach(x=>x.setAttribute("aria-pressed", String(x===b))); renderCheckout();
  if (stuck){ const d=list.getBoundingClientRect().top-before; if (Math.abs(d)>0.5) scrollBy(0, d); } });
document.querySelectorAll("#zoom button").forEach(b=>b.onclick=()=>{ S.zoom=b.dataset.z; document.querySelectorAll("#zoom button").forEach(x=>x.setAttribute("aria-pressed", String(x===b))); renderMap(); });
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{ S.sort=b.dataset.s; document.querySelectorAll(".tabs button").forEach(x=>x.setAttribute("aria-pressed", String(x===b))); renderResults(); });
$("#applyPin").onclick = ()=>{ if(!S.pending) return; setStart({id:"pin", name:"Your pin", lat:S.pending.lat, lon:S.pending.lon}); };

/* ---------- address autofill: Photon (free OpenStreetMap search built for type-ahead), limited to Waterloo Region */
const REGION = {w:-80.75, n:43.62, e:-80.20, s:43.28};
function addrMsg(html){ const m=$("#addrMsg"); m.innerHTML=html; m.hidden=!html; }
const featLabel = f => { if (f.esri){ const i=f.text.indexOf(","); return i<0 ? {main:f.text, area:""} : {main:f.text.slice(0,i), area:f.text.slice(i+1).replace(/,\s*CAN$/,"").trim()}; } const p=f.properties||{}; const street=[p.housenumber, p.street].filter(Boolean).join(" ");
  const main = p.housenumber ? street : (p.name || street || p.street || "");
  const area = [p.housenumber||!p.name ? "" : street, p.city || p.town || p.district || p.county].filter(Boolean).join(", ");
  return {main, area}; };
const AC = {items:[], active:-1, timer:null, ctl:null, seq:0, forQ:""};
const ABBR = {rd:"road", st:"street", ave:"avenue", av:"avenue", dr:"drive", blvd:"boulevard", cres:"crescent", cr:"crescent", ct:"court", pl:"place", ln:"lane", hwy:"highway", pkwy:"parkway", n:"north", s:"south", e:"east", w:"west", ne:"northeast", nw:"northwest", se:"southeast", sw:"southwest"};
const normWords = t => String(t).toLowerCase().replace(/[.,]/g," ").split(/\s+/).filter(Boolean).map(w=>ABBR[w]||w);
/* suggestions that contain more of the typed words come first (Rd = Road, N = North, ...) */
function rankByWords(list, q){ const qw=normWords(q); return list.map((f,i)=>{ const l=featLabel(f), hw=new Set(normWords(l.main+" "+l.area)); return {f,i,n:qw.filter(w=>hw.has(w)).length}; }).sort((a,b)=>b.n-a.n||a.i-b.i).map(x=>x.f); }
function acClose(){ $("#addrList").hidden=true; $("#addr").setAttribute("aria-expanded","false"); AC.active=-1; }
function acRender(note){
  const list=$("#addrList");
  list.innerHTML = note ? `<li class="note">${note}</li>` : AC.items.map((f,i)=>{ const l=featLabel(f); return `<li role="option" id="ac-${i}" data-ai="${i}" aria-selected="${i===AC.active}">${esc(l.main)}${l.area?`<span>${esc(l.area)}</span>`:""}</li>`; }).join("");
  list.hidden=false; $("#addr").setAttribute("aria-expanded","true");
  $("#addr").setAttribute("aria-activedescendant", AC.active>=0 ? "ac-"+AC.active : "");
  list.querySelectorAll("[data-ai]").forEach(li=>li.onmousedown=e=>{ e.preventDefault(); acPick(AC.items[+li.dataset.ai]); });
}
async function acPick(f){
  if (f.esri && !f.geometry){ addrMsg("Looking up your address…");
    try { const j=await getJSON(`${ESRI_GEO}/findAddressCandidates?singleLine=${encodeURIComponent(f.text)}&magicKey=${encodeURIComponent(f.magicKey)}&f=json&maxLocations=1`, 4000); const c=(j.candidates||[])[0]; if(!c) throw new Error("none"); f.geometry={coordinates:[c.location.x, c.location.y]}; }
    catch(e){ addrMsg("Couldn't find that address on the map. Try another suggestion, or click the map to drop a pin."); return; } }
  const l=featLabel(f); const [lon,lat]=f.geometry.coordinates; acClose(); addrMsg(""); $("#addr").value=""; AC.items=[]; setStart({id:"addr", name:[l.main,l.area].filter(Boolean).join(", "), lat:+lat, lon:+lon}); }
/* address suggestions: Esri's geocoder first (fast), the free Photon service as a backup; each gets 3 s */
const ESRI_GEO = "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer";
async function getJSON(url, ms, outer){
  const ctl = typeof AbortController!=="undefined" ? new AbortController() : null; let timedOut=false;
  const t = ctl ? setTimeout(()=>{ timedOut=true; ctl.abort(); }, ms) : null;
  const relay = ()=>ctl && ctl.abort(); if (outer) outer.addEventListener("abort", relay);
  try { const r=await fetch(url, ctl?{signal:ctl.signal}:{}); if(!r.ok) throw new Error(r.status); return await r.json(); }
  catch(err){ if (timedOut) throw new Error("timeout"); throw err; }
  finally { clearTimeout(t); if (outer) outer.removeEventListener("abort", relay); }
}
async function esriSuggest(q, sig){
  const j=await getJSON(`${ESRI_GEO}/suggest?text=${encodeURIComponent(q)}&f=json&countryCode=CAN&searchExtent=${REGION.w},${REGION.s},${REGION.e},${REGION.n}&location=${S.start.lon},${S.start.lat}&maxSuggestions=6`, 3000, sig);
  if (j.error) throw new Error("esri");
  return (j.suggestions||[]).filter(x=>x.text && x.magicKey && !x.isCollection).map(x=>({esri:true, text:x.text, magicKey:x.magicKey}));
}
async function photonSuggest(q, sig){
  const j=await getJSON(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=6&lang=en&bbox=${REGION.w},${REGION.s},${REGION.e},${REGION.n}&lat=${S.start.lat}&lon=${S.start.lon}`, 3000, sig);
  return (j.features||[]).filter(f=>f.geometry&&f.geometry.coordinates&&featLabel(f).main);
}
async function acSearch(q){
  const my=++AC.seq; if (AC.ctl) AC.ctl.abort(); AC.ctl = typeof AbortController!=="undefined" ? new AbortController() : null; const sig=AC.ctl&&AC.ctl.signal;
  let found=null;
  for (const provider of [esriSuggest, photonSuggest]){
    try { found = await provider(q, sig); break; }
    catch(err){ if (sig && sig.aborted) return null; }   /* a newer keystroke replaced this search: not a failure */
  }
  if (my!==AC.seq) return null;
  if (found===null){ AC.items=[]; acRender("Address search isn't available right now. Pick a spot from the list or click the map instead."); return null; }
  const seen=new Set(); AC.items=found.filter(f=>{ const l=featLabel(f), k=(l.main+"|"+l.area).toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true; });
  AC.items=rankByWords(AC.items, q).slice(0,6); AC.forQ=q; AC.active=AC.items.length?0:-1; return AC.items;
}
$("#addr").addEventListener("input", ()=>{
  const q=$("#addr").value.trim(); clearTimeout(AC.timer); addrMsg("");
  if (q.length<3){ AC.items=[]; acClose(); return; }
  AC.timer=setTimeout(async ()=>{ const r=await acSearch(q); if (r===null) return; if (r.length) acRender(); else acRender(`No matches in Waterloo Region yet. Keep typing, e.g. add the city.`); }, 250);
});
$("#addr").addEventListener("keydown", e=>{
  if ($("#addrList").hidden || !AC.items.length){ if(e.key==="Escape") acClose(); return; }
  if (e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); AC.active=(AC.active+(e.key==="ArrowDown"?1:-1)+AC.items.length)%AC.items.length; acRender(); }
  else if (e.key==="Escape"){ acClose(); }
});
$("#addr").addEventListener("blur", ()=>setTimeout(acClose, 150));
$("#addrForm").onsubmit = async e => {
  e.preventDefault(); clearTimeout(AC.timer);
  const q=$("#addr").value.trim(); if(!q){ addrMsg("Type your street address first."); return; }
  if (!$("#addrList").hidden && AC.items.length && AC.forQ===q) return acPick(AC.items[Math.max(0,AC.active)]);
  addrMsg("Looking up your address…");
  const r=await acSearch(q); if (r===null){ if(!AC.items.length) addrMsg("Address search isn't available right now. Pick a spot from the list or click the map to drop a pin instead."); acClose(); return; }
  if (!r.length){ addrMsg(`No address in Waterloo Region matched “${esc(q)}”. Try adding the street number and city, e.g. “200 University Ave W, Waterloo”.`); return; }
  addrMsg(""); if (r.length===1) return acPick(r[0]); acRender();
};

/* ---------- Google Maps directions (opens maps.google.com; no API key needed) */
const DIR_WORD = {walk:"Walking", bike:"Biking", bus:"Transit", car:"Driving"};
const GMODE = {walk:"walking", bike:"bicycling", bus:"transit", car:"driving"};
const storeDest = s => /\d/.test(s.addr) && !s.approx ? `${s.name}, ${s.addr}, ${s.city}, ON` : `${s.lat},${s.lon}`;
const dirUrl = s => `https://www.google.com/maps/dir/?api=1&origin=${S.start.lat},${S.start.lon}&destination=${encodeURIComponent(storeDest(s))}&travelmode=${GMODE[S.mode]}`;
const embedUrl = s => `https://maps.google.com/maps?q=${encodeURIComponent(storeDest(s))}&z=15&output=embed`;
$("#cancelPin").onclick = ()=>{ S.pending=null; renderMap(); $("#applyRow").hidden=true; };

/* ---------- map */
const LAT0=43.455, COS0=Math.cos(LAT0*Math.PI/180);
const toKm=(lat,lon)=>({x:(lon+80.5)*111.32*COS0, y:(LAT0-lat)*110.57});
const fromKm=(x,y)=>({lat:LAT0-y/110.57, lon:x/(111.32*COS0)-80.5});
const LANDMARKS=[["UW",43.4705,-80.5445],["Uptown",43.4655,-80.5225],["Conestoga Mall",43.4985,-80.528],["Downtown Kitchener",43.4495,-80.4895],["Fairview Park",43.4225,-80.4385],["The Boardwalk",43.4345,-80.567],["Cambridge",43.398,-80.31]];
const ION=[[43.4977,-80.5281],[43.4908,-80.5375],[43.4830,-80.5430],[43.4743,-80.5409],[43.4725,-80.5310],[43.4648,-80.5228],[43.4565,-80.5115],[43.4530,-80.5000],[43.4510,-80.4925],[43.4475,-80.4855],[43.4380,-80.4720],[43.4300,-80.4610],[43.4220,-80.4405]];
let MAPGEO=null;
/* the YOU pin: a black teardrop with a white centre and a YOU tag, so it never looks like a store dot */
const PIN_PATH = "M0 0C-4 -9 -12 -14 -12 -24A12 12 0 1 1 12 -24C12 -14 4 -9 0 0Z";
/* read a colour token from :root, for the map library and inline SVG that can't use CSS variables */
const tok = n => getComputedStyle(document.documentElement).getPropertyValue("--"+n).trim();
const pinSvg = (ghost) => `<svg width="34" height="44" viewBox="-17 -40 34 44" aria-hidden="true"><ellipse cx="0" cy="1" rx="7" ry="2.5" fill="${tok("pin-shadow")}"/><path d="${PIN_PATH}" fill="${tok("pin")}" stroke="${tok("surface")}" stroke-width="2.5"${ghost?' opacity=".55"':""}/><circle cx="0" cy="-24" r="5" fill="${tok("surface")}"/></svg>`;
const darkText = hex => { const n=parseInt(hex.slice(1),16), r=n>>16, g=(n>>8)&255, b=n&255; return (0.299*r+0.587*g+0.114*b) > 160; };
/* rank of each priced store in the list below (empty when the cart is empty) */
const mapRank = () => S.rank || {};
/* Street map: Leaflet + Esri street tiles. Falls back to the drawn map if either can't load. */
let MAPMODE = typeof L!=="undefined" ? "street" : "drawn", LMAP=null, LLAYER=null, LFIT="";
const tipHtml = s => { const tr=trip(s); return `<b>${esc(s.name)}</b>${esc(s.addr)}, ${esc(s.city)}<br><span class="mono">${tr.d.toFixed(1)} km · ${fmtMin(tr.min)} ${MODE_WORD[S.mode]}</span>${s.chain?"":"<br><i>No online prices</i>"}${s.approx?"<br><i>Approximate location</i>":""}`; };
const nearPool = () => S.zoom==="near" ? STORES.filter(s=>s.lat>43.43 && s.lat<43.515 && s.lon>-80.59 && s.lon<-80.47) : STORES;
function useDrawnMap(){ MAPMODE="drawn"; $("#lmap").hidden=true; $("#map").style.display=""; renderMap(); }
function initStreetMap(){
  $("#map").style.display="none"; $("#lmap").hidden=false;
  LMAP = L.map("lmap", {scrollWheelZoom:false, zoomSnap:0.5});  /* +/- buttons, double-click zoom, drag to pan and touch-screen pinch stay on (Leaflet defaults) */
  const tiles = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {maxZoom:19, attribution:'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community'});
  let loaded=false, failed=0;
  tiles.on("tileload", ()=>{ loaded=true; });
  tiles.on("tileerror", ()=>{ if(!loaded && ++failed>=3 && MAPMODE==="street"){ LMAP.remove(); LMAP=null; useDrawnMap(); } });
  tiles.addTo(LMAP);
  LLAYER = L.layerGroup().addTo(LMAP);
  if (typeof ResizeObserver!=="undefined") new ResizeObserver(()=>{ if (LMAP) fitStreetMap(false); }).observe($("#lmap"));
  LMAP.on("click", e=>{ S.pending={lat:e.latlng.lat, lon:e.latlng.lng}; $("#applyRow").hidden=false; renderMap(); });
  /* Trackpad pinch over the map zooms the map, never the page. Chrome, Edge and Firefox send a pinch as a wheel event with ctrlKey set;
     Safari sends gesture events. A plain two-finger scroll is left alone, so it always scrolls the page. Zoom steps follow zoomSnap,
     so the pinch is added up and the map moves each time it crosses a half step. */
  const box=$("#lmap"); let pz=null, pzT=0, gz=null, gpt=null;
  const zoomTo=(z, pt)=>{ z=Math.max(LMAP.getMinZoom(), Math.min(LMAP.getMaxZoom(), z)); LMAP.setZoomAround(pt, z, {animate:false}); return z; };
  box.addEventListener("wheel", e=>{ if (!e.ctrlKey || !LMAP) return; e.preventDefault(); if (gz!=null) return;
    pz = zoomTo((pz==null ? LMAP.getZoom() : pz) - e.deltaY*(e.deltaMode===1 ? 0.05 : 0.01), LMAP.mouseEventToContainerPoint(e));
    clearTimeout(pzT); pzT=setTimeout(()=>{ pz=null; }, 250); }, {passive:false});
  box.addEventListener("gesturestart", e=>{ e.preventDefault(); if (!LMAP) return; gz=LMAP.getZoom(); gpt=LMAP.mouseEventToContainerPoint(e); }, {passive:false});
  box.addEventListener("gesturechange", e=>{ e.preventDefault(); if (LMAP && gz!=null && e.scale>0) zoomTo(gz+Math.log2(e.scale), gpt); }, {passive:false});
  box.addEventListener("gestureend", e=>{ e.preventDefault(); gz=null; }, {passive:false});
}
/* fit only once the box has its real size; a ResizeObserver refits when the width changes */
function fitStreetMap(force){ if (!LMAP) return; const el=$("#lmap"), key=`${S.zoom}|${S.start.lat}|${S.start.lon}|${el.clientWidth}`; if (!el.clientWidth || (!force && key===LFIT)) return; LFIT=key; LMAP.invalidateSize(false); const pts=nearPool().map(s=>[s.lat,s.lon]).concat([[S.start.lat,S.start.lon]]); LMAP.fitBounds(L.latLngBounds(pts), {padding:[24,24]}); }
function renderStreetMap(){
  if (!LMAP){ initStreetMap(); if (MAPMODE!=="street") return; }
  LMAP.invalidateSize(false);
  LLAYER.clearLayers();
  L.polyline(ION, {color:tok("map-ion"), weight:4, opacity:.7, interactive:false}).addTo(LLAYER);
  [2,5,10].forEach(r=>L.circle([S.start.lat,S.start.lon], {radius:r*1000, color:tok("accent"), weight:1.5, dashArray:"4 6", fill:false, interactive:false}).addTo(LLAYER));
  STORES.filter(s=>!s.chain).forEach(s=>{ const m=L.circleMarker([s.lat,s.lon], {radius:5, color:tok("map-other"), weight:1.5, fillColor:tok("surface"), fillOpacity:1}).bindTooltip(tipHtml(s), {direction:"top", offset:[0,-6]}).addTo(LLAYER);
    m.on("click", e=>{ L.DomEvent.stopPropagation(e); m.openTooltip(); }); });
  [2,5,10].forEach(r=>{ L.marker([S.start.lat+r/110.57, S.start.lon], {interactive:false, keyboard:false, icon:L.divIcon({className:"lring", html:`${r} km`, iconSize:[40,14], iconAnchor:[20,16]})}).addTo(LLAYER); });
  const RK=mapRank();
  STORES.filter(s=>s.chain).forEach(s=>{ const rk=RK[s.i], col=CH[s.chain].color, sz=rk? (rk===1?28:24) : 16, hi=S.open===s.i;
    const m=L.marker([s.lat,s.lon], {zIndexOffset: rk? 500-rk : 0, title:`${s.name}${rk?` (rank ${rk})`:""}`, icon:L.divIcon({className:"", html:`<span class="lstore${darkText(col)?" dark":""}${hi?" hi":""}" style="width:${sz}px;height:${sz}px;background:${col}">${rk||""}</span>`, iconSize:[sz,sz], iconAnchor:[sz/2,sz/2]})}).bindTooltip(tipHtml(s), {direction:"top", offset:[0,-sz/2]}).addTo(LLAYER);
    m.on("click", e=>{ L.DomEvent.stopPropagation(e); S.open=s.i; renderResults(); renderMap(); const el=document.getElementById("r-"+s.i); if(el) el.scrollIntoView({block:"nearest", behavior:"smooth"}); }); });
  L.marker([S.start.lat,S.start.lon], {zIndexOffset:2000, title:"You: "+S.start.name, icon:L.divIcon({className:"lyou", html:pinSvg(false)+'<span class="tagyou">YOU</span>', iconSize:[34,44], iconAnchor:[17,40]})}).bindTooltip(`<b>You start here</b>${esc(S.start.name)}`, {direction:"top", offset:[0,-40]}).addTo(LLAYER);
  if (S.pending) L.marker([S.pending.lat,S.pending.lon], {zIndexOffset:1900, interactive:false, icon:L.divIcon({className:"lyou", html:pinSvg(true)+'<span class="tagyou" style="opacity:.75">NEW?</span>', iconSize:[34,44], iconAnchor:[17,40]})}).addTo(LLAYER);
  const key = `${S.zoom}|${S.start.lat}|${S.start.lon}`;
  fitStreetMap(false);
}
function renderMap(){
  if (MAPMODE==="street"){ renderStreetMap(); if (MAPMODE==="street"){ renderLegend(); return; } }
  renderSvgMap(); renderLegend();
}
function renderLegend(){
  const n=cartCount(), rk=Object.keys(mapRank()).length>0, SORTW={rec:"Recommended", price:"Lowest price", time:"Shortest trip"}[S.sort];
  $("#mapTitle").innerHTML = rk ? `<b>Map: your starting point and the ${PRICED.length} stores ranked for your cart</b><span>Numbers match the list below (sorted by ${SORTW}).</span>` : `<b>Map: your starting point and the grocery stores around it</b><span>Add items to your cart and each store gets its rank number here.</span>`;
  const W=tok("surface"), dotSvg = (fill, num, stroke=W) => `<svg viewBox="0 0 34 30" aria-hidden="true"><circle cx="17" cy="15" r="11" fill="${fill}" stroke="${stroke}" stroke-width="2"/>${num?`<text x="17" y="19" text-anchor="middle" font-size="11" font-weight="800" fill="${tok("on-accent")}">${num}</text>`:""}</svg>`;
  const wasOpen = !!($("#legend details") && $("#legend details").open);
  $("#legend").innerHTML = `<details class="mapkey"${wasOpen?" open":""}><summary>What the map shows</summary><ul>
    <li><svg viewBox="-17 -40 34 44" aria-hidden="true"><path d="${PIN_PATH}" fill="${tok("pin")}" stroke="${W}" stroke-width="2.5"/><circle cx="0" cy="-24" r="5" fill="${W}"/></svg><div><b>You</b>: where your trip starts (${esc(S.start.name)}). <span>Change it with the address box, the list above, or by clicking the map.</span></div></li>
    <li>${dotSvg(tok("accent"), rk?"1":"")}<div><b>Stores we compare</b>, coloured by chain (colours below). ${rk?`<span>The number is the store's place in the list below; 1 is the top pick. A dark ring marks the store whose receipt is open.</span>`:`<span>Click one to see its receipt once your cart has items.</span>`}</div></li>
    <li>${dotSvg(W, "", tok("map-other"))}<div><b>Other grocers</b> <span>(Food Basics, FreshCo, Costco and others) that don't post prices online, shown so you know they're there.</span></div></li>
    <li><svg viewBox="0 0 34 30" aria-hidden="true"><circle cx="17" cy="15" r="12" fill="none" stroke="${tok("accent")}" stroke-width="1.5" stroke-dasharray="3 4"/></svg><div><b>Distance rings</b> <span>at 2, 5 and 10 km in a straight line from you. Real trips are a bit longer.</span></div></li>
    <li><svg viewBox="0 0 34 30" aria-hidden="true"><path d="M3 22 L14 12 L22 17 L31 7" fill="none" stroke="${tok("map-ion")}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".75"/></svg><div><b>ION light rail</b> <span>(approximate route).</span></div></li>
    <li><svg viewBox="0 0 34 30" aria-hidden="true"></svg><div><b>Moving around</b> <span>drag to move the map, pinch or use + and − to zoom, and click an empty spot to move your YOU pin there.</span></div></li>
  </ul><div class="chainkey"><span style="font-weight:600;color:var(--ink)">Chain colours:</span>${CHAINS.map(c=>`<span><i class="dot" style="background:${c.color}"></i> ${esc(c.name)}</span>`).join("")}</div></details>`;
}
function renderSvgMap(){
  const pool = nearPool();
  const all = pool.map(s=>toKm(s.lat,s.lon)).concat([toKm(S.start.lat,S.start.lon)]).concat(S.pending?[toKm(S.pending.lat,S.pending.lon)]:[]);
  const pad=S.zoom==="near"?0.6:1; let minX=Math.min(...all.map(p=>p.x))-pad, maxX=Math.max(...all.map(p=>p.x))+pad, minY=Math.min(...all.map(p=>p.y))-pad, maxY=Math.max(...all.map(p=>p.y))+pad;
  const VW=1000, Sc=VW/(maxX-minX), VH=Math.round((maxY-minY)*Sc);
  MAPGEO={minX,minY,Sc};
  const P=(lat,lon)=>{ const k=toKm(lat,lon); return [(k.x-minX)*Sc,(k.y-minY)*Sc]; };
  let g="";
  for(let x=Math.ceil(minX);x<maxX;x++) g+=`<line class="grid" x1="${(x-minX)*Sc}" y1="0" x2="${(x-minX)*Sc}" y2="${VH}"/>`;
  for(let y=Math.ceil(minY);y<maxY;y++) g+=`<line class="grid" x1="0" y1="${(y-minY)*Sc}" x2="${VW}" y2="${(y-minY)*Sc}"/>`;
  g+=`<polyline class="ion" points="${ION.map(p=>P(p[0],p[1]).join(",")).join(" ")}"/>`;
  const me=P(S.start.lat,S.start.lon);
  /* markers are sized in screen pixels (K = viewBox units per pixel), so they stay readable on a phone */
  const pxW=$("#map").clientWidth||$("#mapwrap").clientWidth||VW, K=Math.max(0.6, VW/pxW);
  const at=(x,y,inner)=>`<g transform="translate(${x},${y}) scale(${K})">${inner}</g>`;
  [2,5,10].forEach(r=>{ g+=`<circle class="ring" cx="${me[0]}" cy="${me[1]}" r="${r*Sc}"/>`+at(me[0], me[1]-r*Sc, `<text class="ringlbl" y="-4" text-anchor="middle">${r} km</text>`); });
  LANDMARKS.forEach(l=>{ const p=P(l[1],l[2]); g+=at(p[0],p[1],`<text class="lm" text-anchor="middle">${l[0]}</text>`); });
  STORES.filter(s=>!s.chain).forEach(s=>{ const p=P(s.lat,s.lon); g+=at(p[0],p[1],`<circle class="st off" r="4.5" data-s="${s.i}"/>`); });
  const RK=mapRank();
  STORES.filter(s=>s.chain).sort((a,b)=>(RK[b.i]||99)-(RK[a.i]||99)).forEach(s=>{ const p=P(s.lat,s.lon), rk=RK[s.i], col=CH[s.chain].color, r=rk?(rk===1?13:11):7; g+=at(p[0],p[1],`<circle class="st ${S.open===s.i?"hi":""}" r="${r}" fill="${col}" data-s="${s.i}"/>`+(rk?`<text class="snum${darkText(col)?" dark":""}" y="4" text-anchor="middle">${rk}</text>`:"")); });
  const youPin = (x,y,ghost,label) => at(x,y,`<g class="youpin${ghost?" ghost":""}"><ellipse cx="0" cy="1" rx="7" ry="2.5" fill="${tok("pin-shadow")}"/><path d="${PIN_PATH}"/><circle class="hole" cx="0" cy="-24" r="5"/><rect x="15" y="-44" width="${label.length*9+12}" height="20" rx="4"/><text x="21" y="-29">${label}</text></g>`);
  g+=youPin(me[0],me[1],false,"YOU");
  if (S.pending){ const pp=P(S.pending.lat,S.pending.lon); g+=youPin(pp[0],pp[1],true,"NEW?"); }
  const svg=$("#map"); svg.setAttribute("viewBox",`0 0 ${VW} ${VH}`); svg.innerHTML=g;
}
if (typeof ResizeObserver!=="undefined"){ let lastW=0; new ResizeObserver(()=>{ const w=$("#map").clientWidth; if (MAPMODE==="drawn" && w && Math.abs(w-lastW)>20){ lastW=w; renderSvgMap(); } }).observe($("#mapwrap")); }
function svgPoint(e){ const svg=$("#map"); const pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); }
function showTip(t){
  const tip=$("#tip");
  if (t.dataset && t.dataset.s!=null){ const s=STORES[+t.dataset.s], tr=trip(s); const wrap=$("#mapwrap").getBoundingClientRect(); const r=t.getBoundingClientRect();
    tip.innerHTML=tipHtml(s);
    tip.style.left=(r.left+r.width/2-wrap.left)+"px"; tip.style.top=(r.top-wrap.top)+"px"; tip.hidden=false; }
  else tip.hidden=true;
}
$("#map").addEventListener("mousemove", e=>showTip(e.target));
$("#map").addEventListener("pointerleave", e=>{ if (e.pointerType==="mouse") $("#tip").hidden=true; });
$("#map").addEventListener("click", e=>{
  const t=e.target;
  if (t.dataset && t.dataset.s!=null){ const s=STORES[+t.dataset.s]; if(!s.chain){ showTip(t); return; } if(s.chain){ S.open=s.i; renderResults(); renderMap(); const el=document.getElementById("r-"+s.i); if(el) el.scrollIntoView({block:"nearest", behavior:"smooth"}); } return; }
  const p=svgPoint(e); S.pending=fromKm(p.x/MAPGEO.Sc+MAPGEO.minX, p.y/MAPGEO.Sc+MAPGEO.minY); $("#applyRow").hidden=false; renderMap();
});

/* ---------- checkout: results */
function rows(){
  return PRICED.map(s=>({s, tr:trip(s), b:chainTotal(s.chain)}));
}
/* the trade-off in prices and minutes only (no dollar value on time) */
function whyTrade(top, cheapest, fastest){
  const w = MODE_WORD[S.mode], out=[];
  if (cheapest!==top && cheapest.b.full<top.b.full-0.005 && cheapest.tr.min>top.tr.min) out.push(`${esc(cheapest.s.name)} is ${money(top.b.full-cheapest.b.full)} cheaper but a ${cheapest.tr.min-top.tr.min} min longer ${w} each way, so the shorter trip wins.`);
  if (fastest!==top && fastest.tr.min<top.tr.min && fastest.b.full>top.b.full+0.005) out.push(`${esc(fastest.s.name)} is ${top.tr.min-fastest.tr.min} min closer but ${money(fastest.b.full-top.b.full)} more, so the lower price wins.`);
  return out.join(" ");
}
function whyRec(top, cheapest, fastest, pMin, tMin, R){
  const m=top.b.missing.length, cost = top.b.full-pMin<0.005 ? "the cheapest basket" : `a basket ${money(top.b.full-pMin)} more than the cheapest`, trip = top.tr.min-tMin===0 ? "the shortest trip" : `a trip ${top.tr.min-tMin} min longer each way than the shortest`;
  const parts = [`<b>Why ${esc(top.s.name)} is recommended:</b>`, m ? `It has ${cost} and ${trip}, but it's missing ${m} of your item${m===1?"":"s"}.` : `It has everything in your cart, ${cost} and ${trip}.`, whyTrade(top, cheapest, fastest)];
  if (m) { const names=top.b.missing.map(x=>x.it.name.toLowerCase()); const list = names.length<=3 ? (names.length>1 ? names.slice(0,-1).join(", ")+" and "+names.at(-1) : names[0]) : names.slice(0,2).join(", ")+` and ${names.length-2} more`; parts.push(`<span class="warn"><b>Heads up:</b> ${esc(top.s.name)} doesn't list ${esc(list)} online, so you may need a second stop for ${m===1?"it":"them"}.</span>`); }
  if (R.some(r=>r.b.missing.length)) parts.push("For stores missing items, we add what those items cost on average elsewhere so baskets compare fairly.");
  return parts.filter(Boolean).join(" ");
}
/* the one clear answer: the Recommended store, whatever sort tab is showing */
function renderAnswer(R){
  const n=cartCount(), card=$("#answer");
  if (!n || !R.length){ card.hidden=true; card.innerHTML=""; showMbar(false); return; }
  const best=[...R].sort((a,b)=>(a.b.missing.length>0)-(b.b.missing.length>0) || a.score-b.score || a.b.t-b.b.t)[0];
  const cheapest=[...R].sort((a,b)=>a.b.missing.length-b.b.missing.length||a.b.t-b.b.t||a.tr.min-b.tr.min)[0], fastest=[...R].sort((a,b)=>a.tr.min-b.tr.min||a.b.t-b.b.t)[0];
  const c=CH[best.s.chain], miss=best.b.missing.length, diff=best.b.t-cheapest.b.t, faster=cheapest.tr.min-best.tr.min;
  const why = miss ? `No store has everything in your cart. This one has ${best.b.lines.length} of ${best.b.lines.length+miss} items; the receipt shows where to get the rest.`
    : best===cheapest && best.tr.min===fastest.tr.min ? "Lowest price for your whole cart and the shortest trip."
    : best===cheapest || diff<0.005 ? "Lowest price for your whole cart."
    : faster>0 ? `${money(diff)} more than the lowest price, but ${fmtMin(faster)} closer each way.` : `${money(diff)} more than the lowest price.`;
  card.innerHTML = `<div><span class="label">Best pick for you</span><div class="ans-name"><i class="dot" style="background:${c.color}"></i>${esc(best.s.name)}</div>
    <div class="ans-facts"><b class="mono">${money(best.b.t)}</b> with HST · <b class="mono">${fmtMin(best.tr.min)}</b> ${MODE_WORD[S.mode]} each way from ${esc(S.start.name)}</div><p class="ans-why">${esc(why)}</p></div>
    <div class="ans-acts"><a class="btn" href="${dirUrl(best.s)}" target="_blank" rel="noopener">${DIR_WORD[S.mode]} directions</a><button class="btn ghost small" type="button" id="seeBest">See receipt</button></div>`;
  card.hidden=false;
  $("#seeBest").onclick=()=>{ S.open=best.s.i; renderResults(); const el=$("#r-"+best.s.i); if (el) el.scrollIntoView({block:"start"}); };
  $("#mbar").innerHTML = `<div class="mb-t"><div class="mb-name">${esc(best.s.name)} · <span class="mono">${money(best.b.t)}</span></div><div class="mb-sub">Best pick · ${fmtMin(best.tr.min)} ${MODE_WORD[S.mode]} each way${miss?` · ${miss} item${miss>1?"s":""} missing`:""}</div></div><a class="btn small" href="${dirUrl(best.s)}" target="_blank" rel="noopener">Directions</a>`;
  showMbar(!$("#p-checkout").hidden);
}
/* phone bottom bar: pinned while the answer card is scrolled out of view */
function showMbar(on){ const m=$("#mbar"); m.hidden=!on; document.body.classList.toggle("mbar-on", on); }
let answerSeen=false;
/* keep --top-h equal to the sticky header's height (it wraps to two rows on phones) so the travel-mode bar sits right under it */
{ const top=$(".top"), setH=()=>document.documentElement.style.setProperty("--top-h", (getComputedStyle(top).position==="sticky" ? top.offsetHeight : 0)+"px"); setH(); if (typeof ResizeObserver!=="undefined") new ResizeObserver(setH).observe(top); addEventListener("resize", setH); }
if ("IntersectionObserver" in window) new IntersectionObserver(es=>{ answerSeen=es[0].isIntersecting; const m=$("#mbar"); m.classList.toggle("away", answerSeen); m.inert=answerSeen; }).observe($("#answer"));
function renderSteps(){ if (!$("#steps")) return;
  const n=cartCount(), picked=!!S.startPicked;
  const st=[{t:"Cart", d:n?`${n} item${n===1?"":"s"}`:"Add groceries", done:n>0, go:"cart"},
    {t:"Starting point", d:picked?S.start.name:`${S.start.name} (tap to change)`, done:picked, go:"start"},
    {t:"Results", d:n?"Best store for your cart":"Shows once you add items", done:false, go:"results"}];
  const cur = !n ? 0 : !picked ? 1 : 2;
  $("#steps").innerHTML = st.map((x,i)=>`<li class="${x.done?"done":""} ${i===cur?"cur":""}"><button type="button" data-go="${x.go}"${i===cur?' aria-current="step"':""}><span class="num" aria-hidden="true">${x.done?"✓":i+1}</span><span class="st"><b>${i+1}. ${x.t}</b><small>${esc(x.d)}</small></span></button></li>`).join("");
  $("#steps").querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{ const g=b.dataset.go;
    if (g==="cart"){ if (!n){ location.hash="#shop"; return; } $(".co").scrollIntoView({block:"start"}); }
    else if (g==="start"){ $("#locPanel").scrollIntoView({block:"start"}); $("#addr").focus({preventScroll:true}); }
    else { const a=$("#answer"); (a.hidden ? $("#receipts") : a).scrollIntoView({block:"start"}); } });
}
function renderFoldNotes(){
  const n=cartCount();
  $("#savedNote").textContent = SAVED.length ? `${SAVED.length} saved` : "None yet";
  const bn=$("#budgetNote"); bn.classList.remove("over");
  if (!S.budget) bn.textContent = "Not set";
  else if (!n) bn.textContent = `${money(S.budget)}`;
  else { const left=S.budget-refStore().total; bn.textContent = left>=0 ? `${money(left)} under` : `${money(-left)} over`; if (left<0) bn.classList.add("over"); }
  $("#shareNote").textContent = n ? "Link ready" : "Add items first";
}
function renderResults(){
  const n=cartCount();
  const R=rows();
  renderSteps();
  $("#resSub").textContent = n ? `${n} item${n===1?"":"s"} · ${PRICED.length} locations · times by ${MODE_WORD[S.mode]}${routed() ? " (real routes from OpenStreetMap)" : " (estimated)"} from ${S.start.name}` : "";
  renderBudget();
  if (!n){ S.rank={}; $("#why").hidden=true; renderSplit(R); renderAnswer(R); $("#receipts").innerHTML=`<div class="empty">Add groceries to your cart to see every store ranked. <a href="#shop">Start shopping</a></div>`; renderMap(); return; }
  $("#why").hidden=false;
  const pMin=Math.min(...R.map(r=>r.b.full)), pMax=Math.max(...R.map(r=>r.b.full)), tMin=Math.min(...R.map(r=>r.tr.min)), tMax=Math.max(...R.map(r=>r.tr.min));
  /* Recommended: basket cost plus round-trip minutes at one fixed balance (TIME_RATE) */
  const perMin = TIME_RATE;
  R.forEach(r=>{ r.score = r.b.full + perMin*2*r.tr.min; });
  renderAnswer(R);
  const key = S.sort==="price" ? (a,b)=>a.b.missing.length-b.b.missing.length || a.b.t-b.b.t || a.tr.min-b.tr.min : S.sort==="time" ? (a,b)=>a.tr.min-b.tr.min || a.b.t-b.b.t : (a,b)=>(a.b.missing.length>0)-(b.b.missing.length>0) || a.score-b.score || a.b.t-b.b.t;  /* a store missing items means a second stop, so complete baskets come first */
  R.sort(key);
  S.rank = Object.fromEntries(R.map((r,i)=>[r.s.i,i+1]));
  const top=R[0];
  const cheapest=[...R].sort((a,b)=>a.b.missing.length-b.b.missing.length||a.b.t-b.b.t||a.tr.min-b.tr.min)[0], fastest=[...R].sort((a,b)=>a.tr.min-b.tr.min||a.b.t-b.b.t)[0];
  $("#why").innerHTML = S.sort==="rec"
    ? whyRec(top, cheapest, fastest, pMin, tMin, R)
    : S.sort==="price" ? `Sorted by basket total, with stores that have your whole cart first. Cheapest complete basket: <b>${esc(cheapest.s.name)}</b> at ${money(cheapest.b.t)}, ${fmtMin(cheapest.tr.min)} ${MODE_WORD[S.mode]} away. Stores in the same chain charge the same online price, so ties are broken by trip time.`
    : `Sorted by one-way trip time. Closest: <b>${esc(fastest.s.name)}</b>, ${fmtMin(fastest.tr.min)} ${MODE_WORD[S.mode]}, basket ${money(fastest.b.t)}.`;
  renderSplit(R);
  if (S.open==null || (S.open!==-1 && !R.some(r=>r.s.i===S.open))) S.open = top.s.i;
  $("#receipts").innerHTML = R.map((r,idx)=>{
    const c=CH[r.s.chain], open=S.open===r.s.i, diff=r.b.t-cheapest.b.t, miss=r.b.missing.length;
    const chips = [ r===cheapest?'<span class="chip tag">Lowest price</span>':"", r===fastest?'<span class="chip">Shortest trip</span>':"", (S.sort==="rec"&&idx===0)?'<span class="chip">Recommended</span>':"" ].join("");
    const body = open ? `<div class="rbody"><div class="dirrow"><a class="btn small" href="${dirUrl(r.s)}" target="_blank" rel="noopener">${DIR_WORD[S.mode]} directions in Google Maps</a><button class="compare" type="button" data-gm="${r.s.i}" aria-expanded="${S.gmap===r.s.i}">${S.gmap===r.s.i?"Hide map":"Show store on Google Maps"}</button></div>${S.gmap===r.s.i?`<iframe class="gmap" loading="lazy" title="Google map of ${esc(r.s.name)}" src="${embedUrl(r.s)}"></iframe>`:""}<div class="tablebox"><table class="lines"><thead><tr><th>Item</th><th>Product at ${esc(c.short)}</th><th class="n">Qty</th><th class="n">Price</th><th class="n">Total</th></tr></thead><tbody>
      ${r.b.lines.map(l=>{ const sale=l.p.regular&&l.p.regular>l.p.price; return `<tr${sale?' class="onsale"':""}><td>${esc(l.it.name)}<span class="prod">${esc(l.it.cat)}</span></td><td>${esc(l.p.product)}${l.p.size?`<span class="prod">${esc(l.p.size)}</span>`:""}</td><td class="n">${qtyLabel(l.it,l.q)}</td><td class="n">${sale?`<span class="was">${money(l.p.regular)}</span><span class="salep">${money(l.p.price)}</span>`:money(l.p.price)}${l.it.unit==="per_kg"?"/kg":""}</td><td class="n">${money(l.p.price*l.q)}${l.it.tax===0.05?' <abbr title="5% tax applies (the provincial part of HST is rebated)" class="hflag">G</abbr>':l.it.tax?' <abbr title="HST applies" class="hflag">H</abbr>':'<span class="hflag" aria-hidden="true"></span>'}</td></tr>`; }).join("")}
      ${r.b.missing.map(m=>`<tr class="missrow" style="color:var(--muted)"><td>${esc(m.it.name)}<span class="prod">${esc(m.it.cat)}</span></td><td colspan="3"><span class="chip" style="background:var(--surface-2);color:var(--sale)">Not available at ${esc(c.short)}</span>${(()=>{ const alt=nearestFor(m.it, r.s); return alt ? `<span class="prod" style="color:var(--ink)">Nearest place to get it: <b>${esc(alt.s.name)}</b>, ${fmtMin(alt.there)} ${MODE_WORD[S.mode]} from ${esc(c.short)}, then ${fmtMin(alt.home)} back to ${esc(S.start.name)}.</span>` : ""; })()}</td><td class="n">n/a</td></tr>`).join("")}
      </tbody><tfoot><tr class="subrow"><td colspan="4">Subtotal</td><td class="n">${money(r.b.sub)}<span class="hflag"></span></td></tr><tr class="subrow"><td colspan="4">HST 13% on items marked H${r.b.lines.some(l=>l.it.tax===0.05)?", 5% on items marked G":""}</td><td class="n">${money(r.b.tax)}<span class="hflag"></span></td></tr><tr><td colspan="4">Total with HST${miss?` · ${r.b.lines.length} of ${r.b.lines.length+miss} items`:""}</td><td class="n">${money(r.b.t)}<span class="hflag"></span></td></tr>${r.b.sale>0.005?`<tr><td colspan="4" style="font-weight:500;color:var(--muted)">Includes sale savings of</td><td class="n" style="font-weight:500;color:var(--sale)">${money(r.b.sale)}<span class="hflag"></span></td></tr>`:""}</tfoot></table></div>
      ${(()=>{ const n=r.b.lines.filter(l=>l.p.regular&&l.p.regular>l.p.price).length; return `<div class="flyer"><span>${n?`<b>${n} ${n===1?"item":"items"} in your cart ${n===1?"is":"are"} on sale this week</b> (highlighted above).`:"Nothing in your cart is on sale here this week."} Check the flyer for more deals.</span>${c.flyer?`<a href="${esc(c.flyer)}" target="_blank" rel="noopener">This week's ${esc(c.short)} flyer</a>`:""}</div>`; })()}
      ${pickupBox(c)}
      ${r.s.chain==="walmart" ? `<p class="limited">Walmart's website blocks automated price checks, so only ${ITEMS.filter(it=>it.prices.walmart).length.toLocaleString()} of our ${ITEMS.length.toLocaleString()} items have a Walmart price. Items marked "not available" here may still be on the shelf.</p>` : ""}
      <p class="rmeta" style="margin:8px 0 0">Prices from ${esc(c.site)}${r.s.approx?" · map pin approximate":""} · <a href="${reportUrl(r.s)}">Report a wrong price</a></p></div>` : "";
    return `<article class="receipt ${idx===0?"top1":""}" id="r-${r.s.i}">
      <div class="rhead" data-o="${r.s.i}" role="button" tabindex="0" aria-expanded="${open}">
        <span class="rank">${idx+1}</span>
        <div><div class="rname"><i class="dot" style="background:${c.color}"></i>${esc(r.s.name)} ${chips}</div>
          <div class="rmeta">${esc(r.s.addr)}, ${esc(r.s.city)}</div>
          <div class="facts"><span><b class="mono">${r.tr.d.toFixed(1)} km</b> away</span><span><b class="mono">${fmtMin(r.tr.min)}</b> ${MODE_WORD[S.mode]} each way</span><span><b class="mono">${fmtMin(2*r.tr.min)}</b> total there and back</span><span class="mono" style="color:var(--muted)">${open?"Hide":"Show"} receipt</span></div></div>
        <div class="rtotal"><span class="price">${money(r.b.t)}</span><small>${miss?`<span style="color:var(--sale)">missing ${miss} item${miss>1?"s":""}</span>`:(diff>0.005?"+"+money(diff)+" vs lowest":"lowest basket")}</small></div>
      </div>${body}</article>`;
  }).join("");
  $("#receipts").querySelectorAll("[data-gm]").forEach(b=>b.onclick=()=>{ const i=+b.dataset.gm; S.gmap = S.gmap===i ? null : i; renderResults(); });
  $("#receipts").querySelectorAll("[data-o]").forEach(el=>{ const go=()=>{ const i=+el.dataset.o; S.open = S.open===i ? -1 : i; renderResults(); renderMap(); }; el.onclick=go; el.onkeydown=e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); go(); } }; });
  renderMap();
}
function renderCheckout(){ loadRoutes(); renderSharedBanner(); renderCart(); renderStart(); renderMap(); $("#applyRow").hidden=!S.pending; renderResults(); }

$("#srcNote").textContent = CHAINS.map(c=>`${c.name}: ${c.site}`).join(" · ") + `. Checked ${ASOF}. Online prices are each chain's standard web price and include that week's sales; an individual store can differ slightly. Many items have a Brand menu: pick a store brand or a name brand, or "Cheapest available" for each store's lowest-priced brand that matches the item. An item a chain doesn't list online is shown as not available at that store.`;
renderWelcome(); renderRail(); renderHeader(); route();
})();
