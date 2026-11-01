"""Build the site from src/ and data/: the pages, assets/site.css, assets/site.js and favicon.svg.

    python3 tools/build.py                      # writes the pages, assets/ and favicon.svg
    python3 tools/build.py --fragment page.html # also writes the home page without <html>/<head> wrappers

src/layout.html is the shell every page shares (loader, ticker, header, footer) and src/pages/<page>.html is each
page's <main>. Besides those pages it writes listen/<release>.html, a smart link page for every release, and
free/<gate>.html for every free download in data/gates.json.

data/releases.json (from Bandcamp), links.json, upcoming.json, residents.json, events.json, gates.json and
settings.json are checked here; a mistake in them stops the build with the file and entry to fix, instead of breaking
the live site.
"""
import argparse
import hashlib
import html
import json
import re
import sys
import unicodedata
from pathlib import Path
from urllib.parse import quote, urlparse

ROOT = Path(__file__).resolve().parent.parent
BC = "https://deathbellrecords.bandcamp.com/"
SITE = "https://levon-isaa.github.io/death-bell-records/"  # where the site is published: link previews and the 404 page use it
# page, <title>, meta description ({n} is the number of releases)
PAGES = [
    ("index.html", "Death Bell Records",
     "Death Bell Records: independent techno label from Yerevan, Armenia. Hard groove, industrial and hypnotic techno, Death Bell Nights and the DBR Podcast."),
    ("releases.html", "Releases · Death Bell Records",
     "Every Death Bell Records release, {n} in all: EPs, LPs, singles and DBRVA compilations of hard groove, industrial and hypnotic techno."),
    ("events.html", "Events · Death Bell Records",
     "Death Bell Nights: the label's techno parties in Yerevan with its residents and guests, and the full archive from Resident Advisor."),
    ("404.html", "Page not found · Death Bell Records", "This page doesn't exist."),
]
# main navigation: other pages by file name, sections of the home page by #id
NAV = [("Releases", "releases.html"), ("News", "#news"), ("Residents", "#residents"),
       ("Events", "events.html"), ("Podcast", "#podcast"), ("About", "#about")]
# smart link pages: a direct link from data/links.json where there is one, otherwise a search for the release
PLATFORMS = [("beatport", "Beatport", "https://www.beatport.com/search?q={q}"),
             ("spotify", "Spotify", "https://open.spotify.com/search/{q}"),
             ("apple", "Apple Music", "https://music.apple.com/search?term={q}"),
             ("youtube", "YouTube", "https://www.youtube.com/results?search_query={q}"),
             ("soundcloud", "SoundCloud", "https://soundcloud.com/search?q={q}"),
             ("deezer", "Deezer", "https://www.deezer.com/search/{q}")]
# download gate steps that need no more than their name in data/gates.json
FOLLOW = {"soundcloud": ("Follow Death Bell Records on SoundCloud", "https://soundcloud.com/death-bell-979515783"),
          "instagram": ("Follow @deathbellrecords on Instagram", "https://instagram.com/deathbellrecords/"),
          "bandcamp": ("Follow the label on Bandcamp", BC)}
DOC_HEAD = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            '<meta name="theme-color" content="#060606">\n<link rel="icon" href="favicon.svg" type="image/svg+xml">\n')
DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
SLUG = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
esc = lambda s: html.escape(unicodedata.normalize("NFC", str(s)))  # Bandcamp sends some accents as separate marks
dmy = lambda d: ".".join(reversed(d.split("-")))
mmss = lambda s: f"{s // 60}:{s % 60:02d}"
slug_of = lambda r: r["url"].rstrip("/").split("/")[-1]  # .../album/controlled-damage-ep-dbr091 → controlled-damage-ep-dbr091
bare_title = lambda t: re.sub(r"\s*\[[^\]]*\]", "", t).strip()


def fill(text, values):
    for token, value in values.items():
        assert text.count(token) == 1, f"{token} must appear exactly once"
        text = text.replace(token, value)
    return text


