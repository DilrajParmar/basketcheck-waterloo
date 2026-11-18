"""Merge the per-chain price files in scripts/catalog/ into data/data.js (loaded by index.html) and data/prices.json."""
import json, csv, glob, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT = os.path.join(ROOT, "scripts", "catalog")

NAMES = {
 "banana":("Bananas","Sold by weight"), "apple":("Gala apples","Sold by weight"), "orange":("Navel oranges","Sold by weight"),
 "lemon":("Lemon","Each"), "avocado":("Hass avocado","Each"), "potato":("Russet potatoes","Bag"), "onion":("Yellow onions","3 lb bag"),
 "carrot":("Carrots","Bag"), "broccoli":("Broccoli crowns","Sold by weight"), "lettuce":("Iceberg lettuce","Each"),
 "tomato":("Tomatoes on the vine","Sold by weight"), "cucumber":("English cucumber","Each"), "pepper":("Red bell pepper","Sold by weight"),
 "spinach":("Baby spinach","142 g clamshell"), "garlic":("Garlic","Bulb or small pack"), "mushroom":("White mushrooms","227 g"),
 "strawberry":("Strawberries","1 lb clamshell"), "blueberry":("Blueberries","Clamshell"), "grape":("Green seedless grapes","Sold by weight"),
 "eggs":("Large white eggs","12 pack"), "milk":("2% milk","4 L"), "butter":("Salted butter","454 g"), "cheddar":("Cheddar cheese block","400 g"),
 "mozza":("Shredded mozzarella","About 320 g"), "greek":("Plain Greek yogurt","650–750 g tub"), "cream_cheese":("Cream cheese","250 g"),
 "sour_cream":("Sour cream 14%","500 ml"), "cream":("Coffee cream 18%","1 L"), "almond":("Unsweetened almond beverage","1.89 L"),
 "bread_white":("White sliced bread","675 g"), "bread_ww":("100% whole wheat bread","675 g"), "bagel":("Plain bagels","6 pack"),
 "tortilla":("Large flour tortillas","Pack"), "muffin":("English muffins","6 pack"), "buns":("Hamburger buns","8 pack"),
 "chicken_breast":("Boneless skinless chicken breast","Priced per kg"), "chicken_thigh":("Boneless skinless chicken thighs","Priced per kg"),
 "beef":("Lean ground beef","About 450 g"), "bacon":("Bacon","375 g"), "pork_chop":("Pork loin chops","Priced per kg"),
 "salmon":("Atlantic salmon fillets","Priced per kg"), "shrimp":("Frozen raw shrimp","Bag"), "ham":("Sliced deli ham","175 g"),
 "wieners":("Wieners","375–450 g"), "nuggets":("Frozen chicken nuggets","Bag"), "rice":("Long grain white rice","2 kg"),
 "jasmine":("Jasmine rice","About 2 kg"), "spaghetti":("Spaghetti","900 g"), "penne":("Penne","900 g"), "sauce":("Pasta sauce","600–680 ml jar"),
 "diced_tom":("Diced tomatoes","796 ml can"), "black_beans":("Black beans","540 ml can"), "chickpeas":("Chickpeas","540 ml can"),
 "tuna":("Chunk light tuna","170 g can"), "kd":("Kraft Dinner Original","200 g"), "noodles":("Mr. Noodles instant noodles","85 g pack"),
 "soup":("Campbell's Chicken Noodle soup","284 ml can"), "pb":("Kraft Smooth Peanut Butter","1 kg"), "jam":("Strawberry jam","500 ml"),
 "honey":("Liquid honey","500 g"), "flour":("All-purpose flour","2.5 kg"), "sugar":("White sugar","2 kg"), "canola":("Canola oil","Bottle"),
 "olive":("Extra virgin olive oil","1 L"), "oats":("Quick oats","1 kg"), "cheerios":("Cheerios cereal","Box"), "ketchup":("Heinz Ketchup","1 L"),
 "mayo":("Hellmann's Real Mayonnaise","890 ml"), "soy":("Soy sauce","Bottle"), "coffee":("Ground coffee","Large canister"),
 "tea":("Orange pekoe tea","72 bags"), "crackers":("Ritz crackers","Box"), "chips":("Lay's Classic chips","235 g"), "salt":("Table salt","1 kg"),
 "frozen_veg":("Frozen mixed vegetables","750 g"), "frozen_berry":("Frozen berries","600 g"), "fries":("Frozen french fries","Bag"),
 "pizza":("Frozen pepperoni pizza","Rising crust"), "ice_cream":("Vanilla ice cream","About 1.5 L"), "oj":("Orange juice","About 1.5 L"),
 "coke":("Coca-Cola","12 × 355 ml"), "water":("Spring water","24 × 500 ml"), "paper_towel":("Paper towels","6 rolls"),
 "toilet_paper":("Toilet paper","12 rolls"), "dish_soap":("Dish soap","About 500–650 ml"), "detergent":("Liquid laundry detergent","Jug"),
}
spec = list(csv.reader(open(CAT + "/spec.tsv"), delimiter="\t"))[1:]
# items added later: spec-more.tsv also carries the display name, size, HST flag and a drawing recipe
TAX = {"chips","coke","paper_towel","toilet_paper","dish_soap","detergent"}
TAX5 = set()  # 5%: Ontario rebates the 8% provincial part of HST on diapers
ART_OF = {}
if os.path.exists(CAT + "/spec-more.tsv"):
    for r in list(csv.reader(open(CAT + "/spec-more.tsv"), delimiter="\t"))[1:]:
        if len(r) < 8 or r[0] in NAMES: continue
        spec.append(r[:4]); NAMES[r[0]] = (r[4], r[5]); ART_OF[r[0]] = r[7]
        if r[6] == "1": TAX.add(r[0])
        elif r[6] == "0.05": TAX5.add(r[0])
