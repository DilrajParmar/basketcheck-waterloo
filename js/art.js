/* Product illustrations: one flat drawing per item, 120x90 viewBox. Colours are fixed (they are packaging colours, like a photo). */
const ART = (()=>{
  const sh = `<ellipse cx="60" cy="83" rx="36" ry="4" fill="#000" opacity=".1"/>`;
  const t = (x,y,s,txt,fill="#fff",w=700) => `<text x="${x}" y="${y}" font-family="Familjen Grotesk, Arial, sans-serif" font-size="${s}" font-weight="${w}" fill="${fill}" text-anchor="middle">${txt}</text>`;
  const shine = (x,y,w,h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w/2}" fill="#fff" opacity=".35"/>`;
  const leaf = (x,y,r=0) => `<path d="M${x} ${y}c6-8 16-8 20-4-6 6-14 8-20 4Z" fill="#4c9a3b" transform="rotate(${r} ${x} ${y})"/>`;
  const round = (fill, r=25, extra="") => `${sh}<circle cx="60" cy="50" r="${r}" fill="${fill}"/><path d="M60 ${50-r}c0-6 2-9 5-11" stroke="#6b4a2b" stroke-width="3" fill="none" stroke-linecap="round"/>${leaf(63,50-r-3,-20)}<ellipse cx="${60-r*0.4}" cy="${50-r*0.4}" rx="${r*0.18}" ry="${r*0.3}" fill="#fff" opacity=".35"/>${extra}`;
  const pouch = (c, lbl, sub, win="", c2="#fff") => `${sh}<path d="M34 16h52l4 64H30Z" fill="${c}"/><path d="M34 16h52v6H34Z" fill="#000" opacity=".15"/>${win}<rect x="36" y="56" width="48" height="14" rx="2" fill="${c2}"/>${t(60,66,8,lbl,c)}${sub?t(60,51,6.5,sub,"#fff",600):""}`;
  const box = (c, lbl, sub, c2="#fff") => `${sh}<path d="M38 12h44v70H38Z" fill="${c}"/><path d="M82 12l8 -5v70l-8 5Z" fill="#000" opacity=".2"/><path d="M38 12l8 -5h44l-8 5Z" fill="#fff" opacity=".25"/>${t(60,42,10,lbl,c2)}${sub?t(60,55,6.5,sub,c2,600):""}`;
  const can = (lab, lbl, sub, h=56, body="#c9cdd2") => { const y=80-h; return `${sh}<rect x="40" y="${y}" width="40" height="${h}" rx="4" fill="${body}"/><rect x="40" y="${y+6}" width="40" height="${h-12}" fill="${lab}"/><ellipse cx="60" cy="${y}" rx="20" ry="4" fill="#e3e6e9"/>${t(60,y+h/2+2,h>40?8:7,lbl)}${sub?t(60,y+h/2+11,5.5,sub,"#fff",600):""}${shine(44,y+8,3,h-16)}`; };
  const jar = (lid, fill, lbl, labc="#fff", txc="#333") => `${sh}<rect x="40" y="16" width="40" height="10" rx="2" fill="${lid}"/><rect x="37" y="24" width="46" height="57" rx="9" fill="${fill}"/><rect x="40" y="42" width="40" height="20" rx="2" fill="${labc}"/>${t(60,55,7.5,lbl,txc)}${shine(41,28,4,40)}`;
  const tub = (lid, body, lbl, txc="#fff") => `${sh}<path d="M32 36h56l-5 44H37Z" fill="${body}"/><rect x="29" y="28" width="62" height="10" rx="3" fill="${lid}"/>${t(60,62,9,lbl,txc)}`;
  const carton = (c, lbl, sub, c2="#fff") => `${sh}<path d="M42 30l18-14 18 14v50H42Z" fill="${c2}"/><path d="M42 30l18-14 18 14Z" fill="#000" opacity=".08"/><rect x="58" y="10" width="4" height="8" fill="${c}"/><rect x="42" y="46" width="36" height="26" fill="${c}"/>${t(60,60,8,lbl)}${sub?t(60,68,5.5,sub,"#fff",600):""}`;
  const block = (wrap, lbl, txc="#fff", sub="") => `${sh}<path d="M24 46l32-14 40 12-32 16Z" fill="${wrap}" opacity=".85"/><path d="M24 46l40 14v18L24 64Z" fill="${wrap}"/><path d="M64 60l32-16v18L64 78Z" fill="#000" opacity=".18"/><path d="M64 60l32-16v18L64 78Z" fill="${wrap}" opacity=".6"/>${t(44,66,7.5,lbl,txc)}${sub?t(44,73,5,sub,txc,600):""}`;
  const tray = (meat) => `${sh}<rect x="22" y="40" width="76" height="38" rx="6" fill="#e9ecef"/><rect x="26" y="44" width="68" height="30" rx="4" fill="#f8f9fa"/>${meat}<rect x="22" y="40" width="76" height="38" rx="6" fill="#fff" opacity=".18"/>`;
  const loaf = (crust, inside, band, lbl) => `${sh}<path d="M28 46c0-14 10-22 32-22s32 8 32 22v34H28Z" fill="${crust}"/><path d="M33 47c0-10 8-17 27-17s27 7 27 17v31H33Z" fill="${inside}"/><rect x="28" y="58" width="64" height="12" fill="${band}"/>${t(60,67,7.5,lbl)}`;
  const bottle = (c, lbl, cap, tall=false) => tall
    ? `${sh}<rect x="54" y="6" width="12" height="10" fill="${cap}"/><path d="M54 16h12v10l6 8v46H48V34l6-8Z" fill="${c}"/><rect x="48" y="46" width="24" height="18" fill="#fff" opacity=".85"/>${t(60,58,6,lbl,"#333")}${shine(51,36,3,40)}`
    : `${sh}<rect x="53" y="10" width="14" height="9" rx="2" fill="${cap}"/><path d="M53 19h14l10 18v43H43V37Z" fill="${c}"/><rect x="45" y="48" width="30" height="16" fill="#fff" opacity=".9"/>${t(60,59,7,lbl,c)}${shine(47,38,4,36)}`;

  const A = {
    banana: `${sh}<path d="M30 40c6 26 34 38 58 26-20 4-40-6-50-28Z" fill="#f2c94c"/><path d="M34 34c8 26 36 34 56 20-20 2-40-6-48-24Z" fill="#f6d55c"/><path d="M38 28c10 24 36 30 54 14-20 2-38-4-46-20Z" fill="#f9df6d"/><path d="M34 22l8 6-4 4-6-8Z" fill="#6b4a2b"/>`,
    apple: round("#d8392b"),
    orange: round("#f28c1b", 25, `<circle cx="66" cy="56" r="1.2" fill="#c66a0e"/><circle cx="52" cy="60" r="1.2" fill="#c66a0e"/><circle cx="70" cy="44" r="1.2" fill="#c66a0e"/>`),
    lemon: `${sh}<ellipse cx="60" cy="50" rx="30" ry="21" fill="#f5d23a"/><path d="M28 50l-5 0M92 50l5 0" stroke="#e2bb17" stroke-width="5" stroke-linecap="round"/><ellipse cx="50" cy="42" rx="8" ry="4" fill="#fff" opacity=".4"/>`,
    avocado: `${sh}<path d="M44 22c8-6 18 2 22 14 4 10 12 18 10 30-2 12-14 16-24 14S30 70 32 56c2-12 6-26 12-34Z" fill="#3f5d2a"/><path d="M70 30c6-4 14 2 16 12 2 8 8 14 6 24-2 10-12 13-19 11s-14-8-12-19c2-10 4-23 9-28Z" fill="#b9cf6a"/><circle cx="76" cy="60" r="8" fill="#7a4a24"/>`,
    onion: `${sh}<path d="M60 18c4 8 26 18 26 38 0 14-12 24-26 24S34 70 34 56c0-20 22-30 26-38Z" fill="#c98b3f"/><path d="M60 22c-4 14-8 34-4 56M60 22c4 14 8 34 4 56M60 22c-12 14-20 34-14 54M60 22c12 14 20 34 14 54" stroke="#a96e2b" stroke-width="1.2" fill="none"/><path d="M60 18l-2-8M60 18l3-8" stroke="#8a6a3a" stroke-width="2"/>`,
    carrot: `${sh}${[[-18,0],[0,-4],[18,0]].map(([dx,dy])=>`<g transform="translate(${dx} ${dy})"><path d="M52 30h16l-6 50h-4Z" fill="#f07c24"/><path d="M56 40h6M55 52h6M57 64h4" stroke="#c95f12" stroke-width="1.2"/><path d="M60 30c-6-10-10-14-12-18M60 30c0-10 0-14 2-20M60 30c6-10 10-12 14-16" stroke="#4c9a3b" stroke-width="3" stroke-linecap="round" fill="none"/></g>`).join("")}`,
    lettuce: `${sh}<circle cx="60" cy="52" r="28" fill="#9fd36b"/><path d="M36 50c8-14 40-14 48 0M38 60c8-10 36-10 44 0M44 40c8-8 24-8 32 0" stroke="#78b346" stroke-width="2.5" fill="none"/><circle cx="60" cy="52" r="28" fill="none" stroke="#6aa63b" stroke-width="2"/>`,
    tomato: `${sh}${[[44,54],[76,54],[60,44]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="16" fill="#e0402f"/><ellipse cx="${x-5}" cy="${y-6}" rx="3" ry="5" fill="#fff" opacity=".35"/>`).join("")}<path d="M44 38c6-10 26-10 32 0M60 28v-8" stroke="#3f7d2c" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    cucumber: `${sh}<rect x="18" y="40" width="84" height="22" rx="11" fill="#3d7a35" transform="rotate(-12 60 51)"/><rect x="26" y="44" width="60" height="4" rx="2" fill="#fff" opacity=".3" transform="rotate(-12 60 51)"/><rect x="18" y="40" width="84" height="22" rx="11" fill="#fff" opacity=".12" transform="rotate(-12 60 51)"/>`,
    garlic: `${sh}<path d="M60 22c2 8 24 16 24 36 0 14-10 22-24 22S36 72 36 58c0-20 22-28 24-36Z" fill="#f3efe6"/><path d="M60 26c-6 14-8 34-2 52M60 26c6 14 8 34 2 52M48 40c-6 12-4 28 2 38M72 40c6 12 4 28-2 38" stroke="#d6cdb8" stroke-width="1.4" fill="none"/><path d="M60 22v-8" stroke="#cfc4a8" stroke-width="3"/>`,
    mushroom: `${sh}${[[42,50,1],[78,52,.9],[60,40,1.1]].map(([x,y,s])=>`<g transform="translate(${x} ${y}) scale(${s})"><rect x="-6" y="0" width="12" height="18" rx="4" fill="#efe6d6"/><path d="M-18 4c0-14 8-20 18-20s18 6 18 20Z" fill="#e8dcc6"/><path d="M-18 4h36" stroke="#cbbca2" stroke-width="2"/></g>`).join("")}`,
    strawberry: `${sh}<rect x="24" y="30" width="72" height="48" rx="6" fill="#e9f2f5" opacity=".9"/>${[[38,52],[56,48],[74,52],[46,66],[66,66],[84,64]].map(([x,y])=>`<path d="M${x} ${y-8}c8 0 12 4 10 10-2 6-6 10-10 12-4-2-8-6-10-12-2-6 2-10 10-10Z" fill="#d7263d"/><path d="M${x-5} ${y-8}h10l-5-4Z" fill="#4c9a3b"/>`).join("")}<rect x="24" y="30" width="72" height="48" rx="6" fill="none" stroke="#b8cdd4" stroke-width="2"/>`,
    blueberry: `${sh}<rect x="24" y="30" width="72" height="48" rx="6" fill="#e9f2f5" opacity=".9"/>${Array.from({length:18},(_,i)=>`<circle cx="${32+(i%6)*11+(i>5&&i<12?5:0)}" cy="${42+Math.floor(i/6)*12}" r="6" fill="#3b4a8c"/>`).join("")}<rect x="24" y="30" width="72" height="48" rx="6" fill="none" stroke="#b8cdd4" stroke-width="2"/>`,
    grape: `${sh}${[[50,30],[62,30],[74,30],[44,42],[56,42],[68,42],[80,42],[50,54],[62,54],[74,54],[56,66],[68,66],[62,76]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7.5" fill="#a9cf5b" stroke="#8db546" stroke-width="1"/>`).join("")}<path d="M62 22v-10l8-4" stroke="#6b4a2b" stroke-width="3" fill="none"/>`,
    eggs: `${sh}<path d="M18 50h84l-6 28H24Z" fill="#c9c3b7"/>${[30,47,64,81].map(x=>`<ellipse cx="${x+4}" cy="44" rx="9" ry="11" fill="#fbf7ef"/>`).join("")}<path d="M18 50h84" stroke="#b3ac9e" stroke-width="3"/>${t(60,70,8,"LARGE · 12","#6f675a")}`,
    milk: `${sh}<path d="M40 22h30l10 10v48H36V30Z" fill="#fafafa"/><rect x="48" y="14" width="14" height="9" rx="2" fill="#2f6fb4"/><path d="M70 30h8v24h-8" fill="none" stroke="#e5e5e5" stroke-width="5"/><rect x="36" y="48" width="44" height="22" fill="#2f6fb4"/>${t(58,62,11,"2%")}${t(58,44,6,"4 L","#2f6fb4")}`,
    butter: block("#e8c25a", "BUTTER", "#5a4100", "454 g · salted"),
    cheddar: block("#f0a33a", "CHEDDAR", "#5a3400", "400 g"),
    mozza: pouch("#2f6fb4", "MOZZA", "shredded", `<path d="M44 26h32v24H44Z" fill="#fbf3dc"/><path d="M48 30l6 8M58 30l-4 10M64 32l6 10M50 42l8 4M66 28l4 8" stroke="#efdca8" stroke-width="2"/>`),
    greek: tub("#e9eef3", "#ffffff", "GREEK", "#2f4f7f"),
    cream_cheese: block("#cfe0f2", "CREAM", "#24456e", "cheese · 250 g"),
    sour_cream: tub("#2e8b57", "#f5f7f4", "SOUR CREAM", "#2e8b57"),
    cream: carton("#c08a3e", "18%", "CREAM"),
    almond: carton("#6b4a2b", "ALMOND", "unsweetened", "#f2ead9"),
    bread_white: loaf("#c98a43", "#f6ead4", "#d1462f", "WHITE"),
    bread_ww: loaf("#8a5a2b", "#d9b98a", "#2e7d4f", "WHOLE WHEAT"),
    bagel: `${sh}${[[44,58],[74,54],[58,40]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="18" ry="13" fill="#d39a52"/><ellipse cx="${x}" cy="${y-1}" rx="5" ry="3.5" fill="#f3e3c4"/><ellipse cx="${x-6}" cy="${y-6}" rx="5" ry="2" fill="#fff" opacity=".25"/>`).join("")}`,
    muffin: `${sh}${[66,56,46].map((y,i)=>`<ellipse cx="60" cy="${y}" rx="24" ry="9" fill="#efdcb8"/><ellipse cx="60" cy="${y-3}" rx="24" ry="8" fill="#f6ead2"/><circle cx="${52+i*4}" cy="${y-4}" r="1" fill="#d7c29a"/><circle cx="${66-i*3}" cy="${y-2}" r="1" fill="#d7c29a"/>`).join("")}`,
    buns: `${sh}${[[40,56],[80,56],[60,46]].map(([x,y])=>`<path d="M${x-18} ${y+8}c0-14 8-20 18-20s18 6 18 20Z" fill="#d79a4e"/><path d="M${x-18} ${y+8}h36v6h-36Z" fill="#f3dfb8"/>${[0,1,2].map(k=>`<ellipse cx="${x-8+k*8}" cy="${y-6+(k%2)*3}" rx="1.4" ry=".8" fill="#fbf3dc"/>`).join("")}`).join("")}`,
    chicken_breast: tray(`<path d="M32 52c6-8 22-8 26 2 2 8-6 16-16 16s-14-10-10-18Z" fill="#f4c2b0"/><path d="M62 50c6-8 22-6 26 4 2 8-6 14-16 14s-14-10-10-18Z" fill="#f1b9a5"/>`),
    chicken_thigh: tray(`${[[40,58],[60,56],[80,58]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="11" ry="9" fill="#eaa98f"/><ellipse cx="${x-2}" cy="${y-2}" rx="5" ry="3" fill="#f6cdbd"/>`).join("")}`),
    beef: tray(`<path d="M32 66c2-12 12-18 28-18s26 6 28 18Z" fill="#b8333a"/>${Array.from({length:14},(_,i)=>`<circle cx="${36+i*3.6}" cy="${60+(i%3)*2}" r="1.3" fill="#e06a6f"/>`).join("")}`),
    bacon: tray(`${[50,57,64].map(y=>`<path d="M30 ${y}c10-4 18 4 30 0s20-4 30 0" stroke="#c0483c" stroke-width="5" fill="none"/><path d="M30 ${y}c10-4 18 4 30 0s20-4 30 0" stroke="#f4c8b8" stroke-width="1.6" fill="none"/>`).join("")}`),
    salmon: tray(`<path d="M30 54c18-6 44-6 60 2l-4 14c-18 4-40 4-54-2Z" fill="#f08a5d"/>${[42,52,62,72,82].map(x=>`<path d="M${x} 52c-3 6-3 12 0 18" stroke="#fbd3c0" stroke-width="1.6" fill="none"/>`).join("")}`),
    shrimp: pouch("#1f5f99", "SHRIMP", "frozen raw", `${[[50,38],[70,38],[60,30]].map(([x,y])=>`<path d="M${x-8} ${y}a8 8 0 1 0 8-8" stroke="#f3926b" stroke-width="5" fill="none" stroke-linecap="round"/>`).join("")}`),
    ham: tray(`${[[44,60],[60,57],[76,60]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="14" ry="10" fill="#f2a9a9"/><ellipse cx="${x}" cy="${y}" rx="14" ry="10" fill="none" stroke="#e48e8e" stroke-width="2"/>`).join("")}`),
    wieners: tray(`${[50,57,64].map(y=>`<rect x="30" y="${y-3}" width="60" height="7" rx="3.5" fill="#d0705a"/>`).join("")}`),
    nuggets: pouch("#e4a12c", "NUGGETS", "chicken", `${[[48,38],[64,34],[74,42],[56,46]].map(([x,y])=>`<path d="M${x-7} ${y}c0-5 4-8 8-8s8 3 7 8-4 6-8 6-7-2-7-6Z" fill="#d18a2f"/>`).join("")}`, "#7a3e00"),
    rice: pouch("#f3f0e8", "WHITE RICE", "", `<rect x="40" y="24" width="40" height="22" rx="2" fill="#fff"/>${Array.from({length:16},(_,i)=>`<ellipse cx="${44+(i%8)*4.5}" cy="${30+Math.floor(i/8)*8}" rx="1.8" ry=".9" fill="#ddd6c6"/>`).join("")}`, "#2f6fb4").replace('fill="#f3f0e8"/><path','fill="#2f6fb4"/><path'),
    jasmine: pouch("#7a2f8a", "JASMINE", "2 kg", `<rect x="40" y="24" width="40" height="22" rx="2" fill="#fbf8f0"/>${Array.from({length:16},(_,i)=>`<ellipse cx="${44+(i%8)*4.5}" cy="${30+Math.floor(i/8)*8}" rx="1.8" ry=".9" fill="#e4dcc8"/>`).join("")}`),
    spaghetti: `${sh}<rect x="28" y="26" width="64" height="40" rx="4" fill="#1f4e9a" transform="rotate(-10 60 46)"/>${Array.from({length:9},(_,i)=>`<line x1="${30+i*2}" y1="${60-i*0.4}" x2="${96+i*0.6}" y2="${48-i*0.4}" stroke="#f1d58a" stroke-width="1.6"/>`).join("")}<rect x="40" y="52" width="40" height="12" fill="#fff" transform="rotate(-10 60 58)"/>${t(60,62,7,"SPAGHETTI","#1f4e9a")}`,
    penne: pouch("#1f4e9a", "PENNE", "900 g", `<rect x="40" y="24" width="40" height="22" rx="2" fill="#fbf3dc"/>${[[46,30],[58,28],[70,32],[50,40],[64,40]].map(([x,y])=>`<path d="M${x} ${y}l8-3 2 6-8 3Z" fill="#e8c46a"/>`).join("")}`),
    sauce: jar("#2e7d32", "#c0392b", "SAUCE", "#fff7e6", "#c0392b"),
    diced_tom: can("#c0392b", "DICED", "TOMATOES"),
    black_beans: can("#2c2c2c", "BLACK", "BEANS"),
    chickpeas: can("#c99a3c", "CHICK", "PEAS"),
    tuna: can("#1f5f99", "TUNA", "chunk light", 30),
    kd: box("#1f6fd1", "KD", "original", "#ffd23f"),
    noodles: `${sh}<path d="M24 42l36-12 36 12-36 14Z" fill="#f28c1b"/><path d="M24 42l36 14v22L24 64Z" fill="#e0751a"/><path d="M96 42L60 56v22l36-14Z" fill="#c9620f"/>${t(43,64,6.5,"NOODLES")}`,
    soup: can("#c8102e", "SOUP", "chicken noodle", 42, "#e9e9e9"),
    pb: jar("#c8102e", "#a86a32", "P. BUTTER", "#1f4e9a", "#fff"),
    jam: jar("#e9e1d6", "#a3172b", "JAM", "#fff", "#a3172b"),
    honey: jar("#f2c94c", "#e09a1a", "HONEY", "#fff8e1", "#a86500"),
    flour: `${sh}<path d="M36 18h48v62H36Z" fill="#f4efe4"/><path d="M36 18l6-6h36l6 6Z" fill="#e3dccb"/><rect x="36" y="40" width="48" height="18" fill="#2f6fb4"/>${t(60,52,8,"FLOUR")}${t(60,72,5.5,"ALL-PURPOSE · 2.5 kg","#2f6fb4",600)}`,
    sugar: `${sh}<path d="M38 18h44v62H38Z" fill="#fff"/><path d="M38 18l6-6h32l6 6Z" fill="#eee"/><rect x="38" y="40" width="44" height="18" fill="#d1462f"/>${t(60,52,8,"SUGAR")}${t(60,72,5.5,"GRANULATED · 2 kg","#d1462f",600)}`,
    olive: bottle("#4f6b1c", "OLIVE", "#c9a227", true),
    oats: `${sh}<rect x="40" y="18" width="40" height="62" rx="4" fill="#c46a2d"/><ellipse cx="60" cy="18" rx="20" ry="5" fill="#e3e6e9"/><rect x="40" y="38" width="40" height="22" fill="#f6e6c8"/>${t(60,52,8,"OATS","#c46a2d")}${t(60,72,5.5,"QUICK · 1 kg")}`,
    cheerios: box("#f7c600", "Cheerios", "family size", "#1a1a1a"),
    ketchup: bottle("#c8102e", "HEINZ", "#fff"),
    mayo: jar("#1f4e9a", "#fbf6e8", "MAYO", "#1f4e9a", "#fff"),
    tea: box("#c8102e", "TEA", "72 bags", "#fff"),
    crackers: box("#d7192f", "RITZ", "crackers", "#ffd23f"),
    chips: pouch("#f6c90e", "CLASSIC", "potato chips", `<circle cx="60" cy="34" r="12" fill="#c8102e"/><ellipse cx="60" cy="34" rx="8" ry="5" fill="#f9e27a"/>`, "#c8102e"),
    salt: `${sh}<rect x="42" y="16" width="36" height="64" rx="4" fill="#1f5f99"/><ellipse cx="60" cy="16" rx="18" ry="4" fill="#e3e6e9"/><rect x="42" y="36" width="36" height="20" fill="#fff"/>${t(60,49,8,"SALT","#1f5f99")}${t(60,70,5.5,"1 kg")}`,
    frozen_veg: pouch("#1d7a46", "MIXED VEG", "frozen", `${[[46,32,"#f07c24"],[54,38,"#f5d23a"],[64,30,"#4c9a3b"],[72,38,"#f07c24"],[60,42,"#4c9a3b"],[50,44,"#f5d23a"]].map(([x,y,c])=>`<rect x="${x}" y="${y}" width="6" height="6" rx="1.5" fill="${c}"/>`).join("")}`),
    frozen_berry: pouch("#7a1f3d", "BERRIES", "frozen", `${[[48,36],[60,30],[72,36],[60,42]].map(([x,y])=>`<path d="M${x} ${y-6}c6 0 9 3 8 8s-5 8-8 9c-3-1-7-4-8-9s2-8 8-8Z" fill="#d7263d"/>`).join("")}`),
    fries: pouch("#c8102e", "FRIES", "", `${[44,50,56,62,68,74].map((x,i)=>`<rect x="${x}" y="${26+(i%3)*4}" width="4" height="20" rx="1" fill="#f3c34a"/>`).join("")}`),
    ice_cream: tub("#7b4a2b", "#fdf4e3", "VANILLA", "#7b4a2b"),
    oj: carton("#f28c1b", "ORANGE", "JUICE"),
    coke: `${sh}<path d="M22 34h76v46H22Z" fill="#d7192f"/><path d="M22 34l8-8h76l-8 8Z" fill="#b5121f"/><path d="M98 34l8-8v46l-8 8Z" fill="#9e0f1b"/>${t(60,58,9,"COLA")}${t(60,70,6,"12 × 355 ml")}`,
    water: `${sh}${[0,1,2,3].map(i=>`<g transform="translate(${30+i*16} 0)"><rect x="-6" y="22" width="12" height="56" rx="5" fill="#bfe0f5"/><rect x="-3" y="16" width="6" height="7" fill="#2f6fb4"/><rect x="-6" y="44" width="12" height="12" fill="#2f6fb4"/></g>`).join("")}<rect x="20" y="58" width="80" height="20" fill="#fff" opacity=".35"/>${t(60,72,7,"SPRING WATER · 24","#1f4e9a")}`,
    paper_towel: `${sh}${[[44,40],[76,40],[60,58]].map(([x,y])=>`<rect x="${x-14}" y="${y-14}" width="28" height="30" rx="4" fill="#fff" stroke="#d9dde2"/><ellipse cx="${x}" cy="${y-14}" rx="14" ry="4" fill="#f1f3f5" stroke="#d9dde2"/><ellipse cx="${x}" cy="${y-14}" rx="4" ry="1.4" fill="#c9b79a"/>`).join("")}`,
    dish_soap: bottle("#1f6fd1", "DISH SOAP", "#f2c94c", true),
    potato: `${sh}<path d="M24 76c-4-10 4-22 12-24l40 0c14 0 22 6 22 14s-6 12-14 12H30c-3 0-5-1-6-2Z" fill="#b5803f"/><path d="M28 30h64l6 46H22Z" fill="#e8dcc0" opacity=".55"/>${[[42,58],[62,54],[80,60],[52,68],[72,70]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="13" ry="9" fill="#c9965a"/><circle cx="${x-4}" cy="${y-2}" r="1.2" fill="#8a5f2c"/><circle cx="${x+5}" cy="${y+2}" r="1" fill="#8a5f2c"/>`).join("")}<rect x="28" y="22" width="64" height="10" rx="2" fill="#7a5a2b"/>${t(60,30,7,"RUSSET")}`,
    broccoli: `${sh}<path d="M54 52h12l-2 26h-8Z" fill="#7fae4a"/>${[[44,42,13],[60,34,15],[76,42,13],[52,52,11],[68,52,11]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#3f8a34"/><circle cx="${x-3}" cy="${y-3}" r="${r*0.4}" fill="#5aa64a"/>`).join("")}`,
    pepper: `${sh}<path d="M60 26c-14-4-28 6-28 22 0 18 10 30 28 30s28-12 28-30c0-16-14-26-28-22Z" fill="#d42a1e"/><path d="M60 26c-4 10-4 40 0 52" stroke="#a81c13" stroke-width="2" fill="none"/><path d="M56 26c0-6 2-10 8-12" stroke="#3f7d2c" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="44" cy="42" rx="4" ry="9" fill="#fff" opacity=".3"/>`,
    spinach: `${sh}<rect x="24" y="30" width="72" height="48" rx="6" fill="#e9f2f5" opacity=".9"/>${[[38,48,-30],[54,44,10],[72,48,30],[46,62,-10],[66,62,20],[84,60,40]].map(([x,y,r])=>`<path d="M${x} ${y}c-8-2-10-12-2-16 8 0 10 10 2 16Z" fill="#2f7a2c" transform="rotate(${r} ${x} ${y})"/>`).join("")}<rect x="24" y="30" width="72" height="48" rx="6" fill="none" stroke="#b8cdd4" stroke-width="2"/>${t(60,26,7,"BABY SPINACH","#2f7a2c")}`,
    tortilla: `${sh}${[0,1,2].map(i=>`<ellipse cx="60" cy="${66-i*7}" rx="36" ry="12" fill="${["#e8cf9a","#efdaae","#f4e4c0"][i]}" stroke="#d9bb80" stroke-width="1"/>`).join("")}${[[48,50],[64,48],[74,54],[56,56]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2" fill="#c9a060"/>`).join("")}`,
    pork_chop: tray(`${[[46,58],[74,58]].map(([x,y])=>`<path d="M${x-14} ${y}c0-8 8-12 16-12s14 6 12 12-8 10-14 10-14-2-14-10Z" fill="#f1b3a8"/><path d="M${x-14} ${y}c0-8 8-12 16-12" stroke="#fbe3dc" stroke-width="3" fill="none"/>`).join("")}`),
    canola: bottle("#e3b505", "CANOLA", "#1d7a46", true),
    soy: bottle("#3a2414", "SOY", "#c8102e", true),
    coffee: `${sh}<rect x="38" y="20" width="44" height="60" rx="4" fill="#4a2c1d"/><rect x="36" y="14" width="48" height="10" rx="3" fill="#c8102e"/><rect x="38" y="40" width="44" height="22" fill="#f3e3c4"/>${t(60,53,8,"COFFEE","#4a2c1d")}${t(60,72,5.5,"ground · medium","#f3e3c4",600)}`,
    pizza: `${sh}<path d="M20 36h80v44H20Z" fill="#c8102e"/><path d="M20 36l8-8h80l-8 8Z" fill="#a50d26"/><circle cx="60" cy="58" r="17" fill="#e8b25a"/><circle cx="60" cy="58" r="14" fill="#d9542f"/>${[[54,52],[66,54],[58,64],[68,63],[52,61]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.6" fill="#9c2a1c"/>`).join("")}${t(34,48,6.5,"PIZZA")}`,
    toilet_paper: `${sh}${[[42,44],[66,44],[54,62],[78,62]].map(([x,y])=>`<rect x="${x-11}" y="${y-12}" width="22" height="24" rx="3" fill="#fff" stroke="#d9dde2"/><ellipse cx="${x}" cy="${y-12}" rx="11" ry="3.5" fill="#f1f3f5" stroke="#d9dde2"/><ellipse cx="${x}" cy="${y-12}" rx="3.5" ry="1.4" fill="#c9b79a"/>`).join("")}`,
    detergent: `${sh}<path d="M34 30h40l10 10v40H34Z" fill="#f28c1b"/><rect x="40" y="20" width="18" height="10" rx="2" fill="#1f4e9a"/><path d="M74 34h8c4 0 6 3 6 6v12h-8" fill="none" stroke="#d9741a" stroke-width="5"/><rect x="38" y="46" width="38" height="20" fill="#fff" opacity=".9"/>${t(57,58,6.5,"LAUNDRY","#d9741a")}${t(57,63.5,4.5,"liquid detergent","#d9741a",600)}`,
  };
  /* Items added later carry a short drawing recipe in the data ("shape|colour|label|..."), built from the same packaging shapes. */
  const light = c => { const h=(c||"").replace("#",""); if (h.length<6) return false; const [r,g,b]=[0,2,4].map(i=>parseInt(h.substr(i,2),16)); return (r*299+g*587+b*114)/1000 > 165; };
  const ink = c => light(c) ? "#333" : "#fff";
  const G = {
    pouch: (c, lbl, sub, c2) => `${sh}<path d="M34 16h52l4 64H30Z" fill="${c}"/><path d="M34 16h52v6H34Z" fill="#000" opacity=".15"/><path d="M36 26c10 6 38 6 48 0" stroke="${ink(c)}" stroke-width="1.5" fill="none" opacity=".35"/><rect x="36" y="56" width="48" height="14" rx="2" fill="${c2||"#fff"}"/>${t(60,66,fit(lbl,44,8),lbl,c2&&!light(c2)?"#fff":(light(c)?"#333":c))}${sub?subT(47,46,6.5,sub,ink(c)):""}`,
    box: (c, lbl, sub, c2) => `${sh}<path d="M38 12h44v70H38Z" fill="${c}"/><path d="M82 12l8 -5v70l-8 5Z" fill="#000" opacity=".2"/><path d="M38 12l8 -5h44l-8 5Z" fill="#fff" opacity=".25"/>${t(60,42,fit(lbl,40,10),lbl,c2||ink(c))}${sub?subT(55,40,6,sub,c2||ink(c)):""}`,
    can: (c, lbl, sub) => { const h=56, y=80-h; return `${sh}<rect x="40" y="${y}" width="40" height="${h}" rx="4" fill="#c9cdd2"/><rect x="40" y="${y+6}" width="40" height="${h-12}" fill="${c}"/><ellipse cx="60" cy="${y}" rx="20" ry="4" fill="#e3e6e9"/>${t(60,y+h/2+2,fit(lbl,36,8),lbl,ink(c))}${sub?subT(y+h/2+11,36,5.5,sub,ink(c)):""}${shine(44,y+8,3,h-16)}`; },
    jar: (lid, fill, lbl, labc, txc) => `${sh}<rect x="40" y="16" width="40" height="10" rx="2" fill="${lid}"/><rect x="37" y="24" width="46" height="57" rx="9" fill="${fill}"/><rect x="40" y="42" width="40" height="20" rx="2" fill="${labc||"#fff"}"/>${t(60,55,fit(lbl,36,7.5),lbl,txc||"#333")}${shine(41,28,4,40)}`,
    tub: (lid, body, lbl, txc) => `${sh}<path d="M32 36h56l-5 44H37Z" fill="${body}"/><rect x="29" y="28" width="62" height="10" rx="3" fill="${lid}"/>${t(60,62,fit(lbl,48,9),lbl,txc||ink(body))}`,
    carton: (c, lbl, sub) => `${sh}<path d="M42 30l18-14 18 14v50H42Z" fill="#fff"/><path d="M42 30l18-14 18 14Z" fill="#000" opacity=".08"/><rect x="58" y="10" width="4" height="8" fill="${c}"/><rect x="42" y="46" width="36" height="26" fill="${c}"/>${t(60,60,fit(lbl,33,8),lbl,ink(c))}${sub?t(60,68,5.5,sub,ink(c),600):""}`,
    block: (c, lbl) => block(c, lbl, ink(c)),
    loaf: (crust, inside, band, lbl) => `${sh}<path d="M28 46c0-14 10-22 32-22s32 8 32 22v34H28Z" fill="${crust}"/><path d="M33 47c0-10 8-17 27-17s27 7 27 17v31H33Z" fill="${inside}"/><rect x="28" y="58" width="64" height="12" fill="${band}"/>${t(60,67,fit(lbl,58,7.5),lbl,ink(band))}`,
    bottle: (c, lbl, cap, tall) => tall ? `${sh}<rect x="54" y="6" width="12" height="10" fill="${cap}"/><path d="M54 16h12v10l6 8v46H48V34l6-8Z" fill="${c}"/><rect x="48" y="46" width="24" height="18" fill="#fff" opacity=".85"/>${t(60,58,fit(lbl,22,6),lbl,"#333")}${shine(51,36,3,40)}`
                                         : `${sh}<rect x="53" y="10" width="14" height="9" rx="2" fill="${cap}"/><path d="M53 19h14l10 18v43H43V37Z" fill="${c}"/><rect x="45" y="48" width="30" height="16" fill="#fff" opacity=".9"/>${t(60,59,fit(lbl,28,7),lbl,light(c)?"#333":c)}${shine(47,38,4,36)}`,
    tube: (c, lbl, sub) => `${sh}<rect x="46" y="12" width="28" height="68" rx="3" fill="${c}"/><ellipse cx="60" cy="12" rx="14" ry="3.5" fill="#e3e6e9"/><circle cx="60" cy="38" r="9" fill="#fff" opacity=".9"/><path d="M55 36c2 4 8 4 10 0" stroke="#333" stroke-width="1.4" fill="none"/>${t(60,58,fit(lbl,26,6),lbl,ink(c))}${sub?t(60,66,4.4,sub,ink(c),600):""}${shine(49,16,3,58)}`,
    bar: (c, lbl) => `${sh}<g transform="rotate(-12 60 52)"><rect x="18" y="38" width="84" height="26" rx="3" fill="${c}"/><path d="M18 38h6v26h-6ZM96 38h6v26h-6Z" fill="#000" opacity=".18"/>${t(60,55,fit(lbl,76,10),lbl,ink(c))}</g>`,
    cans: (c, lbl, sub="12-pack") => `${sh}<path d="M22 34h76v46H22Z" fill="${c}"/><path d="M22 34l8-8h76l-8 8Z" fill="#000" opacity=".12"/><path d="M98 34l8-8v46l-8 8Z" fill="#000" opacity=".25"/>${t(60,58,fit(lbl,70,9),lbl,ink(c))}${t(60,70,5.5,sub,ink(c),600)}`,
    tray: (c) => tray(`${[[46,58],[74,58]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="13" ry="10" fill="${c}"/><ellipse cx="${x-3}" cy="${y-3}" rx="5" ry="3" fill="#fff" opacity=".25"/>`).join("")}`),
  };
  const fit = (lbl, w, max) => Math.min(max, w / (Math.max(String(lbl).length, 1) * 0.66));
  /* Small print under a label: shrink to fit, and wrap onto two lines when one line would be too small to read. */
  const subT = (y, w, base, s, fill) => { s=String(s); const f=fit(s,w,base); const sp=[...s.matchAll(/ /g)].map(m=>m.index);
    if (f>=4.6 || !sp.length) return t(60,y,Math.max(f,3.8),s,fill,600);
    const cut=sp.reduce((a,b)=>Math.abs(b-s.length/2)<Math.abs(a-s.length/2)?b:a); const a=s.slice(0,cut), b=s.slice(cut+1);
    const f2=Math.min(base, fit(a,w,base), fit(b,w,base)); return t(60,y-f2*0.45,f2,a,fill,600)+t(60,y+f2*0.75,f2,b,fill,600); };
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch]));
  const gen = id => {
    const it = typeof DATA !== "undefined" && DATA && DATA.ITEMS && DATA.ITEMS.find(x => x.id === id);
    if (!it || !it.art) return null;
    const [shape, ...a] = it.art.split("|").map(esc);
    return G[shape] ? G[shape](...a) : null;
  };
  return (id) => { const body = A[id] || gen(id); return body ? `<svg viewBox="0 0 120 90" aria-hidden="true">${body}</svg>` : null; };
})();