def read_json(name):
    try:
        return json.loads((ROOT / "data" / name).read_text())
    except json.JSONDecodeError as e:
        sys.exit(f"data/{name}: not valid JSON at line {e.lineno}, column {e.colno}: {e.msg}")


def load(name, check):
    """Read data/<name>, a JSON list, and stop with a readable message at the first entry that is wrong."""
    items = read_json(name)
    if not isinstance(items, list):
        sys.exit(f"data/{name}: should be a list, [ ... ]")
    for i, item in enumerate(items, 1):
        problem = check(item) if isinstance(item, dict) else "should be an object, { ... }"
        if problem:
            sys.exit(f"data/{name}, entry {i}: {problem}")
    return items


def missing(item, keys):
    gone = [k for k in keys if not str(item.get(k, "")).strip()]
    return f"needs {', '.join(gone)}" if gone else None


def check_event(e):
    return (missing(e, ["date", "title", "lineup", "venue", "ra"])
            or (None if DATE.match(e["date"]) else f'date "{e["date"]}" should look like 2026-12-04')
            or (None if isinstance(e["ra"], int) else "ra should be the RA event number, without quotes"))


def check_resident(p):
    return (missing(p, ["name", "photo", "links"])
            or (None if (ROOT / "residents" / p["photo"]).exists() else f'photo residents/{p["photo"]} not found')
            or next((f'link {link} should be ["Label", "https://…"]' for link in p["links"]
                     if not (isinstance(link, list) and len(link) == 2 and str(link[1]).startswith("https://"))), None))


def check_upcoming(u):
    return (missing(u, ["artist", "title"])
            or (None if not u.get("date") or DATE.match(u["date"]) else f'date "{u["date"]}" should look like 2026-12-04, or "" while TBA')
            or (None if not u.get("url") or u["url"].startswith("https://") else "url should start with https://")
            or (None if not u.get("cover") or (ROOT / u["cover"]).exists() else f'cover {u["cover"]} not found'))


def checker_gate(by_release):
    seen = set()

    def check(g):
        problem = missing(g, ["id", "artist", "title", "download", "steps"])
        if problem:
            return problem
        if not SLUG.match(g["id"]) or g["id"] in seen:
            return f'id "{g["id"]}" should be unique, in lower case with dashes, like total-trace-free'
        seen.add(g["id"])
        if not (g["download"].startswith("https://") or (ROOT / g["download"]).exists()):
            return f'download "{g["download"]}" should be an https:// link or a file in the site, like downloads/trace.mp3'
        if g.get("cover") and not (ROOT / g["cover"]).exists():
            return f'cover {g["cover"]} not found'
        if g.get("release") and g["release"] not in by_release:
            return f'release "{g["release"]}" is not a catalogue number or Bandcamp address in data/releases.json'
        for step in g["steps"]:
            if not (step in FOLLOW or step == "email" or (isinstance(step, dict) and step.get("label")
                                                           and str(step.get("url", "")).startswith("https://"))):
                return f'step {step} should be "soundcloud", "instagram", "bandcamp", "email" or {{"label": "…", "url": "https://…"}}'
    return check


def load_settings():
    s = read_json("settings.json")
    m = s.get("mailing_list") if isinstance(s, dict) else None
    if not isinstance(m, dict) or not isinstance(m.get("hidden", {}), dict) or not str(m.get("email_field", "")).strip():
        sys.exit('data/settings.json: needs "mailing_list" with "action", "email_field" and "hidden" (see README)')
    if m.get("action") and not m["action"].startswith("https://"):
        sys.exit("data/settings.json: mailing_list.action should be the https:// address from your mailing-list form")
    return s


def nav(page):
    items = []
    for label, href in NAV:
        if href.startswith("#"):
            items.append(f'      <a href="{href if page == "index.html" else "./" + href}">{label}</a>')
        else:
            current = ' aria-current="page"' if href == page else ""
            items.append(f'      <a href="{href}"{current}>{label}</a>')
    return "\n".join(items)


