'use strict';

const SITE_PATTERN = /^https?:\/\/([a-z0-9-]+\.)?(ts\.kg|oc\.kg)\//;

async function injectScript(tabId) {
    try {
        await chrome.scripting.executeScript({
            target: { tabId, allFrames: true },  // allFrames catches oc.kg player iframes
            files: ['pageScript.js'],
            world: 'MAIN',
        });
        console.log('[ext bg] injected into tab', tabId);
    } catch (err) {
        console.warn('[ext bg] injection failed:', err.message);
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && SITE_PATTERN.test(tab.url)) {
        injectScript(tabId);
    }
});