# general search tags per item (catalog/tags.tsv): searching "breakfast" or "chips" finds every item tagged with it
TAGS = {}
if os.path.exists(CAT + "/tags.tsv"):
    for r in list(csv.reader(open(CAT + "/tags.tsv"), delimiter="\t"))[1:]:
        TAGS[r[0]] = [t.strip() for t in r[1].split(",") if t.strip()]
# after reviewing what each chain actually sells: name/size as sold, and odd sizes or variants treated as missing
RELABEL = {"lays_bbq":(None,"220 g"),"lays_sv":(None,"220 g"),"lays_ketchup":(None,"220 g"),"lays_dressed":(None,"220 g"),
 "tostitos":(None,"215 g"),"pretzels":("Rold Gold pretzel twists","295 g"),"ritz":(None,"180 g"),"special_k":(None,"485 g"),"corn_flakes":(None,"600 g"),
 "froot_loops":(None,"320 g"),"frosted_flakes":(None,"545–580 g"),"chewy_bars":(None,"5 bars (120 g)"),"nv_bars":(None,"10 bars (210 g)"),
 "cake_mix":("Betty Crocker cake mix","375–404 g"),"margarine":("Becel margarine","800 g"),"italian_dress":("Kraft Italian dressing","425 ml"),
 "mozza_sticks":(None,"454 g"),"dumplings":(None,"567 g"),"hash_browns":(None,"1.2–1.3 kg"),"tater_tots":(None,"About 800 g"),
 "chocolate_bar":(None,"90–100 g"),"skittles":(None,"170–191 g"),"sour_patch":(None,"315 g"),"salsa":(None,"600–650 ml"),"trail_mix":(None,"600 g"),
 "naan":(None,"250 g"),"cookies_bakery":(None,"18 pack"),"coffee_mate":("Coffee-mate liquid creamer","946 ml"),"cup_noodles":("Mr. Noodles cup","64 g"),
 "lasagna_frozen":("Frozen meat lasagna","1.13 kg"),"monster":("Monster Energy Zero Ultra","473 ml"),"ramen_sapporo":("Shin Ramyun multipack","480 g"),
 "planters":("Peanuts, salted or dry roasted","500–600 g"),"cranberry":("Ocean Spray cranberry drink","1.89 L"),"bubly":(None,"12 × 355 ml"),
 "red_bull":("Red Bull 4-pack","4 × 250 ml"),"mac_cups":("KD snack cups","4 × 58 g"),"yogurt_cups":(None,"16 × 100 g"),"cheese_slices":(None,"410 g"),
 "hot_sauce":(None,"354 ml"),"taco_kit":(None,"250 g"),"mini_wheats":(None,"650 g"),"chicken_strips":(None,"700 g"),"burritos":(None,"Multipack")}
for k, (n, z) in RELABEL.items():
    if k in NAMES: NAMES[k] = (n or NAMES[k][0], z or NAMES[k][1])
