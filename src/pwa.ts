
import { registerSW } from 'virtual:pwa-register';

registerSW({
    immediate: true,

    onRegisteredSW(_swUrl, registration) {
        if (!registration) return;

        const checkForUpdate = () => {
            if (navigator.onLine) {
                registration.update().catch((error) => {
                    console.warn('PWA update check failed:', error);
                });
            }
        };

        // Check every 30 minutes.
        window.setInterval(checkForUpdate, 30 * 60 * 1000);

        // Check when Rentike returns to the foreground.
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                checkForUpdate();
            }
        });
    },
});
