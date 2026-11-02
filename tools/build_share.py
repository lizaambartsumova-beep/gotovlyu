"""Builds link-preview pages for every recipe.

Messengers (Telegram, WhatsApp, iMessage) don't run JavaScript and never see the
"#recipe" part of a link, so they can't build a preview from index.html.
For each recipe this script writes:
  r/<id>.html  — a tiny page with Open Graph tags that forwards to ../#<id>
  og/<id>.jpg  — a 1200×630 preview picture made from the recipe photo
Run:  python tools/build_share.py            (reads recipes from Supabase)
      python tools/build_share.py --json f   (reads [{id, data}, ...] from a file)
"""
import hashlib, html, io, json, os, re, sys, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://lizaambartsumova-beep.github.io/gotovlyu/"
SB_URL = "https://ljpzvbvpnfrvcedjdkga.supabase.co"
SB_KEY = "sb_publishable_sOPyjfHTkFmkZdt_BXVkxw_dN9EiHD3"  # public key, same as in backend.js
SITE = "Готовлю как умею"


def load():
    if "--json" in sys.argv:
        return json.load(open(sys.argv[sys.argv.index("--json") + 1], encoding="utf8"))
    req = urllib.request.Request(f"{SB_URL}/rest/v1/recipes?select=id,data", headers={"apikey": SB_KEY, "Authorization": f"Bearer {SB_KEY}"})
    return json.load(urllib.request.urlopen(req, timeout=60))


def img_bytes(pid):
    if not pid:
        return None
    if pid.startswith("img/"):
        p = os.path.join(ROOT, pid)
        return open(p, "rb").read() if os.path.exists(p) else None
    url = pid if pid.startswith("http") else f"{SB_URL}/storage/v1/object/public/photos/{pid}"
    try:
        return urllib.request.urlopen(url, timeout=60).read()
    except Exception:
        return None


def cover(raw, out):
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    W, H = 1200, 630
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    l, t = (im.width - W) // 2, (im.height - H) // 2
    im.crop((l, t, l + W, t + H)).save(out, "JPEG", quality=80, optimize=True, progressive=True)


def clean(t, n):
    t = re.sub(r"\*\*(.+?)\*\*", r"\1", str(t or "")).replace("\n", " ").strip()
    return t if len(t) <= n else t[: n - 1].rsplit(" ", 1)[0] + "…"


def write_if_changed(path, text):
    if os.path.exists(path) and open(path, encoding="utf8").read() == text:
        return False
    open(path, "w", encoding="utf8").write(text)
    return True


def main():
    rows = load()
    os.makedirs(os.path.join(ROOT, "r"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "og"), exist_ok=True)
    man_p = os.path.join(ROOT, "og", "manifest.json")
    man = json.load(open(man_p)) if os.path.exists(man_p) else {}
    keep = set()
    for row in rows:
        rid, d = row["id"], row.get("data") or {}
        if not re.fullmatch(r"[A-Za-z0-9_-]{1,80}", rid):
            continue
        keep.add(rid)
        raw = img_bytes(d.get("photo") or d.get("ingPhoto"))
        if raw:
            h = hashlib.md5(raw).hexdigest()[:10]
            if man.get(rid) != h or not os.path.exists(os.path.join(ROOT, "og", rid + ".jpg")):
                cover(raw, os.path.join(ROOT, "og", rid + ".jpg"))
                man[rid] = h
            image = f"{BASE}og/{rid}.jpg?v={h}"
        else:
            man.pop(rid, None)
            image = f"{BASE}og/site.jpg"
        title = clean(d.get("title") or "Рецепт", 90)
        desc = clean(d.get("source") or d.get("story") or "Рецепт на «Готовлю как умею»", 200)
        e = lambda x: html.escape(x, quote=True)
        page = f"""<!doctype html><html lang="ru"><head><meta charset="utf-8">
<title>{e(title)} — {SITE}</title>
<meta name="description" content="{e(desc)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="{SITE}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{e(image)}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="{BASE}r/{rid}.html">
<meta property="og:locale" content="ru_RU">
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url=../#{rid}">
<script>location.replace("../#{rid}")</script>
</head><body><p><a href="../#{rid}">Открыть рецепт «{e(title)}»</a></p></body></html>
"""
        write_if_changed(os.path.join(ROOT, "r", rid + ".html"), page)
    for f in os.listdir(os.path.join(ROOT, "r")):
        if f.endswith(".html") and f[:-5] not in keep:
            os.remove(os.path.join(ROOT, "r", f))
    for rid in list(man):
        if rid not in keep:
            man.pop(rid)
            p = os.path.join(ROOT, "og", rid + ".jpg")
            if os.path.exists(p):
                os.remove(p)
    write_if_changed(man_p, json.dumps(man, ensure_ascii=False, indent=1, sort_keys=True) + "\n")
    print(f"{len(keep)} recipe previews")


if __name__ == "__main__":
    main()
