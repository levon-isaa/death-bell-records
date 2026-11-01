"""Find each release on Apple Music and Deezer for its smart link page (listen/<release>.html).

    python3 tools/fetch_links.py && python3 tools/build.py

Writes data/links.json, keyed by the release's Bandcamp address (controlled-damage-ep-dbr091 for
deathbellrecords.bandcamp.com/album/controlled-damage-ep-dbr091):

    {"controlled-damage-ep-dbr091": {"apple": "https://music.apple.com/…", "deezer": "https://www.deezer.com/…"}}

A release is linked only when artist and title both match. Links added by hand (spotify, beatport, youtube,
soundcloud, or a corrected apple or deezer) are kept: the script only fills in what is missing.
Platforms without a link get a search button on the page instead.
"""
import json
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36"}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return json.loads(r.read().decode("utf-8", "replace"))


def fold(s):
    """Compare names the way people write them: no accents or brackets, no EP/LP/Single, ø as o."""
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c)).replace("ø", "o").replace("æ", "ae")
    s = re.sub(r"\[[^\]]*\]|\([^)]*\)", " ", s)
    s = re.sub(r"\b(ep|lp|single|e\.p\.)\b", " ", s)
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def matches(artist, title, their_artist, their_title):
    a, b = fold(artist), fold(their_artist)
    return fold(title) == fold(their_title) and bool(a) and (a == b or a in b or b in a)


def apple(artist, title):
    term = urllib.parse.quote(f"{artist} {title}")
    for album in get(f"https://itunes.apple.com/search?term={term}&entity=album&limit=10").get("results", []):
        if matches(artist, title, album.get("artistName", ""), album.get("collectionName", "")):
            return album["collectionViewUrl"].split("?")[0]


def deezer(artist, title):
    for q in (f'artist:"{artist}" album:"{title}"', f"{artist} {title}"):
        for album in get("https://api.deezer.com/search/album?q=" + urllib.parse.quote(q)).get("data", []):
            if matches(artist, title, album["artist"]["name"], album["title"]):
                return album["link"]


def main():
    rows = json.loads((ROOT / "data/releases.json").read_text())
    path = ROOT / "data/links.json"
    links = json.loads(path.read_text()) if path.exists() else {}
    found = {"apple": 0, "deezer": 0}
    for r in rows:
        slug = r["url"].rstrip("/").split("/")[-1]
        have = links.setdefault(slug, {})
        artist = r["artist"].split(",")[0].strip()
        title = re.sub(r"\s*\[[^\]]*\]", "", r["title"]).strip()
        for name, lookup, pause in (("apple", apple, 3.2), ("deezer", deezer, .3)):  # Apple allows about 20 a minute
            if name in have:
                continue
            try:
                url = lookup(artist, title)
            except Exception as e:  # one failed lookup shouldn't stop the rest
                print(f"  {name} lookup failed for {artist} - {title}: {e}")
                url = None
            if url:
                have[name] = url
                found[name] += 1
            time.sleep(pause)
        print(f"{r['cat'] or r['type']:9} {artist} - {title}: {', '.join(sorted(have)) or 'nothing found'}")
    order = [r["url"].rstrip("/").split("/")[-1] for r in rows]
    path.write_text(json.dumps({k: links[k] for k in order if links.get(k)}, ensure_ascii=False, indent=1) + "\n")
    print(f"new links: {found} | releases with at least one link: {sum(1 for k in order if links.get(k))} of {len(rows)}")


if __name__ == "__main__":
    main()
