# Death Bell Records

Website for [Death Bell Records](https://deathbellrecords.bandcamp.com/), the independent techno label from Yerevan, Armenia.

Three static pages, no framework and no build server:

- `index.html`: the latest release, News (upcoming releases and the release schedule), residents, the DBR Podcast, about and links.
- `releases.html`: the full Bandcamp catalogue, with the newest covers, search and filters.
- `events.html`: Death Bell Nights from Resident Advisor, the next night and the archive by year.

The pages share `assets/site.css` and `assets/site.js`. The loader plays when someone arrives at the site or reloads a page, not when they move between its pages.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Structure

| Path | What it is |
| --- | --- |
| `index.html`, `releases.html`, `events.html`, `assets/` | The built site. Generated, do not edit by hand. |
| `src/layout.html` | What every page shares: loader, ticker, header and footer. |
| `src/pages/` | Each page's content (`<main>`). The hero on the home page is written here by hand. |
| `src/site.css` | All styles. |
| `src/site.js` | All scripts. Upcoming releases, residents and events are plain arrays near the top. |
| `data/releases.json` | The catalogue, pulled from Bandcamp. |
| `covers/` | `<id>-l.jpg` large covers for the newest releases, `<id>-t.jpg` catalogue thumbnails. |
| `residents/`, `events/`, `podcast/` | Resident photos, the 10th anniversary flyer, the podcast artwork. |
| `logo.svg` | The label emblem. It is inlined into the page at build time; `favicon.svg` is generated from it. |
| `tools/` | `fetch_bandcamp.py` refreshes the catalogue, `build.py` writes the pages and `assets/`. |

## Update the site

After a new release on Bandcamp:

```bash
python3 tools/fetch_bandcamp.py
python3 tools/build.py
```

The hero (the "DBR091" block) is written by hand in `src/pages/index.html`; update it for a new featured release, then run `tools/build.py`.

Upcoming release: a pre-order on Bandcamp shows up in News by itself after the two commands above. For a release announced anywhere else, add it to the `UPCOMING` array in `src/site.js` (cat. no., artist, title, date or `""` for TBA, link, cover) and run `tools/build.py`. News shows it with a countdown and moves it into the schedule once the date has passed.

New Death Bell Night: add a line to the `EVENTS` array in `src/site.js`. A future date shows under "Next night" automatically.

## Deploy

Any static host works (GitHub Pages, Netlify, Cloudflare Pages). For GitHub Pages: Settings, Pages, deploy from the `main` branch, root folder.

## Credits

Artwork by Tøtal. Resident photos come from the artists' public SoundCloud and Resident Advisor profiles; replace them with press photos the artists have approved.