MORE_EXCLUDE = {("tostitos","sobeys"),("pretzels","walmart"),("chewy_bars","nofrills"),("trail_mix","sobeys"),("skittles","walmart"),
 ("sour_patch","sobeys"),("sour_patch","walmart"),("salsa","independent"),("salsa","zehrs"),("mini_wheats","walmart"),("special_k","nofrills"),
 ("special_k","independent"),("corn_flakes","nofrills"),("corn_flakes","zehrs"),("hot_sauce","sobeys"),("taco_kit","walmart"),("coffee_mate","nofrills"),
 ("naan","nofrills"),("cookies_bakery","nofrills"),("chicken_strips","independent"),("dumplings","zehrs"),("mozza_sticks","independent"),
 ("mozza_sticks","sobeys"),("lasagna_frozen","sobeys"),("hash_browns","zehrs"),("tater_tots","walmart"),("tater_tots","zehrs"),
 ("chocolate_bar","walmart"),("burritos","nofrills"),("apple_juice","zehrs"),
 # round 2 (Superstore + gap fills): different sizes or variants than the other chains
 ("cheddar","superstore"),("hash_browns","superstore"),("popcorn_mw","superstore"),("baking_soda","walmart"),("oat_milk","walmart"),
 ("popcorn_mw","walmart"),("burritos","independent"),("burritos","zehrs"),("frozen_mango","zehrs"),("pita","sobeys"),("dumplings","sobeys"),
 ("sprite","sobeys"),("pepperoni","sobeys"),("donuts","superstore")}
CHAINS = [
 {"id":"nofrills","flyer":"https://www.nofrills.ca/print-flyer","name":"No Frills","short":"No Frills","site":"nofrills.ca","color":"#e8b800"},
 {"id":"walmart","flyer":"https://www.walmart.ca/en/flyer","name":"Walmart","short":"Walmart","site":"walmart.ca","color":"#1a73c9"},
 {"id":"independent","flyer":"https://www.yourindependentgrocer.ca/print-flyer","name":"Your Independent Grocer","short":"Independent","site":"yourindependentgrocer.ca","color":"#8b5a2b"},
 {"id":"zehrs","flyer":"https://www.zehrs.ca/print-flyer","name":"Zehrs","short":"Zehrs","site":"zehrs.ca","color":"#2e8b57"},
 {"id":"superstore","flyer":"https://www.realcanadiansuperstore.ca/print-flyer","name":"Real Canadian Superstore","short":"Superstore","site":"realcanadiansuperstore.ca","color":"#e2231a"},
 {"id":"sobeys","flyer":"https://www.sobeys.com/en/flyer/","name":"Sobeys","short":"Sobeys","site":"voila.ca (Sobeys online)","color":"#7a3fa0"},
]
data = {c["id"]:{} for c in CHAINS}
import collections
for f in sorted(glob.glob(CAT + "/*-[A-Z].json")):
    j = json.load(open(f))
    for it in j["items"]:
        data[j["store"]][it["id"]] = it
# fixes after review: unfair or mismatched matches are treated as missing
EXCLUDE = {("broccoli","nofrills"),("broccoli","walmart"),("pepper","walmart"),("pepper","sobeys"),("potato","nofrills"),("potato","zehrs"),("potato","independent"),("canola","walmart"),("canola","zehrs"),("canola","sobeys"),("detergent","independent"),("coffee","zehrs"),
           ("toilet_paper","zehrs"),("tortilla","independent"),("tortilla","walmart"),("pork_chop","zehrs"),("carrot","sobeys"),
           ("lettuce","nofrills")}  # No Frills only listed organic iceberg
# Sobeys pick was a specialty cucumber; the regular English cucumber is listed at $2.99 (from the same search page)
data["sobeys"]["cucumber"] = {"id":"cucumber","product":"English Cucumber Seedless 1 Count","size":"1 count","price":2.99,"regular":None,"unit":"each","match":"exact"}
data["zehrs"]["bread_white"] = {"id":"bread_white","product":"No Name Original Bread","size":"675 g","price":2.48,"regular":None,"unit":"each","match":"exact"}
# multi-buy deals ("sale price requires min 2", "2 for $8"): one unit costs the regular price, so the regular price is used
import re as _re
MULTIBUY = _re.compile(r"\bmin(imum)?\b.{0,24}\d|\d\s*for\s*\$|\bmulti-?buy|\bbuy \d", _re.I)
for _cid, _rows in data.items():
    for _it in _rows.values():
        if MULTIBUY.search(_it.get("note") or "") and _it.get("regular") and _it.get("price") and _it["price"] < _it["regular"]:
            _it["price"], _it["regular"] = _it["regular"], None
# prices re-checked against the chain's own site (catalog/verified-prices.json holds the source link and the date checked)
VERIFIED = json.load(open(CAT + "/verified-prices.json")) if os.path.exists(CAT + "/verified-prices.json") else {"prices":{}}
for _cid, _rows in VERIFIED["prices"].items():
    for _iid, _v in _rows.items():
        if _iid in data.get(_cid, {}): data[_cid][_iid]["price"], data[_cid][_iid]["regular"] = _v["price"], _v["regular"]
