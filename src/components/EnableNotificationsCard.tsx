import { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { BellRing, X } from 'lucide-react';
import { api } from '../../convex/_generated/api';
import { useApp } from '../context/AppContext';

// ---------------------------------------------------------------------------
// "Turn on notifications" card.
// Shows to signed-in users whose phone is NOT registered for pop-ups yet.
//   - ask:          normal case -> button that asks properly and registers
//   - blocked:      notifications were blocked -> short unblock steps
//   - ios-install:  iPhone in Safari -> "Add to Home Screen" first
// "Not now" hides it for 3 days. Turning notifications off on the
// Notifications screen hides it for good.
// ---------------------------------------------------------------------------

type CardMode = 'hidden' | 'ask' | 'blocked' | 'ios-install';

const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 4000;

// Screens where the card would get in the way.
const HIDDEN_ON_VIEWS = new Set<string>([
    'welcome',
    'login',
    'signup',
    'role-selection',
    'lister-subtype',
    'lister-about',
    'notifications',
]);

const decodeVapidKey = (key: string): Uint8Array<ArrayBuffer> => {
    const padded = key + '='.repeat((4 - (key.length % 4)) % 4);
    const binary = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
};

const readStorage = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};

const writeStorage = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Storage unavailable (private mode etc.) - the card just shows again later.
    }
};

const isIos = () =>
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isInstalledApp = () =>
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isPushSupported = () =>
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

const hasDeviceSubscription = async (): Promise<boolean> => {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        return Boolean(subscription);
    } catch {
        return false;
    }
};

export function EnableNotificationsCard() {
    const { currentUser, currentView } = useApp();
    const registerPushDevice = useMutation(api.pushSubscriptions.register);

    const [mode, setMode] = useState<CardMode>('hidden');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const userId = currentUser?.id;

    useEffect(() => {
        if (!userId) {
            setMode('hidden');
            return;
        }

        let cancelled = false;

        const decide = async (): Promise<CardMode> => {
            // The user turned notifications off on purpose.
            if (readStorage(`rentike-push-disabled:${userId}`) === '1') return 'hidden';

            const snoozedUntil = Number(
                readStorage(`rentike-push-card-snoozed:${userId}`) || '0'
            );
            if (snoozedUntil > Date.now()) return 'hidden';

            // iPhone/iPad: pop-ups only work from the Home Screen app.
            if (isIos() && !isInstalledApp()) return 'ios-install';

            if (!isPushSupported()) return 'hidden';

            if (Notification.permission === 'denied') return 'blocked';

            if (
                Notification.permission === 'granted' &&
                (await hasDeviceSubscription())
            ) {
                try {
                    const registration = await navigator.serviceWorker.getRegistration();
                    const subscription = await registration?.pushManager.getSubscription();
                    const keys = subscription?.toJSON().keys;

                    if (subscription && keys?.p256dh && keys?.auth) {
                        await registerPushDevice({
                            endpoint: subscription.endpoint,
                            p256dh: keys.p256dh,
                            auth: keys.auth,
                            expirationTime: subscription.expirationTime ?? undefined,
                        });

                        return 'hidden';
                    }
                } catch (error) {
                    console.warn('Rentike: push subscription sync failed:', error);
                }
            }

            return 'ask';
        };

        const timer = window.setTimeout(() => {
            void decide().then((next) => {
                if (!cancelled) setMode(next);
            });
        }, SHOW_DELAY_MS);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [userId]);

    const snooze = () => {
        if (userId) {
            writeStorage(
                `rentike-push-card-snoozed:${userId}`,
                String(Date.now() + SNOOZE_MS)
            );
        }
        setError(null);
        setMode('hidden');
    };

    const handleTurnOn = async () => {
        if (!userId || busy) return;

        setError(null);
        setBusy(true);

        let createdSubscription: PushSubscription | null = null;

        try {
            // Must be the first thing after the tap, so phones show the question.
            const permission = await Notification.requestPermission();

            if (permission === 'denied') {
                setMode('blocked');
                return;
            }

            if (permission !== 'granted') {
                setError('Tap "Allow" when your phone asks, so Rentike can notify you.');
                return;
            }

            const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            if (!publicKey) {
                throw new Error('VAPID public key is unavailable.');
            }

            const registration = await Promise.race([
                navigator.serviceWorker.ready,
                new Promise<ServiceWorkerRegistration>((_, reject) =>
                    setTimeout(
                        () => reject(new Error('Service worker was not ready after 10 seconds.')),
                        10000
                    )
                ),
            ]);

            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: decodeVapidKey(publicKey),
                });
                createdSubscription = subscription;
            }

            const keys = subscription.toJSON().keys;
            if (!keys?.p256dh || !keys?.auth) {
                throw new Error('Browser push subscription is missing its keys.');
            }

            await registerPushDevice({
                endpoint: subscription.endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
                expirationTime: subscription.expirationTime ?? undefined,
            });

            console.info('Rentike: push subscription saved in Convex.');
            setMode('hidden');
        } catch (err) {
            console.error('Rentike: turning on notifications failed:', err);
            if (createdSubscription) {
                await createdSubscription.unsubscribe().catch(() => false);
            }
            setError('Could not turn on notifications. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    if (mode === 'hidden' || !userId || HIDDEN_ON_VIEWS.has(currentView)) {
        return null;
    }

    const title =
        mode === 'blocked'
            ? 'Notifications are blocked'
            : mode === 'ios-install'
                ? 'Get notifications on iPhone'
                : 'Turn on notifications';

    return (
        <div
            role="dialog"
            aria-live="polite"
            className="fixed left-4 right-4 bottom-24 z-[900] sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#111111] text-neutral-900 dark:text-[#F5F5F5] shadow-xl p-4"
        >
            <div className="flex items-start gap-3">
                <BellRing size={20} className="mt-0.5 shrink-0 text-[var(--rentike-bronze)]" />

                <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold">{title}</h2>

                    {mode === 'ask' && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                            Get notified about new messages and important Rentike updates.
                        </p>
                    )}

                    {mode === 'blocked' && (
                        <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed space-y-1">
                            <p>To get Rentike pop-ups, allow notifications on this phone:</p>
                            <p>
                                <strong>In Chrome:</strong> tap the icon left of the web address →
                                Permissions → Notifications → Allow.
                            </p>
                            <p>
                                <strong>In the installed app:</strong> long-press the Rentike icon →
                                App info → Notifications → Allow.
                            </p>
                        </div>
                    )}

                    {mode === 'ios-install' && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                            In Safari, tap <strong>Share</strong>, then{' '}
                            <strong>Add to Home Screen</strong>. Open Rentike from your Home
                            Screen and you can turn on notifications there.
                        </p>
                    )}

                    {error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                        {mode === 'ask' ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => void handleTurnOn()}
                                    disabled={busy}
                                    className="rounded-xl px-4 py-2 text-xs font-bold bg-black text-white dark:bg-white dark:text-black disabled:opacity-50 cursor-pointer"
                                >
                                    {busy ? 'Please wait…' : 'Turn on'}
                                </button>
                                <button
                                    type="button"
                                    onClick={snooze}
                                    disabled={busy}
                                    className="rounded-xl px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                                >
                                    Not now
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                onClick={snooze}
                                className="rounded-xl px-4 py-2 text-xs font-bold bg-black text-white dark:bg-white dark:text-black cursor-pointer"
                            >
                                Got it
                            </button>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={snooze}
                    aria-label="Close"
                    className="shrink-0 p-1 -m-1 text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}