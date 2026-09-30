// Online Radio Box for IINA — main entry
// Runs inside every player window, but only acts in the dedicated radio window
// created by the global entry (label "onlineradiobox").

const { core, global, event, mpv } = iina;

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

  global.onMessage("title", ({ title }) => {
    pendingTitle = title;
    applyTitle();
  });

  global.onMessage("play", ({ url, title }) => {
    global.postMessage("ack", {});
    pendingTitle = title;
    applyTitle();
    core.open(url);
    core.osd("📻 " + title);
  });

  global.onMessage("stop", () => core.stop());

  event.on("iina.file-started", () => applyTitle());

  // No "window closed" handling on purpose: IINA can close/reopen the main
  // window (e.g. music mode for audio), and the global entry now checks that
  // this window is alive with an "ack" before reusing it.
}
