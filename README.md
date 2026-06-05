# Ts.kg Ad Scroller — Chrome Extension

Automatically removes ads and skips video ad breaks on [ts.kg](https://www.ts.kg/).

## What it does

- Removes overlay banners and ad blocks injected into the page
- Skips pre-roll video ads by jumping to the end
- Detects ads both by URL pattern and by duration (< 60s)
- Restores player controls after ad playback
- Sets a clean dark green background

## Installation

> The extension is not published on the Chrome Web Store and is loaded manually as an unpacked extension.

1. **Download** `ts-kg-extension.zip` and unzip it to a permanent folder (don't delete it after installation).
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the `ts-kg-extension` folder.
5. Done — visit any page on `ts.kg` and ads will be removed automatically.

## Updating

1. Replace the folder contents with the new files.
2. Go to `chrome://extensions/` and click the **↺ refresh** icon on the extension card.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension configuration (Manifest V3) |
| `background.js` | Service worker — detects ts.kg tabs and injects the script |
| `pageScript.js` | All logic: DOM cleanup, MutationObserver, video ad skip |
| `icon*.png` | Extension icons |

## Permissions

| Permission | Reason |
|---|---|
| `scripting` | Injects `pageScript.js` into the page's JS context |
| `tabs` | Reads tab URL to detect ts.kg pages |
| `https://*.ts.kg/*` | Limits the extension to ts.kg only |

## Troubleshooting

**Ads still showing after install**
Reload the ts.kg tab. If the issue persists, refresh the extension in `chrome://extensions/` and reload the tab.

**Extension disappeared after Chrome update**
Chrome occasionally disables unpacked extensions after updates. Re-enable it in `chrome://extensions/`.
