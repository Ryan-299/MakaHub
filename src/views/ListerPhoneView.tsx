import React, { useState } from 'react';
import { ArrowLeft, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../../convex/_generated/api';
import { convexClient, isConvexConfigured } from '../lib/convex';

export const ListerPhoneView: React.FC = () => {
    const {
        currentUser,
        assignListerSubtype,
        setCurrentUser,
        setCurrentView,
        resolvedTheme,
    } = useApp();

    const isDark = resolvedTheme === 'dark';

    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [error, setError] = useState('');

    const handleSave = async () => {
        setError('');

        if (!phone.trim()) {
            setError('Please enter your phone number.');
            return;
        }

        if (!currentUser || !isConvexConfigured || !convexClient) {
            setError('Unable to save your phone number. Please try again.');
            return;
        }

        try {
            const result = await convexClient.mutation(
                api.users.updateMyPhone,
                { phone: phone.trim() }
            );

            if (result.status === 'saved' || result.status === 'unchanged') {
                setCurrentUser({ ...currentUser, phone: result.phone });
                setCurrentView('lister-about');
                return;
            }
            if (result.status === 'taken') {
                setError('This phone number is already used by another account.');
            } else if (result.status === 'invalid') {
                setError('Enter a valid Kenyan mobile number, e.g. 0712 345 678.');
            }
        } catch (err) {
            setError('Could not save your phone number. Please try again.');
        }
    };
    return (
        <main
            className={`min-h-screen w-full flex items-center justify-center px-6 ${isDark ? 'bg-black text-white' : 'bg-white text-neutral-900'
                }`}
        >
            <div className="w-full max-w-md">
                <button
                    type="button"
                    onClick={() => setCurrentView('lister-subtype')}
                    className="mb-8 flex items-center gap-2 text-sm opacity-70 hover:opacity-100"
                >
                    <ArrowLeft size={18} />
                    Back
                </button>

                <div className="mb-8">
                    <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${isDark
                            ? 'bg-white text-black'
                            : 'bg-black text-white'
                            }`}
                    >
                        <Phone size={22} />
                    </div>

                    <h1
                        className="font-editorial text-4xl sm:text-5xl font-normal leading-tight"
                        style={{
                            fontFamily: "'Cormorant Garamond', Georgia, serif",
                        }}
                    >
                        Contact Phone Number
                    </h1>

                    <p
                        className={`mt-3 text-sm leading-6 ${isDark ? 'text-neutral-400' : 'text-neutral-600'
                            }`}
                    >
                        Add a number seekers can use to contact you.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-2">
                        Phone Number
                    </label>

                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+254XXXXXXXXX"
                        autoComplete="tel"
                        className={`w-full px-4 py-4 rounded-xl border outline-none transition ${isDark
                            ? 'bg-neutral-950 border-neutral-800 focus:border-white'
                            : 'bg-white border-neutral-300 focus:border-black'
                            }`}
                    />

                    {error && (
                        <p className="mt-2 text-sm text-red-500">
                            {error}
                        </p>
                    )}

                    <p
                        className={`mt-3 text-xs leading-5 ${isDark ? 'text-neutral-500' : 'text-neutral-500'
                            }`}
                    >
                        This number will appear on your public profile.
                    </p>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="w-full mt-6 rounded-2xl px-5 py-4 text-base font-semibold transition-opacity hover:opacity-90"
                        style={{
                            backgroundColor: '#C49A6C',
                            color: '#111111',
                        }}
                    >
                        Save & Continue

                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentView('lister-about')}
                        className={`mt-4 w-full text-sm font-medium underline underline-offset-4 ${isDark ? 'text-neutral-400' : 'text-neutral-600'
                            }`}
                    >
                        Skip for now
                    </button>
                </div>
            </div>
        </main>
    );
};