def no_js(rows, events, residents):
    """Plain lists of what site.js renders, for visitors and crawlers without JavaScript."""
    def ul(items):
        return "<noscript><ul class=\"nojs\">" + "".join(f"<li>{i}</li>" for i in items) + "</ul></noscript>"
    release = lambda r: (f'<a href="listen/{slug_of(r)}.html"><span class="lab">{esc(r["cat"] or r["type"])} · {r["date"][:4]}</span>'
                         f'<span><b>{esc(r["artist"])}</b> — {esc(r["title"])}</span></a>')
    return {
        "RELEASES": ul(release(r) for r in rows),
        "LATEST": ul(release(r) for r in rows[:5]),
        "EVENTS": ul(f'<a href="https://ra.co/events/{e["ra"]}"><span class="lab">{e["date"]} · {esc(e["venue"])}</span>'
                     f'<span><b>{esc(e["title"])}</b> — {esc(e["lineup"])}</span></a>' for e in events),
        "RESIDENTS": ul(f'<b>{esc(p["name"])}</b> ' + " · ".join(f'<a href="{esc(u)}">{esc(label)}</a>' for label, u in p["links"])
                        for p in residents),
    }


def social(page, title, desc, image, alt):
    """Canonical link and the tags that give shared links a title, description and picture."""
    url = SITE + ("" if page == "index.html" else page)
    return "\n".join([
        f'<link rel="canonical" href="{url}">',
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="Death Bell Records">',
        f'<meta property="og:title" content="{esc(title)}">',
        f'<meta property="og:description" content="{esc(desc)}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{SITE + image}">',
        f'<meta property="og:image:alt" content="{esc(alt)}">',
        '<meta name="twitter:card" content="summary">',
    ])


def cover_of(r):
    large = f'covers/{r["art"]}-l.jpg'
    return (large, 600) if (ROOT / large).exists() else (f'covers/{r["art"]}-m.jpg', 300)


def signup_form(settings, button, uid):
    """A form that sends an email address to the label's mailing list, or nothing while none is set up."""
    m = settings["mailing_list"]
    if not m.get("action"):
        return ""
    hidden = "".join(f'<input type="hidden" name="{esc(k)}" value="{esc(v)}">' for k, v in m.get("hidden", {}).items())
    return (f'<form class="signup" action="{esc(m["action"])}" method="post" target="signup-frame">'
            f'<label class="sr" for="{uid}">Email address</label>'
            f'<input id="{uid}" type="email" name="{esc(m["email_field"])}" required autocomplete="email" placeholder="Your email">'
            f'{hidden}<button class="btn sm" type="submit">{button}</button></form>')


