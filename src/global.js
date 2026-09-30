// Online Radio Box for IINA — global entry
// Runs once while IINA is open: owns the station window, the favourites list
// and the dedicated radio player window.

const { console, global, menu, standaloneWindow, http, preferences } = iina;

const BASE = "https://onlineradiobox.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";

let radioPlayerId = null; // id returned by global.createPlayerInstance
let acked = false; // set synchronously by the radio window when it receives "play"
let current = null; // station currently playing
let windowReady = false;

// ---------- favourites storage ----------

// Starter favourites (the author's picks), added on first run
const SEED_VERSION = 2;
const DEFAULT_FAVORITES = [
  {
    "id": "us.lofihiphop",
    "name": "Lofi Hip Hop Radio",
    "img": "https://cdn.onlineradiobox.com/img/l/6/87786.v3.png",
    "stream": "https://stream.zeno.fm/0r0xa792kwzuv",
    "type": "mp3"
  },
  {
    "id": "uk.boxlofi",
    "name": "BOX : Lofi Radio - Chill study & sleep beats",
    "img": "https://cdn.onlineradiobox.com/img/l/8/97478.v14.png",
    "stream": "https://boxradio-edge-07.streamafrica.net/lofi",
    "type": "mp3"
  },
  {
    "id": "us.dublab",
    "name": "Dublab Radio",
    "img": "https://cdn.onlineradiobox.com/img/l/1/11471.v8.png",
    "stream": "https://dublab.out.airtime.pro/dublab_a",
    "type": "mp3"
  },
  {
    "id": "uk.fantasyfm",
    "name": "Fantasy FM",
    "img": "https://cdn.onlineradiobox.com/img/l/0/75270.v13.png",
    "stream": "https://eu4.fastcast4u.com/proxy/fantasyfm?mp=/1",
    "type": "mp3"
  },
  {
    "id": "uk.oldskooluk",
    "name": "Oldskool UK",
    "img": "https://cdn.onlineradiobox.com/img/l/8/86748.v15.png",
    "stream": "https://usa10.fastcast4u.com:8880/;",
    "type": "mp3"
  },
  {
    "id": "uk.bbcradio1",
    "name": "BBC Radio 1",
    "img": "https://cdn.onlineradiobox.com/img/l/3/1193.v25.png",
    "stream": "https://a.files.bbci.co.uk/ms6/live/3441A116-B12E-4D2F-ACA8-C1984642FA4B/audio/simulcast/hls/nonuk/audio_syndication_low_sbr_v1/cfs/bbc_radio_one.m3u8",
    "type": "hls"
  },
  {
    "id": "uk.bbcdance",
    "name": "BBC Radio 1 Dance",
    "img": "https://cdn.onlineradiobox.com/img/l/0/97780.v25.png",
    "stream": "https://a.files.bbci.co.uk/ms6/live/3441A116-B12E-4D2F-ACA8-C1984642FA4B/audio/simulcast/hls/nonuk/audio_syndication_low_sbr_v1/cfs/bbc_radio_one_dance.m3u8",
    "type": "hls"
  },
  {
    "id": "uk.bbcradio2",
    "name": "BBC Radio 2",
    "img": "https://cdn.onlineradiobox.com/img/l/5/1185.v27.png",
    "stream": "https://a.files.bbci.co.uk/ms6/live/3441A116-B12E-4D2F-ACA8-C1984642FA4B/audio/simulcast/hls/nonuk/audio_syndication_low_sbr_v1/cfs/bbc_radio_two.m3u8",
    "type": "hls"
  },
  {
    "id": "uk.bbcradio1xtra",
    "name": "BBC Radio 1Xtra",
    "img": "https://cdn.onlineradiobox.com/img/l/5/1195.v18.png",
    "stream": "https://a.files.bbci.co.uk/ms6/live/3441A116-B12E-4D2F-ACA8-C1984642FA4B/audio/simulcast/hls/nonuk/audio_syndication_low_sbr_v1/aks/bbc_1xtra.m3u8",
    "type": "hls"
  },
  {
    "id": "uk.bbcradio6",
    "name": "BBC Radio 6 Music",
    "img": "https://cdn.onlineradiobox.com/img/l/8/1188.v23.png",
    "stream": "https://a.files.bbci.co.uk/ms6/live/3441A116-B12E-4D2F-ACA8-C1984642FA4B/audio/simulcast/hls/nonuk/audio_syndication_low_sbr_v1/cfs/bbc_6music.m3u8",
    "type": "hls"
  },
  {
    "id": "us.kexpfm",
    "name": "KEXP 90.3 FM",
    "img": "https://cdn.onlineradiobox.com/img/l/1/6291.v2.png",
    "stream": "https://kexp-mp3-128.streamguys1.com/kexp128.mp3",
    "type": "mp3"
  },
  {
    "id": "us.kcrwhd2",
    "name": "KCRW Eclectic24",
    "img": "https://cdn.onlineradiobox.com/img/l/6/5366.v2.png",
    "stream": "https://streams.kcrw.com/e24_mp3",
    "type": "mp3"
  },
  {
    "id": "rs.aparat",
    "name": "RadioAparat",
    "img": "https://cdn.onlineradiobox.com/img/l/0/67020.v5.png",
    "stream": "https://stream.rcast.net/72355/",
    "type": "mp3"
  },
  {
    "id": "gr.nostos",
    "name": "Nostos 100.6",
    "img": "https://cdn.onlineradiobox.com/img/l/4/131974.v1.png",
    "stream": "https://neos.win:37878/stream?type=.mp3",
    "type": "mp3"
  },
  {
    "id": "gr.best926",
    "name": "Best Radio",
    "img": "https://cdn.onlineradiobox.com/img/l/8/45668.v3.png",
    "stream": "https://best.live24.gr/best1222",
    "type": "mp3"
  },
  {
    "id": "gr.enlefko877",
    "name": "En Lefko 87.7",
    "img": "https://cdn.onlineradiobox.com/img/l/7/15367.v9.png",
    "stream": "https://stream.radiojar.com/enlefko877",
    "type": "mp3"
  },
  {
    "id": "us.mrgfmdroneradio",
    "name": "DroneRadio (MRG.fm)",
    "img": "https://cdn.onlineradiobox.com/img/l/4/82044.v8.png",
    "stream": "https://str3.openstream.co/1835",
    "type": "mp3"
  },
  {
    "id": "co.tropicana1029",
    "name": "Tropicana",
    "img": "https://cdn.onlineradiobox.com/img/l/7/21737.v23.png",
    "stream": "https://playerservices.streamtheworld.com/api/livestream-redirect/TROPICANAAAC.aac?dist=onlineradiobox",
    "type": "mp3"
  },
  {
    "id": "jm.rjr94fm",
    "name": "Radio Jamaica 94 FM",
    "img": "https://cdn.onlineradiobox.com/img/l/1/34951.v12.png",
    "stream": "https://stream.zeno.fm/omonrcmoy1vuv",
    "type": "mp3"
  },
  {
    "id": "us.surfshackradio",
    "name": "Surf Shack Radio",
    "img": "https://cdn.onlineradiobox.com/img/l/0/4030.v4.png",
    "stream": "https://la2.indexcom.com/hls/disco/program.m3u8",
    "type": "hls"
  },
  {
    "id": "il.jointradio",
    "name": "Joint Radio Reggae",
    "img": "https://cdn.onlineradiobox.com/img/l/8/10888.v13.png",
    "stream": "https://jointil.com/stream-reggae",
    "type": "mp3"
  },
  {
    "id": "mx.cumbiasinmortales",
    "name": "Cumbias Inmortales Radio",
    "img": "https://cdn.onlineradiobox.com/img/l/9/7359.v43.png",
    "stream": "https://panel.retrolandigital.com/listen/cumbias_inmortales_radio/listen",
    "type": "mp3"
  },
  {
    "id": "ua.wolfmusicdeephouse",
    "name": "Wolf Music Deep House Radio",
    "img": "https://cdn.onlineradiobox.com/img/l/0/74820.v19.png",
    "stream": "https://a3.asurahosting.com/listen/wolf_music_radio/radio.mp3",
    "type": "mp3"
  }
];

