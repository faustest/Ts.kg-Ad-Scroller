'use strict';

const TS_KG_PATTERN = /^https?:\/\/([a-z0-9-]+\.)?ts\.kg\//;

async function injectScript(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId, allFrames: false },
            files: ['pageScript.js'],
            world: 'MAIN',  // full access to window.videojs
        });
        console.log('[ts.kg bg] injected into tab', tabId);
    } catch (err) {
        // Tab may have closed or navigated away — safe to ignore
        console.warn('[ts.kg bg] injection failed:', err.message);
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && TS_KG_PATTERN.test(tab.url)) {
        injectScript(tabId);
    }
});
