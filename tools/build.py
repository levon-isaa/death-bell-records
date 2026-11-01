"""Build index.html from src/template.html, the Bandcamp catalogue in data/releases.json and logo.svg.

    python3 tools/build.py                      # writes index.html and favicon.svg
    python3 tools/build.py --fragment page.html # also writes the page without <html>/<head> wrappers
"""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BC = "https://deathbellrecords.bandcamp.com/"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fragment", help="also write the page body without the document wrapper")
    args = ap.parse_args()

    rows = json.loads((ROOT / "data/releases.json").read_text())
    data = [[r["cat"], r["artist"], r["title"], r["type"], r["date"], r["tracks"], r["length"],
             r["url"].replace(BC, ""), r["art"], 1 if r["vinyl"] else 0] for r in rows]
    js = "[\n" + ",\n".join("    " + json.dumps(d, ensure_ascii=False) for d in data) + ",\n  ]"
    logo_d = re.search(r'\sd="([^"]+)"', (ROOT / "logo.svg").read_text()).group(1)

    page = (ROOT / "src/template.html").read_text()
    for token, value in (("/*@DATA@*/[]", js), ("/*@LOGO@*/", logo_d)):
        assert page.count(token) == 1, f"template must contain {token} exactly once"
        page = page.replace(token, value)

    (ROOT / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1376 1376"><rect width="1376" height="1376" rx="220" fill="#060606"/>'
        f'<path transform="translate(96 238) scale(.86)" fill="#e4e4e7" d="{logo_d}"/></svg>\n')
    head = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '<meta name="theme-color" content="#060606">\n<link rel="icon" href="favicon.svg" type="image/svg+xml">\n')
    (ROOT / "index.html").write_text(head + page + "\n</html>\n")
    if args.fragment:
        Path(args.fragment).write_text(page)
    print(f"{len(data)} releases, {len(page) // 1024} KB page")


if __name__ == "__main__":
    main()
