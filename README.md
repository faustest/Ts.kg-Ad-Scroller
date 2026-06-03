# Ts.kg Ad Scroller — Chrome Extension

Automatically removes ads and skips video ad breaks on [ts.kg](https://www.ts.kg/).

## What it does

- Removes overlay banners and ad blocks injected into the page
- Skips static (pre-roll) video ads by jumping to the end
- Restores player controls after ad playback
- Sets a clean dark green background

## Installation

> The extension is not published on the Chrome Web Store, so it is loaded manually as an unpacked extension.

1. **Download** the `ts-kg-extension.zip` file from [releases](https://github.com/faustest/Ts.kg-Ad-Scroller/releases) and unzip it to a permanent folder on your computer (don't delete it after installation).

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** using the toggle in the top-right corner.

4. Click **Load unpacked** and select the unzipped `ts-kg-extension` folder.

5. The extension is now active. Visit any page on `ts.kg` — ads will be removed automatically.

## Updating

When a new version is available:

1. Replace the contents of the folder with the new files.
2. Go to `chrome://extensions/` and click the **↺ refresh** icon on the extension card.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension configuration (Manifest V3) |
| `content.js` | Entry point — injects scripts into the page context |
| `pageScript.js` | Main logic: ad removal, video skip |
| `waitForKeyElements.js` | Utility that polls for dynamically added DOM elements |
| `icon*.png` | Extension icons |

## Permissions

| Permission | Reason |
|---|---|
| `scripting` | Required to inject scripts into pages |
| `tabs` | Required alongside scripting |
| `https://*.ts.kg/*` | Limits the extension to ts.kg only |

## Troubleshooting

**Ads still showing after install**
Reload the ts.kg tab after installing. If the issue persists, go to `chrome://extensions/`, click the refresh icon on the extension, and reload the tab again.

**Extension disappeared after Chrome update**
Chrome occasionally disables unpacked extensions after updates. Re-enable it in `chrome://extensions/`.
