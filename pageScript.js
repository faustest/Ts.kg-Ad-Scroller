(function () {
    // Remove elements matching a selector immediately if present
    function removeAll(selector) {
        document.querySelectorAll(selector).forEach(el => el.remove());
    }

    // Apply background once body exists
    function applyBackground() {
        if (document.body) {
            document.body.style.background = '#206e3e';
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                document.body.style.background = '#206e3e';
            });
        }
    }

    applyBackground();

    // Remove known ad elements immediately (if already in DOM)
    removeAll("div[id^='oops-branding']");
    removeAll("div[class^='oops-']");

    // Poll for dynamically injected ad elements and remove them
    waitForKeyElements('#player-overlay', function (el) { el.remove(); });
    waitForKeyElements('#player-blocker', function (el) { el.remove(); });
    waitForKeyElements('#oops-footer',    function (el) { el.remove(); });
    waitForKeyElements('#cc7635be',       function (el) { el.remove(); });
    waitForKeyElements('#oopsf',          function (el) { el.remove(); });
    waitForKeyElements('[data-link*="https"][data-id]', function (el) { el.remove(); });
    waitForKeyElements('[data-link][data-id]',          function (el) { el.remove(); });

    // Video player: skip static (ad) videos
    waitForKeyElements('video', function () {
        if (typeof videojs === 'undefined' || !videojs.players) return;

        const player = videojs.players.player5;
        if (!player) return;

        player.ready(function () {
            function skipToEnd() {
                let timeLeft = player.remainingTime();
                console.log('[ts.kg ext] remainingTime:', timeLeft);
                if (isNaN(timeLeft)) {
                    setTimeout(function () {
                        player.currentTime(player.remainingTime());
                    }, 300);
                } else {
                    player.currentTime(timeLeft);
                }
            }

            player.on('play', function () {
                if (player.src().includes('static')) {
                    skipToEnd();
                }
                player.controls(true);
            });
        });
    });

    console.log('[ts.kg ext] pageScript loaded.');
})();