def listen_main(r, links, gate):
    """A release's smart link page: buy it on Bandcamp, or pick a streaming platform."""
    cover, size = cover_of(r)
    cat, title = r["cat"] or r["type"], bare_title(r["title"])
    q = quote(f'{r["artist"].split(",")[0].strip()} {re.sub(r" (EP|LP)$", "", title)}')
    price = (f'${r["price"]:g}' if r.get("currency") == "USD" else f'{r["price"]:g} {r["currency"]}') if r.get("price") else ""
    rows = [("Bandcamp", f"Buy{' · ' + price if price else ''}", r["url"])]
    for key, name, search in PLATFORMS:
        if links.get(key):
            rows.append((name, "Buy" if key == "beatport" else "Stream", links[key]))
        else:
            rows.append((name, "Search", search.format(q=q)))
    platforms = "".join(f'<li><a href="{esc(url)}" target="_blank" rel="noopener"><span class="n">{name}</span>'
                        f'<span class="h">{what}</span><span class="go" aria-hidden="true">↗</span></a></li>' for name, what, url in rows)
    about = next((p.strip() for p in (r.get("about") or "").split("\n") if len(p.strip()) > 40), "")
    if len(about) > 320:
        about = about[:320].rsplit(". ", 1)[0] + "."
    tracks = "".join(f'<li><span class="n">{i:02d}</span><span class="tt">{esc(bare_title(t))}</span><span class="tl">{mmss(s)}</span></li>'
                     for i, (t, s) in enumerate(r.get("tracklist") or [], 1))
    free = f'<a class="btn" href="free/{gate["id"]}.html">Free download →</a>' if gate else ""
    return f'''<main id="main" tabindex="-1" data-page="listen">
  <section class="hero" id="top" aria-labelledby="page-h">
    <div class="wrap">
      <div class="hero-bar">
        <a class="lab" href="releases.html">Death Bell Records / Releases</a>
        <span class="lab">{esc(cat)}</span>
        <span class="lab">{"Out " + dmy(r["date"])}</span>
      </div>
      <div class="hero-grid">
        <div class="tilt" id="tilt"><div class="tilt-in">
          <img class="hero-cover" src="{cover}" width="{size}" height="{size}" fetchpriority="high" decoding="async" data-preload alt="Cover of {esc(r["title"])} by {esc(r["artist"])}">
        </div></div>
        <div class="hero-copy">
          <p class="cat" aria-hidden="true">{esc(cat)}</p>
          <h1 class="title-stack" id="page-h"><span class="sr">{esc(cat)}: </span><span class="a">{esc(r["artist"])}</span> <span class="t">{esc(title)}</span></h1>
          {f'<p class="lede">{esc(about)}</p>' if about else ""}
          <div>
            <p class="lab">Choose a platform</p>
            <ul class="follow platforms">{platforms}</ul>
          </div>
          <div class="actions">
            <button class="btn" type="button" data-share>Share this page</button>
            {free}
            <a class="btn" href="releases.html">All releases →</a>
          </div>
        </div>
      </div>
      {f'<ol class="tracks" aria-label="Tracklist">{tracks}</ol>' if tracks else ""}
    </div>
  </section>
</main>'''


def gate_steps(g, settings):
    steps = []
    for step in g["steps"]:
        if step == "email":
            if settings["mailing_list"].get("action"):  # no mailing list set up yet: the step is left out
                steps.append(("email", "Join the label's mailing list", signup_form(settings, "Join", f'gate-{g["id"]}-email')))
        else:
            label, url = FOLLOW[step] if isinstance(step, str) else (step["label"], step["url"])
            key = step if isinstance(step, str) else re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")
            steps.append((key, label, f'<a class="btn sm" href="{esc(url)}" target="_blank" rel="noopener">Follow ↗</a>'))
    return steps


def gate_main(g, settings, cover):
    """A free download that unlocks once the visitor has done each step (follow, join the list)."""
    steps = "".join(f'<li class="step" data-step="{key}"><span class="n">{i:02d}</span><span class="t">{esc(label)}</span>{action}</li>'
                    for i, (key, label, action) in enumerate(gate_steps(g, settings), 1))
    local = not g["download"].startswith("https://")
    fmt = g.get("format") or "MP3"
    note = g.get("note") or "A free download from Death Bell Records. Support the label below and the download unlocks."
    return f'''<main id="main" tabindex="-1" data-page="free">
  <section class="hero" id="top" aria-labelledby="page-h">
    <div class="wrap">
      <div class="hero-bar">
        <a class="lab" href="./">Death Bell Records</a>
        <span class="lab"><span class="dot live"></span>Free download</span>
        <span class="lab">{esc(fmt)}</span>
      </div>
      <div class="hero-grid">
        <div class="tilt" id="tilt"><div class="tilt-in">
          <img class="hero-cover" src="{cover[0]}" width="{cover[1]}" height="{cover[1]}" fetchpriority="high" decoding="async" data-preload alt="Cover of {esc(g["title"])} by {esc(g["artist"])}">
        </div></div>
        <div class="hero-copy">
          <p class="cat" aria-hidden="true">{esc(g.get("cat") or "Free")}</p>
          <h1 class="title-stack" id="page-h"><span class="sr">Free download: </span><span class="a">{esc(g["artist"])}</span> <span class="t">{esc(g["title"])}</span></h1>
          <p class="lede">{esc(note)}</p>
          <div class="gate" data-gate="{g["id"]}">
            <p class="lab">Support the label to unlock the download</p>
            <ol class="steps">{steps}</ol>
            <div class="gate-foot">
              <a class="btn primary gate-dl" href="#locked" data-href="{esc(g["download"])}"{" data-local" if local else ""} aria-disabled="true">Download · {esc(fmt)}</a>
              <span class="lab gate-status" aria-live="polite"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>'''


