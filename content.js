(function () {
    'use strict';

    // Inject a script FILE from the extension — allowed by CSP unlike inline scripts.
    // This gives the script full access to the page's JS context (videojs, $, etc.)
    function injectScript(filename) {
        const s = document.createElement('script');
        s.src = chrome.runtime.getURL(filename);
        s.onload = function () { s.remove(); };
        (document.head || document.documentElement).appendChild(s);
    }

    // Inject waitForKeyElements first, then the main logic
    const wfke = document.createElement('script');
    wfke.src = chrome.runtime.getURL('waitForKeyElements.js');
    wfke.onload = function () {
        wfke.remove();
        injectScript('pageScript.js');
    };
    (document.head || document.documentElement).appendChild(wfke);
})();
