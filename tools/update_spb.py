"""Weekly robot: average food prices in St Petersburg from Petrostat (Rosstat, region 78).

Petrostat publishes a monthly PDF "О динамике цен на потребительские товары и услуги в Санкт-Петербурге"
with average retail prices. The script looks for the newest issue, reads the price table and writes
data/prices_spb.json, which the site uses for the "Петербург (средние)" price set.
If nothing new is found, the old file stays as it is.
"""
import datetime, io, json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "prices_spb.json")
BASE = "https://78.rosstat.gov.ru/storage/mediabank/"

# catalogue key -> regex on the Petrostat product name
MAP = {
    "potato": r"^картофель", "onion": r"^лук репчатый", "carrot": r"^морковь", "cabbage": r"^капуста белокочанная",
    "tomato": r"^помидоры", "cucumber": r"^огурцы", "apple": r"^яблоки", "banana": r"^бананы", "lemon": r"^лимоны",
    "garlic": r"^чеснок", "pepper": r"^перец сладкий",
    "egg": r"^яйца куриные", "milk": r"^молоко пастеризованное", "butter": r"^масло сливочное", "schmand": r"^сметана",
    "tvorog": r"^творог", "quark": r"^творог", "yogurt": r"^кисломолочные", "hardcheese": r"^сыры", "gratedcheese": r"^сыры",
    "gouda": r"^сыры", "parmesan": r"^сыры",
    "sugar": r"^сахар-песок", "salt": r"^соль", "flour": r"^мука пшеничная", "bread": r"^хлеб ржаной",
    "toast": r"^хлеб и булочные изделия из пшеничной", "rice": r"^рис", "buckwheat": r"^крупа гречневая", "oats": r"^(овсяные хлопья|крупа овсяная|хлопья овсяные)",
    "pasta": r"^(вермишель|макаронные)", "oil": r"^масло подсолнечное", "chicken": r"^куры", "mince": r"^говядина",
    "pangasius": r"^рыба мороженая", "greentea": r"^чай", "honey": r"^мед",
}
UNIT_RE = r"(кг|л|10 шт\.?|шт\.?)"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (price robot for a personal recipe site)"})
    return urllib.request.urlopen(req, timeout=60).read()


def candidates():
    d = datetime.date.today().replace(day=1)
    for back in range(0, 4):
        m = (d.month - back - 1) % 12 + 1
        y = d.year + ((d.month - back - 1) // 12)
        for series in (f"260001{str(y)[2:]}", f"220007{str(y)[2:]}"):
            yield f"{BASE}{series}_{m:02d}{y}.pdf", f"{y}-{m:02d}"


def parse(pdf_bytes):
    import pdfplumber
    text = ""
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\n"
    rows = {}
    for line in text.splitlines():
        m = re.match(r"^\s*(.+?),\s*" + UNIT_RE + r"\s+(\d[\d\s]*,\d{2})\b", line.strip(), re.I)
        if m:
            name = m.group(1).strip().lower()
            price = float(m.group(3).replace(" ", "").replace(",", "."))
            rows.setdefault(name, (m.group(2).replace(".", ""), price))
    return rows


def main():
    old = json.load(open(OUT, encoding="utf8")) if os.path.exists(OUT) else {}
    for url, month in candidates():
        try:
            raw = fetch(url)
        except Exception as e:
            print("skip", url, e)
            continue
        if not raw.startswith(b"%PDF"):
            print("not a pdf", url)
            continue
        rows = parse(raw)
        items = {}
        for key, rx in MAP.items():
            for name, (unit, price) in rows.items():
                if re.search(rx, name):
                    items[key] = {"name": name, "unit": unit, "price": price}
                    break
        if len(items) < 8:
            print("too few rows parsed from", url, len(items))
            continue
        if old.get("month") and old["month"] >= month and old.get("items"):
            print("already have", old["month"])
            return
        out = {"month": month, "source": url, "checked": datetime.date.today().isoformat(), "currency": "RUB", "items": items}
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        json.dump(out, open(OUT, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        print("saved", month, len(items), "items from", url)
        return
    print("no new Petrostat issue found")


if __name__ == "__main__":
    main()
