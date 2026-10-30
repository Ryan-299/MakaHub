
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
            icon: '/pwa-192x192.png',
            data: { url },
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url || self.location.origin + '/';

    event.waitUntil(
        (async () => {
            const windows = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true,
            });

            const existing = windows.find(
                (client) => new URL(client.url).origin === self.location.origin
            );

            if (existing) {
                await existing.navigate(url);
                await existing.focus();
            } else {
                await self.clients.openWindow(url);
            }
        })()
    );
});
