"""Refresh data/releases.json and covers/ from deathbellrecords.bandcamp.com.

    python3 tools/fetch_bandcamp.py && python3 tools/build.py

Downloads a 100px thumbnail (covers/<id>-t.jpg) for every release and a 700px cover
(covers/<id>-l.jpg) for the newest nine, which the hero and release grid show.
"""
import html
import json
import re
import time
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BASE = "https://deathbellrecords.bandcamp.com"
BAND_ID = 1811959851
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"}
# Catalogue numbers missing on Bandcamp but shown on the label's SoundCloud
CAT_FIX = {"/album/hidden-process-ep": "DBR090", "/album/enthropy-ep": "DBR089"}
LARGE = 9


def get(url, binary=False):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "replace")


def attr(page, name):
    m = re.search(name + r'="([^"]*)"', page)
    return json.loads(html.unescape(m.group(1))) if m else None


def main():
    music = get(BASE + "/music")
    items = [(m.group(1), int(m.group(2))) for m in re.finditer(r'<li[^>]*data-item-id="(album|track)-(\d+)"', music)]
    items += [(c["type"], c["id"]) for c in attr(music, "data-client-items") or []]
    items = list(dict((i[1], i) for i in items).values())
    print("items:", len(items))

    rows = []
    for kind_, tid in items:
        d = json.loads(get(f"https://bandcamp.com/api/mobile/24/tralbum_details?band_id={BAND_ID}&tralbum_type={kind_[0]}&tralbum_id={tid}"))
        tracks = d.get("tracks") or []
        raw_title = d.get("title") or ""
        about = (d.get("about") or "").replace("\r\n", "\n")
        blob = "\n".join([raw_title, about, d.get("credits") or ""] + [t.get("title") or "" for t in tracks])
        m = re.search(r"\b(DBR\s?VA\s?\d{3,4}|DBR\s?\d{3}|SUBCORE\s?\d{3})\b", blob, re.I)
        path = "/" + d["bandcamp_url"].split("/", 3)[3]
        artist = d.get("tralbum_artist") or ""
        title = re.sub(r"\s*\[(DBR|SUBCORE)[^\]]*\]\s*", " ", raw_title, flags=re.I).strip()
        first = artist.split(",")[0].strip()
        if title.lower().startswith(first.lower() + " - "):
            title = title[len(first) + 3:]
        if title.lower().startswith("various artists - "):
            title = title[18:]
        rows.append({
            "cat": CAT_FIX.get(path) or (re.sub(r"\s", "", m.group(1)).upper() if m else ""),
            "artist": artist,
            "title": title or raw_title,
            "type": "VA" if artist.lower() == "various artists" else "Single" if kind_ == "track" else "LP" if re.search(r"\bLP\b", raw_title) else "EP",
            "date": datetime.fromtimestamp(d["release_date"], timezone.utc).strftime("%Y-%m-%d"),
            "tracks": len(tracks) or 1,
            "length": round(sum(t.get("duration") or 0 for t in tracks)),
            "url": d["bandcamp_url"],
            "art": d.get("art_id"),
            "vinyl": bool(d.get("package_art")),
            "price": d.get("price"),
            "currency": d.get("currency"),
            "tracklist": [[re.sub(r"\s*\[(DBR|SUBCORE)[^\]]*\]", "", t.get("title") or ""), round(t.get("duration") or 0)] for t in tracks],
            "about": about,
        })
        time.sleep(0.15)

    rows.sort(key=lambda r: r["date"], reverse=True)
    (ROOT / "covers").mkdir(exist_ok=True)
    for i, r in enumerate(rows):
        for code, tag, wanted in (("3", "t", True), ("5", "l", i < LARGE)):
            out = ROOT / "covers" / f"{r['art']}-{tag}.jpg"
            if wanted and not out.exists():
                out.write_bytes(get(f"https://f4.bcbits.com/img/a{r['art']:010d}_{code}.jpg", binary=True))
                time.sleep(0.05)

    (ROOT / "data/releases.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1))
    print("releases:", len(rows), "| without cat. no.:", [r["title"] for r in rows if not r["cat"]])


if __name__ == "__main__":
    main()
