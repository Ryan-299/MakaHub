
self.addEventListener('push', (event) => {
    let payload = {};

    try {
        if (event.data) {
            payload = event.data.json();
        }
    } catch (error) {
        console.error('Invalid Rentike push payload:', error);
    }

    const title =
        typeof payload.title === 'string' && payload.title.trim()
            ? payload.title
            : 'Rentike';

    const body =
        typeof payload.body === 'string'
            ? payload.body
            : 'You have a new notification.';

    let url = self.location.origin + '/';

    if (typeof payload.url === 'string') {
        try {
            const destination = new URL(payload.url, self.location.origin);

            if (destination.origin === self.location.origin) {
                url = destination.href;
            }
        } catch {
            // Keep the safe homepage URL.
        }
    }

    event.waitUntil(
        self.registration.showNotification(title, {
            body,

            badge: '/rentike-notification-badge-96.png',
            data: { url },
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url || self.location.origin + '/';
    const isAndroid = /Android/i.test(self.navigator.userAgent || '');

    event.waitUntil(
        (async () => {
            if (isAndroid) {
                try {
                    const opened = await self.clients.openWindow(url);
                    opened?.postMessage({ type: 'rentike-open', url });
                } catch (error) {
                    console.error('Could not open Rentike:', error);
                }
                return;
            }

            const windows = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true,
            });

            const existing = windows.find(
                (client) => new URL(client.url).origin === self.location.origin
            );

            if (existing) {
                try {
                    const focused = (await existing.focus()) || existing;
                    focused.postMessage({ type: 'rentike-open', url });
                    return;
                } catch (error) {
                    console.warn('Could not focus Rentike:', error);
                }
            }

            try {
                await self.clients.openWindow(url);
            } catch (error) {
                console.error('Could not open Rentike:', error);
            }
        })()
    );
});