USE = os.environ.get("CHAINS","nofrills,walmart,independent,zehrs,sobeys,superstore").split(",")
CHAINS = [c for c in CHAINS if c["id"] in USE and data[c["id"]]]
items, dropped = [], []
for row in spec:
    iid, cat = row[0], row[1]
    prices, units, ok = {}, set(), True
    from collections import Counter
    cand = {}
    for c in CHAINS:
        p = data[c["id"]].get(iid)
        if (iid,"*") in EXCLUDE or (iid,c["id"]) in EXCLUDE: p = None
        if (iid,c["id"]) in MORE_EXCLUDE: p = None
        if not p or p.get("price") in (None, 0) or p.get("match") == "none": continue
        cand[c["id"]] = p
    if not cand: dropped.append((iid,"none")); continue
    unit = Counter(p.get("unit","each") for p in cand.values()).most_common(1)[0][0]
    for cid, p in cand.items():
        if p.get("unit","each") != unit: continue
        reg = p.get("regular")
        prices[cid] = {"price": round(float(p["price"]),2), "regular": round(float(reg),2) if reg else None,
                       "product": p.get("product",""), "size": p.get("size","") or ""}
    if len(prices) < 2: dropped.append((iid,"fewer than 2 stores")); continue
    units = {unit}
    n, sz = NAMES[iid]
    items.append({"id":iid, "cat":cat, "name":n, "size":sz, "unit":units.pop(), "kw":row[3], "prices":prices})
    if iid in TAX: items[-1]["tax"] = 1
    elif iid in TAX5: items[-1]["tax"] = 0.05
    if iid in ART_OF: items[-1]["art"] = ART_OF[iid]
    if iid in TAGS: items[-1]["tags"] = TAGS[iid]

# ---------- brand choices (catalog/brands-<chain>.json: every brand found for branded items)
import re
def qty_of(s):
    """parse a package size into (amount, unit kind) e.g. '675 g'->(675,'g'), '4 L'->(4000,'ml'), '12 rolls'->(12,'ct')"""
    s = (s or "").lower().replace(",", ".")
    m = re.search(r"(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(ml|l|g|kg)\b", s)
    if m: n, v, u = int(m.group(1)), float(m.group(2)), m.group(3); return (n * v * (1000 if u in ("l","kg") else 1), "ml" if u in ("ml","l") else "g")
    m = re.search(r"(\d+(?:\.\d+)?)\s*(ml|l|g|kg|lb)\b", s)
    if m:
        v, u = float(m.group(1)), m.group(2)
        if u == "lb": return (v * 453.6, "g")
        return (v * (1000 if u in ("l","kg") else 1), "ml" if u in ("ml","l") else "g")
    m = re.search(r"(\d+)\s*(pack|pk|ct|count|rolls?|bags?|cans?|un|ea)\b", s)
    if m: return (float(m.group(1)), "ct")
    return None
def norm_brand(b):
    b = (b or "").lower().replace("’","'").strip()
    b = re.sub(r"[^a-z0-9' ]", "", b)
    b = re.sub(r"^(the )", "", b)
    return {"pc":"president's choice","presidents choice":"president's choice","noname":"no name","dempsters":"dempster's","hellmanns":"hellmann's",
            "campbells":"campbell's","smuckers":"smucker's","lays":"lay's","chapmans":"chapman's","breyers":"breyers","kraft heinz":"kraft","cheerios":"general mills"}.get(b, b)
HOUSE = {"no name","president's choice","great value","compliments","our finest","selection","sensations","irresistibles","best buy"}
USUAL = {"kd":"Kraft","soup":"Campbell's","pb":"Kraft","cheerios":"General Mills","ketchup":"Heinz","mayo":"Hellmann's","chips":"Lay's","pizza":"Delissio","coke":"Coca-Cola"}
brand_rows = {}
for f in glob.glob(CAT + "/brands-*.json"):
    j = json.load(open(f))
    for it in j.get("items", []): brand_rows.setdefault(it["id"], {})[j["store"]] = it.get("products", [])
# the same two corrections for the brand-choice rows: multi-buy deals use the regular price, and re-checked prices win
for _iid, _per in brand_rows.items():
    for _cid, _prods in _per.items():
        _v = VERIFIED["prices"].get(_cid, {}).get(_iid)
        for _p in _prods:
            if MULTIBUY.search(_p.get("note") or "") and _p.get("regular") and _p.get("price") and _p["price"] < _p["regular"]: _p["price"], _p["regular"] = _p["regular"], None
            _full = _p.get("product","") if _p.get("product","").lower().startswith((_p.get("brand") or "").lower()) else f'{_p.get("brand","")} {_p.get("product","")}'
            if _v and _full.strip().lower() == _v.get("product","").lower(): _p["price"], _p["regular"] = _v["price"], _v["regular"]
