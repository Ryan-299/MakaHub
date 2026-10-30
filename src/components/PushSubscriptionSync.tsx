
import { useEffect } from 'react';
import { useConvexAuth, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useApp } from '../context/AppContext';

const decodeVapidKey = (key: string): Uint8Array<ArrayBuffer> => {
    const padded = key + '='.repeat((4 - (key.length % 4)) % 4);
    const binary = atob(
        padded.replace(/-/g, '+').replace(/_/g, '/')
    );

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
};

export function PushSubscriptionSync() {
    const { currentUser } = useApp();
    const { isAuthenticated } = useConvexAuth();
    const registerPushDevice = useMutation(
        api.pushSubscriptions.register
    );

    useEffect(() => {
        if (!isAuthenticated || !currentUser?.id) return;

        if (
            !('serviceWorker' in navigator) ||
            !('PushManager' in window) ||
            !('Notification' in window) ||
            Notification.permission !== 'granted'
        ) {
            return;
        }

        const disabledKey =
            `rentike-push-disabled:${currentUser.id}`;

        if (localStorage.getItem(disabledKey) === '1') {
            return;
        }

        const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        if (!publicKey) {
            console.error(
                'Rentike push registration: VAPID public key is unavailable.'
            );
            return;
        }

        let cancelled = false;

        const sync = async () => {
            try {
                const registration = await Promise.race([
                    navigator.serviceWorker.ready,
                    new Promise<ServiceWorkerRegistration>((_, reject) =>
                        setTimeout(
                            () => reject(
                                new Error(
                                    'Service worker was not ready after 10 seconds.'
                                )
                            ),
                            10000
                        )
                    ),
                ]);

                if (cancelled) return;

                let subscription =
                    await registration.pushManager.getSubscription();

                if (!subscription) {
                    subscription =
                        await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: decodeVapidKey(publicKey),
                        });
                }

                if (cancelled) return;

                const keys = subscription.toJSON().keys;

                if (!keys?.p256dh || !keys?.auth) {
                    throw new Error(
                        'Browser push subscription is missing its keys.'
                    );
                }

                await registerPushDevice({
                    endpoint: subscription.endpoint,
                    p256dh: keys.p256dh,
                    auth: keys.auth,
                    expirationTime:
                        subscription.expirationTime ?? undefined,
                });

                console.info(
                    'Rentike: push subscription saved in Convex.'
                );
            } catch (error) {
                console.error(
                    'Rentike: push subscription synchronization failed:',
                    error
                );
            }
        };

        void sync();

        return () => {
            cancelled = true;
        };
    }, [
        isAuthenticated,
        currentUser?.id,
        registerPushDevice,
    ]);

    return null;
}
