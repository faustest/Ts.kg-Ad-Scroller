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
    const AD_MAX_DURATION = 60;      // videos shorter than this are ads
    const SKIP_RETRY_INTERVAL = 200; // ms between retry attempts
    const SKIP_RETRY_LIMIT = 30;     // give up after 30 * 200ms = 6 seconds

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
    //
    // Problem: on slow connections duration() is NaN when 'play' fires.
    // Solution: retry loop — poll until duration is known, then jump.
    // Each ad gets its own independent retry loop via a closure over `skipId`,
    // so when the second ad starts it cancels any leftover timer from the first.
    //
    function makeSkipper(player) {
        let timerId = null;
        let skipId = 0; // incremented on each new skip attempt to cancel stale loops

        function attempt(id, tries) {
            if (id !== skipId) return; // stale loop — a newer skip has taken over

            const dur = player.duration();
            const remaining = player.remainingTime();

            if (!isNaN(dur) && dur > 0) {
                const target = isNaN(remaining) ? dur : remaining;
                console.log(`[ts.kg] skip attempt ${tries}: jumping to ${target}s / ${dur}s`);
                player.currentTime(target);
                return; // done
            }

            if (tries >= SKIP_RETRY_LIMIT) {
                console.warn('[ts.kg] skip gave up after', tries, 'attempts');
                return;
            }

            timerId = setTimeout(() => attempt(id, tries + 1), SKIP_RETRY_INTERVAL);
        }

        return function skip() {
            clearTimeout(timerId);
            const id = ++skipId;
            attempt(id, 0);
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

            // 'play' fires at the start of each video (including each consecutive ad)
            player.on('play', () => {
                if (isAd(player)) {
                    console.log('[ts.kg] ad detected on play');
                    skip();
                }
                player.controls(true);
            });

            // 'loadedmetadata' fires when duration becomes available.
            // Catches the case where 'play' fired before duration was known.
            player.on('loadedmetadata', () => {
                if (isAd(player) && !player.paused()) {
                    console.log('[ts.kg] ad detected on loadedmetadata');
                    skip();
                }
            });

            // 'timeupdate' is a last-resort safety net — if the video is
            // playing and we somehow missed both events above, skip it here.
            player.on('timeupdate', () => {
                if (isAd(player) && player.currentTime() < 1) {
                    console.log('[ts.kg] ad detected on timeupdate');
                    skip();
                }
            });
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
        return observer;
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
