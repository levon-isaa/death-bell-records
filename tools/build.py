"""Build the site from src/: index.html, releases.html, events.html, assets/site.css, assets/site.js and favicon.svg.

    python3 tools/build.py                      # writes the pages, assets/ and favicon.svg
    python3 tools/build.py --fragment page.html # also writes the home page without <html>/<head> wrappers

src/layout.html is the shell every page shares (loader, ticker, header, footer) and src/pages/<page>.html is each
page's <main>. The Bandcamp catalogue in data/releases.json goes into site.js, the emblem from logo.svg into the layout.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BC = "https://deathbellrecords.bandcamp.com/"
# page, <title>, meta description ({n} is the number of releases)
PAGES = [
    ("index.html", "Death Bell Records",
     "Death Bell Records: independent techno label from Yerevan, Armenia. Hard groove, industrial and hypnotic techno, Death Bell Nights and the DBR Podcast."),
    ("releases.html", "Releases · Death Bell Records",
     "Every Death Bell Records release, {n} in all: EPs, LPs, singles and DBRVA compilations of hard groove, industrial and hypnotic techno."),
    ("events.html", "Events · Death Bell Records",
     "Death Bell Nights: the label's techno parties in Yerevan with its residents and guests, and the full archive from Resident Advisor."),
]
# main navigation: other pages by file name, sections of the home page by #id
NAV = [("Releases", "releases.html"), ("News", "#news"), ("Residents", "#residents"),
       ("Events", "events.html"), ("Podcast", "#podcast"), ("About", "#about")]
DOC_HEAD = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '<meta name="theme-color" content="#060606">\n<link rel="icon" href="favicon.svg" type="image/svg+xml">\n')


def fill(text, values):
    for token, value in values.items():
        assert text.count(token) == 1, f"{token} must appear exactly once"
        text = text.replace(token, value)
    return text


def nav(page):
    items = []
    for label, href in NAV:
        if href.startswith("#"):
            items.append(f'      <a href="{href if page == "index.html" else "./" + href}">{label}</a>')
        else:
            current = ' aria-current="page"' if href == page else ""
            items.append(f'      <a href="{href}"{current}>{label}</a>')
    return "\n".join(items)


def version(text):
    return hashlib.sha1(text.encode()).hexdigest()[:10]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fragment", help="also write the home page without the document wrapper")
    args = ap.parse_args()

    rows = json.loads((ROOT / "data/releases.json").read_text())
    data = [[r["cat"], r["artist"], r["title"], r["type"], r["date"], r["tracks"], r["length"],
             r["url"].replace(BC, ""), r["art"], 1 if r["vinyl"] else 0] for r in rows]
    js = fill((ROOT / "src/site.js").read_text(), {
        "/*@DATA@*/[]": "[\n" + ",\n".join("    " + json.dumps(d, ensure_ascii=False) for d in data) + ",\n  ]"})
    css = (ROOT / "src/site.css").read_text()
    (ROOT / "assets").mkdir(exist_ok=True)
    (ROOT / "assets/site.js").write_text(js)
    (ROOT / "assets/site.css").write_text(css)

    logo_d = re.search(r'\sd="([^"]+)"', (ROOT / "logo.svg").read_text()).group(1)
    layout = (ROOT / "src/layout.html").read_text()
    for page, title, desc in PAGES:
        main_html = (ROOT / "src/pages" / page).read_text().rstrip("\n")
        # the first image the loader waits for is also the one to fetch first
        first = re.search(r'<img[^>]*\ssrc="([^"]+)"[^>]*\sdata-preload', main_html)
        body = fill(layout, {
            "<!--@TITLE@-->": title,
            "<!--@DESC@-->": desc.format(n=len(rows)),
            "<!--@HEAD@-->": f'<link rel="preload" as="image" href="{first.group(1)}" fetchpriority="high">' if first else "",
            "<!--@HOME@-->": "#top" if page == "index.html" else "./",
            "<!--@NAV@-->": nav(page),
            "<!--@MAIN@-->": main_html,
            "<!--@V_CSS@-->": version(css),
            "<!--@V_JS@-->": version(js),
            "/*@LOGO@*/": logo_d,
        })
        (ROOT / page).write_text(DOC_HEAD + body + "</html>\n")
        if page == "index.html" and args.fragment:
            Path(args.fragment).write_text(body)

    (ROOT / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1376 1376"><rect width="1376" height="1376" rx="220" fill="#060606"/>'
        f'<path transform="translate(96 238) scale(.86)" fill="#e4e4e7" d="{logo_d}"/></svg>\n')
    print(f"{len(data)} releases | {', '.join(p for p, _, _ in PAGES)} | site.css {len(css) // 1024} KB, site.js {len(js) // 1024} KB")


if __name__ == "__main__":
    main()
