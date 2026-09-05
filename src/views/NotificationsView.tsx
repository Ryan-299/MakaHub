import React from 'react';
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const NotificationsView: React.FC = () => {
    const {
        notifications = [],
        markNotificationRead,
        markAllNotificationsRead,
        setCurrentView,
        currentUser,
    } = useApp();

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
                            Updates about your MakaoHub account, listings and activity.
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
                                Your MakaoHub updates will appear here.
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