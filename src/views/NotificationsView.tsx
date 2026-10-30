
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, BellRing, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';


const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i++) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
};

export const NotificationsView: React.FC = () => {
    const {
        notifications = [],
        markNotificationRead,
        markAllNotificationsRead,
        setCurrentView,
        currentUser,
    } = useApp();

    const registerPushDevice = useMutation(api.pushSubscriptions.register);
    const unregisterPushDevice = useMutation(api.pushSubscriptions.unregister);

    const [pushEnabled, setPushEnabled] = useState(false);
    const [pushBusy, setPushBusy] = useState(false);
    const [pushSupported, setPushSupported] = useState(true);
    const [pushError, setPushError] = useState<string | null>(null);
    const [pushStage, setPushStage] = useState('Not started');



    useEffect(() => {
        let cancelled = false;

        const report = (stage: string) => {
            if (!cancelled) setPushStage(stage);
        };

        const syncPushSubscription = async () => {
            report('1. Registration started');

            if (
                !('serviceWorker' in navigator) ||
                !('PushManager' in window) ||
                !('Notification' in window)
            ) {
                report('Stopped: Browser push support unavailable');
                if (!cancelled) setPushSupported(false);
                return;
            }

            if (!currentUser?.id) {
                report('Stopped: Rentike user not available');
                if (!cancelled) setPushEnabled(false);
                return;
            }

            const disabledKey = `rentike-push-disabled:${currentUser.id}`;

            if (Notification.permission !== 'granted') {
                report('Stopped: Browser permission unavailable');
                if (!cancelled) setPushEnabled(false);
                return;
            }

            if (localStorage.getItem(disabledKey) === '1') {
                report('Stopped: Rentike disabled flag is set');
                if (!cancelled) setPushEnabled(false);
                return;
            }

            try {
                const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

                if (!publicKey) {
                    throw new Error('VAPID public key unavailable to frontend');
                }

                report('2. Waiting for service worker');

                const registration = await Promise.race([
                    navigator.serviceWorker.ready,
                    new Promise<ServiceWorkerRegistration>((_, reject) =>
                        setTimeout(
                            () => reject(new Error('Service worker timeout')),
                            10000
                        )
                    ),
                ]);

                report('3. Service worker ready');

                let subscription =
                    await registration.pushManager.getSubscription();

                if (!subscription) {
                    report('4. Creating browser subscription');

                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(publicKey),
                    });
                }

                report('5. Browser subscription available');

                const keys = subscription.toJSON().keys;

                if (!keys?.p256dh || !keys?.auth) {
                    throw new Error('Subscription keys unavailable');
                }

                report('6. Sending subscription to Convex');

                await registerPushDevice({
                    endpoint: subscription.endpoint,
                    p256dh: keys.p256dh,
                    auth: keys.auth,
                    expirationTime: subscription.expirationTime ?? undefined,
                });

                report('7. Saved successfully in Convex');

                if (!cancelled) {
                    setPushEnabled(true);
                    setPushError(null);
                }
            } catch (error) {
                const message =
                    error instanceof Error
                        ? error.message
                        : 'Unknown registration error';

                report(`Failed: ${message}`);

                if (!cancelled) {
                    setPushEnabled(false);
                    setPushError(message);
                }
            }
        };

        void syncPushSubscription();

        return () => {
            cancelled = true;
        };
    }, [currentUser?.id, registerPushDevice]);

    const handleEnablePush = async () => {
        setPushError(null);

        if (!pushSupported || !currentUser) {
            setPushError('Phone notifications are unavailable.');
            return;
        }

        const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        if (!publicKey) {
            setPushError('Phone notifications are not configured yet.');
            return;
        }

        try {
            // Request permission only after the user clicks Enable.
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                setPushError('Notification permission was not granted.');
                return;
            }

            setPushBusy(true);

            const registration = await navigator.serviceWorker.ready;

            let subscription =
                await registration.pushManager.getSubscription();

            let createdSubscription = false;

            try {
                if (!subscription) {
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(publicKey),
                    });

                    createdSubscription = true;
                }

                const keys = subscription.toJSON().keys;

                if (!keys?.p256dh || !keys?.auth) {
                    throw new Error('Missing device subscription keys.');
                }

                await registerPushDevice({
                    endpoint: subscription.endpoint,
                    p256dh: keys.p256dh,
                    auth: keys.auth,
                    expirationTime: subscription.expirationTime ?? undefined,
                });

                localStorage.removeItem(`rentike-push-disabled:${currentUser.id}`);
                setPushEnabled(true);
            } catch (error) {
                // Undo a newly created subscription if saving it failed.
                if (createdSubscription && subscription) {
                    await subscription.unsubscribe().catch(() => false);
                }
                throw error;
            }
        } catch (error) {
            console.error('Failed to enable phone notifications:', error);
            setPushError(
                error instanceof Error
                    ? error.message
                    : 'Push registration failed.'
            );
        } finally {
            setPushBusy(false);
        }
    };

    const handleDisablePush = async () => {
        setPushError(null);
        setPushBusy(true);

        try {
            const registration =
                await navigator.serviceWorker.getRegistration();

            const subscription =
                await registration?.pushManager.getSubscription();

            if (subscription) {
                await unregisterPushDevice({
                    endpoint: subscription.endpoint,
                });

                const removed = await subscription.unsubscribe();

                if (!removed) {
                    throw new Error('Browser subscription could not be removed.');
                }
            }

            if (currentUser?.id) {
                localStorage.setItem(`rentike-push-disabled:${currentUser.id}`, '1');
            }

            setPushEnabled(false);
        } catch (error) {
            console.error('Failed to disable phone notifications:', error);
            setPushError('Could not disable phone notifications. Please try again.');
        } finally {
            setPushBusy(false);
        }
    };

    const sortedNotifications = [...notifications].sort(
        (a, b) =>
            new Date(b.createdAt || b.time).getTime() -
            new Date(a.createdAt || a.time).getTime()
    );

    const handleBack = () => {
        if (currentUser?.role === 'admin') {
            setCurrentView('admin-dashboard');
        } else if (currentUser?.role === 'lister') {
            setCurrentView('lister-dashboard');
        } else {
            setCurrentView('tenant-home');
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-[#F5F5F5]">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white mb-8"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="flex items-center justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div>
                        <div className="flex items-center gap-3">
                            <Bell size={24} />
                            <h1 className="text-3xl font-semibold">
                                Notifications
                            </h1>
                        </div>

                        <p className="text-sm text-neutral-500 mt-2">
                            Updates about your Rentike account, listings and activity.
                        </p>
                    </div>

                    {notifications.some((notification) => !notification.read) && (
                        <button
                            type="button"
                            onClick={markAllNotificationsRead}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900"
                        >
                            <CheckCheck size={17} />
                            Mark all as read
                        </button>
                    )}
                </div>


                {/* Phone Push Notifications */}
                <div className="mt-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <BellRing
                                size={21}
                                className="mt-1 text-neutral-700 dark:text-neutral-300"
                            />

                            <div>
                                <h2 className="font-semibold text-base">
                                    Phone Notifications
                                </h2>

                                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                    Receive Rentike updates on this device,
                                    even when the app is closed.
                                </p>
                                <p className="text-xs text-neutral-500 mt-2">
                                    Registration status: {pushStage}
                                </p>
                                <p className="text-xs text-neutral-500 mt-2">
                                    {pushEnabled
                                        ? 'Notifications enabled on this device.'
                                        : pushSupported
                                            ? 'Notifications are currently disabled.'
                                            : 'Push notifications are not supported on this browser.'}
                                </p>
                            </div>
                        </div>

                        {pushSupported && (
                            <button
                                type="button"
                                onClick={
                                    pushEnabled
                                        ? handleDisablePush
                                        : handleEnablePush
                                }
                                disabled={pushBusy || !currentUser}
                                className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium bg-neutral-900 text-white dark:bg-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-85 transition-opacity"
                            >
                                {pushBusy
                                    ? 'Please wait...'
                                    : pushEnabled
                                        ? 'Disable Notifications'
                                        : 'Enable Notifications'}
                            </button>
                        )}
                    </div>

                    {pushError && (
                        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                            {pushError}
                        </p>
                    )}
                </div>

                <div className="mt-6">

                    {sortedNotifications.length === 0 ? (
                        <div className="border border-neutral-200 dark:border-neutral-800 rounded-3xl py-20 text-center">
                            <Bell
                                size={34}
                                className="mx-auto mb-4 text-neutral-400"
                            />

                            <h2 className="text-xl font-semibold">
                                No notifications yet
                            </h2>

                            <p className="text-sm text-neutral-500 mt-2">
                                Your Rentike updates will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden">
                            {sortedNotifications.map((notif) => (
                                <button
                                    type="button"
                                    key={notif.id}
                                    onClick={() => markNotificationRead(notif.id)}
                                    className={`w-full text-left px-5 sm:px-6 py-5 transition-colors hover:bg-neutral-50 dark:hover:bg-[#111111] ${!notif.read
                                        ? 'bg-neutral-50 dark:bg-[#0D0D0D]'
                                        : 'bg-white dark:bg-black'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="pt-2">
                                            <span
                                                className={`block w-2 h-2 rounded-full ${notif.read
                                                    ? 'bg-neutral-300 dark:bg-neutral-700'
                                                    : 'bg-black dark:bg-white'
                                                    }`}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4">
                                                <h3 className="font-semibold text-sm sm:text-base">
                                                    {notif.title}
                                                </h3>

                                                <span className="text-xs text-neutral-400 whitespace-nowrap">
                                                    {new Date(
                                                        notif.createdAt || notif.time
                                                    ).toLocaleString()}
                                                </span>
                                            </div>

                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};