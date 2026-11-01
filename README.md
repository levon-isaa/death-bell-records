# Death Bell Records

Website for [Death Bell Records](https://deathbellrecords.bandcamp.com/), the independent techno label from Yerevan, Armenia.

A single static page: latest release, release grid, the full Bandcamp catalogue (search and filters), residents, Death Bell Nights from Resident Advisor, the DBR Podcast and social links. No framework and no build server; `index.html` plus images.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | The built site. Generated, do not edit by hand. |
| `src/template.html` | The page source: styles, markup and scripts. Residents and events are plain arrays near the top of the script. |
| `data/releases.json` | The catalogue, pulled from Bandcamp. |
| `covers/` | `<id>-l.jpg` large covers for the newest releases, `<id>-t.jpg` catalogue thumbnails. |
| `residents/`, `events/`, `podcast/` | Resident photos, the 10th anniversary flyer, the podcast artwork. |
| `logo.svg` | The label emblem. It is inlined into the page at build time; `favicon.svg` is generated from it. |
| `tools/` | `fetch_bandcamp.py` refreshes the catalogue, `build.py` writes `index.html`. |

## Update the site

After a new release on Bandcamp:

```bash
python3 tools/fetch_bandcamp.py
python3 tools/build.py
```

The hero (the "DBR091" block) is written by hand in `src/template.html`; update it for a new featured release, then run `tools/build.py`.

New Death Bell Night: add a line to the `EVENTS` array in `src/template.html`. A future date shows under "Next night" automatically.

## Deploy

Any static host works (GitHub Pages, Netlify, Cloudflare Pages). For GitHub Pages: Settings, Pages, deploy from the `main` branch, root folder.

## Credits

Artwork by Tøtal. Resident photos come from the artists' public SoundCloud and Resident Advisor profiles; replace them with press photos the artists have approved.