function seedFavorites() {
  if (Number(preferences.get("seeded") || 0) >= SEED_VERSION) return;
  const list = loadFavorites();
  for (const f of DEFAULT_FAVORITES) {
    if (!list.some((x) => x.id === f.id)) list.push(f);
  }
  preferences.set("seeded", SEED_VERSION);
  saveFavorites(list);
}

function loadFavorites() {
  try {
    const list = JSON.parse(preferences.get("favorites") || "[]");
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function saveFavorites(list) {
  preferences.set("favorites", JSON.stringify(list));
  preferences.sync();
  pushState();
  rebuildMenu();
}

// ---------- onlineradiobox parsing ----------

function decodeEntities(s) {
  // some names on the site are double-encoded (e.g. "&amp;amp;")
  let prev;
  s = s || "";
  do {
    prev = s;
    s = decodeOnce(s);
  } while (s !== prev);
  return s;
}

function decodeOnce(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

function attr(tag, name) {
  const m = tag.match(new RegExp("\\s" + name + '\\s*=\\s*"([^"]*)"', "i"));
  return m ? decodeEntities(m[1]) : "";
}

function absUrl(u) {
  if (!u) return "";
  if (u.startsWith("//")) return "https:" + u;
  if (u.startsWith("/")) return BASE + u;
  return u;
}

// Every station on onlineradiobox (station page, lists, search results,
// favourites page) is rendered as a play button carrying these attributes:
// stream, streamType, radioId, radioName, radioImg
function parseStations(html) {
  const out = [];
  const seen = {};
  const tags = html.match(/<(?:button|a|div|span|li)\b[^>]*\bstream\s*=\s*"[^"]+"[^>]*>/gi) || [];
  for (const tag of tags) {
    const id = attr(tag, "radioId");
    const stream = attr(tag, "stream");
    if (!id || !stream || seen[id]) continue;
    if (attr(tag, "streamType") === "external") continue; // web-page-only stations
    seen[id] = true;
    out.push({
      id,
      name: attr(tag, "radioName") || id,
      img: absUrl(attr(tag, "radioImg")),
      stream: normalizeStream(stream),
      type: attr(tag, "streamType"),
    });
  }
  return out;
}

// BBC streams are listed as DASH (.mpd); the HLS twin is more reliable in IINA.
function normalizeStream(url) {
  return url.replace(
    /\/dash\/nonuk\/pc_hd_abr_v2\/(\w+)\/(\w+)\.mpd$/,
    "/hls/nonuk/audio_syndication_low_sbr_v1/$1/$2.m3u8",
  );
}

function stationPageUrl(id) {
  const dot = id.indexOf(".");
  if (dot < 0) return null;
  return `${BASE}/${id.slice(0, dot)}/${id.slice(dot + 1)}/`;
}

async function fetchHtml(url, params) {
  const res = await http.get(url, {
    params: params || {},
    headers: { "User-Agent": UA, "Accept-Language": "en" },
  });
  return res.text || "";
}

async function resolveStation(id) {
  const url = stationPageUrl(id);
  if (!url) throw new Error("Invalid station id: " + id);
  const html = await fetchHtml(url);
  const found = parseStations(html);
  const st = found.find((s) => s.id === id) || found[0];
  if (!st) throw new Error("No stream found for " + id);
  return st;
}

async function search(query) {
  const html = await fetchHtml(`${BASE}/search`, { q: query });
  return parseStations(html);
}

// Accepts anything the user pastes: station URLs, favourites links with ?cs=,
// or bare ids like "gr.kosmos" — separated by spaces, commas or new lines.
function extractIds(text) {
  const ids = [];
  const add = (id) => {
    id = id.toLowerCase();
    if (!ids.includes(id)) ids.push(id);
  };
  const urlRe = /onlineradiobox\.com\/([a-z]{2,3})\/([a-z0-9_\-]+)/gi;
  let m;
  while ((m = urlRe.exec(text))) {
    if (!["favorites", "search", "genre", "track", "country"].includes(m[1])) add(`${m[1]}.${m[2]}`);
  }
  const csRe = /[?&]cs=([a-z0-9_.\-]+)/gi;
  while ((m = csRe.exec(text))) add(m[1]);
  const bare = text.replace(/https?:\/\/\S+/g, " ").split(/[\s,;]+/);
  for (const token of bare) {
    if (/^[a-z]{2,3}\.[a-z0-9_\-]+$/i.test(token)) add(token);
  }
  return ids;
}

// ---------- playback ----------

function play(station) {
  current = station;
  const payload = { url: station.stream, title: station.name };
  // Reuse the radio window whenever it still answers. Messages are delivered
  // synchronously, so the "ack" arrives before postMessage returns.
  if (radioPlayerId !== null) {
    acked = false;
    global.postMessage(radioPlayerId, "play", payload);
    if (!acked) radioPlayerId = null;
  }
  if (radioPlayerId === null) {
    radioPlayerId = global.createPlayerInstance({
      url: station.stream,
      label: "onlineradiobox",
      enablePlugins: false, // only this plugin — keeps other plugins (e.g. yt-dlp) off radio streams
    });
    if (typeof radioPlayerId !== "number") {
      radioPlayerId = null;
      notify("error", "IINA refused to open the stream.");
      return;
    }
    // the player's plugin instance is wired up right after creation;
    // send it the station name so the window shows it instead of the URL
    const id = radioPlayerId;
    setTimeout(() => {
      if (id === radioPlayerId && current) global.postMessage(id, "title", { title: current.name });
    }, 300);
  }
  pushState();
  rebuildMenu();
}

// IMPORTANT: http responses resolve on a background thread, and creating a
// player window off the main thread freezes IINA. setTimeout callbacks run on
// the main thread, so every player/UI call goes through onMain().
function onMain(fn) {
  setTimeout(fn, 0);
}

// Play immediately from the stored stream (no network wait), then refresh
// the stored stream URL from the site in the background.
function playById(id, fromWindow) {
  const fav = loadFavorites().find((f) => f.id === id);
  const st = fav && fav.stream ? fav : fromWindow && fromWindow.stream ? fromWindow : null;
  if (st) {
    play(st);
    if (fav) refreshStation(id);
    return;
  }
  resolveStation(id)
    .then((resolved) => onMain(() => play(resolved)))
    .catch((e) => {
      console.error(String(e));
      onMain(() => notify("error", "Couldn't load station " + id));
    });
}

function refreshStation(id) {
  resolveStation(id)
    .then((st) =>
      onMain(() => {
        const list = loadFavorites();
        const fav = list.find((f) => f.id === id);
        if (fav && (fav.stream !== st.stream || fav.name !== st.name || fav.img !== st.img)) {
          saveFavorites(list.map((f) => (f.id === id ? { ...f, ...st } : f)));
        }
      }),
    )
    .catch((e) => console.error("refresh " + id + ": " + e));
}

// messages from the radio player window (main entry)
global.onMessage("ack", () => {
  acked = true;
});

// ---------- station window ----------

// IINA injects message data into the webview inside a JS template literal,
// so strip characters that would break it.
function safe(obj) {
  return JSON.parse(JSON.stringify(obj).replace(/`/g, "'").replace(/\$\{/g, "$ {"));
}

function pushState() {
  if (!windowReady) return;
  standaloneWindow.postMessage(
    "state",
    safe({ favorites: loadFavorites(), current: current ? current.id : null }),
  );
}

function notify(kind, text) {
  if (windowReady) standaloneWindow.postMessage("notify", safe({ kind, text }));
}

function showWindow() {
  windowReady = false;
  standaloneWindow.loadFile("radio.html");
  standaloneWindow.setProperty({
    title: "Online Radio Box",
    resizable: true,
    hideTitleBar: false,
    fullSizeContentView: false,
  });
  standaloneWindow.setFrame(380, 560);

  // loadFile() clears message listeners, so (re)install them every time
  {
    standaloneWindow.onMessage("ready", () => {
      windowReady = true;
      pushState();
    });

    standaloneWindow.onMessage("play", (st) => onMain(() => playById(st.id, st)));

    standaloneWindow.onMessage("search", async ({ query }) => {
      try {
        const results = await search(query);
        onMain(() => standaloneWindow.postMessage("results", safe({ query, results })));
      } catch (e) {
        console.error(String(e));
        onMain(() => standaloneWindow.postMessage("results", { query, results: [], error: true }));
      }
    });

    standaloneWindow.onMessage("addFavorite", (st) => {
      const list = loadFavorites();
      if (!list.some((f) => f.id === st.id)) list.push(st);
      saveFavorites(list);
    });

    standaloneWindow.onMessage("removeFavorite", ({ id }) => {
      saveFavorites(loadFavorites().filter((f) => f.id !== id));
    });

    standaloneWindow.onMessage("moveFavorite", ({ id, delta }) => {
      const list = loadFavorites();
      const i = list.findIndex((f) => f.id === id);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      saveFavorites(list);
    });

    standaloneWindow.onMessage("import", async ({ text }) => {
      const ids = extractIds(text);
      if (!ids.length) {
        notify("error", "No stations found in what you pasted.");
        return;
      }
      const list = loadFavorites();
      let added = 0;
      const failed = [];
      for (const id of ids) {
        if (list.some((f) => f.id === id)) continue;
        try {
          list.push(await resolveStation(id));
          added++;
        } catch (e) {
          failed.push(id);
        }
      }
      onMain(() => {
        // re-read in case favourites changed while we were fetching
        const merged = loadFavorites();
        for (const st of list) if (!merged.some((f) => f.id === st.id)) merged.push(st);
        saveFavorites(merged);
        notify(
          failed.length ? "error" : "ok",
          `Added ${added} station${added === 1 ? "" : "s"}` +
            (failed.length ? ` — not found: ${failed.join(", ")}` : ""),
        );
      });
    });

    standaloneWindow.onMessage("stop", () => {
      if (radioPlayerId !== null) global.postMessage(radioPlayerId, "stop", {});
      current = null;
      pushState();
      rebuildMenu();
    });
  }

  standaloneWindow.open();
}

// ---------- Plugin menu ----------

function rebuildMenu() {
  menu.removeAllItems();
  menu.addItem(menu.item("Online Radio Box…", () => showWindow()));
  const favs = loadFavorites();
  if (favs.length) {
    const sub = menu.item("Radio Favourites");
    for (const f of favs) {
      sub.addSubMenuItem(
        menu.item(f.name, () => onMain(() => playById(f.id)), { selected: !!current && current.id === f.id }),
      );
    }
    menu.addItem(sub);
  }
  menu.forceUpdate();
}

seedFavorites();
rebuildMenu();
if (preferences.get("open_on_launch")) showWindow();
