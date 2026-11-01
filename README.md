# Death Bell Records

Website for [Death Bell Records](https://deathbellrecords.bandcamp.com/), the independent techno label from Yerevan, Armenia.

Static pages, no framework and no build server:

- `index.html`: the latest release, News (upcoming releases, the release schedule and a Notify me sign-up), free downloads, residents, the DBR Podcast, about and links.
- `releases.html`: the full Bandcamp catalogue, with the newest covers, search and filters.
- `events.html`: Death Bell Nights from Resident Advisor, the next night and the archive by year.
- `listen/<release>.html`: a smart link page for every release, one shareable address with Bandcamp and every streaming platform. Releases across the site link here.
- `free/<gate>.html`: a free download that unlocks once the fan follows the label or joins the mailing list.

The pages share `assets/site.css` and `assets/site.js`; `404.html` is shown for any address that doesn't exist. The loader plays when someone arrives at the site or reloads a page, not when they move between its pages.

## Run it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Structure

| Path | What it is |
| --- | --- |
| `index.html`, `releases.html`, `events.html`, `404.html`, `listen/`, `free/`, `assets/` | The built site. Generated, do not edit by hand. |
| `src/layout.html` | What every page shares: loader, ticker, header and footer. |
| `src/pages/` | Each page's content (`<main>`). The hero on the home page is written here by hand. |
| `src/site.css` | All styles. |
| `src/site.js` | All scripts. |
| `data/releases.json` | The catalogue, pulled from Bandcamp. |
| `data/links.json` | Each release on Apple Music and Deezer, found by `tools/fetch_links.py`; add Spotify, Beatport, YouTube or SoundCloud links by hand. |
| `data/upcoming.json`, `data/residents.json`, `data/events.json`, `data/gates.json` | Upcoming releases, residents, Death Bell Nights and free downloads, edited by hand. |
| `data/settings.json` | The mailing list that Notify me and the download gates send email addresses to. |
| `covers/` | `<id>-t.jpg` thumbnails and `<id>-m.jpg` 300px covers for every release, `<id>-l.jpg` large covers for the newest. |
| `residents/`, `events/`, `podcast/` | Resident photos, the 10th anniversary flyer, the podcast artwork. |
| `logo.svg` | The label emblem. It is inlined into the page at build time; `favicon.svg` is generated from it. |
| `tools/` | `fetch_bandcamp.py` refreshes the catalogue, `fetch_links.py` finds releases on streaming platforms, `build.py` writes the pages and `assets/`. |

## Update the site

After a new release on Bandcamp:

```bash
python3 tools/fetch_bandcamp.py
python3 tools/fetch_links.py
python3 tools/build.py
```

The new release gets its smart link page at `listen/<its Bandcamp address>.html`. `fetch_links.py` looks it up on Apple Music and Deezer; a platform without a link gets a search button instead. To link a platform directly, add it under the release in `data/links.json` (it is never overwritten):

```json
"controlled-damage-ep-dbr091": {"apple": "…", "deezer": "…", "spotify": "https://open.spotify.com/album/…", "beatport": "https://www.beatport.com/release/…"}
```

The hero (the "DBR091" block) is written by hand in `src/pages/index.html`; update it for a new featured release, then run `tools/build.py`.

Upcoming release: a pre-order on Bandcamp shows up in News by itself after the two commands above. For a release announced anywhere else, add it to `data/upcoming.json` and run `tools/build.py`. News shows it with a countdown and moves it into the schedule once the date has passed. Only `artist` and `title` are required; `date` stays `""` while it is TBA:

```json
[
  {"cat": "DBR092", "artist": "Artist", "title": "Title EP", "date": "2026-12-04", "format": "Digital",
   "url": "https://deathbellrecords.bandcamp.com/album/title-ep", "cover": "covers/dbr092.jpg", "note": "One line about the record."}
]
```

Free download: put the file somewhere fans can download it (a file in a `downloads/` folder of the site, or a Dropbox or Google Drive link) and add it to `data/gates.json`. `steps` can be `"soundcloud"`, `"instagram"`, `"bandcamp"` (follow the label), `"email"` (join the mailing list) or your own `{"label": "Follow Tøtal on SoundCloud", "url": "https://soundcloud.com/tootal"}`. `release` borrows that release's cover (or give a `cover`), and links its smart link page to the download:

```json
[
  {"id": "total-trace-free", "artist": "Tøtal", "title": "Trace (Free DL edit)", "release": "DBR091", "format": "WAV",
   "download": "https://www.dropbox.com/…?dl=1", "steps": ["soundcloud", "instagram", "email"], "note": "One line for the fans."}
]
```

The download unlocks once each step is done. A static site can't check that someone really followed, so a step counts once they open the link: it is a thank-you, not a lock. The page lives at `free/<id>.html`, ready to share, and the home page lists it under Free downloads.

Mailing list: Notify me (on News) and the gates' email step send the address to the form of your mailing-list service. In Mailchimp: Audience, Signup forms, Embedded form; copy the form's `action` address and the name of the email field (`EMAIL`) into `data/settings.json`, and any hidden fields it has into `hidden`. Brevo, Buttondown and most others work the same way. While `action` is empty the sign-ups stay hidden and News offers Follow on Bandcamp instead.

```json
{"mailing_list": {"action": "https://xxxx.us1.list-manage.com/subscribe/post?u=…&id=…", "email_field": "EMAIL", "hidden": {}}}
```

New Death Bell Night: add a line at the top of `data/events.json` with the date, title, lineup, venue and the RA event number (`"ra": 2470236`). A future date shows under "Next night" automatically. Residents live in `data/residents.json`, with their photo in `residents/`.

`tools/build.py` checks these files before it writes anything. A missing comma, a wrong date or a photo that isn't there stops the build with the file and entry to fix, so a typo never reaches the live site. If the site's script still fails in a browser, the loader steps aside after a few seconds instead of hiding the page.

## Deploy

Any static host works (GitHub Pages, Netlify, Cloudflare Pages). For GitHub Pages: Settings, Pages, deploy from the `main` branch, root folder. If the address changes (a custom domain, say), update `SITE` in `tools/build.py`: link previews and the 404 page use it.

## Credits

Artwork by Tøtal. Resident photos come from the artists' public SoundCloud and Resident Advisor profiles; replace them with press photos the artists have approved.
