'use strict';

(function () {

    // --- Per-site config ---
    const SITES = {
        'ts.kg': {
            bgColor: '#206e3e',
            selectors: [
                "div[id^='oops-branding']",
                "div[class^='oops-']",
                '#player-overlay',
                '#player-blocker',
                '#oops-footer',
                '#cc7635be',
                '#oopsf',
                '[data-link*="https"][data-id]',
                '[data-link][data-id]',
            ],
            removeContainerStyles: false,
            hasVideoSkip: true,
            playerName: 'player5',
        },
        'oc.kg': {
            bgColor: '#206e3e',
            selectors: [
                '.oops-footer',
                '.online_banner',
                '.online_banner_m',
                '.outside_img',
                '.side_ad_m',
                '.sidebanner',
                // Player iframe ad elements
                '#player-blocker',
                '#player-overlay',
                '.side_banner',
                '.bottom_banner',
            ],
            removeContainerStyles: true,
            hasVideoSkip: true,
            playerName: 'my_video_1',
        },
    };

    const AD_MAX_DURATION = 60;

    // --- Detect current site ---
    function getSiteConfig() {
        const host = location.hostname.replace(/^www\./, '');
        for (const key of Object.keys(SITES)) {
            if (host === key || host.endsWith('.' + key)) {
                return SITES[key];
            }
        }
        return null;
    }

    const config = getSiteConfig();
    if (!config) return; // unknown site — do nothing

    // --- Helpers ---
    function removeAll(selector) {
        document.querySelectorAll(selector).forEach(el => el.remove());
    }

    function isAdSrc(src) {
        return (src ?? '').includes('static') || (src ?? '').includes('/background/');
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
        config.selectors.forEach(removeAll);

        // Remove inline <style> tags that inject background images (in head or #container)
        if (config.removeContainerStyles) {
            document.querySelectorAll('#container > style, head > style').forEach(el => {
                if (el.textContent.includes('background-image') && el.textContent.includes('/background/')) {
                    el.remove();
                }
            });
        }
    }

    // --- Video skip (ts.kg only) ---
    function makeSkipper(player) {
        let skippedSrc = null;

        return function skip() {
            const src = player.src();
            if (src && src === skippedSrc) return;

            const dur = player.duration();
            if (isNaN(dur) || dur <= 0) {
                console.log('[ext] skip: duration not ready, waiting for loadedmetadata');
                return;
            }

            const remaining = player.remainingTime();
            const target = isNaN(remaining) ? dur : remaining;

            console.log(`[ext] skipping ad: jumping to ${target.toFixed(2)}s`);
            player.currentTime(target);
            skippedSrc = src;
        };
    }

    function getPlayer() {
        if (typeof videojs === 'undefined' || !videojs.players) return null;
        if (config.playerName && videojs.players[config.playerName]) {
            return videojs.players[config.playerName];
        }
        return Object.values(videojs.players).find(p => p != null) ?? null;
    }

    function setupPlayer(player) {
        const skip = makeSkipper(player);

        player.ready(() => {
            player.controls(true);

            let metadataReady = player.readyState() >= 1;
            let playFired = !player.paused();

            function trySkip() {
                if (metadataReady && playFired && isAd(player)) {
                    skip();
                }
            }

            player.on('loadstart', () => {
                metadataReady = false;
                playFired = false;
                player.controls(true);
            });

            player.on('loadedmetadata', () => {
                metadataReady = true;
                trySkip();
            });

            player.on('play', () => {
                playFired = true;
                trySkip();
            });

            trySkip();
        });
    }

    function tryAttachPlayer() {
        if (!config.hasVideoSkip) return;
        const player = getPlayer();
        if (!player || player._tsExtAttached) return;
        player._tsExtAttached = true;
        setupPlayer(player);
        console.log('[ext] player attached');
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
        if (config.bgColor && document.body) {
            document.body.style.background = config.bgColor;
        }
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
// patch applied below via str_replace
