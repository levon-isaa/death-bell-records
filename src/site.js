(() => {
  // Catalogue from deathbellrecords.bandcamp.com, newest first. tools/build.py fills it in from data/releases.json.
  // [cat. no., artist, title, type, release date, tracks, length in seconds, Bandcamp path, cover id, has vinyl]
  const DATA = /*@DATA@*/[];
  const BC = "https://deathbellrecords.bandcamp.com/";
  const IG = "https://instagram.com/deathbellrecords/";
  const FOUNDED = 2016; // Bandcamp dates one early EP to 2001, so the label's age comes from here, not the data
  const ALIAS = { "Förm": "_förm" }; // same artist, spelled two ways on Bandcamp
  const LABEL_ONLY = ["various artists", "death bell records"];

  // Kept in data/*.json and checked by tools/build.py before it fills them in, so a typo stops the build, not the site.
  // upcoming.json: releases announced for News (Bandcamp pre-orders show up there by themselves)
  const UPCOMING = /*@UPCOMING@*/[];
  // residents.json: resident DJs in the label's order, with their photo in residents/ and their links
  const RESIDENTS = /*@RESIDENTS@*/[];
  // events.json: Death Bell nights from ra.co/promoters/90929, newest first; a future date shows under "Next night"
  const EVENTS = /*@EVENTS@*/[].map((e) => ({ ...e, url: `https://ra.co/events/${e.ra}` }));
  // settings.json: the mailing list that Notify me and the download gates' email step send to
  const SETTINGS = /*@SETTINGS@*/{};

  // search ignores case, accents and spacing: "total" finds Tøtal, "form" finds Förm, "dbr 091" finds DBR091
  const fold = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/ø/g, "o").replace(/æ/g, "ae").replace(/œ/g, "oe").replace(/ß/g, "ss").replace(/ł/g, "l").replace(/đ/g, "d");
  const squash = (s) => s.replace(/\s+/g, "");

  const R = DATA.map(([cat, artist, title, type, date, tracks, length, path, art, vinyl]) => {
    const names = LABEL_ONLY.includes(artist.toLowerCase()) ? [] : artist.split(", ").map((a) => ALIAS[a.trim()] || a.trim());
    const key = fold(`${cat} ${artist} ${names.join(" ")} ${title}`);
    return { cat, artist, title, type, date, tracks, length, url: BC + path, art, vinyl, year: +date.slice(0, 4), key, keyTight: squash(key),
      page: `listen/${path.split("/").pop()}.html` }; // its smart link page: Bandcamp and every streaming platform
  });

  const $ = (s) => document.querySelector(s);
  // each part of the page renders on its own: a bad entry breaks that part, never the loader or the rest
  const part = (name, render) => { try { render(); } catch (e) { console.error(`Death Bell site: ${name} failed to render`, e); } };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const newTab = (url) => (/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ""); // other sites open in a new tab
  // a form that sends an email address to the label's mailing list, or nothing while none is set up
  const signup = (button, uid) => {
    const m = SETTINGS.mailing_list || {};
    if (!m.action) return "";
    const hidden = Object.entries(m.hidden || {}).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join("");
    return `<form class="signup" action="${esc(m.action)}" method="post" target="signup-frame"><label class="sr" for="${uid}">Email address</label>` +
      `<input id="${uid}" type="email" name="${esc(m.email_field)}" required autocomplete="email" placeholder="Your email">${hidden}<button class="btn sm" type="submit">${button}</button></form>`;
  };
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const dmy = (d) => d.split("-").reverse().join(".");
  const pad = (n) => String(n).padStart(2, "0");
  const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date().toISOString().slice(0, 10);
  const days = (d) => Math.round((Date.parse(d) - Date.parse(today)) / 864e5); // positive: still to come
  const ago = (d) => {
    const n = -days(d);
    return n < 1 ? "Today" : n < 14 ? `${n} d ago` : n < 60 ? `${Math.round(n / 7)} wk ago` : n < 365 ? `${Math.round(n / 30)} mo ago` : `${Math.round(n / 365)} yr ago`;
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const PAGE = document.querySelector("main")?.dataset.page || "home";
  const released = R.filter((r) => r.date <= today);
  const nightsPast = EVENTS.filter((e) => e.date < today);
  const nightsNext = EVENTS.filter((e) => e.date >= today).reverse(); // soonest first

  // ---------- micro-interaction helpers ----------
  // images fade in as they arrive; one the browser has already started drawing is left alone, or it would blink out
  function fadeIn(root) {
    root.querySelectorAll("img").forEach((img) => {
      if (img.complete || img.naturalWidth || img.classList.contains("fade")) return;
      img.classList.add("fade");
      const show = () => img.classList.add("in");
      img.addEventListener("load", show, { once: true });
      img.addEventListener("error", show, { once: true });
    });
  }
  // text decodes from random glyphs into the real label. The glyphs play in a copy hidden from screen readers,
  // which keep reading the real text next to it.
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";
  function scramble(el, dur = 420) {
    if (reduce || !el) return;
    if (!el._shown) {
      const text = el.textContent, real = document.createElement("span"), shown = document.createElement("span");
      real.className = "sr";
      real.textContent = shown.textContent = text;
      shown.setAttribute("aria-hidden", "true");
      el.replaceChildren(real, shown);
      el._shown = shown;
      el._text = text;
    }
    const shown = el._shown, final = el._text;
    cancelAnimationFrame(el._raf);
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), n = Math.floor(p * final.length);
      let out = "";
      for (let i = 0; i < final.length; i++) out += i < n || final[i] === " " ? final[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      shown.textContent = out;
      if (p < 1) el._raf = requestAnimationFrame(step);
      else shown.textContent = final;
    };
    el._raf = requestAnimationFrame(step);
  }
  // freshly rendered rows slide in, one after another
  function stagger(list, animate) {
    if (!animate || reduce) return;
    [...list.children].slice(0, 24).forEach((li, i) => { li.classList.add("enter"); li.style.animationDelay = `${i * 14}ms`; });
  }
  // numbers tick up to their value when they come into view
  function countUp(el) {
    if (reduce) return;
    const end = +el.dataset.count, width = el.textContent.length, t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / 900);
      el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3)))).padStart(width, "0");
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const specRows = (rows) => rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
  // The typefaces the page uses, actually downloaded. document.fonts.ready alone resolves before they have
  // started loading, so on a slow first visit the hero showed in a fallback font and flickered into Geist.
  const FACES = ["300 1em Geist", "400 1em Geist", "700 1em Geist", "800 1em Geist", '400 1em "Geist Mono"', '500 1em "Geist Mono"'];
  const fontsLoaded = document.fonts
    ? Promise.all(FACES.map((face) => document.fonts.load(face, "DBR091 Tøtal"))).catch(() => {})
    : Promise.resolve();

  // ---------- menu (small screens) ----------
  const bar = $("#bar"), menuBtn = $("#menu-btn");
  menuBtn.addEventListener("click", () => {
    const open = bar.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  const closeMenu = () => { bar.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); };
  $("#links").addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && bar.classList.contains("open")) { closeMenu(); menuBtn.focus(); }
  });

  // ---------- Yerevan local time ----------
  const clockFmt = (opts) => { try { return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Yerevan", hour12: false, ...opts }); } catch (e) { return null; } };
  const fShort = clockFmt({ hour: "2-digit", minute: "2-digit" }), fLong = clockFmt({ hour: "2-digit", minute: "2-digit", second: "2-digit" });
  if (fShort) {
    document.querySelector(".clock").hidden = false;
    const tickClock = () => { const d = new Date(); $("#clock").innerHTML = fShort.format(d).replace(":", '<i class="colon">:</i>'); $("#clock-l").textContent = fLong.format(d); };
    tickClock();
    setInterval(tickClock, 1000);
  }

  // ---------- ticker: latest releases, duplicated for a seamless loop ----------
  part("ticker", () => {
    const tickerItems = R.slice(0, 12).map((r) =>
      `<a href="${r.page}"><b>${r.cat || r.type}</b>${r.date > today ? "Pre-order · " : ""}${esc(r.artist)} — ${esc(r.title)}</a>`).join("");
    $("#ticker").innerHTML = `<span class="sr">Latest releases: </span>${tickerItems}<span aria-hidden="true" style="display:contents">${tickerItems.replace(/<a /g, '<a tabindex="-1" ')}</span>`;
  });

  // the site's one colour: sampled from the newest cover, then lightened as far as needed to stay readable on
  // black (4.5:1), so a mostly blue or violet cover can't make the accent text and focus outlines too dark
  const hslToRgb = (h, s, l) => {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    return [0, 8, 4].map((n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
  };
  const onBlack = (h, s, l) => {
    const [r, g, b] = hslToRgb(h, s, l).map((v) => (v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4));
    return (.2126 * r + .7152 * g + .0722 * b + .05) / (.0018 + .05); // against the --bg #060606
  };
  function rgbToHs(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, dd = mx - mn;
    if (!dd) return [0, 0];
    const s = dd / (1 - Math.abs(2 * l - 1));
    const h = mx === r ? ((g - b) / dd) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
    return [Math.round((h * 60 + 360) % 360), Math.round(s * 100)];
  }
  (function accentFromCover(src) {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas"), N = 48;
        c.width = c.height = N;
        const x = c.getContext("2d");
        x.drawImage(img, 0, 0, N, N);
        const d = x.getImageData(0, 0, N, N).data;
        let r = 0, g = 0, b = 0, w = 0;
        for (let i = 0; i < d.length; i += 4) {
          const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
          const sat = mx ? (mx - mn) / mx : 0;
          if (sat > .35 && mx > 70) { const k = sat * mx; r += d[i] * k; g += d[i + 1] * k; b += d[i + 2] * k; w += k; }
        }
        if (!w) return;
        const [h, s] = rgbToHs(r / w, g / w, b / w), sat = Math.min(85, Math.max(50, s));
        let light = 58;
        while (light < 80 && onBlack(h, sat, light) < 4.5) light += 2;
        const root = document.documentElement.style;
        root.setProperty("--accent", `hsl(${h} ${sat}% ${light}%)`);
        root.setProperty("--accent-a", `hsl(${h} ${sat}% 50% / .22)`);
      } catch (e) { /* keep the neutral default */ }
    };
    img.src = src;
  })(`covers/${(released[0] || R[0]).art}-t.jpg`);

  // ---------- home: news, the next release and the release schedule ----------
  part("news", () => {
    if (!$("#nw-feat")) return;
    const preorders = R.filter((r) => r.date > today).map((r) => ({
      cat: r.cat, artist: r.artist, title: r.title, date: r.date, format: r.vinyl ? "Vinyl · Digital" : "Digital",
      url: r.url, cover: `covers/${r.art}-l.jpg`, preorder: true }));
    const onBandcamp = new Set(preorders.map((u) => u.cat).filter(Boolean));
    const upcoming = [...preorders, ...UPCOMING.filter((u) => !(u.cat && onBandcamp.has(u.cat)) && (!u.date || u.date > today))]
      .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999")); // soonest first, TBA last
    const lastCat = Math.max(0, ...R.map((r) => +(/^DBR(\d+)$/.exec(r.cat) || [])[1] || 0));
    const u = upcoming[0];
    const placeholder = `<span class="nw-art nw-ph" aria-hidden="true"><svg class="emblem"><use href="#logo"/></svg><span class="lab">Artwork soon</span></span>`;
    const form = signup("Notify me", "notify-email");
    const notify = form ? `<div class="notify"><p class="lab">Get an email the day it drops</p>${form}<p class="lab signup-done" hidden>You're on the list. We'll email you when it's out.</p></div>` : "";
    $("#nw-feat").innerHTML = u ? `
      ${u.url ? `<a class="nw-art" href="${esc(u.url)}" target="_blank" rel="noopener" tabindex="-1">` : '<span class="nw-art">'}${u.cover
        ? `<img src="${esc(u.cover)}" width="600" height="600" data-preload alt="Cover of ${esc(u.title)} by ${esc(u.artist)}">`
        : placeholder}${u.url ? "</a>" : "</span>"}
      <div class="nw-body">
        <p class="lab"><span class="dot live"></span>${u.preorder ? "Pre-order now" : "Upcoming release"}</p>
        <p class="nw-cat" aria-hidden="true">${esc(u.cat || "New")}</p>
        <h3 class="title-stack"><span class="sr">${esc(u.cat || "")} </span><span class="a">${esc(u.artist)}</span> <span class="t">${esc(u.title)}</span></h3>
        ${u.note ? `<p class="lede">${esc(u.note)}</p>` : ""}
        <dl class="spec">${specRows([["Release", u.date ? dmy(u.date) : "TBA"], ["Format", esc(u.format || "Digital")], ["Label", "Death Bell"]])}</dl>
        ${u.date ? `<div class="count" id="countdown" data-to="${u.date}" role="timer" aria-label="Out in ${days(u.date)} days"></div>` : ""}
        <div class="actions">${u.url ? `<a class="btn primary" href="${esc(u.url)}" target="_blank" rel="noopener">${u.preorder ? "Pre-order on Bandcamp ↗" : "Listen ↗"}</a>` : ""}<a class="btn" href="${IG}" target="_blank" rel="noopener">Instagram ↗</a></div>
        ${notify}
      </div>` : `
      ${placeholder}
      <div class="nw-body">
        <p class="lab"><span class="dot live"></span>Next in the catalogue</p>
        <p class="nw-cat">DBR${String(lastCat + 1).padStart(3, "0")}</p>
        <h3 class="nw-tba">To be announced</h3>
        <p class="lede">The next Death Bell record is in the works. Follow the label on Bandcamp to get it the day it drops, and watch Instagram and SoundCloud for the first previews.</p>
        ${notify}
        <div class="actions"><a class="btn${notify ? "" : " primary"}" href="${BC}" target="_blank" rel="noopener">Follow on Bandcamp ↗</a><a class="btn" href="${IG}" target="_blank" rel="noopener">Instagram ↗</a></div>
      </div>`;

    // live countdown to midnight in Yerevan on release day
    const cd = $("#countdown");
    if (cd) {
      const to = Date.parse(cd.dataset.to + "T00:00:00+04:00");
      const tick = () => {
        const s = Math.max(0, Math.floor((to - Date.now()) / 1000));
        cd.innerHTML = [[Math.floor(s / 86400), "Days"], [Math.floor(s % 86400 / 3600), "Hrs"], [Math.floor(s % 3600 / 60), "Min"], [s % 60, "Sec"]]
          .map(([n, l]) => `<span><b>${pad(n)}</b><i class="lab">${l}</i></span>`).join("");
      };
      tick();
      setInterval(tick, 1000);
    }

    // newest at the top: what is coming, a line for today, then what just came out
    const row = (d, status, cat, artist, title, url, up) => `
      <li><a class="srow${up ? " up" : ""}" href="${esc(url)}"${newTab(url)}>
        <span class="d">${d}</span><span class="s">${status}</span><span class="c">${esc(cat || "—")}</span>
        <span class="w"><b>${esc(artist)}</b><span>${esc(title)}</span></span><span class="go" aria-hidden="true">↗</span>
      </a></li>`;
    $("#sched").innerHTML =
      (upcoming.length
        ? upcoming.slice().reverse().map((x) => row(x.date ? dmy(x.date) : "TBA", x.date ? `In ${days(x.date)} d` : "Soon", x.cat, x.artist, x.title, x.url || BC, true)).join("")
        : `<li class="sempty"><span class="lab">No release dates announced yet</span></li>`) +
      `<li class="now"><span class="lab"><span class="dot live"></span>Today · ${dmy(today)}</span></li>` +
      released.slice(0, 5).map((r) => row(dmy(r.date), ago(r.date), r.cat, r.artist, r.title, r.page)).join("");

    // ways into the releases and events pages
    $("#dx-rel").innerHTML = `<b data-count="${R.length}">${R.length}</b> releases · since ${FOUNDED}`;
    $("#dx-covers").innerHTML = released.slice(0, 5).map((r) => `<img src="covers/${r.art}-m.jpg" width="300" height="300" loading="lazy" alt="">`).join("");
    $("#dx-ev").innerHTML = `<b data-count="${nightsPast.length}">${pad(nightsPast.length)}</b> nights · next: ${nightsNext.length ? dmy(nightsNext[0].date) : "TBA"}`;
    $("#dx-nights").innerHTML = [...nightsNext.slice(0, 1), ...nightsPast.slice(0, 3)].map((e) =>
      `<span class="dx-row"><span>${dmy(e.date)}</span><span>${esc(e.title)}</span><span>${esc(e.venue)}</span></span>`).join("");
  });

  // ---------- home: residents ----------
  part("residents", () => {
    if (!$("#res-grid")) return;
    $("#res-grid").innerHTML = RESIDENTS.map((p) => `
      <article class="rs">
        <div class="ph"><img src="residents/${p.photo}" loading="lazy" alt="${esc(p.name)}"></div>
        <h3>${esc(p.name)}</h3>
        <div class="rs-links">${p.links.map(([l, u]) => `<a href="${u}" target="_blank" rel="noopener">${l} ↗</a>`).join("")}</div>
      </article>`).join("");
  });

  // ---------- releases page ----------
  part("releases", () => {
    const qEl = $("#q");
    if (!qEl) return;
    const kinds = R.reduce((m, r) => ((m[r.type] = (m[r.type] || 0) + 1), m), {});
    const tracks = R.reduce((s, r) => s + r.tracks, 0);
    $("#rel-stats").innerHTML = specRows([
      ["Releases", `<b data-count="${R.length}">${R.length}</b>`],
      ["Tracks", `<b data-count="${tracks}">${tracks}</b>`],
      ["Music", `${Math.round(R.reduce((s, r) => s + r.length, 0) / 3600)} hours`],
      ["EP · LP", `${kinds.EP || 0} · ${kinds.LP || 0}`],
      ["VA · Single", `${kinds.VA || 0} · ${kinds.Single || 0}`],
      ["Label since", FOUNDED],
    ]);

    // the newest eight as covers
    $("#latest-sum").innerHTML = `<b data-count="8">08</b> of ${R.length}`;
    $("#covers").innerHTML = R.slice(0, 8).map((r) => `
      <a class="rc" href="${r.page}">
        <span class="iw"><img src="covers/${r.art}-l.jpg" width="600" height="600" data-preload alt="Cover of ${esc(r.title)} by ${esc(r.artist)}"></span>
        <span class="m"><span class="lab">${r.cat || r.type}</span><span class="lab">${r.date > today ? "Pre-order" : dmy(r.date)}</span></span>
        <span class="a">${esc(r.artist)}</span>
        <span class="t">${esc(r.title)}</span>
      </a>`).join("");

    // every release, with search and filters
    const yearEl = $("#year"), typesEl = $("#types");
    let type = "";
    [...new Set(R.map((r) => r.year))].sort((a, b) => b - a)
      .forEach((y) => yearEl.insertAdjacentHTML("beforeend", `<option>${y}</option>`));
    typesEl.querySelectorAll("button").forEach((b) => {
      b.insertAdjacentHTML("beforeend", `<small>${b.dataset.type ? kinds[b.dataset.type] || 0 : R.length}</small>`);
    });
    $("#all-sum").innerHTML = `<b data-count="${R.length}">${R.length}</b> releases`;

    const renderRows = (animate) => {
      const q = fold(qEl.value.trim()), qTight = squash(q), y = +yearEl.value;
      const list = R.filter((r) =>
        (!q || r.key.includes(q) || r.keyTight.includes(qTight)) &&
        (!type || r.type === type) && (!y || r.year === y));
      $("#rows").innerHTML = list.map((r) => `
        <li><a class="trow" href="${r.page}">
          <img src="covers/${r.art}-t.jpg" width="40" height="40" loading="lazy" decoding="async" alt="">
          <span class="c">${r.cat || "—"}</span>
          <span class="a">${esc(r.artist)}</span>
          <span class="t">${esc(r.title)}${r.date > today ? '<span class="badge">Pre-order</span>' : ""}${r.vinyl ? '<span class="badge">Vinyl</span>' : ""}</span>
          <span class="ty">${r.type}</span>
          <span class="k">${pad(r.tracks)}</span>
          <span class="l">${mmss(r.length)}</span>
          <span class="y">${r.year}</span>
        </a></li>`).join("");
      stagger($("#rows"), animate);
      fadeIn($("#rows"));
      $("#empty").hidden = list.length > 0;
      $("#count").textContent = `Showing ${pad(list.length)} / ${R.length}`;
    };
    typesEl.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      type = b.dataset.type;
      typesEl.querySelectorAll("button").forEach((c) => c.classList.toggle("on", c === b));
      renderRows(true);
    });
    qEl.addEventListener("input", () => renderRows(true));
    yearEl.addEventListener("change", () => renderRows(true));
    $("#clear").addEventListener("click", () => {
      qEl.value = ""; yearEl.value = ""; type = "";
      typesEl.querySelectorAll("button").forEach((c) => c.classList.toggle("on", !c.dataset.type));
      renderRows(true); qEl.focus();
    });
    renderRows();

    // press / to search
    addEventListener("keydown", (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || /^(input|select|textarea)$/i.test(document.activeElement.tagName)) return;
      e.preventDefault();
      qEl.focus({ preventScroll: true });
      qEl.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    });
  });

  // ---------- events page ----------
  part("events", () => {
    if (!$("#ev-list")) return;
    const venues = nightsPast.reduce((m, e) => (e.venue !== "TBA" && (m[e.venue] = (m[e.venue] || 0) + 1), m), {});
    const [home, homeN] = Object.entries(venues).sort((a, b) => b[1] - a[1])[0];
    $("#ev-stats").innerHTML = specRows([
      ["Nights", `<b data-count="${nightsPast.length}">${pad(nightsPast.length)}</b>`],
      ["First", nightsPast[nightsPast.length - 1].date.slice(0, 4)],
      ["Venues", `<b data-count="${Object.keys(venues).length}">${pad(Object.keys(venues).length)}</b>`],
      ["Most nights", `${esc(home)} · ${homeN}`],
      ["Next", nightsNext.length ? dmy(nightsNext[0].date) : "TBA"],
      ["City", "Yerevan"],
    ]);

    if (nightsNext.length) {
      $("#ev-tba").hidden = true;
      const ul = $("#ev-upcoming");
      ul.hidden = false;
      ul.innerHTML = nightsNext.map((e) => `<li><a href="${e.url}" target="_blank" rel="noopener"><span class="lab">${dmy(e.date)} · ${esc(e.venue)}</span><span class="t">${esc(e.title)}</span><span class="lab">${esc(e.lineup)}</span></a></li>`).join("");
    }

    // the archive, grouped by year
    $("#ev-sum").innerHTML = `<b data-count="${nightsPast.length}">${pad(nightsPast.length)}</b> nights listed on Resident Advisor`;
    const perYear = nightsPast.reduce((m, e) => ((m[e.date.slice(0, 4)] = (m[e.date.slice(0, 4)] || 0) + 1), m), {});
    let year = "";
    $("#ev-list").innerHTML = nightsPast.map((e) => {
      const y = e.date.slice(0, 4), head = y === year ? "" : `<li class="eyear"><span>${(year = y)}</span><span class="lab">${pad(perYear[y])} ${perYear[y] > 1 ? "nights" : "night"}</span></li>`;
      return `${head}
      <li><a class="erow" href="${e.url}" target="_blank" rel="noopener">
        <span class="d"><b>${dmy(e.date)}</b>${WD[new Date(e.date + "T12:00:00").getDay()]}</span>
        <span class="t">${esc(e.title)}</span>
        <span class="l">${esc(e.lineup)}</span>
        <span class="v">${esc(e.venue)}</span>
        <span class="go" aria-hidden="true">↗</span>
      </a></li>`;
    }).join("");
  });

  // ---------- page loader: real progress on fonts and the page's first screen of artwork ----------
  const loader = $("#loader");
  const revealed = new Promise((resolve) => {
    const root = document.documentElement;
    if (!root.classList.contains("is-loading")) { loader.remove(); root.classList.add("intro"); resolve(); return; }
    const log = $("#ld-log"), num = $("#ld-num"), barEl = $("#ld-bar"), logo = $("#ld-logo");
    const line = (label, value = "") => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${label}</span><span>${value}</span>`;
      log.append(li);
      return li.lastChild;
    };
    line("> Init Death Bell Records", "Yerevan");
    if (PAGE === "events") line(`> Nights · ${nightsPast.length} on Resident Advisor`, "OK");
    else line(`> Catalogue · ${R.length} releases`, "OK");
    const art = [...document.querySelectorAll("main img[data-preload]")].slice(0, 9).map((img) => img.getAttribute("src"));
    let artDone = 0, fontsDone = 0, shown = 0, finished = false, ended = false;
    const artLine = line("> Artwork", art.length ? `00/${pad(art.length)}` : "OK");
    art.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => { artDone++; artLine.textContent = artDone === art.length ? "OK" : `${pad(artDone)}/${pad(art.length)}`; };
      img.src = src;
    });
    const typeLine = line("> Type · Geist / Geist Mono", "…");
    fontsLoaded.then(() => { fontsDone = 1; typeLine.textContent = "OK"; });

    let seen = null;
    try { seen = localStorage.getItem("dbr:seen"); } catch (e) { /* storage blocked: treat as a first visit */ }
    const total = art.length + 1, MIN = seen ? 650 : 1100, MAX = 6000, t0 = performance.now();
    const paint = (p) => {
      num.textContent = String(Math.round(p * 100)).padStart(3, "0");
      barEl.style.setProperty("--p", p.toFixed(3));
      logo.style.setProperty("--clip", `${((1 - p) * 100).toFixed(1)}%`);
    };
    const end = () => {
      if (ended) return;
      ended = true;
      root.classList.remove("is-loading");
      loader.remove();
      resolve();
    };
    function finish() {
      if (finished) return;
      finished = true;
      paint(1);
      line("> Ready", "▮");
      try { localStorage.setItem("dbr:seen", "1"); } catch (e) { /* storage blocked: every visit gets the full-length loader */ }
      setTimeout(() => {
        root.classList.add("intro");
        loader.classList.add("done");
        loader.addEventListener("transitionend", end, { once: true });
        setTimeout(end, reduce ? 350 : 1200);
      }, 260);
    }
    const frame = (now) => {
      if (finished) return;
      const elapsed = now - t0;
      const goal = elapsed > MAX ? 1 : Math.min((artDone + fontsDone) / total, elapsed / MIN);
      shown += (goal - shown) * (reduce ? 1 : .14);
      if (goal - shown < .003) shown = goal;
      paint(shown);
      if (shown >= 1) finish(); else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    setTimeout(finish, MAX + 300); // backstop if animation frames are paused
  });

  // ---------- footer wordmark: fill the width ----------
  const wm = $("#wordmark");
  function fitWordmark() {
    wm.style.setProperty("--wm", "100px");
    const rg = document.createRange();
    rg.selectNodeContents(wm);
    wm.style.setProperty("--wm", `${Math.min(100 * wm.clientWidth / rg.getBoundingClientRect().width * .99, 400).toFixed(1)}px`);
  }
  fitWordmark();
  fontsLoaded.then(fitWordmark);
  let wmRaf = 0;
  addEventListener("resize", () => { cancelAnimationFrame(wmRaf); wmRaf = requestAnimationFrame(fitWordmark); });

  // ---------- nav: on the home page, mark the section in view ----------
  const links = [...document.querySelectorAll('#links a[href^="#"]')];
  if (links.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) links.forEach((l) => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    links.forEach((l) => { const s = document.querySelector(l.getAttribute("href")); if (s) io.observe(s); });
    io.observe($("#top")); // back in the hero: no section marked
  }

  // ---------- micro-interactions ----------
  fadeIn(document);

  // smooth scrolling for links within the page, switched on after load so a link into a section of
  // another page (./#news) lands on it instead of gliding down from the top
  addEventListener("load", () => setTimeout(() => document.documentElement.classList.add("smooth"), 60), { once: true });

  // scroll progress under the bar
  const progress = $("#progress");
  let progRaf = 0;
  const setProgress = () => {
    progRaf = 0;
    const h = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty("--p", h > 0 ? (scrollY / h).toFixed(4) : 0);
  };
  addEventListener("scroll", () => { if (!progRaf) progRaf = requestAnimationFrame(setProgress); }, { passive: true });
  setProgress();

  // the big catalogue number or page title decodes on arrival; section titles decode as they come into view
  revealed.then(() => scramble($(".cat") || $(".page-t"), 900));
  const titleIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { scramble(e.target, 650); titleIO.unobserve(e.target); }
  }), { threshold: .6 });
  document.querySelectorAll(".sh-t, .nw-cat").forEach((h) => titleIO.observe(h));

  const countIO = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { countUp(e.target); countIO.unobserve(e.target); }
  }), { threshold: .8 });
  document.querySelectorAll("[data-count]").forEach((el) => countIO.observe(el));

  // copy the contact email
  const toast = $("#toast");
  let toastTimer = 0;
  const say = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
  };
  document.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => {
    const done = () => { say("Email copied"); b.textContent = "Copied ✓"; setTimeout(() => { b.textContent = "Copy"; }, 1600); };
    const fallback = () => {
      const a = b.closest("div").parentElement.querySelector('a[href^="mailto"]') || b.parentElement.querySelector('a[href^="mailto"]');
      if (a) { const rg = document.createRange(); rg.selectNodeContents(a); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg); }
      say("Selected: press Ctrl+C / ⌘C");
    };
    try { navigator.clipboard.writeText(b.dataset.copy).then(done, fallback); } catch (e) { fallback(); }
  }));

  // share a release's smart link page: the phone's share sheet where there is one, otherwise copy the address
  document.querySelectorAll("[data-share]").forEach((b) => b.addEventListener("click", () => {
    const url = location.href.split("#")[0];
    if (navigator.share) { navigator.share({ title: document.title, url }).catch(() => {}); return; }
    try { navigator.clipboard.writeText(url).then(() => say("Link copied"), () => say(url)); } catch (e) { say(url); }
  }));

  // ---------- mailing-list sign-ups: Notify me on News and the download gates' email step ----------
  // posted into a hidden frame so the visitor stays on the page; the list itself is set in data/settings.json
  part("sign-ups", () => {
    const forms = [...document.querySelectorAll("form.signup")];
    if (!forms.length) return;
    document.body.insertAdjacentHTML("beforeend", '<iframe name="signup-frame" title="Mailing list sign-up" hidden></iframe>');
    forms.forEach((form) => form.addEventListener("submit", () => {
      setTimeout(() => { // after the browser has sent it
        form.hidden = true;
        const done = form.parentElement.querySelector(".signup-done");
        if (done) done.hidden = false;
        say("You're on the list");
        form.dispatchEvent(new CustomEvent("signed-up", { bubbles: true }));
      }, 0);
    }));
  });

  // ---------- free download gates (free/<gate>.html) ----------
  // each step counts once the visitor has opened the follow link or joined the list; nothing here can check a
  // follow, so this is a thank-you, not a lock. Progress is kept in this browser for when they come back.
  part("gate", () => {
    const gate = $(".gate");
    if (!gate) return;
    const steps = [...gate.querySelectorAll(".step")], dl = gate.querySelector(".gate-dl"), status = gate.querySelector(".gate-status");
    const key = `dbr:gate:${gate.dataset.gate}`;
    let done = new Set();
    try { done = new Set(JSON.parse(localStorage.getItem(key) || "[]")); } catch (e) { /* storage blocked: start fresh */ }
    const update = () => {
      try { localStorage.setItem(key, JSON.stringify([...done])); } catch (e) { /* storage blocked: progress lasts this visit */ }
      let count = 0;
      steps.forEach((s) => {
        const ok = done.has(s.dataset.step), a = s.querySelector("a.btn");
        s.classList.toggle("done", ok);
        if (a) a.textContent = ok ? "Done ✓" : "Follow ↗";
        count += ok;
      });
      const open = count === steps.length;
      if (open) {
        dl.href = dl.dataset.href;
        dl.removeAttribute("aria-disabled");
        if (dl.hasAttribute("data-local")) dl.setAttribute("download", "");
      }
      status.textContent = open ? "Unlocked. Thank you for the support." : `${pad(count)} / ${pad(steps.length)} done`;
    };
    steps.forEach((s) => s.querySelector("a.btn")?.addEventListener("click", () => { done.add(s.dataset.step); setTimeout(update, 300); }));
    gate.addEventListener("signed-up", (e) => { done.add(e.target.closest(".step").dataset.step); update(); });
    dl.addEventListener("click", (e) => {
      if (!dl.hasAttribute("aria-disabled")) return;
      e.preventDefault();
      const next = steps.find((s) => !done.has(s.dataset.step));
      next?.querySelector("a, input")?.focus();
      say("Finish the steps above to unlock the download");
    });
    update();
  });

  if (fine) {
    // labels scramble on hover
    document.querySelectorAll(".links a, .btn:not([data-copy]), .sh a.lab, .hero-bar a.lab, .foot-bottom a").forEach((el) => {
      if (el.children.length) return;
      el.addEventListener("mouseenter", () => scramble(el, 380));
    });
    document.querySelectorAll(".follow a").forEach((a) => a.addEventListener("mouseenter", () => scramble(a.querySelector(".n"), 380)));
    document.querySelectorAll(".rs").forEach((c) => c.addEventListener("mouseenter", () => scramble(c.querySelector("h3"), 420)));
    document.querySelectorAll(".dx").forEach((c) => c.addEventListener("mouseenter", () => scramble(c.querySelector(".dx-t"), 480)));
    $("#covers")?.addEventListener("mouseover", (e) => {
      const cell = e.target.closest(".rc");
      if (cell && !cell.contains(e.relatedTarget)) scramble(cell.querySelector(".a"), 380);
    });

    if (!reduce) {
      // primary buttons lean toward the pointer
      document.querySelectorAll(".btn.primary").forEach((b) => {
        b.addEventListener("pointermove", (e) => {
          const r = b.getBoundingClientRect();
          b.style.transform = `translate(${((e.clientX - r.left) / r.width - .5) * 10}px, ${((e.clientY - r.top) / r.height - .5) * 8}px)`;
        });
        b.addEventListener("pointerleave", () => { b.style.transform = ""; });
      });

      // hero cover tilts in 3D toward the pointer
      const tilt = $("#tilt");
      if (tilt) {
        const tiltIn = tilt.querySelector(".tilt-in");
        tilt.addEventListener("pointermove", (e) => {
          const r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
          tilt.classList.add("active");
          tiltIn.style.setProperty("--ry", `${((x - .5) * 12).toFixed(2)}deg`);
          tiltIn.style.setProperty("--rx", `${((.5 - y) * 12).toFixed(2)}deg`);
        });
        tilt.addEventListener("pointerleave", () => {
          tilt.classList.remove("active");
          tiltIn.style.setProperty("--rx", "0deg");
          tiltIn.style.setProperty("--ry", "0deg");
        });
      }
    }

    // square cursor: inverts what it covers, grows over anything clickable
    const cursor = $("#cursor");
    document.documentElement.classList.add("has-cursor");
    let tx = -100, ty = -100, cx = -100, cy = -100, curRaf = 0;
    const ease = reduce ? 1 : .3;
    const follow = () => {
      cx += (tx - cx) * ease; cy += (ty - cy) * ease;
      cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      curRaf = Math.abs(tx - cx) + Math.abs(ty - cy) > .3 ? requestAnimationFrame(follow) : 0;
    };
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add("on");
      cursor.classList.toggle("big", !!e.target.closest("a, button, label.select"));
      cursor.classList.toggle("hide", !!e.target.closest("input, select, textarea"));
      if (!curRaf) curRaf = requestAnimationFrame(follow);
    }, { passive: true });
    document.documentElement.addEventListener("mouseleave", () => cursor.classList.remove("on"));
    addEventListener("pointerdown", () => cursor.classList.add("press"));
    addEventListener("pointerup", () => cursor.classList.remove("press"));
  }
})();