def free_section(gates, covers):
    """The home page's free downloads, shown only while there are any."""
    if not gates:
        return ""
    cells = "".join(f'''
        <a class="rc" href="free/{g["id"]}.html">
          <span class="iw"><img src="{covers[g["id"]][0]}" width="{covers[g["id"]][1]}" height="{covers[g["id"]][1]}" loading="lazy" alt="Cover of {esc(g["title"])} by {esc(g["artist"])}"></span>
          <span class="m"><span class="lab">{esc(g.get("cat") or "Free")}</span><span class="lab">Free DL</span></span>
          <span class="a">{esc(g["artist"])}</span>
          <span class="t">{esc(g["title"])}</span>
        </a>''' for g in gates)
    return f'''  <section class="sec" id="free" aria-labelledby="free-h">
    <div class="wrap">
      <div class="sh">
        <h2 class="sh-t" id="free-h">Free downloads</h2>
        <span class="lab">Support the label, take a track</span>
      </div>
      <div class="cells rel-cells">{cells}
      </div>
    </div>
  </section>'''


def version(text):
    return hashlib.sha1(text.encode()).hexdigest()[:10]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fragment", help="also write the home page without the document wrapper")
    args = ap.parse_args()

    rows = json.loads((ROOT / "data/releases.json").read_text())
    by_release = {**{r["cat"]: r for r in rows if r["cat"]}, **{slug_of(r): r for r in rows}}
    links = read_json("links.json") if (ROOT / "data/links.json").exists() else {}
    upcoming = load("upcoming.json", check_upcoming)
    residents = load("residents.json", check_resident)
    events = load("events.json", check_event)
    gates = load("gates.json", checker_gate(by_release))
    settings = load_settings()
    assert len({slug_of(r) for r in rows}) == len(rows), "two releases share a Bandcamp address"

    data = [[r["cat"], r["artist"], r["title"], r["type"], r["date"], r["tracks"], r["length"],
             r["url"].replace(BC, ""), r["art"], 1 if r["vinyl"] else 0] for r in rows]
    as_js = lambda items: json.dumps(items, ensure_ascii=False)
    js = fill((ROOT / "src/site.js").read_text(), {
        "/*@DATA@*/[]": "[\n" + ",\n".join("    " + json.dumps(d, ensure_ascii=False) for d in data) + ",\n  ]",
        "/*@UPCOMING@*/[]": as_js(upcoming),
        "/*@RESIDENTS@*/[]": as_js(residents),
        "/*@EVENTS@*/[]": as_js(events),
        "/*@SETTINGS@*/{}": as_js(settings),
    })
    css = (ROOT / "src/site.css").read_text()
    (ROOT / "assets").mkdir(exist_ok=True)
    (ROOT / "assets/site.js").write_text(js)
    (ROOT / "assets/site.css").write_text(css)

    logo_d = re.search(r'\sd="([^"]+)"', (ROOT / "logo.svg").read_text()).group(1)
    layout = (ROOT / "src/layout.html").read_text()
    lists = no_js(rows, events, residents)
    newest = rows[0]
    gate_covers = {g["id"]: (g["cover"], 600) if g.get("cover") else cover_of(by_release[g["release"]] if g.get("release") else newest)
                   for g in gates}
    gate_for = {g["release"]: g for g in gates if g.get("release")}

    def write(page, title, desc, main_html, preview=True):
        """Wrap a page's <main> in the shared layout and write it; pages in a folder get a base of ../"""
        first = re.search(r'<img[^>]*\ssrc="([^"]+)"[^>]*\sdata-preload[^>]*\salt="([^"]*)"', main_html)
        head = []
        if first:  # the first image the loader waits for is also the one to fetch first and the picture for link previews
            head.append(f'<link rel="preload" as="image" href="{first.group(1)}" fetchpriority="high">')
        if preview:
            image, alt = first.groups() if first else (f'covers/{newest["art"]}-l.jpg', f'Cover of {newest["title"]} by {newest["artist"]}')
            head.append(social(page, title, desc, image, alt))
        else:
            head.append('<meta name="robots" content="noindex">')
        body = fill(layout, {
            "<!--@TITLE@-->": esc(title),
            "<!--@DESC@-->": esc(desc),
            "<!--@HEAD@-->": "\n".join(head),
            "<!--@HOME@-->": "#top" if page == "index.html" else "./",
            "<!--@NAV@-->": nav(page),
            "<!--@MAIN@-->": main_html,
            "<!--@V_CSS@-->": version(css),
            "<!--@V_JS@-->": version(js),
            "/*@LOGO@*/": logo_d,
        })
        doc_head = DOC_HEAD
        if page == "404.html":
            # GitHub Pages shows this page at any missing address, however deep, so its links start from the site root
            doc_head = doc_head.replace('<meta charset="utf-8">\n', f'<meta charset="utf-8">\n<base href="{urlparse(SITE).path}">\n')
        elif "/" in page:
            # links start from the site root, so the shared layout works unchanged; links within the page keep the page
            doc_head = doc_head.replace('<meta charset="utf-8">\n', '<meta charset="utf-8">\n<base href="../">\n')
            body = body.replace('href="#', f'href="{page}#')
        (ROOT / page).parent.mkdir(exist_ok=True)
        (ROOT / page).write_text(doc_head + body + "</html>\n")
        return body

    for page, title, desc in PAGES:
        main_html = (ROOT / "src/pages" / page).read_text().rstrip("\n")
        main_html = re.sub(r"<!--@NOJS_(\w+)@-->", lambda m: lists[m.group(1)], main_html)
        if page == "index.html":
            main_html = fill(main_html, {"<!--@FREE@-->": free_section(gates, gate_covers)})
        body = write(page, title, desc.format(n=len(rows)), main_html, preview=page != "404.html")
        if page == "index.html" and args.fragment:
            Path(args.fragment).write_text(body)

    # pages that no longer have a release or gate behind them are removed, so old links get the 404 page
    for folder in ("listen", "free"):
        for old in (ROOT / folder).glob("*.html") if (ROOT / folder).exists() else []:
            old.unlink()
    for r in rows:
        title = bare_title(r["title"])
        gate = gate_for.get(r["cat"]) or gate_for.get(slug_of(r))
        write(f"listen/{slug_of(r)}.html", f'{r["artist"]} — {title} · Death Bell Records',
              f'{title} by {r["artist"]} ({r["cat"] or r["type"]}, {r["date"][:4]}) on Death Bell Records. '
              'Buy it on Bandcamp or listen on Beatport, Spotify, Apple Music, YouTube and more.',
              listen_main(r, links.get(slug_of(r), {}), gate))
    for g in gates:
        write(f'free/{g["id"]}.html', f'Free download: {g["artist"]} — {g["title"]} · Death Bell Records',
              f'Download {g["title"]} by {g["artist"]} for free from Death Bell Records.', gate_main(g, settings, gate_covers[g["id"]]))

    (ROOT / "favicon.svg").write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1376 1376"><rect width="1376" height="1376" rx="220" fill="#060606"/>'
        f'<path transform="translate(96 238) scale(.86)" fill="#e4e4e7" d="{logo_d}"/></svg>\n')
    linked = sum(1 for r in rows if links.get(slug_of(r)))
    print(f"{len(data)} releases ({linked} with streaming links), {len(upcoming)} upcoming, {len(residents)} residents, "
          f"{len(events)} events, {len(gates)} free downloads | mailing list {'on' if settings['mailing_list'].get('action') else 'off'} | "
          f"{len(PAGES) + len(rows) + len(gates)} pages | site.css {len(css) // 1024} KB, site.js {len(js) // 1024} KB")


if __name__ == "__main__":
    main()
