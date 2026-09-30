# Online Radio Box for IINA

An [IINA](https://iina.io) plugin that plays web radio stations listed on [onlineradiobox.com](https://onlineradiobox.com), with a favourites list you manage inside IINA.

## Features

- **Station window** (Plugin ▸ Online Radio Box…)
  - **Favourites**: click to play, reorder with ↑ / ↓, remove with ✕
  - **Search**: searches onlineradiobox.com; ☆ adds a station to your favourites
  - **Import**: paste station links (`https://onlineradiobox.com/us/dublab/`) or ids (`gr.kosmos`), several at once
- **Plugin ▸ Radio Favourites** menu to switch station without opening the window
- Stations play in one dedicated IINA window, titled with the station name
- Plays instantly from the saved stream URL, then refreshes that URL from the site in the background so it stays current
- BBC DASH streams are swapped for their HLS equivalents, which play more reliably in IINA
- Comes with 23 starter stations (electronic, lofi, BBC, KEXP, KCRW, Greek radio and more). Remove the ones you don't want.

## Install

In IINA: **Settings ▸ Plugins ▸ Install from GitHub…** and enter:

```
pinedigga/iina-plugin-onlineradiobox
```

IINA checks this repo for updates.

You can also download the `.iinaplgz` file from [Releases](../../releases) and double-click it.

### Permissions

- **Network**: to search onlineradiobox.com and play streams. Streams come from each station's own server, so all domains are allowed.
- **File system**: IINA 1.4.x requires it for any plugin that opens a URL in a player. The plugin doesn't read or write your files.

## Notes

- Favourites are stored in IINA's plugin preferences, not in your onlineradiobox.com account. onlineradiobox has no public API for account favourites.
- Station data is read from the public onlineradiobox.com pages. If the site changes its markup, search and URL refresh may stop working until the plugin is updated. Saved favourites keep playing from their stored stream URLs.
- Tested with IINA 1.4.4 on macOS.

This project is not affiliated with Online Radio Box or with any of the radio stations.

## Development

```
Info.json      plugin manifest
src/global.js  global entry: station window, favourites, menu, player management
src/main.js    per-player entry: plays streams in the dedicated radio window
radio.html     station window UI
pref.html      preferences page
```

To package a release: `zip -r OnlineRadioBox.iinaplgz Info.json src radio.html pref.html`, then bump `version` and `ghVersion` in `Info.json`.

## License

MIT
