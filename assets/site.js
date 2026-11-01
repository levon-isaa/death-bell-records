(() => {
  // Catalogue from deathbellrecords.bandcamp.com, newest first. tools/build.py fills it in from data/releases.json.
  // [cat. no., artist, title, type, release date, tracks, length in seconds, Bandcamp path, cover id, has vinyl]
  const DATA = [
    ["DBR091", "Tøtal", "Controlled Damage EP", "EP", "2026-10-02", 6, 1876, "album/controlled-damage-ep-dbr091", 2029983464, 0],
    ["DBR090", "Dave Alyan", "Hidden Process EP", "EP", "2026-09-25", 4, 1175, "album/hidden-process-ep", 3004936792, 0],
    ["DBR089", "SUNBURN", "ENTHROPY EP", "EP", "2026-09-04", 4, 1248, "album/enthropy-ep", 1177275998, 0],
    ["DBR088", "MOHG", "Oath EP", "EP", "2026-08-07", 4, 1294, "album/oath-ep", 1306603334, 0],
    ["DBR087", "Not By Me", "Eyes Closed", "EP", "2026-05-29", 4, 1129, "album/eyes-closed", 1966631380, 0],
    ["DBRVA009", "Various Artists", "DBRVA009", "VA", "2026-04-10", 24, 7614, "album/dbrva009", 610976801, 0],
    ["DBR086", "Gioele Menoni", "Single Force EP", "EP", "2026-03-20", 3, 875, "album/single-force-ep", 1633306445, 0],
    ["", "Tøtal", "Control EP", "EP", "2026-03-06", 8, 2373, "album/control-ep", 1323866780, 0],
    ["DBR084", "Screwss", "Alone EP", "EP", "2026-02-27", 4, 1353, "album/alone-ep", 371291288, 0],
    ["DBR083", "aft6r", "Gruv Me Up EP", "EP", "2026-02-13", 4, 1182, "album/gruv-me-up-ep", 2611202588, 0],
    ["DBR082", "Synthr", "Cosmic Interpretation EP", "EP", "2026-01-23", 3, 897, "album/cosmic-interpretation-ep", 1670984148, 0],
    ["DBR081", "Arte Muradyan", "Ripple EP", "EP", "2026-01-16", 4, 1054, "album/ripple-ep", 487229799, 0],
    ["DBR080", "Sid Porwal", "Super Dank EP", "EP", "2025-12-19", 4, 1296, "album/super-dank-ep", 2244479124, 0],
    ["", "Tøtal", "Time EP", "EP", "2025-12-05", 4, 1200, "album/time-ep", 3802364179, 0],
    ["", "NOOG", "Traumatic EP", "EP", "2025-10-27", 4, 1332, "album/traumatic-ep", 266918994, 0],
    ["DBR077", "Fakign", "Still life EP", "EP", "2025-10-10", 5, 1654, "album/fakign-still-life-ep-dbr077", 1443416804, 0],
    ["DBRVA008", "Various Artists", "DBRVA008", "VA", "2025-09-26", 24, 8063, "album/dbrva008", 3068642983, 0],
    ["DBR076", "Arte Muradyan", "Friction EP", "EP", "2025-09-12", 4, 1066, "album/friction-ep", 3828654665, 0],
    ["DBR075", "Nicko Shuo", "Iteritas EP", "EP", "2025-09-05", 4, 1238, "album/iteritas-ep", 3909761953, 0],
    ["DBR072", "Niklass", "When Night Falls EP", "EP", "2025-08-25", 4, 1360, "album/when-night-falls-ep", 3343681895, 0],
    ["DBR074", "Tøtal", "Signal LP", "LP", "2025-08-22", 12, 3805, "album/signal-lp", 1562286964, 0],
    ["DBR073", "BREAKER BREAKER", "UNTAPPED SENSORS EP", "EP", "2025-08-15", 4, 1265, "album/untapped-sensors-ep", 3192468159, 0],
    ["", "Tøtal, KamavoSian", "TWINZ (Deep Cover)", "Single", "2025-07-29", 1, 311, "track/twinz-deep-cover", 3802522890, 0],
    ["DBR071", "Oculus", "Revelations II", "EP", "2025-07-13", 4, 1348, "album/revelations-ii", 3404242842, 0],
    ["DBRVA007", "Various Artists", "DBRVA007", "VA", "2025-05-30", 13, 4191, "album/dbrva007", 1624365199, 0],
    ["DBRVA006", "Various Artists", "DBRVA006", "VA", "2025-04-11", 15, 4871, "album/dbrva006", 2221061691, 0],
    ["DBR070", "Tøtal", "Qez EP", "EP", "2025-03-27", 3, 845, "album/qez-ep-dbr070", 78983774, 0],
    ["DBR069", "Nozli", "End It All EP", "EP", "2025-03-14", 4, 1242, "album/end-it-all-ep-dbr069", 3088126241, 0],
    ["DBR068", "Akuntsu", "Chances taken", "EP", "2025-02-28", 3, 954, "album/chances-taken-dbr068", 3873124354, 0],
    ["DBRVA005", "Various Artists", "DBRVA005", "VA", "2025-02-14", 19, 6253, "album/dbrva005", 1963748726, 0],
    ["SUBCORE001", "KamavoSian", "DREAMSIDE EP", "EP", "2025-01-24", 3, 966, "album/dreamside-ep-subcore001", 833367328, 0],
    ["DBR067", "ninezerø", "Zero EP", "EP", "2025-01-09", 3, 842, "album/zero-ep", 3232033506, 0],
    ["DBRVA2024", "Various artists", "DBRVA 2024", "VA", "2024-12-24", 8, 2570, "album/dbrva-2024", 840457908, 0],
    ["DBR066", "Tøtal", "Believe In Me Destruction EP", "EP", "2024-11-15", 4, 1090, "album/believe-in-me-destruction-ep-dbr066", 2229226411, 0],
    ["DBR065", "Breaker", "Echoes of the Aether EP", "EP", "2024-10-24", 3, 919, "album/echoes-of-the-aether-ep", 681880562, 0],
    ["DBR064", "Tøtal, Keshabyan", "Rhythm of your heart EP", "EP", "2024-09-23", 3, 837, "album/rhythm-of-your-heart-ep", 3347527103, 0],
    ["DBR063", "Dave Alyan", "Give Me Some EP", "EP", "2024-08-21", 2, 644, "album/give-me-some-ep-dbr063", 1442127180, 0],
    ["DBR062", "Tøtal", "Snake EP", "EP", "2024-06-10", 6, 1772, "album/snake-ep-dbr062", 1352689030, 0],
    ["DBR061", "ALLFIVE", "Might Be Some EP", "EP", "2024-06-03", 3, 979, "album/might-be-some-ep-dbr061", 2301975808, 0],
    ["DBRVA004", "Various Artists", "Through the Loophole vol.2", "VA", "2024-03-18", 12, 3679, "album/various-artists-through-the-loophole-vol-2-dbrva004", 2808425168, 0],
    ["DBR060", "Tøtal", "Kill EP", "EP", "2024-02-12", 3, 818, "album/kill-ep", 2837164196, 0],
    ["DBR059", "Talantosis", "Trismegistos EP", "EP", "2023-09-15", 3, 1113, "album/trismegistos-ep", 466241783, 0],
    ["DBR058", "Tøtal", "Pursuit EP", "EP", "2023-08-28", 3, 879, "album/pursuit-ep-dbr058", 4232063609, 0],
    ["DBR057", "Death Bell Records", "Rise Again EP", "EP", "2023-04-14", 2, 719, "album/rise-again-ep-dbr057", 552935056, 0],
    ["DBR056", "Tøtal", "Pure Substance EP", "EP", "2023-04-06", 6, 2066, "album/pure-substance-ep", 2191731978, 0],
    ["DBR055", "Scornia", "Pitch Control EP", "EP", "2023-03-13", 4, 1479, "album/pitch-control-ep-dbr055", 3548311791, 0],
    ["DBR053", "Obscur", "Collective Behaviour EP", "EP", "2022-12-28", 3, 1072, "album/collective-behaviour-ep", 1807862835, 0],
    ["DBR054", "Tøtal", "Synthetic Function EP", "EP", "2022-12-05", 3, 1049, "album/synthetic-function-ep", 3145901581, 0],
    ["DBRVA003", "Various Artists", "Persuasive Conversation", "VA", "2022-09-23", 6, 2174, "album/persuasive-conversation-dbrva003", 369105216, 0],
    ["DBR052", "Cullen Enslin", "Complex Systems EP", "EP", "2022-05-06", 3, 943, "album/complex-systems-ep", 3450889641, 0],
    ["DBR051", "R 417", "Coma EP", "EP", "2022-04-25", 3, 1064, "album/coma-ep-dbr051", 2292317908, 0],
    ["DBR050", "Erased Roots", "On The Run EP", "EP", "2022-03-26", 4, 1531, "album/on-the-run-ep-dbr050", 3739085202, 0],
    ["DBR049", "Kevin Ferhati", "Cloaking EP", "EP", "2022-02-28", 3, 1031, "album/cloaking-ep", 2177785951, 0],
    ["DBR048", "Oscar Sanchez", "Chaac EP", "EP", "2022-02-09", 3, 935, "album/chaac-ep", 2183696140, 0],
    ["DBR047", "Anejath", "Droid Mechanics EP", "EP", "2021-12-13", 3, 1073, "album/droid-mechanics-ep", 3015951790, 0],
    ["DBR046", "Black Mirror Park", "The Second Coming EP", "EP", "2021-12-06", 3, 1011, "album/the-second-coming-ep", 2003113128, 0],
    ["DBR045", "Tøtal", "Infuse Yourself EP", "EP", "2021-11-29", 3, 1090, "album/infuse-yourself-ep", 1810890857, 0],
    ["DBR044", "Alberto Tolo", "Discordia EP", "EP", "2021-11-21", 3, 1004, "album/discordia-ep", 4100210380, 0],
    ["DBRVA002", "Various Artists", "Definition", "VA", "2021-10-18", 4, 1533, "album/definition", 4234619989, 0],
    ["DBR043", "Dave Alyan, J.Blofeld", "Obscure EP", "EP", "2021-06-18", 2, 811, "album/dave-alyan-obscure-ep", 192288709, 0],
    ["DBR042", "Tøtal", "Processes EP", "EP", "2021-05-21", 3, 916, "album/processes-ep", 3520373355, 0],
    ["DBR041", "Pøl, Hedström & Pflug", "Defense mechanism", "EP", "2021-05-01", 8, 2906, "album/defense-mechanism", 3334966241, 0],
    ["DBR040", "Dave Alyan", "Vision EP", "EP", "2021-02-22", 3, 1184, "album/vision-ep", 1818994491, 0],
    ["DBRVA001", "Various Artists", "Through the Loophole", "VA", "2021-01-18", 11, 3939, "album/through-the-loophole", 402826650, 0],
    ["DBR039", "Tøtal", "Merger EP", "EP", "2020-07-12", 6, 2107, "album/merger-ep", 376116535, 0],
    ["DBR038", "KamavoSian", "Message EP", "EP", "2020-06-22", 2, 839, "album/message-ep", 3409972078, 0],
    ["", "Qwëzall", "Lost Remnants Ep", "EP", "2020-06-05", 3, 1005, "album/lost-remnants-ep", 497983478, 0],
    ["", "Tøtal, KamavoSian, _förm", "BasisOne", "EP", "2020-05-03", 2, 821, "album/basisone", 464109748, 0],
    ["DBR036", "Distorted Anima", "Binary System EP", "EP", "2020-03-30", 4, 1462, "album/binary-system-ep", 98577518, 0],
    ["DBR035", "_förm", "Evol Anin EP", "EP", "2020-02-10", 3, 1123, "album/evol-anin-ep", 2833290298, 0],
    ["DBR034", "KamavoSian", "Sign of light EP", "EP", "2020-01-30", 5, 2546, "album/sign-of-light-ep", 376551612, 0],
    ["DBR033", "Tøtal", "Pressure EP", "EP", "2020-01-13", 4, 1615, "album/pressure-ep", 1764560438, 0],
    ["DBR032", "Egotot", "Hypnotic therapy EP", "EP", "2019-12-03", 4, 1576, "album/hypnotic-therapy-ep", 4003101631, 0],
    ["DBR031", "KamavoSian", "I was cold beside you EP", "EP", "2019-10-07", 4, 1485, "album/i-was-cold-beside-you-ep", 2426898336, 0],
    ["DBR030", "Space (GR)", "LINEAR MOLTEN EP", "EP", "2019-05-20", 5, 2253, "album/linear-molten-ep", 2951051880, 0],
    ["DBR029", "Ruke Lidchard", "Cosmic Dust EP", "EP", "2019-05-15", 4, 1358, "album/cosmic-dust-ep", 650267330, 0],
    ["DBR028", "_förm", "Head Of Hydrus EP", "EP", "2019-05-01", 3, 1248, "album/head-of-hydrus-ep", 2947191454, 0],
    ["DBR027", "Tøtal", "Mist EP", "EP", "2019-04-15", 3, 1108, "album/mist-ep", 1146857001, 0],
    ["DBR026", "KamavoSian, Tøtal", "Inner oppression EP", "EP", "2019-04-06", 3, 1474, "album/inner-oppression-ep", 1030704589, 0],
    ["DBR025", "Trial-Trip", "Before The Event EP", "EP", "2019-04-01", 6, 1968, "album/before-the-event-ep", 1125848036, 0],
    ["DBR024", "Förm", "Dark Redux EP", "EP", "2019-01-28", 3, 1426, "album/dark-redux-ep", 557922274, 0],
    ["DBR023", "Tøtal", "Apart EP", "EP", "2019-01-15", 3, 1150, "album/apart-ep", 1482433059, 0],
    ["DBR022", "KamavoSian", "Craving EP", "EP", "2018-10-29", 3, 1323, "album/craving-ep", 20546307, 0],
    ["DBR021", "Tøtal", "Ripple Effects EP", "EP", "2018-10-01", 3, 1121, "album/ripple-effects-ep", 2561637312, 0],
    ["DBR020", "Chihiro Hikari", "Back Home EP", "EP", "2018-08-15", 3, 1484, "album/back-home-ep", 2610293853, 0],
    ["DBR018", "Tøtal", "Arrival LP", "LP", "2018-08-06", 10, 3199, "album/arrival-lp", 1236495174, 0],
    ["DBR019", "KamavoSian", "Silence EP", "EP", "2018-07-29", 3, 1020, "album/silence-ep", 4283829877, 0],
    ["DBR017", "Andis", "Dancing EP", "EP", "2018-07-21", 6, 2164, "album/dancing-ep", 858086369, 0],
    ["DBR016", "Unart8", "Paradise EP", "EP", "2018-07-07", 5, 2005, "album/paradise-ep", 2697461983, 0],
    ["DBR015", "Tøtal", "NGC 2207 EP", "EP", "2018-06-11", 3, 1127, "album/ngc-2207-ep", 51429735, 0],
    ["DBR014", "Gurbo", "A Voice From Somewhere EP", "EP", "2018-06-05", 3, 1090, "album/a-voice-from-somewhere-ep", 350734119, 0],
    ["DBR013", "Wacky Kid", "The Story of the Dark Instincts EP", "EP", "2018-05-24", 5, 1734, "album/the-story-of-the-dark-instincts-ep", 737583181, 0],
    ["DBR012", "Thomas Vunel", "EP #book No.1", "EP", "2018-05-07", 3, 1453, "album/ep-book-no-1", 1162202967, 0],
    ["DBR011", "Nick", "BASHMASHCASHWASH EP", "EP", "2018-05-02", 3, 1171, "album/bashmashcashwash-ep", 2166693857, 0],
    ["DBR012", "Tøtal", "Unknown Shadow Ep", "EP", "2018-04-30", 4, 1453, "album/unknown-shadow-ep", 212378826, 1],
    ["DBR010", "Tøtal", "Warp ep", "EP", "2018-04-16", 3, 1190, "album/warp-ep", 4157947853, 0],
    ["DBR009", "KamavoSian", "ep. obscure", "EP", "2018-04-08", 3, 943, "album/ep-obscure", 2306465840, 0],
    ["DBR008", "Wacky Kid", "SAINT EP", "EP", "2018-03-31", 4, 1673, "album/saint-ep", 1205054804, 0],
    ["DBR007", "Rebecca Delle Piane", "THREE SHELTERS FOR THE BROKEN EP", "EP", "2018-03-19", 3, 1117, "album/three-shelters-for-the-broken-ep", 3559105889, 0],
    ["DBR006", "Dystopic L.", "Self-determination EP", "EP", "2018-03-05", 2, 589, "album/self-determination-ep", 2456789497, 0],
    ["", "Tøtal", "546 EP", "EP", "2018-02-15", 3, 1200, "album/546-ep", 2554406301, 0],
    ["DBR005", "Rebecca Delle Piane", "EP 7", "EP", "2018-02-12", 2, 754, "album/ep-7", 1392093723, 0],
    ["", "KamavoSian", "Hate EP", "EP", "2017-12-31", 3, 1473, "album/hate-ep", 4080443543, 0],
    ["", "Tøtal", "back space EP", "EP", "2001-01-17", 3, 1156, "album/back-space-ep", 842162726, 0],
  ];
  const BC = "https://deathbellrecords.bandcamp.com/";
  const IG = "https://instagram.com/deathbellrecords/";
  const FOUNDED = 2016; // Bandcamp dates one early EP to 2001, so the label's age comes from here, not the data
  const ALIAS = { "Förm": "_förm" }; // same artist, spelled two ways on Bandcamp
  const LABEL_ONLY = ["various artists", "death bell records"];

  // Kept in data/*.json and checked by tools/build.py before it fills them in, so a typo stops the build, not the site.
  // upcoming.json: releases announced for News (Bandcamp pre-orders show up there by themselves)
  const UPCOMING = [];
  // residents.json: resident DJs in the label's order, with their photo in residents/ and their links
  const RESIDENTS = [{"name": "Förm", "photo": "form.jpg", "links": [["RA", "https://ra.co/dj/form"], ["SoundCloud", "https://soundcloud.com/form_music"], ["Instagram", "https://www.instagram.com/_form_live/"]]}, {"name": "KamavoSian", "photo": "kamavosian.jpg", "links": [["RA", "https://ra.co/dj/kamavosian"], ["SoundCloud", "https://soundcloud.com/ando-kamavosyan"], ["Instagram", "https://instagram.com/kamavosian"]]}, {"name": "Tøtal", "photo": "total.jpg", "links": [["RA", "https://ra.co/dj/total"], ["SoundCloud", "https://soundcloud.com/tootal"], ["Instagram", "https://instagram.com/totalofficial/"], ["Bandcamp", "https://totaldbr.bandcamp.com"]]}, {"name": "Arte Muradyan", "photo": "arte-muradyan.jpg", "links": [["SoundCloud", "https://soundcloud.com/arte-muradyan"], ["Instagram", "https://instagram.com/artemuradyan/"], ["Beatport", "https://www.beatport.com/artist/arte-muradyan/758297"]]}, {"name": "Belluian", "photo": "belluian.jpg", "links": [["SoundCloud", "https://soundcloud.com/belluian"]]}];
  // events.json: Death Bell nights from ra.co/promoters/90929, newest first; a future date shows under "Next night"
  const EVENTS = [{"date": "2026-06-20", "title": "Death Bell Records 10th Anniversary", "lineup": "Förm b2b Arte Muradyan, Tøtal, KXAH (NYC), KamavoSian, Belluian b2b DPNN2", "venue": "The How", "ra": 2470236}, {"date": "2026-04-17", "title": "Death Bell Night with Lucia Lu", "lineup": "Tøtal, Förm, Lucia Lu, KamavoSian, Yhii", "venue": "The How", "ra": 2411514}, {"date": "2024-12-31", "title": "Death Bell Night x Subcore x How", "lineup": "hofmann (AM), Tøtal, Mixtinct, Xandra, KamavoSian", "venue": "The How", "ra": 2067828}, {"date": "2024-12-14", "title": "Death Bell Night", "lineup": "Tøtal, KamavoSian, Mixtinct, Belluian", "venue": "Fermata", "ra": 2054598}, {"date": "2024-09-27", "title": "Death Bell x Woozy Tunes", "lineup": "hayk karoyi, haramik, Maxwell (AM), KamavoSian, Tøtal", "venue": "Kitchen Lab", "ra": 2009918}, {"date": "2024-04-06", "title": "Death Bell Night", "lineup": "Lucinee, Tøtal, KamavoSian, T_st", "venue": "Hayfilm Studio", "ra": 1887942}, {"date": "2023-08-11", "title": "Death Bell Night", "lineup": "Tøtal, KamavoSian", "venue": "Fermata", "ra": 1754537}, {"date": "2023-04-01", "title": "Death Bell Night 7 Years", "lineup": "Tøtal, Förm, GFRND, ROKS, KamavoSian", "venue": "TBA", "ra": 1675104}, {"date": "2023-01-02", "title": "Death Bell Night x Korridorrr", "lineup": "Tøtal, KamavoSian", "venue": "Korridorrr", "ra": 1635613}, {"date": "2022-12-02", "title": "Death Bell Night", "lineup": "Tøtal, KamavoSian", "venue": "Fermata", "ra": 1621308}, {"date": "2022-06-03", "title": "ԵՌԱՆԿՅՈՒՆ festival", "lineup": "daao, Henna Onna, Ge-ology, KAÍ, Leö Anîram, Stereo Express, Supacooks, Tøtal, RIKHTER, KamavoSian", "venue": "Motor Yerevan", "ra": 1538430}, {"date": "2022-02-11", "title": "Death Bell Night x The Basement", "lineup": "Tøtal, Lucinee, KamavoSian", "venue": "Motor Yerevan", "ra": 1496355}, {"date": "2021-12-24", "title": "Death Bell x LEZVANI", "lineup": "Henna Onna, Narek Simonian, thanakí, Tøtal, GFRND, KamavoSian", "venue": "Fermata", "ra": 1490459}, {"date": "2021-10-22", "title": "Death Bell Night", "lineup": "JohannesK, Tøtal, Duncan Macdonald, KamavoSian", "venue": "Nine", "ra": 1468404}, {"date": "2021-09-11", "title": "Death Bell Night", "lineup": "sardaryans, Förm, KamavoSian, Tøtal, KAÍ, GFRND", "venue": "Fermata", "ra": 1462476}, {"date": "2021-08-13", "title": "Death Bell Night", "lineup": "Tøtal, KamavoSian, T_st", "venue": "Fermata", "ra": 1455656}, {"date": "2021-03-19", "title": "Death Bell Night", "lineup": "Tøtal, KamavoSian, Förm", "venue": "Korridorrr", "ra": 1438935}, {"date": "2019-08-23", "title": "Death Bell Night", "lineup": "Regal, Tøtal, KamavoSian, Förm", "venue": "Old Shoes Factory", "ra": 1289632}].map((e) => ({ ...e, url: `https://ra.co/events/${e.ra}` }));
  // settings.json: the mailing list that Notify me and the download gates' email step send to
  const SETTINGS = {"mailing_list": {"action": "", "email_field": "EMAIL", "hidden": {}}};

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
