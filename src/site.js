(() => {
  // Catalogue from deathbellrecords.bandcamp.com, newest first. tools/build.py fills it in from data/releases.json.
  // [cat. no., artist, title, type, release date, tracks, length in seconds, Bandcamp path, cover id, has vinyl]
  const DATA = /*@DATA@*/[];
  const BC = "https://deathbellrecords.bandcamp.com/";
  const IG = "https://instagram.com/deathbellrecords/";
  const FOUNDED = 2016; // Bandcamp dates one early EP to 2001, so the label's age comes from here, not the data
  const ALIAS = { "Förm": "_förm" }; // same artist, spelled two ways on Bandcamp
  const LABEL_ONLY = ["various artists", "death bell records"];

  // Upcoming releases for the News section on the home page. Pre-orders on Bandcamp show up there by themselves
  // after tools/fetch_bandcamp.py; add a release announced anywhere else here. Leave date "" while it is TBA.
  //   { cat: "DBR092", artist: "Artist", title: "Title EP", date: "2026-12-04", format: "Digital",
  //     url: "https://…", cover: "covers/dbr092.jpg", note: "One line about the record." },
  const UPCOMING = [];

  // Resident DJs, in the label's order. Photos are their RA / SoundCloud profile pictures.
  const RESIDENTS = [
    { name: "Förm", photo: "form.jpg",
      links: [["RA", "https://ra.co/dj/form"], ["SoundCloud", "https://soundcloud.com/form_music"], ["Instagram", "https://www.instagram.com/_form_live/"]] },
    { name: "KamavoSian", photo: "kamavosian.jpg",
      links: [["RA", "https://ra.co/dj/kamavosian"], ["SoundCloud", "https://soundcloud.com/ando-kamavosyan"], ["Instagram", "https://instagram.com/kamavosian"]] },
    { name: "Tøtal", photo: "total.jpg",
      links: [["RA", "https://ra.co/dj/total"], ["SoundCloud", "https://soundcloud.com/tootal"], ["Instagram", "https://instagram.com/totalofficial/"], ["Bandcamp", "https://totaldbr.bandcamp.com"]] },
    { name: "Arte Muradyan", photo: "arte-muradyan.jpg",
      links: [["SoundCloud", "https://soundcloud.com/arte-muradyan"], ["Instagram", "https://instagram.com/artemuradyan/"], ["Beatport", "https://www.beatport.com/artist/arte-muradyan/758297"]] },
    { name: "Belluian", photo: "belluian.jpg",
      links: [["SoundCloud", "https://soundcloud.com/belluian"]] },
  ];

  // Death Bell nights from ra.co/promoters/90929, newest first. [date, title, lineup, venue, RA event id]
  // A night with a future date shows under "Next night" on the events page and on the home page.
  const EVENTS = [
    ["2026-06-20", "Death Bell Records 10th Anniversary", "Förm b2b Arte Muradyan, Tøtal, KXAH (NYC), KamavoSian, Belluian b2b DPNN2", "The How", 2470236],
    ["2026-04-17", "Death Bell Night with Lucia Lu", "Tøtal, Förm, Lucia Lu, KamavoSian, Yhii", "The How", 2411514],
    ["2024-12-31", "Death Bell Night x Subcore x How", "hofmann (AM), Tøtal, Mixtinct, Xandra, KamavoSian", "The How", 2067828],
    ["2024-12-14", "Death Bell Night", "Tøtal, KamavoSian, Mixtinct, Belluian", "Fermata", 2054598],
    ["2024-09-27", "Death Bell x Woozy Tunes", "hayk karoyi, haramik, Maxwell (AM), KamavoSian, Tøtal", "Kitchen Lab", 2009918],
    ["2024-04-06", "Death Bell Night", "Lucinee, Tøtal, KamavoSian, T_st", "Hayfilm Studio", 1887942],
    ["2023-08-11", "Death Bell Night", "Tøtal, KamavoSian", "Fermata", 1754537],
    ["2023-04-01", "Death Bell Night 7 Years", "Tøtal, Förm, GFRND, ROKS, KamavoSian", "TBA", 1675104],
    ["2023-01-02", "Death Bell Night x Korridorrr", "Tøtal, KamavoSian", "Korridorrr", 1635613],
    ["2022-12-02", "Death Bell Night", "Tøtal, KamavoSian", "Fermata", 1621308],
    ["2022-06-03", "ԵՌԱՆԿՅՈՒՆ festival", "daao, Henna Onna, Ge-ology, KAÍ, Leö Anîram, Stereo Express, Supacooks, Tøtal, RIKHTER, KamavoSian", "Motor Yerevan", 1538430],
    ["2022-02-11", "Death Bell Night x The Basement", "Tøtal, Lucinee, KamavoSian", "Motor Yerevan", 1496355],
    ["2021-12-24", "Death Bell x LEZVANI", "Henna Onna, Narek Simonian, thanakí, Tøtal, GFRND, KamavoSian", "Fermata", 1490459],
    ["2021-10-22", "Death Bell Night", "JohannesK, Tøtal, Duncan Macdonald, KamavoSian", "Nine", 1468404],
    ["2021-09-11", "Death Bell Night", "sardaryans, Förm, KamavoSian, Tøtal, KAÍ, GFRND", "Fermata", 1462476],
    ["2021-08-13", "Death Bell Night", "Tøtal, KamavoSian, T_st", "Fermata", 1455656],
    ["2021-03-19", "Death Bell Night", "Tøtal, KamavoSian, Förm", "Korridorrr", 1438935],
    ["2019-08-23", "Death Bell Night", "Regal, Tøtal, KamavoSian, Förm", "Old Shoes Factory", 1289632],
  ].map(([date, title, lineup, venue, id]) => ({ date, title, lineup, venue, url: `https://ra.co/events/${id}` }));

  const R = DATA.map(([cat, artist, title, type, date, tracks, length, path, art, vinyl]) => ({
    cat, artist, title, type, date, tracks, length, url: BC + path, art, vinyl,
    year: +date.slice(0, 4),
    names: LABEL_ONLY.includes(artist.toLowerCase()) ? [] : artist.split(", ").map((a) => ALIAS[a.trim()] || a.trim()),
  }));

  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
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
  // images fade in as they arrive
  function fadeIn(root) {
    root.querySelectorAll("img").forEach((img) => {
      if (img.complete || img.classList.contains("fade")) return;
      img.classList.add("fade");
      const show = () => img.classList.add("in");
      img.addEventListener("load", show, { once: true });
      img.addEventListener("error", show, { once: true });
    });
  }
  // text decodes from random glyphs into the real label
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>";
  function scramble(el, dur = 420) {
    if (reduce || !el) return;
    const final = el._final ?? el.textContent;
    el._final = final;
    cancelAnimationFrame(el._raf);
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur), n = Math.floor(p * final.length);
      let out = "";
      for (let i = 0; i < final.length; i++) out += i < n || final[i] === " " ? final[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
      if (p < 1) el._raf = requestAnimationFrame(step);
      else { el.textContent = final; el._final = undefined; }
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

  // ---------- menu (small screens) ----------
  const bar = $("#bar"), menuBtn = $("#menu-btn");
  menuBtn.addEventListener("click", () => {
    const open = bar.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  $("#links").addEventListener("click", (e) => {
    if (e.target.closest("a")) { bar.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); }
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
  const tickerItems = R.slice(0, 12).map((r) =>
    `<a href="${r.url}" target="_blank" rel="noopener"><b>${r.cat || r.type}</b>${r.date > today ? "Pre-order · " : ""}${esc(r.artist)} — ${esc(r.title)}</a>`).join("");
  $("#ticker").innerHTML = `<span class="sr">Latest releases: </span>${tickerItems}<span aria-hidden="true" style="display:contents">${tickerItems.replace(/<a /g, '<a tabindex="-1" ')}</span>`;

  // the site's one colour: sampled from the newest cover
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
        const root = document.documentElement.style;
        root.setProperty("--accent", `hsl(${h} ${sat}% 58%)`);
        root.setProperty("--accent-a", `hsl(${h} ${sat}% 50% / .22)`);
      } catch (e) { /* keep the neutral default */ }
    };
    img.src = src;
  })(`covers/${released[0].art}-t.jpg`);

  // ---------- home: news, the next release and the release schedule ----------
  if ($("#nw-feat")) {
    const preorders = R.filter((r) => r.date > today).map((r) => ({
      cat: r.cat, artist: r.artist, title: r.title, date: r.date, format: r.vinyl ? "Vinyl · Digital" : "Digital",
      url: r.url, cover: `covers/${r.art}-l.jpg`, preorder: true }));
    const onBandcamp = new Set(preorders.map((u) => u.cat).filter(Boolean));
    const upcoming = [...preorders, ...UPCOMING.filter((u) => !(u.cat && onBandcamp.has(u.cat)) && (!u.date || u.date > today))]
      .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999")); // soonest first, TBA last
    const lastCat = Math.max(0, ...R.map((r) => +(/^DBR(\d+)$/.exec(r.cat) || [])[1] || 0));
    const u = upcoming[0];
    const placeholder = `<span class="nw-art nw-ph" aria-hidden="true"><svg class="emblem"><use href="#logo"/></svg><span class="lab">Artwork soon</span></span>`;
    $("#nw-feat").innerHTML = u ? `
      ${u.url ? `<a class="nw-art" href="${esc(u.url)}" target="_blank" rel="noopener" tabindex="-1">` : '<span class="nw-art">'}${u.cover
        ? `<img src="${esc(u.cover)}" width="600" height="600" data-preload alt="Cover of ${esc(u.title)} by ${esc(u.artist)}">`
        : placeholder}${u.url ? "</a>" : "</span>"}
      <div class="nw-body">
        <p class="lab"><span class="dot live"></span>${u.preorder ? "Pre-order now" : "Upcoming release"}</p>
        <p class="nw-cat" aria-hidden="true">${esc(u.cat || "New")}</p>
        <h3 class="title-stack"><span class="sr">${esc(u.cat || "")} </span><span class="a">${esc(u.artist)}</span><span class="t">${esc(u.title)}</span></h3>
        ${u.note ? `<p class="lede">${esc(u.note)}</p>` : ""}
        <dl class="spec">${specRows([["Release", u.date ? dmy(u.date) : "TBA"], ["Format", esc(u.format || "Digital")], ["Label", "Death Bell"]])}</dl>
        ${u.date ? `<div class="count" id="countdown" data-to="${u.date}" role="timer" aria-label="Out in ${days(u.date)} days"></div>` : ""}
        <div class="actions">${u.url ? `<a class="btn primary" href="${esc(u.url)}" target="_blank" rel="noopener">${u.preorder ? "Pre-order on Bandcamp ↗" : "Listen ↗"}</a>` : ""}<a class="btn" href="${IG}" target="_blank" rel="noopener">Instagram ↗</a></div>
      </div>` : `
      ${placeholder}
      <div class="nw-body">
        <p class="lab"><span class="dot live"></span>Next in the catalogue</p>
        <p class="nw-cat">DBR${String(lastCat + 1).padStart(3, "0")}</p>
        <h3 class="nw-tba">To be announced</h3>
        <p class="lede">The next Death Bell record is in the works. Follow the label on Bandcamp to get it the day it drops, and watch Instagram and SoundCloud for the first previews.</p>
        <div class="actions"><a class="btn primary" href="${BC}" target="_blank" rel="noopener">Follow on Bandcamp ↗</a><a class="btn" href="${IG}" target="_blank" rel="noopener">Instagram ↗</a></div>
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
      <li><a class="srow${up ? " up" : ""}" href="${esc(url)}" target="_blank" rel="noopener">
        <span class="d">${d}</span><span class="s">${status}</span><span class="c">${esc(cat || "—")}</span>
        <span class="w"><b>${esc(artist)}</b><span>${esc(title)}</span></span><span class="go" aria-hidden="true">↗</span>
      </a></li>`;
    $("#sched").innerHTML =
      (upcoming.length
        ? upcoming.slice().reverse().map((x) => row(x.date ? dmy(x.date) : "TBA", x.date ? `In ${days(x.date)} d` : "Soon", x.cat, x.artist, x.title, x.url || BC, true)).join("")
        : `<li class="sempty"><span class="lab">No release dates announced yet</span></li>`) +
      `<li class="now"><span class="lab"><span class="dot live"></span>Today · ${dmy(today)}</span></li>` +
      released.slice(0, 5).map((r) => row(dmy(r.date), ago(r.date), r.cat, r.artist, r.title, r.url)).join("");

    // ways into the releases and events pages
    $("#dx-rel").innerHTML = `<b data-count="${R.length}">${R.length}</b> releases · since ${FOUNDED}`;
    $("#dx-covers").innerHTML = released.slice(0, 5).map((r) => `<img src="covers/${r.art}-l.jpg" width="600" height="600" loading="lazy" alt="">`).join("");
    $("#dx-ev").innerHTML = `<b data-count="${nightsPast.length}">${pad(nightsPast.length)}</b> nights · next: ${nightsNext.length ? dmy(nightsNext[0].date) : "TBA"}`;
    $("#dx-nights").innerHTML = [...nightsNext.slice(0, 1), ...nightsPast.slice(0, 3)].map((e) =>
      `<span class="dx-row"><span>${dmy(e.date)}</span><span>${esc(e.title)}</span><span>${esc(e.venue)}</span></span>`).join("");
  }

  // ---------- home: residents ----------
  if ($("#res-grid")) {
    $("#res-grid").innerHTML = RESIDENTS.map((p) => `
      <article class="rs">
        <div class="ph"><img src="residents/${p.photo}" loading="lazy" alt="${esc(p.name)}"></div>
        <h3>${esc(p.name)}</h3>
        <div class="rs-links">${p.links.map(([l, u]) => `<a href="${u}" target="_blank" rel="noopener">${l} ↗</a>`).join("")}</div>
      </article>`).join("");
  }

  // ---------- releases page ----------
  const qEl = $("#q");
  if (qEl) {
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
      <a class="rc" href="${r.url}" target="_blank" rel="noopener">
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
      const q = qEl.value.trim().toLowerCase(), y = +yearEl.value;
      const list = R.filter((r) =>
        (!q || `${r.cat} ${r.artist} ${r.names.join(" ")} ${r.title}`.toLowerCase().includes(q)) &&
        (!type || r.type === type) && (!y || r.year === y));
      $("#rows").innerHTML = list.map((r) => `
        <li><a class="trow" href="${r.url}" target="_blank" rel="noopener">
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
  }

  // ---------- events page ----------
  if ($("#ev-list")) {
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
  }

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
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { fontsDone = 1; typeLine.textContent = "OK"; });

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
  if (document.fonts) document.fonts.ready.then(fitWordmark);
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

  if (fine) {
    // labels scramble on hover
    document.querySelectorAll(".links a, .btn:not([data-copy]), .sh a.lab, .hero-bar a.lab, .foot-bottom a").forEach((el) => {
      if (el.children.length) return;
      el.setAttribute("aria-label", el.textContent.trim());
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