spec_size = {}
if os.path.exists(CAT + "/brand-items.tsv"):
    for r in csv.reader(open(CAT + "/brand-items.tsv"), delimiter="\t"):
        if r and r[0] != "id": spec_size[r[0]] = r[3]
def target_of(iid, base):
    t = qty_of(spec_size.get(iid, ""))
    if t: return t
    q = [qty_of(p["size"]) for p in base.values()]; q = [x for x in q if x]
    return sorted(q)[len(q)//2] if q else None
def size_ok(p, tgt):
    q = qty_of(p.get("size","") + " " + p.get("product",""))
    if not tgt or not q: return True
    if q[1] != tgt[1]: return q[1] == "ct" or tgt[1] == "ct"
    return 0.7 <= q[0] / tgt[0] <= 1.45
# products that are a different kind of thing than the item (organic, premium lines, ice milk, kettle chips...)
ODD = re.compile(r"\b(organic|organics|deluxe|ice milk|black label|kettle|wood fired|chicken hot dogs|lactose free)\b", re.I)
NICE = {"chapman's":"Chapman's","red baron":"Red Baron","clover leaf":"Clover Leaf"}
def nice_label(nb, raw):
    if nb in NICE: return NICE[nb]
    return raw.title() if raw.isupper() else raw
def pick(cands):
    return min(cands, key=lambda p: p["price"]) if cands else None
def as_price(p):
    reg = p.get("regular")
    name, br = p.get("product",""), (p.get("brand") or "").strip()
    name = re.sub(r"^(\S+)\s+\1\b", r"\1", name, flags=re.I)  # "Chapmans Chapmans Markdale" -> "Chapmans Markdale"
    p = {**p, "product": name}
    flat = lambda x: re.sub(r"[^a-z0-9]", "", norm_brand(x).replace("'", ""))
    if br and flat(br) not in flat(name): p = {**p, "product": f"{br} {name}"}
    return {"price": round(float(p["price"]),2), "regular": round(float(reg),2) if reg and float(reg) > float(p["price"]) else None,
            "product": p.get("product",""), "size": p.get("size","") or ""}
chain_ids = [c["id"] for c in CHAINS]
for it in items:
    rows = brand_rows.get(it["id"])
    if not rows or it["unit"] != "each": continue
    tgt = target_of(it["id"], it["prices"])
    usual = USUAL.get(it["id"]) or ("Store brand" if "store brand" in " ".join(r[2].lower() for r in spec if r[0]==it["id"]) and "cheapest" not in " ".join(r[2].lower() for r in spec if r[0]==it["id"]) else "Usual pick")
    by_brand = {}
    for cid, prods in rows.items():
        if cid not in chain_ids: continue
        for p in prods:
            if not p.get("price") or not size_ok(p, tgt): continue
            if ODD.search(p.get("product","") + " " + (p.get("brand") or "")) and not ODD.search(it["name"]): continue
            nb = "store" if (p.get("house") or norm_brand(p.get("brand")) in HOUSE) else norm_brand(p.get("brand"))
            if not nb: continue
            by_brand.setdefault(nb, {}).setdefault(cid, []).append(p)
    if usual in ("Store brand", "Usual pick") and by_brand:
        # name the default after what the base picks really are: all house brands, one brand, or a mix
        def base_brand(prod):
            low = norm_brand(prod)
            if any(low.startswith(h) for h in HOUSE): return "store"
            for nb in sorted(by_brand, key=len, reverse=True):
                if nb != "store" and low.replace("'", "").startswith(nb.replace("'", "")): return nb
            return "?" + low.split(" ")[0]
        seen = {base_brand(v["product"]) for v in it["prices"].values() if v}
        usual = "Store brand" if seen == {"store"} else "Usual pick"
    opts = [{"k":"usual", "label":usual}]
    usual_key = "store" if usual == "Store brand" else norm_brand(usual) if usual != "Usual pick" else None
    if usual_key in by_brand:
        # the default brand was found at a chain whose base pick is missing: fill the gap
        for cid, ps in by_brand[usual_key].items():
            if not it["prices"].get(cid): it["prices"][cid] = as_price(pick(ps))
    label_of = {}
    for nb, per in by_brand.items():
        for ps in per.values():
            for p in ps: label_of.setdefault(nb, p.get("brand","").strip())
    ranked = sorted(by_brand.items(), key=lambda kv: (-(len(kv[1])), kv[0] != "store", kv[0]))
    for nb, per in ranked:
        if nb == usual_key or len(per) < 2: continue
        if len([o for o in opts if o["k"] != "usual" and o["k"] != "store"]) >= 3 and nb != "store": continue
        opts.append({"k": re.sub(r"[^a-z0-9]+","-",nb).strip("-"), "label": "Store brand" if nb == "store" else nice_label(nb, label_of.get(nb) or nb.title()),
                     "prices": {cid: as_price(pick(ps)) for cid, ps in per.items()}})
    if usual == "Usual pick" and len(opts) > 1:
        # the default was "cheapest of any brand", so it becomes the cheapest of every brand found at each chain
        for o in opts[1:]:
            for cid, pr in o["prices"].items():
                if not it["prices"].get(cid) or pr["price"] < it["prices"][cid]["price"]: it["prices"][cid] = pr
        opts[0]["label"] = "Cheapest available"; it["cheapDefault"] = True
    if len(opts) > 1: it["opts"] = opts

STORES = [
 # name, addr, city, lat, lon, chain, approx
 ("Zehrs Conestoga","555 Davenport Rd","Waterloo",43.496854,-80.52506,"zehrs",0),
 ("Zehrs Glenridge","315 Lincoln Rd","Waterloo",43.483104,-80.506311,"zehrs",0),
 ("Zehrs Beechwood","450 Erb St W","Waterloo",43.453083,-80.555858,"zehrs",0),
 ("Zehrs Laurentian","750 Ottawa St S","Kitchener",43.42,-80.476,"zehrs",1),
 ("Zehrs Stanley Park","1005 Ottawa St N","Kitchener",43.449343,-80.444699,"zehrs",0),
 ("Zehrs Pioneer Park","123 Pioneer Dr","Kitchener",43.407,-80.463,"zehrs",1),
 ("Zehrs Weber St E","1375 Weber St E","Kitchener",43.435,-80.452,"zehrs",1),
 ("Zehrs Hespeler","180 Holiday Inn Dr","Cambridge",43.4128,-80.3221,"zehrs",1),
 ("Zehrs Conestoga Blvd","400 Conestoga Blvd","Cambridge",43.3905,-80.317,"zehrs",1),
 ("Zehrs Franklin","200 Franklin Blvd","Cambridge",43.382,-80.287,"zehrs",1),
 ("No Frills Waterloo","24 Forwell Creek Rd","Waterloo",43.486572,-80.52457,"nofrills",0),
 ("No Frills Forest Glen","700 Strasburg Rd","Kitchener",43.413957,-80.47915,"nofrills",0),
 ("No Frills East King","1515 King St E","Cambridge",43.4005,-80.325,"nofrills",1),
 ("No Frills New Hamburg","1540 Haysville Rd","New Hamburg",43.379,-80.709,"nofrills",1),
 ("Jaden's No Frills","6 Arthur St N","Elmira",43.6,-80.558,"nofrills",1),
 ("Bob's Your Independent Grocer","75 King St S","Waterloo",43.4625,-80.5225,"independent",1),
 ("Belfiore's Your Independent Grocer","385 Frederick St","Kitchener",43.46,-80.48,"independent",1),
 ("Walmart Supercentre Waterloo","335 Farmers Market Rd","Waterloo",43.5081817,-80.548171,"walmart",0),
 ("Walmart Supercentre The Boardwalk","100 The Boardwalk","Kitchener",43.4335,-80.566,"walmart",1),
 ("Walmart Supercentre Sunrise","1400 Ottawa St S","Kitchener",43.415,-80.495,"walmart",1),
 ("Walmart Supercentre Fairway","2960 Kingsway Dr","Kitchener",43.425,-80.441,"walmart",1),
 ("Walmart Supercentre Cambridge","22 Pinebush Rd","Cambridge",43.410667,-80.327039,"walmart",0),
 ("Real Canadian Superstore","875 Highland Rd W","Kitchener",43.4335,-80.5175,"superstore",1),
 ("Sobeys Northfield","640 Parkside Dr","Waterloo",43.498686,-80.548103,"sobeys",0),
 ("Sobeys Bridgeport","94 Bridgeport Rd E","Waterloo",43.469879,-80.515248,"sobeys",0),
 ("Sobeys Columbia","450 Columbia St W","Waterloo",43.46846,-80.568678,"sobeys",0),
 ("Sobeys Highland","274 Highland Rd W","Kitchener",43.441,-80.4985,"sobeys",1),
 ("Sobeys Fischer-Hallman","1187 Fischer-Hallman Rd","Kitchener",43.4065,-80.493,"sobeys",1),
 ("Sobeys Ira Needles","235 Ira Needles Blvd","Kitchener",43.4365,-80.565,"sobeys",1),
 ("Sobeys Westgate","130 Cedar St","Cambridge",43.362,-80.326,"sobeys",1),
 ("Sobeys New Hamburg","100 Mill St","New Hamburg",43.377,-80.712,"sobeys",1),
 # map only (no online prices)
 ("FreshCo University & Bridge","425 University Ave E","Waterloo",43.489211,-80.493053,None,0),
 ("FreshCo Westmount","720 Westmount Rd E","Kitchener",43.4225,-80.4735,None,1),
 ("FreshCo Weber St E","1111 Weber St E","Kitchener",43.44,-80.461,None,1),
 ("FreshCo Hespeler & Dunbar","1 Hespeler Rd","Cambridge",43.374089,-80.318226,None,0),
 ("FreshCo Dundas St N","75 Dundas St N","Cambridge",43.37,-80.302,None,1),
 ("Food Basics Laurelwood","600 Laurelwood Dr","Waterloo",43.4626,-80.5805,None,1),
 ("Food Basics Highland","370 Highland Rd W","Kitchener",43.438,-80.5115,None,1),
 ("Food Basics Glasgow Heights","851 Fischer-Hallman Rd","Kitchener",43.429,-80.501,None,1),
 ("Food Basics Williamsburg","1270 Fischer-Hallman Rd","Kitchener",43.414,-80.499,None,1),
 ("Food Basics Fairway","655 Fairway Rd S","Kitchener",43.4105,-80.443,None,1),
 ("Food Basics Ottawa St N","1405 Ottawa St N","Kitchener",43.4545,-80.431,None,1),
 ("Food Basics Jamieson Pkwy","100 Jamieson Pkwy","Cambridge",43.396,-80.34,None,1),
 ("Food Basics Water St N","95 Water St N","Cambridge",43.363,-80.315,None,1),
 ("Food Basics Elmira","232 Arthur St S","Elmira",43.593,-80.556,None,1),
 ("Foodland Elmira","315 Arthur St S","Elmira",43.592,-80.5555,None,1),
 ("Foodland Ayr","1011 Northumberland St","Ayr",43.286,-80.451,None,1),
 ("Farm Boy Waterloo","417 King St N","Waterloo",43.4854936,-80.527683,None,0),
 ("Farm Boy Fairway","385 Fairway Rd S","Kitchener",43.4209778,-80.4404139,None,0),
 ("Farm Boy Cambridge","350 Hespeler Rd","Cambridge",43.389,-80.319,None,1),
 ("Costco Kitchener","4438 King St E","Kitchener",43.413,-80.4,None,1),
 ("Costco Waterloo","930 Erb St W","Waterloo",43.456,-80.565,None,1),
 ("T&T Supermarket","50 Westmount Rd N","Waterloo",43.4624441,-80.5380946,None,0),
 ("Waterloo Central Supermarket","University Ave W area","Waterloo",43.472934,-80.5351655,None,0),
 ("Kung Fu Mart","Near UW campus","Waterloo",43.478777,-80.5375301,None,0),
 ("Farah's Foodmart","170 University Ave W","Waterloo",43.4728,-80.5355,None,1),
 ("India Food and Grocery","466 Albert St","Waterloo",43.4771195,-80.5309847,None,0),
 ("Kishki Halal Supermarket","Northwest Waterloo","Waterloo",43.4863112,-80.5395464,None,0),
 ("Mediterranean Market","91 King St N","Waterloo",43.468,-80.523,None,1),
 ("Vincenzo's","150 Caroline St S","Waterloo",43.4593318,-80.5192966,None,0),
 ("Goodness Me! Natural Food Market","668 Erb St W","Waterloo",43.4468565,-80.5751135,None,0),
 ("Dutchie's Fresh Market","Erb St W","Waterloo",43.4447222,-80.5705556,None,0),
 ("Grocery Garden","105 Lexington Rd","Waterloo",43.493,-80.505,None,1),
 ("New City Supermarket","Downtown Kitchener","Kitchener",43.4482913,-80.4853115,None,0),
 ("KW Korean Food Market","Kitchener","Kitchener",43.45611,-80.46137,None,0),
 ("Bến Thành Market","Kitchener","Kitchener",43.446542,-80.481372,None,0),
]
# exact store coordinates from geocoding each street address (catalog/store-coords.json holds the source and the date checked)
COORDS = json.load(open(CAT + "/store-coords.json"))["stores"] if os.path.exists(CAT + "/store-coords.json") else {}
STORES = [(s[0],s[1],s[2],COORDS[s[0]]["lat"],COORDS[s[0]]["lon"],s[5],0) if s[0] in COORDS and COORDS[s[0]]["addr"]==s[1] else s for s in STORES]
IDS = {c["id"] for c in CHAINS}
stores = [{"i":i,"name":s[0],"addr":s[1],"city":s[2],"lat":s[3],"lon":s[4],"chain":s[5] if s[5] in IDS else None,"approx":bool(s[6])} for i,s in enumerate(STORES)]

# ---- two smaller aisles split out of Household (and Pantry, for baby food) so they are easy to find
PC_RE=_re2=__import__("re").compile(r"toothpaste|body wash|deodorant|antiperspirant|roll-on|speed stick|shampoo|conditioner|mouthwash|smart rinse|breath strips|tampons|\bpads\b|toothbrush|floss|razor", __import__("re").I)
BP_TAGS={"cat food","dog food","cat litter","dog treats","baby food","baby wipes","wet cat food","dry cat food","wet dog food","dry dog food","diapers"}
for it in items:
    tg=set(it.get("tags") or [])
    if it["cat"] in ("Household","Pantry","Snacks") and tg & BP_TAGS: it["cat"]="Baby & Pet"
    elif it["cat"]=="Household" and PC_RE.search(it["name"]): it["cat"]="Personal Care"

# ---- unit size for unit prices: parse "4x100 g", "1.89 L", "12 ea" etc. into a base quantity (g, ml or count)
import re as _re
def parse_size(t):
    t=str(t or "").lower().replace("×","x").replace("~","").replace(",",".").strip()
    t=_re.sub(r"\(.*?\)","",t).strip()
    m=_re.match(r"^(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|g|ml|l)\b",t)
    n=1
    if m: n=int(m[1]); q=float(m[2]); u=m[3]
    else:
        m=_re.match(r"^(\d+(?:\.\d+)?)\s*(kg|g|ml|l|litres?|ea|pack|pk|bags|tea bags|pods|k-cups|rolls|ct|count|bars|eggs|sheets|tampons|pads|wipes|tabs|strips|diapers)\b",t)
        if not m: return None
        q=float(m[1]); u=m[2]
    if u=="kg": q*=1000; u="g"
    elif u in("l","litre","litres"): q*=1000; u="ml"
    elif u not in("g","ml"): u="ea"
    q*=n
    return (round(q,3),u) if q>0 else None
WORD={"bags":"bag","tea bags":"bag","pods":"pod","k-cups":"pod","rolls":"roll","bars":"bar","eggs":"egg","sheets":"sheet"}
def count_word(t):
    t=str(t or "").lower()
    for k,v in [("pod","pod"),("bag","bag"),("roll","roll"),("sheet","sheet"),("bar","bar"),("egg","egg"),("pop","pop"),("tampons","tampon"),("pads","pad"),("wipes","wipe"),(" tabs","tab"),("strips","strip"),("diapers","diaper")]:
        if k in t: return v
    return "item"
from collections import Counter as _C
for it in items:
    if it.get("unit")=="per_kg": continue
    c=_C()
    for p in it["prices"].values():
        r=parse_size(p.get("size"))
        if r: c[r]+=1
    r=parse_size(it.get("size"))
    if r: c[r]+=2
    if c:
        (q,u),_=c.most_common(1)[0]
        if _re.search(r"[–-]\s*\d", str(it.get("size",""))): continue  # a size range, e.g. 12–18 pops: no fair unit price
        if u=="ea" and q<=1: continue
        it["uq"]=[q,u] if u!="ea" else [q,u,count_word(it.get("size")+" "+it["name"])]

# the "Prices checked" date range shown at the top of every page (catalog/asof.json is updated by the weekly refresh)
ASOF = "Oct 20 to 28, 2026"
if os.path.exists(CAT + "/asof.json"):
    _a = json.load(open(CAT + "/asof.json")); ASOF = f'{_a["from"]} to {_a["to"]}'
out = {"ASOF":ASOF,"CHAINS":CHAINS,"ITEMS":items,"STORES":stores}
with open(os.path.join(ROOT, "data", "data.js"), "w") as f:
    f.write("// Generated by scripts/build_data.py. Do not edit by hand.\nconst DATA = " + json.dumps(out, ensure_ascii=False) + ";\n")
json.dump(out, open(os.path.join(ROOT, "data", "prices.json"), "w"), indent=1, ensure_ascii=False)
print("items kept", len(items), "dropped", dropped)
