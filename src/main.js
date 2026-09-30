// Online Radio Box for IINA — main entry
// Runs inside every player window, but only acts in the dedicated radio window
// created by the global entry (label "onlineradiobox").

const { core, global, event, mpv } = iina;

// Defensive: keep callbacks referenced so they are never garbage-collected.
const KEEP_ALIVE = [];
function keep(fn) {
  KEEP_ALIVE.push(fn);
  return fn;
}

const isRadioWindow = global && global.getLabel && global.getLabel() === "onlineradiobox";

if (isRadioWindow) {
  let pendingTitle = null;

  function applyTitle() {
    if (!pendingTitle) return;
    try {
      mpv.set("force-media-title", pendingTitle);
    } catch (e) {
      // cosmetic only — never let the title break playback
    }
  }

  global.onMessage("title", keep(({ title }) => {
    pendingTitle = title;
    applyTitle();
  }));

  global.onMessage("play", keep(({ url, title }) => {
    pendingTitle = title;
    applyTitle();
    if (core.status.idle) {
      // nothing loaded (first stream, or the window was closed): open normally,
      // which also brings the player window back
      core.open(url);
    } else {
      // already playing: swap the stream inside the same window. core.open()
      // would go through IINA's "Open URL" loading screen and reshuffle windows
      // (music mode), so talk to mpv directly instead.
      mpv.command("loadfile", [url, "replace"]);
    }
    core.osd("📻 " + title);
  }));

  global.onMessage("stop", keep(() => core.stop()));

  event.on("iina.file-started", keep(() => applyTitle()));

  // No "window closed" handling on purpose: IINA closes/reopens the main
  // window around music mode, and the global entry always reuses this player.
}
