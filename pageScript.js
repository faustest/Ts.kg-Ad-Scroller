'use strict';

(function () {
    // --- Config ---
    const SELECTORS_TO_REMOVE = [
        "div[id^='oops-branding']",
        "div[class^='oops-']",
        '#player-overlay',
        '#player-blocker',
        '#oops-footer',
        '#cc7635be',
        '#oopsf',
        '[data-link*="https"][data-id]',
        '[data-link][data-id]',
    ];

    const BG_COLOR = '#206e3e';
    const AD_MAX_DURATION = 60;

    // --- Helpers ---
    function removeAll(selector) {
        document.querySelectorAll(selector).forEach(el => el.remove());
    }

    function isAdSrc(src) {
        return (src ?? '').includes('static');
    }

    function isAdByDuration(player) {
        const dur = player.duration();
        return !isNaN(dur) && dur > 0 && dur < AD_MAX_DURATION;
    }

    function isAd(player) {
        return isAdSrc(player.src()) || isAdByDuration(player);
    }

    // --- DOM cleanup ---
    function cleanDOM() {
        SELECTORS_TO_REMOVE.forEach(removeAll);
    }

    // --- Skip logic ---
    function makeSkipper(player) {
        let skippedSrc = null;

        return function skip() {
            const src = player.src();
            if (src && src === skippedSrc) return;

            const dur = player.duration();
            const remaining = player.remainingTime();
            const target = isNaN(remaining) ? dur : remaining;

            console.log(`[ts.kg] skipping ad: jumping to ${target.toFixed(2)}s`);
            player.currentTime(target);
            skippedSrc = src;
        };
    }

    // --- Player setup ---
    function getPlayer() {
        if (typeof videojs === 'undefined' || !videojs.players) return null;
        return Object.values(videojs.players).find(p => p != null) ?? null;
    }

    function setupPlayer(player) {
        const skip = makeSkipper(player);

        player.ready(() => {
            player.controls(true);

            // Check current state at attach time —
            // first ad may have already started before our script was injected.
            // readyState >= 1 (HAVE_METADATA) means duration is already known.
            let metadataReady = player.readyState() >= 1;
            let playFired = !player.paused();

            function trySkip() {
                if (metadataReady && playFired && isAd(player)) {
                    skip();
                }
            }

            // Reset flags for every new video source
            player.on('loadstart', () => {
                metadataReady = false;
                playFired = false;
                player.controls(true);
            });

            // Duration is guaranteed to be known here
            player.on('loadedmetadata', () => {
                metadataReady = true;
                trySkip();
            });

            // Fires on autoplay or user interaction
            player.on('play', () => {
                playFired = true;
                trySkip();
            });

            // Handle the case where we attached mid-playback
            trySkip();
        });
    }

    function tryAttachPlayer() {
        const player = getPlayer();
        if (!player || player._tsExtAttached) return;
        player._tsExtAttached = true;
        setupPlayer(player);
        console.log('[ts.kg] player attached');
    }

    // --- MutationObserver ---
    function observeDOM() {
        const observer = new MutationObserver(() => {
            cleanDOM();
            tryAttachPlayer();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    // --- Init ---
    function init() {
        if (document.body) document.body.style.background = BG_COLOR;
        cleanDOM();
        tryAttachPlayer();
        observeDOM();

        window.addEventListener('load', () => {
            setTimeout(() => {
                cleanDOM();
                tryAttachPlayer();
            }, 1000);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
