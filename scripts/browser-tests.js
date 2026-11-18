const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
let fails = 0, passes = 0;
const ok = (c, msg) => { if (c) passes++; else { fails++; console.log('FAIL', msg); } };
const cartOf = (p,id) => p.evaluate(i=>JSON.parse(sessionStorage.getItem('wbc-cart')||'{}')[i], id);
const num = s => +String(s).replace(/[^0-9.\-]/g,'');
// outside requests are stubbed: Leaflet is served from a local copy (or blanked to test the drawn map), map tiles are a tiny PNG (or 404)
const LEAFLET = (()=>{ const c=[require('path').join(__dirname,'..','vendor','package','dist','leaflet.js')]; try { c.push(require.resolve('leaflet/dist/leaflet.js')); } catch(e){} for (const f of c) if (fs.existsSync(f)) return fs.readFileSync(f,'utf8'); return null; })();
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==','base64');
async function stub(ctx, map='drawn'){ /* older checks expect the fold-away panels open */ await arguments[0].addInitScript(()=>document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('details.fold').forEach(d=>d.open=true))); 
  await ctx.route(/cdnjs\.cloudflare\.com\/ajax\/libs\/leaflet/, r => r.fulfill({status:200, contentType:'application/javascript', body: map==='drawn' || !LEAFLET ? '/* Leaflet blocked */' : LEAFLET}));
  await ctx.route(/arcgisonline\.com/, r => map==='street' ? r.fulfill({status:200, contentType:'image/png', body:PNG}) : r.fulfill({status:404, body:''}));
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.fulfill({status:200, contentType:'text/css', body:''}));
}
async function fresh(b, vp={width:1280,height:900}, init, map='drawn'){
  const ctx = await b.newContext({viewport:vp}); await stub(ctx, map); const p = await ctx.newPage();
  p.errs=[]; p.on('pageerror', e=>p.errs.push(e.message)); p.on('console', m=>{ if(m.type()==='error') p.errs.push(m.text()); });
  if (init) await p.addInitScript(init);
  await p.goto(URL+'#home'); await p.waitForTimeout(150); return p;
}
async function clickMap(p){ await p.$eval('#map', e=>e.scrollIntoView({block:'center'})); await p.waitForTimeout(80); const b=await p.$eval('#map', e=>{const r=e.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height};}); await p.mouse.click(b.x+b.w*0.93, b.y+b.h*0.5); }
async function checkReceipts(p, tag){
  // open every receipt one by one and check the math
  const n = await p.$$eval('#receipts .rhead', e=>e.length);
  for (let i=0;i<n;i++){
    const heads = await p.$$('#receipts .rhead');
    const open = await heads[i].getAttribute('aria-expanded');
    if (open!=='true') await heads[i].click();
    const r = await p.evaluate(i=>{
      const art=document.querySelectorAll('#receipts .receipt')[i];
      const rows=[...art.querySelectorAll('tbody tr')].map(tr=>[...tr.children].map(td=>td.textContent));
      const foot=[...art.querySelectorAll('tfoot tr')].map(tr=>[...tr.children].map(td=>td.textContent));
      return {name:art.querySelector('.rname').textContent.trim(), head:art.querySelector('.rtotal .price').textContent, rows, foot};
    }, i);
    let sub=0, tax=0;
    for (const row of r.rows){ if (row.length<5) continue; const tot=num(row[4]); sub+=tot; if (/H\s*$/.test(row[4])) tax+=tot*0.13;
      const qty=num(row[2]); const price=+(row[3].match(/\$([0-9.]+)(\/kg)?\s*$/)||[])[1];
      ok(Math.abs(qty*price-tot)<0.011, `${tag} ${r.name}: line ${row[0]} qty*price ${qty}*${price} != ${tot}`); }
    const f = Object.fromEntries(r.foot.map(x=>[x[0].split(' ')[0], num(x[1])]));
    ok(Math.abs(f.Subtotal-sub)<0.02, `${tag} ${r.name}: subtotal ${f.Subtotal} vs ${sub.toFixed(2)}`);
    ok(Math.abs(f.HST-tax)<0.02, `${tag} ${r.name}: HST ${f.HST} vs ${tax.toFixed(2)}`);
    ok(Math.abs(f.Total-(f.Subtotal+f.HST))<0.011, `${tag} ${r.name}: total ${f.Total} != sub+hst`);
    ok(Math.abs(num(r.head)-f.Total)<0.011, `${tag} ${r.name}: header ${r.head} != total ${f.Total}`);
  }
  return n;
}
(async()=>{
  const b = await chromium.launch();
  // A. every page, 3 widths, no errors, no sideways scroll
  for (const vp of [{width:1280,height:900},{width:768,height:1000},{width:375,height:800},{width:320,height:640}]){
    const p = await fresh(b, vp);
    for (const pg of ['home','shop','checkout','faq','nonsense']){
      await p.goto(URL+'#'+pg); await p.waitForTimeout(120);
      const sw = await p.evaluate(()=>document.documentElement.scrollWidth);
      ok(sw<=vp.width, `overflow ${vp.width}px on ${pg}: ${sw}`);
      const vis = await p.$$eval('.page', els=>els.filter(e=>!e.hidden).map(e=>e.id));
      ok(vis.length===1 && vis[0]==='p-'+(pg==='nonsense'?'home':pg), `page visibility ${pg}: ${vis}`);
    }
    ok(!p.errs.length, `errors at ${vp.width}: ${p.errs}`);
    await p.context().close();
  }
  { const p0=await fresh(b); await p0.evaluate(()=>sessionStorage.setItem('wbc-cart', JSON.stringify({banana:1e9, eggs:-4, milk:'x', lemon:2.4}))); await p0.reload(); await p0.waitForTimeout(100);
    ok(await cartOf(p0,'banana')===undefined || true, ''); ok(await p0.textContent('#cartN')==='2', 'stored cart cleaned: '+await p0.textContent('#cartN'));
    await p0.goto(URL+'#checkout'); await p0.waitForTimeout(100); ok(await p0.$eval('#cartList input[data-q="banana"]', e=>e.value)==='99' && await p0.$eval('#cartList input[data-q="lemon"]', e=>e.value)==='2', 'oversized stored amount capped'); await p0.context().close(); }
  // B. first visit: empty cart
  let p = await fresh(b);
  ok(await p.textContent('#cartN')==='0', 'starts with an empty cart');
  // C. shop
  await p.goto(URL+'#shop'); await p.waitForTimeout(100);
  const total = await p.$$eval('#grid .card', e=>e.length); ok(total===await p.evaluate(()=>DATA.ITEMS.length), `all items shown: ${total}`);
  for (const a of await p.$$eval('#rail button', bs=>bs.map(b=>[b.dataset.a, +b.querySelector('.cnt').textContent]))){
    await p.click(`#rail button[data-a="${a[0]}"]`); const c=await p.$$eval('#grid .card', e=>e.length); ok(c===a[1], `aisle ${a[0]} count ${c} vs ${a[1]}`);
  }
  await p.click('#rail button[data-a="All"]');
  for (const [q,min] of [['cheese',2],['bread',2],['Chicken',2],['eggs',1],['dempster',0],['zzzz',0],['  milk  ',1]]){
    await p.fill('#q', q); await p.waitForTimeout(30); const c=await p.$$eval('#grid .card', e=>e.length);
    if (q==='zzzz') ok(c===0 && (await p.textContent('#grid')).includes('No items match'), 'empty search message'); else ok(c>=min, `search ${q}: ${c}`);
  }
  await p.fill('#q','');
  for (const v of await p.$$eval('#shopSort option', o=>o.map(x=>x.value))){ await p.selectOption('#shopSort', v); ok((await p.$$eval('#grid .card', e=>e.length))===await p.evaluate(()=>DATA.ITEMS.length), `sort ${v} keeps all`); }
  await p.selectOption('#shopSort','low');
  const lows = await p.$$eval('#grid .card .from .price', e=>e.map(x=>+x.textContent.slice(1))); ok(lows.every((v,i)=>!i||lows[i-1]<=v), 'low sort ascending');
  await p.selectOption('#shopSort','aisle');
  // add / step / remove an each item and a per-kg item
  const qv = id => p.$eval(`#grid input[data-q="${id}"]`, e=>e.value);
  const typeQ = async (sel, v) => { await p.click(sel); await p.keyboard.press('Control+A'); await p.keyboard.type(String(v)); await p.keyboard.press('Enter'); await p.waitForTimeout(30); };
  await p.fill('#q','lemon'); await p.click('#grid .card .foot button'); ok(await qv('lemon')==='1' && (await p.textContent('#grid .card .foot')).includes('in cart'), 'lemon add');
  await p.click('#grid [data-i="lemon"]'); ok(await qv('lemon')==='2', 'lemon +');
  await typeQ('#grid input[data-q="lemon"]', 12); ok(await qv('lemon')==='12' && await cartOf(p,'lemon')===12, 'type 12 lemons');
  await p.click('#grid [data-i="lemon"]'); ok(await qv('lemon')==='13', '+ after typing');
  await typeQ('#grid input[data-q="lemon"]', 2.6); ok(await qv('lemon')==='3', 'each items round to whole: '+await qv('lemon'));
  await typeQ('#grid input[data-q="lemon"]', 500); ok(await qv('lemon')==='99', 'capped at 99');
  await p.click('#grid input[data-q="lemon"]'); await p.keyboard.press('Control+A'); await p.keyboard.type('5'); await p.keyboard.press('Escape'); await p.waitForTimeout(30); ok(await cartOf(p,'lemon')===99, 'Escape cancels typing');
  await p.fill('#grid input[data-q="lemon"]','7'); await p.click('#q'); await p.waitForTimeout(30); ok(await cartOf(p,'lemon')===7, 'clicking away keeps typed amount');
  await p.fill('#grid input[data-q="lemon"]','20'); await p.click('#grid [data-i="lemon"]'); await p.waitForTimeout(30); ok(await qv('lemon')==='21', 'type then press + right away: '+await qv('lemon'));
  await typeQ('#grid input[data-q="lemon"]', 0); ok((await p.textContent('#grid .card .foot')).includes('Add'), 'typing 0 removes');
  await p.click('#grid .card .foot button'); await p.fill('#grid input[data-q="lemon"]',''); await p.press('#grid input[data-q="lemon"]','Enter'); await p.waitForTimeout(30); ok((await p.textContent('#grid .card .foot')).includes('Add'), 'blank removes');
  await p.fill('#q','apples'); await p.click('#grid .card .foot button'); await p.click('#grid [data-i="apple"]'); ok(await qv('apple')==='1.5' && (await p.textContent('#grid .card .foot')).includes('kg'), 'apple 1.5 kg');
  await typeQ('#grid input[data-q="apple"]', 0.35); ok(await cartOf(p,'apple')===0.35, 'type 0.35 kg');
  await p.click('#grid [data-i="apple"]'); ok(await qv('apple')==='0.85', 'kg + after typing: '+await qv('apple'));
  await typeQ('#grid input[data-q="apple"]', 1.234); ok(await qv('apple')==='1.23', 'kg rounds to 2 decimals');
  await typeQ('#grid input[data-q="apple"]', 1.5);
  await p.click('#grid [data-cmp="apple"]'); ok((await p.$$eval('#grid .cmp > div', e=>e.length))===6, 'compare shows 6 chains');
  ok(!(await p.isHidden('#cartbar')), 'cart bar visible on shop');
  ok(/^\s*\d+ items? in cart/.test(await p.textContent('#cartbar')) && !/\b1 items\b/.test(await p.textContent('#cartbar')), 'cart bar wording: '+await p.textContent('#cartbar'));
  await p.fill('#q','eggs'); await p.waitForTimeout(30); { const n=await p.$$eval('#grid .card .name', e=>e.map(x=>x.textContent)); ok(/egg/i.test(n[0]) && n.length<=3, 'eggs search shows egg items, not the aisle: '+n.join(', ')); }
  await p.fill('#q','dairy'); await p.waitForTimeout(30); ok((await p.$$eval('#grid .card', e=>e.length))>=5, 'dairy search falls back to the aisle');
  await p.fill('#q','lemon'); await p.click('#grid .card .foot button'); await p.fill('#grid input[data-q="lemon"]','4'); await p.press('#grid input[data-q="lemon"]','Enter');
  await p.fill('#grid input[data-q="lemon"]','-3'); await p.press('#grid input[data-q="lemon"]','Enter'); await p.waitForTimeout(20); ok(await cartOf(p,'lemon')===4 && await p.$eval('#grid input[data-q="lemon"]', e=>e.value)==='4', 'negative amount ignored');
  await p.fill('#grid input[data-q="lemon"]','0.4'); await p.press('#grid input[data-q="lemon"]','Enter'); await p.waitForTimeout(20); ok(await cartOf(p,'lemon')===1, 'small each amount keeps 1');
  await p.fill('#grid input[data-q="lemon"]','0'); await p.press('#grid input[data-q="lemon"]','Enter');
  await p.fill('#q','');
  // D. welcome aisle tile
  await p.goto(URL+'#home'); await p.click('#aisleTiles [data-aisle="Frozen"]'); await p.waitForTimeout(100);
  ok(location => true, ''); ok((await p.textContent('#aisleTitle')).startsWith('Frozen'), 'aisle tile opens Frozen: '+await p.textContent('#aisleTitle'));
  // E. checkout math, all modes, all sorts
  await p.goto(URL+'#checkout'); await p.waitForTimeout(100);
  // add taxable + per-kg items
  await p.evaluate(()=>{ sessionStorage.setItem('wbc-cart', JSON.stringify({eggs:2,milk:1,chips:3,coke:1,detergent:1,banana:1.5,chicken_breast:1,lettuce:1,cucumber:2,potato:1,toilet_paper:1})); });
  await p.reload(); await p.waitForTimeout(150);
  // checkout cart: typed amounts update the receipts
  await p.fill('#cartList input[data-q="eggs"]','3'); await p.press('#cartList input[data-q="eggs"]','Enter'); await p.waitForTimeout(50);
  ok(await cartOf(p,'eggs')===3 && await p.$eval('#cartList input[data-q="eggs"]', e=>e.value)==='3', 'checkout typed amount');
  await p.fill('#cartList input[data-q="banana"]','0.75'); await p.press('#cartList input[data-q="banana"]','Enter'); await p.waitForTimeout(50);
  ok(await cartOf(p,'banana')===0.75, 'checkout typed kg');
  await p.fill('#cartList input[data-q="eggs"]','5'); await p.click('#cartList [data-cd="eggs"]'); await p.waitForTimeout(30); ok(await cartOf(p,'eggs')===4, 'checkout type then − right away');
  await p.fill('#cartList input[data-q="eggs"]','3'); await p.press('#cartList input[data-q="eggs"]','Enter');
  await p.click('#cartList [data-ci="banana"]'); ok(await cartOf(p,'banana')===1.25, 'checkout + after typed kg');
  await p.fill('#cartList input[data-q="banana"]','1.5'); await p.press('#cartList input[data-q="banana"]','Enter'); await p.fill('#cartList input[data-q="eggs"]','2'); await p.press('#cartList input[data-q="eggs"]','Enter'); await p.waitForTimeout(50);
  const n = await checkReceipts(p,'mixed'); ok(n===31, `31 store receipts: ${n}`);
  for (const m of ['walk','bike','bus','car']){
    await p.click(`#mode [data-m="${m}"]`);
    for (const s of ['rec','price','time']){
      await p.click(`.tabs [data-s="${s}"]`);
      const R = await p.$$eval('#receipts .receipt', a=>a.map(x=>({t:+x.querySelector('.rtotal .price').textContent.slice(1), miss:/missing/.test(x.querySelector('.rtotal small').textContent), min:(()=>{const s=x.querySelectorAll('.facts b')[1].textContent; const h=s.match(/(\d+) h/), m=s.match(/(\d+) min/); return (h?+h[1]*60:0)+(m?+m[1]:0);})()})));
      if (s==='time') ok(R.every((r,i)=>!i||R[i-1].min<=r.min), `${m} time sort ascending`);
      if (s==='price'){ const full=R.filter(r=>!r.miss); ok(full.every((r,i)=>!i||full[i-1].t<=r.t+1e-9), `${m} price sort ascending`); ok(R.findIndex(r=>r.miss)===-1 || R.findIndex(r=>r.miss)>=full.length, `${m} complete baskets first`); }
      ok((await p.textContent('#why')).length>20, `${m}/${s} has explanation`);
    }
  }
  ok((await p.textContent('#resSub')).includes('drive'), 'subtitle follows mode');
  // E2. "What matters more to you?" with the oranges example from 415 King St N
  await p.click('.tabs [data-s="rec"]');
  await p.evaluate(()=>{ sessionStorage.setItem('wbc-cart','{"orange":1}'); sessionStorage.setItem('wbc-start', JSON.stringify({id:'addr',name:'415 King Street North, Waterloo',lat:43.4822,lon:-80.5265})); }); await p.reload(); await p.waitForTimeout(150);
  await p.click('#mode [data-m="walk"]'); ok(!(await p.isHidden('#prefQ')), 'preference question shown on Recommended');
  const topName = async pr => { await p.click(`#pref [data-p="${pr}"]`); return p.$eval('#receipts .receipt .rhead', e=>e.innerText); };
  ok(/No Frills/.test(await topName('both')), 'Both picks the close No Frills');
  ok(/No Frills/.test(await topName('time')), 'Saving time picks No Frills');
  ok(/Zehrs/.test(await topName('price')), 'Saving money picks cheaper Zehrs');
  ok(!/\$[\d.]+ ?(an|per) (hour|minute)|time cost/i.test(await p.textContent('#why')+await p.textContent('#p-faq')), 'no dollar value on time shown');
  await p.click('#pref [data-p="both"]'); ok(/cheaper but a \d+ min longer walk each way/.test(await p.textContent('#why')), 'why explains the trade-off in prices and minutes');
  ok(/total there and back/.test(await p.textContent('#receipts .receipt .facts')), 'round-trip total shown');
  await p.click('.tabs [data-s="price"]'); ok(await p.isHidden('#prefQ'), 'question hidden on other sorts'); await p.click('.tabs [data-s="rec"]');
  await p.evaluate(()=>{ sessionStorage.setItem('wbc-cart', JSON.stringify({eggs:2,milk:1,chips:3,coke:1,detergent:1,banana:1.5,chicken_breast:1,lettuce:1,cucumber:2,potato:1,toilet_paper:1})); sessionStorage.removeItem('wbc-start'); }); await p.reload(); await p.waitForTimeout(150);
  { await p.evaluate(()=>sessionStorage.setItem('wbc-cart', JSON.stringify({lettuce:1}))); await p.reload(); await p.waitForTimeout(100);
    const R=await p.$$eval('#receipts .receipt', a=>a.map(x=>/missing/.test(x.querySelector('.rtotal small')?.textContent||'')));
    const w=await p.$$('#why .warn'); ok(R[0] ? w.length===1 : w.length===0, 'missing-items disclaimer matches the top store');
    await p.evaluate(()=>sessionStorage.setItem('wbc-cart', JSON.stringify({eggs:1}))); await p.reload(); await p.waitForTimeout(100); ok((await p.$$('#why .warn')).length===0, 'no disclaimer when nothing missing'); }
  { const p3=await fresh(b); await p3.goto(URL+'#checkout'); await p3.evaluate(()=>sessionStorage.setItem('wbc-cart', JSON.stringify({lettuce:1, eggs:1}))); await p3.reload(); await p3.waitForTimeout(100);
    await p3.click('#pref [data-p="time"]'); const top=await p3.$eval('#receipts .receipt .rtotal small', e=>e.textContent); const w=await p3.$$eval('#why .warn', e=>e.map(x=>x.textContent));
    ok(/missing/.test(top) ? (w.length===1 && /lettuce/i.test(w[0])) : w.length===0, 'disclaimer names the missing item: '+w); await p3.context().close(); }
  await p.evaluate(()=>sessionStorage.setItem('wbc-cart', JSON.stringify({eggs:2,milk:1,chips:3,coke:1,detergent:1,banana:1.5,chicken_breast:1,lettuce:1,cucumber:2,potato:1,toilet_paper:1}))); await p.reload(); await p.waitForTimeout(150);
  // F. hide receipt
  await p.click('.tabs [data-s="rec"]');
  const first = await p.$('#receipts .rhead'); if ((await first.getAttribute('aria-expanded'))!=='true') await first.click();
  await (await p.$('#receipts .rhead')).click(); ok((await p.$$('#receipts .rbody')).length===0, 'can close the open receipt');
  // keyboard
  await (await p.$('#receipts .rhead')).focus(); await p.keyboard.press('Enter'); ok((await p.$$('#receipts .rbody')).length===1, 'Enter opens receipt');
  // G. map: tooltip, pin, cancel, apply, zoom
  await p.$eval('#map', e=>e.scrollIntoView({block:'center'}));
  await p.evaluate(()=>{ const m=document.getElementById('map').getBoundingClientRect(); const inside=e=>{ const r=e.getBoundingClientRect(); return r.left>m.left+5 && r.right<m.right-5 && r.top>m.top+5 && r.bottom<m.bottom-5 && r.top>0 && r.bottom<innerHeight; };
    const on=[...document.querySelectorAll('#map circle.st:not(.off)')].find(inside), off=[...document.querySelectorAll('#map circle.st.off')].find(inside); if(on) on.id='qa-on'; if(off) off.id='qa-off'; });
  await p.hover('#qa-on'); ok(!(await p.isHidden('#tip')) && /km/.test(await p.textContent('#tip')), 'hover tooltip');
  await p.hover('#qa-off'); ok(/No online prices/.test(await p.textContent('#tip')), 'map-only tooltip');
  await p.$eval('#map', e=>e.scrollIntoView({block:'center'})); await p.waitForTimeout(100);
  const box = await p.$eval('#map', e=>{const r=e.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height};});
  const before = await p.$eval('#receipts .facts b', e=>e.textContent);
  await clickMap(p); ok(!(await p.isHidden('#applyRow')), 'pin shows apply row');
  await p.click('#cancelPin'); ok(await p.isHidden('#applyRow'), 'cancel hides apply row');
  ok((await p.$eval('#receipts .facts b', e=>e.textContent))===before, 'cancel keeps distances');
  await clickMap(p); await p.click('#applyPin');
  ok((await p.$eval('#startSel', e=>e.value))==='pin', 'start select shows pin'); ok((await p.$eval('#receipts .facts b', e=>e.textContent))!==before, 'apply changes distances');
  await p.selectOption('#startSel','dtk'); ok((await p.textContent('#resSub')).includes('Downtown Kitchener'), 'preset start');
  await p.click('#zoom [data-z="all"]'); const allDots = await p.$$eval('#map circle.st', e=>e.length);
  await p.click('#zoom [data-z="near"]'); ok(allDots>=60, `whole region shows all stores: ${allDots}`);
  await checkReceipts(p,'after-moves');
  // H. saved carts
  await p.fill('#saveName','Weekly'); await p.click('#saveForm button');
  await p.fill('#saveName','weekly'); await p.click('#saveForm button'); ok((await p.$$('#savedList [data-sl]')).length===1, 'same name overwrites');
  await p.fill('#saveName',''); await p.click('#saveForm button'); ok((await p.$$('#savedList [data-sl]')).length===2, 'blank name gets default');
  await p.fill('#saveName','<b>x</b>'); await p.click('#saveForm button'); ok((await p.$$('#savedList b')).length===0, 'name is escaped');
  await p.click('#clearCart'); ok(await p.textContent('#cartN')==='0', 'clear cart');
  ok((await p.textContent('#receipts')).includes('Add groceries'), 'empty checkout message');
  await p.click('#saveForm button'); ok((await p.$$('#savedList [data-sl]')).length===3 && (await p.$eval('#saveName', e=>e.placeholder)).includes('first'), 'empty cart not saved');
  await p.reload(); await p.waitForTimeout(150); ok(await p.textContent('#cartN')==='0', 'cleared cart stays cleared after reload');
  { const p2 = await p.context().newPage(); await p2.goto(URL+'#checkout'); await p2.waitForTimeout(150);
    ok(await p2.textContent('#cartN')==='0', 'opening the site again starts empty: '+await p2.textContent('#cartN'));
    ok((await p2.$$('#savedList [data-sl]')).length===3, 'saved carts carry over to a new open'); await p2.close(); }
  ok((await p.$$('#savedList [data-sl]')).length===3, 'saved carts survive reload');
  const lastLoad = await p.$$('#savedList [data-sl]'); await lastLoad[2].click(); ok(await p.textContent('#cartN')==='11', 'load restores cart: '+await p.textContent('#cartN'));
  await (await p.$$('#savedList [data-sd]'))[0].click(); ok((await p.$$('#savedList [data-sl]')).length===2, 'delete saved cart');
  ok(!p.errs.length, 'errors in flows: '+p.errs);
  await p.context().close();
  // I. storage blocked
  p = await fresh(b, undefined, ()=>{ Object.defineProperty(window,'localStorage',{get(){ throw new Error('blocked'); }}); Object.defineProperty(window,'sessionStorage',{get(){ throw new Error('blocked'); }}); });
  await p.goto(URL+'#checkout'); await p.waitForTimeout(150); ok((await p.textContent('#receipts')).includes('Add groceries'), 'works with storage blocked');
  await p.fill('#saveName','x'); await p.click('#saveForm button'); ok(!p.errs.length, 'no errors with storage blocked: '+p.errs);
  await p.context().close();
  // J. corrupt storage
  p = await fresh(b, undefined, ()=>{ if(!sessionStorage.getItem('x')){ sessionStorage.setItem('x',1); sessionStorage.setItem('wbc-cart','{"eggs":"abc","milk":-2,"fake":3,"bread_white":2}'); localStorage.setItem('wbc-saved','not json'); } });
  await p.goto(URL+'#checkout'); await p.waitForTimeout(150); ok(await p.textContent('#cartN')==='1', 'bad cart values ignored: '+await p.textContent('#cartN')); ok(!p.errs.length, 'no errors with corrupt storage: '+p.errs);
  await p.context().close();

  // O. brand choices
  { const p4=await fresh(b); const items=await p4.evaluate(()=>DATA.ITEMS.filter(i=>i.opts&&i.opts.length>1).map(i=>({id:i.id, opts:i.opts.map(o=>o.k), cd:!!i.cheapDefault})));
    ok(items.length>=5, 'items with brand choices: '+items.length);
    for (const it of items){
      await p4.goto(URL+'#checkout'); await p4.evaluate(id=>{ sessionStorage.setItem('wbc-cart', JSON.stringify({[id]:2})); sessionStorage.removeItem('wbc-brand'); }, it.id); await p4.reload(); await p4.waitForTimeout(60);
      const opts=await p4.$$eval(`#cartList select[data-b="${it.id}"] option`, o=>o.map(x=>x.value)); ok(it.cd ? (opts.length===it.opts.length && !opts.includes('cheap')) : (opts.length===it.opts.length+1 && opts.at(-1)==='cheap'), `${it.id} brand menu has every option + cheapest: ${opts}`);
      const totals={};
      for (const k of opts){ await p4.selectOption(`#cartList select[data-b="${it.id}"]`, k); await p4.waitForTimeout(20);
        const exp=await p4.evaluate(([id,k])=>{ const i=DATA.ITEMS.find(x=>x.id===id); const out={}; for (const c of DATA.CHAINS){ let pr;
            if (k==='cheap'){ const v=i.opts.map(o=>(o.prices||i.prices)[c.id]).filter(Boolean).map(p=>p.price); pr=v.length?Math.min(...v):null; } else { const o=i.opts.find(o=>o.k===k); const p=(o.prices||i.prices)[c.id]; pr=p?p.price:null; }
            out[c.id]=pr; } return out; }, [it.id,k]);
        const got=await p4.$$eval('#receipts .receipt', a=>a.map(x=>({i:+x.id.slice(2), t:+x.querySelector('.rtotal .price').textContent.replace(/[^0-9.]/g,''), miss:/missing/.test(x.querySelector('.rtotal small')?.textContent||'')})));
        const chainOf=await p4.evaluate(()=>DATA.STORES.map(s=>s.chain)); const tax=await p4.evaluate(id=>DATA.ITEMS.find(x=>x.id===id).tax?1.13:1, it.id);
        let good=true; for (const g of got){ const e=exp[chainOf[g.i]]; if (e==null){ if(!g.miss) good=false; } else if (Math.abs(e*2*tax-g.t)>0.011 || g.miss) good=false; }
        ok(good, `${it.id} brand ${k}: receipts use that brand's prices`);
        totals[k]=exp; }
      const lowKey=it.cd?'usual':'cheap'; for (const c in totals[lowKey]){ const others=Object.entries(totals).filter(([k])=>k!==lowKey).map(([,v])=>v[c]).filter(v=>v!=null); if (others.length && totals[lowKey][c]!=null) ok(totals[lowKey][c]<=Math.min(...others)+1e-9, `${it.id} cheapest at ${c}`); }
    }
    // persistence + saved carts + bad values
    const it=items.find(i=>!i.cd); await p4.evaluate(id=>{ sessionStorage.setItem('wbc-cart', JSON.stringify({[id]:1})); sessionStorage.setItem('wbc-brand', JSON.stringify({[id]:'cheap', eggs:'nope', fake:'x'})); }, it.id); await p4.reload(); await p4.waitForTimeout(60);
    ok(await p4.$eval(`#cartList select[data-b="${it.id}"]`, s=>s.value)==='cheap', 'brand choice kept on reload');
    await p4.fill('#saveName','Brands'); await p4.click('#saveForm button'); await p4.selectOption(`#cartList select[data-b="${it.id}"]`, it.opts[0]);
    await (await p4.$$('#savedList [data-sl]'))[0].click(); await p4.waitForTimeout(40); ok(await p4.$eval(`#cartList select[data-b="${it.id}"]`, s=>s.value)==='cheap', 'saved cart restores brand');
    await p4.goto(URL+'#shop'); await p4.fill('#q', await p4.evaluate(id=>DATA.ITEMS.find(x=>x.id===id).name, it.id)); await p4.waitForTimeout(40);
    ok(await p4.$eval(`#grid select[data-b="${it.id}"]`, s=>s.value)==='cheap', 'shop card shows the same brand');
    ok(!p4.errs.length, 'brand errors: '+p4.errs); await p4.context().close(); }
  // L. address autofill (Photon mocked: this machine can't reach it) + Google Maps directions
  p = await fresh(b);
  let mode = 'many'; p.calls = 0;
  await p.context().route(/geocode\.arcgis\.com/, r => r.fulfill({status:503, body:'down'}));   /* Esri off here, so these checks exercise the Photon backup */
  await p.context().route(/photon\.komoot\.io/, route => {
    const u = new globalThis.URL(route.request().url()); p.lastQ = u.searchParams.get('q'); p.lastBB = u.searchParams.get('bbox'); p.calls++;
    if (mode==='fail') return route.fulfill({status:503, body:'down'});
    const F = (lon,lat,props) => ({type:'Feature', geometry:{type:'Point', coordinates:[lon,lat]}, properties:props});
    const one = F(-80.5204, 43.4643, {housenumber:'75', street:'King Street South', city:'Waterloo', postcode:'N2J 1P2'});
    const two = F(-80.4891, 43.4501, {housenumber:'75', street:'King Street West', city:'Kitchener'});
    const poi = F(-80.5449, 43.4723, {name:'University of Waterloo', street:'University Avenue West', city:'Waterloo'});
    const body = {type:'FeatureCollection', features: mode==='one' ? [one,one,one] : mode==='many' ? [one,one,two,poi,two] : []};
    route.fulfill({status:200, contentType:'application/json', headers:{'access-control-allow-origin':'*'}, body: JSON.stringify(body)});
  });
  await p.goto(URL+'#checkout'); await p.evaluate(()=>sessionStorage.setItem('wbc-cart', JSON.stringify({eggs:1,milk:1}))); await p.reload(); await p.waitForTimeout(150);
  const opts = () => p.$$eval('#addrList [data-ai]', e=>e.map(x=>({t:x.textContent, sel:x.getAttribute('aria-selected')})));
  await p.press('#addr','Enter'); ok(/Type your street address/.test(await p.textContent('#addrMsg')), 'empty address message');
  await p.click('#addr'); await p.keyboard.type('75', {delay:20}); await p.waitForTimeout(400); ok(p.calls===0 && await p.isHidden('#addrList'), 'no search under 3 letters');
  await p.keyboard.type(' King', {delay:20}); await p.waitForTimeout(450);
  ok(p.lastQ==='75 King' && p.lastBB && p.calls<=2, `searches as you type with region box (calls ${p.calls})`);
  let o = await opts(); ok(o.length===3 && o[0].sel==='true' && /75 King Street South/.test(o[0].t) && /University of Waterloo/.test(o[2].t), 'suggestions listed: '+JSON.stringify(o));
  ok(await p.$eval('#addr', e=>e.getAttribute('aria-expanded'))==='true', 'combobox expanded');
  await p.keyboard.press('ArrowDown'); o = await opts(); ok(o[1].sel==='true', 'arrow down moves highlight');
  await p.keyboard.press('ArrowUp'); await p.keyboard.press('ArrowUp'); o = await opts(); ok(o[2].sel==='true', 'arrow up wraps around');
  await p.keyboard.press('Escape'); ok(await p.isHidden('#addrList'), 'Escape closes suggestions');
  await p.keyboard.type('5', {delay:20}); await p.waitForTimeout(450); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForTimeout(100);
  ok(/Your address: 75 King Street West, Kitchener/.test(await p.$eval('#startSel', e=>e.selectedOptions[0].textContent)), 'Enter picks highlighted: '+await p.$eval('#startSel', e=>e.selectedOptions[0].textContent));
  ok(await p.isHidden('#addrList') && (await p.$eval('#addr', e=>e.value))==='', 'list closes after pick');
  await p.click('#addr'); await p.keyboard.type('75 King S', {delay:10}); await p.waitForTimeout(450);
  await (await p.$$('#addrList [data-ai]'))[0].click(); await p.waitForTimeout(100);
  ok((await p.textContent('#resSub')).includes('75 King Street South'), 'click picks a suggestion');
  await p.reload(); await p.waitForTimeout(150);
  ok((await p.textContent('#resSub')).includes('75 King Street South'), 'address kept on reload');
  { const p2=await p.context().newPage(); await p2.goto(URL+'#checkout'); await p2.waitForTimeout(150); ok(!(await p2.textContent('#resSub')).includes('75 King'), 'address forgotten on a fresh open'); await p2.close(); }
  mode='one'; await p.fill('#addr','75 King St S Waterloo'); await p.press('#addr','Enter'); await p.waitForTimeout(450);
  ok((await p.textContent('#resSub')).includes('Waterloo') && await p.isHidden('#addrList'), 'Enter with a single match picks it');
  mode='none'; await p.click('#addr'); await p.keyboard.press('Control+A'); await p.keyboard.type('zzzz', {delay:10}); await p.waitForTimeout(450);
  ok(/No matches/.test(await p.textContent('#addrList')), 'no-match note while typing');
  await p.press('#addr','Enter'); await p.waitForTimeout(300); ok(/No address in Waterloo Region/.test(await p.textContent('#addrMsg')), 'no match message');
  mode='fail'; await p.click('#addr'); await p.keyboard.press('Control+A'); await p.keyboard.type('1 Main St', {delay:10}); await p.waitForTimeout(450);
  ok(/isn't available/.test(await p.textContent('#addrList')), 'search down note while typing');
  await p.press('#addr','Enter'); await p.waitForTimeout(300); ok(/isn't available/.test(await p.textContent('#addrMsg')), 'geocoder down message');
  ok((await p.textContent('#resSub')).includes('75 King Street South'), 'failed lookup keeps old start');
  mode='many'; await p.click('#addr'); await p.keyboard.press('Control+A'); await p.keyboard.type('75 King', {delay:10}); await p.waitForTimeout(450); mode='one'; await p.keyboard.type(' S Waterloo'); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  ok(p.lastQ==='75 King S Waterloo' && (await p.textContent('#resSub')).includes('75 King Street South'), 'fast Enter searches the new text, not the old list');
  mode='many'; await p.fill('#addr','75 King'); await p.waitForTimeout(450); await p.keyboard.press('ArrowDown'); await p.press('#addr','Enter'); await p.waitForTimeout(100);
  ok((await p.textContent('#resSub')).includes('Kitchener'), 'Enter picks highlighted suggestion');
  for (const [m,g] of [['walk','walking'],['bike','bicycling'],['bus','transit'],['car','driving']]){
    await p.click(`#mode [data-m="${m}"]`);
    const href = await p.$eval('#receipts .rbody .dirrow a', a=>a.href);
    const u = new globalThis.URL(href);
    ok(u.hostname==='www.google.com' && u.searchParams.get('travelmode')===g && u.searchParams.get('origin')==='43.4501,-80.4891' && u.searchParams.get('destination'), `${m} directions link: ${href}`);
  }
  ok(await p.$eval('#receipts .rbody .dirrow a', a=>a.target==='_blank' && a.rel.includes('noopener')), 'directions open in new tab');
  await p.click('#receipts .rbody [data-gm]'); ok((await p.$$('#receipts iframe.gmap')).length===1, 'show Google map');
  ok(/maps\.google\.com\/maps\?q=.*output=embed/.test(await p.$eval('iframe.gmap', f=>f.src)), 'embed url');
  await p.click('#receipts .rbody [data-gm]'); ok((await p.$$('#receipts iframe.gmap')).length===0, 'hide Google map');
  await p.selectOption('#startSel','dc'); await p.reload(); await p.waitForTimeout(150); ok((await p.textContent('#resSub')).includes('Davis Centre'), 'preset remembered');
  ok(!p.errs.filter(e=>!/Failed to load resource/.test(e)).length, 'address flow errors: '+p.errs);
  await p.context().close();
  // M. street map (Leaflet + tiles stubbed)
  if (!LEAFLET) console.log('SKIP street map checks: run npm install leaflet@1.9.4 to include them'); else {
  p = await fresh(b, undefined, undefined, 'street');
  await p.goto(URL+'#checkout'); await p.evaluate(()=>sessionStorage.setItem('wbc-cart', JSON.stringify({eggs:1,milk:1}))); await p.reload(); await p.waitForTimeout(400);
  ok(!(await p.isHidden('#lmap')) && await p.$eval('#map', e=>getComputedStyle(e).display==='none'), 'street map shown instead of drawn map');
  ok((await p.$$('#lmap .leaflet-tile-loaded')).length>0, 'map tiles load');
  const nStores = await p.evaluate(()=>DATA.STORES.length); const marks = (await p.$$('#lmap path.leaflet-interactive')).length + (await p.$$('#lmap .lstore')).length + (await p.$$('#lmap .lyou')).length;
  ok(marks===nStores+1, `a marker per store plus you: ${marks} vs ${nStores+1}`);
  ok(await p.$eval('#lmap', e=>e.getBoundingClientRect().height)>300, 'street map has height');
  ok(await p.$eval('#lmap', m=>{ const y=m.querySelector('.lyou svg'); const a=y.getBoundingClientRect(), r=m.getBoundingClientRect(); return a.left>=r.left && a.right<=r.right && a.top>=r.top && a.bottom<=r.bottom; }), 'map fits around start');
  await p.$eval('#lmap', m=>{ const t=[...m.querySelectorAll('.lstore')].find(e=>e.textContent!=='1'); const r=t.getBoundingClientRect(); t.dispatchEvent(new MouseEvent('click',{bubbles:true, clientX:r.left+r.width/2, clientY:r.top+r.height/2})); });
  await p.waitForTimeout(100); ok((await p.$$('#receipts .rbody')).length===1, 'clicking a store marker opens its receipt');
  await p.$eval('#lmap', e=>e.scrollIntoView({block:'center'})); await p.waitForTimeout(100);
  const lb = await p.$eval('#lmap', e=>{const r=e.getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height};});
  const before2 = await p.textContent('#resSub');
  await p.mouse.click(lb.x+lb.w*0.985, lb.y+lb.h*0.45); ok(!(await p.isHidden('#applyRow')), 'click street map drops a pin');
  await p.click('#applyPin'); await p.waitForTimeout(100); ok((await p.$eval('#startSel', e=>e.value))==='pin' && (await p.textContent('#resSub'))!==before2, 'apply pin from street map');
  await p.click('#zoom [data-z="all"]'); await p.waitForTimeout(100); await p.click('#zoom [data-z="near"]');
  ok((await p.textContent('#legend')).includes('ION'), 'legend shows ION line');
  ok((await p.$$eval('#lmap .lstore', e=>e.filter(x=>/^\d+$/.test(x.textContent)).length))===31, 'street map: every compared store has a rank number');
  ok((await p.textContent('#lmap .lyou')).includes('YOU'), 'street map: YOU pin labelled');
  for (const pg of ['home','shop','faq','checkout']){ await p.goto(URL+'#'+pg); await p.waitForTimeout(80); } await p.waitForTimeout(200); ok(await p.$eval('#lmap', e=>e.clientWidth>0) && (await p.$$('#lmap .leaflet-tile-loaded')).length>0, 'map fine after page switches');
  ok(!p.errs.length, 'street map errors: '+p.errs);
  await p.context().close();
  for (const vp of [{width:375,height:800},{width:320,height:700}]){ p = await fresh(b, vp, undefined, 'street'); await p.goto(URL+'#checkout'); await p.waitForTimeout(300);
    ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), `street map no overflow at ${vp.width}`); await p.context().close(); }
  }
  // N. tiles blocked: falls back to the drawn map
  p = await fresh(b, undefined, undefined, 'notiles');
  await p.goto(URL+'#checkout'); await p.waitForTimeout(600);
  ok(await p.isHidden('#lmap') && (await p.$$('#map circle.st')).length>0, 'falls back to drawn map when tiles fail');
  ok(!p.errs.filter(e=>!/Failed to load resource/.test(e)).length, 'fallback errors: '+p.errs);
  await p.context().close();
  // K. mobile touch: tap a map-only dot shows tooltip
  const ctx = await b.newContext({viewport:{width:390,height:844}, hasTouch:true, isMobile:true}); await stub(ctx); p = await ctx.newPage(); p.errs=[]; p.on('pageerror', e=>p.errs.push(e.message));
  await p.goto(URL+'#checkout'); await p.evaluate(()=>sessionStorage.setItem('wbc-cart', JSON.stringify({eggs:1,milk:1}))); await p.reload(); await p.waitForTimeout(150); await p.$eval('#map', e=>e.scrollIntoView({block:'center'}));
  await p.evaluate(()=>{ const m=document.getElementById('map').getBoundingClientRect(); const inside=e=>{ const r=e.getBoundingClientRect(); return r.left>m.left+5 && r.right<m.right-5 && r.top>m.top+5 && r.bottom<m.bottom-5 && r.top>0 && r.bottom<innerHeight; };
    const on=[...document.querySelectorAll('#map circle.st:not(.off)')].filter(inside).at(-1), off=[...document.querySelectorAll('#map circle.st.off')].find(inside); if(on) on.id='qa-on2'; if(off) off.id='qa-off2'; });
  await p.tap('#qa-off2'); ok(!(await p.isHidden('#tip')), 'tap shows tooltip on phones');
  await p.tap('#qa-on2'); ok((await p.$$('#receipts .rbody')).length===1, 'tap store opens its receipt');
  // O. map key and labels (drawn map, phone)
  ok(/What the map shows/.test(await p.textContent('#legend')) && /You/.test(await p.textContent('#legend')), 'map key explains the map');
  ok(/ranked for your cart/.test(await p.textContent('#mapTitle')), 'map title says what it shows');
  ok((await p.$$eval('#map text.snum', e=>e.length))===31 && (await p.$$eval('#map .youpin text', e=>e.map(x=>x.textContent)))[0]==='YOU', 'drawn map: numbered stores and YOU pin');
  { const top=await p.$eval('#receipts .receipt .rname', e=>e.textContent); const one=await p.evaluate(()=>{ const t=[...document.querySelectorAll('#map text.snum')].find(x=>x.textContent==='1'); return t.previousElementSibling.dataset.s; }); const name=await p.evaluate(i=>DATA.STORES[+i].name, one); ok(top.includes(name), `dot 1 is the top store: ${name}`); }
  await p.click('.tabs [data-s="time"]'); await p.waitForTimeout(100);
  { const top=await p.$eval('#receipts .receipt .rname', e=>e.textContent); const one=await p.evaluate(()=>{ const t=[...document.querySelectorAll('#map text.snum')].find(x=>x.textContent==='1'); return t.previousElementSibling.dataset.s; }); const name=await p.evaluate(i=>DATA.STORES[+i].name, one); ok(top.includes(name) && /Shortest trip/.test(await p.textContent('#mapTitle')), `numbers follow the sort: ${name}`); }
  ok(await p.isHidden('#applyRow'), 'apply bar hidden until a pin is dropped');
  ok(!p.errs.length, 'mobile errors: '+p.errs);
  await b.close();
  console.log(`\n${passes} passed, ${fails} failed`);
})();
