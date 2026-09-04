import React, { useState } from 'react';
import { ArrowLeft, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ListerPhoneView: React.FC = () => {
    const {
        currentUser,
        assignListerSubtype,
        setCurrentView,
        resolvedTheme,
    } = useApp();

    const isDark = resolvedTheme === 'dark';

    const [phone, setPhone] = useState(currentUser?.phone || '');
    const [error, setError] = useState('');

    const handleSave = async () => {
        setError('');

        const cleaned = phone.replace(/[\s-]/g, '');

        let normalizedPhone = cleaned;

        if (cleaned.startsWith('+254')) {
            normalizedPhone = cleaned;
        } else if (cleaned.startsWith('254')) {
            normalizedPhone = `+${cleaned}`;
        } else if (cleaned.startsWith('0')) {
            normalizedPhone = `+254${cleaned.slice(1)}`;
        } else if (/^[71]\d{8}$/.test(cleaned)) {
            normalizedPhone = `+254${cleaned}`;
        }

        if (!/^\+254[71]\d{8}$/.test(normalizedPhone)) {
            setError('Please enter a valid Kenyan phone number.');
            return;
        }

        if (!currentUser?.listerSubtype) {
            setCurrentView('lister-subtype');
            return;
        }

        try {
            await assignListerSubtype(currentUser.listerSubtype, normalizedPhone);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Unable to save this phone number. Please try again.'
            );
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
                    onClick={() => setCurrentView('role-selection')}
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

                    <h1 className="text-3xl font-semibold tracking-tight">
                        Complete your lister profile
                    </h1>

                    <p
                        className={`mt-3 text-sm leading-6 ${isDark ? 'text-neutral-400' : 'text-neutral-600'
                            }`}
                    >
                        Add a phone number to continue to your MakaoHub lister dashboard.
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
                        This number will be saved to your MakaoHub account. SMS verification
                        is not required at this stage.
                    </p>

                    <button
                        type="button"
                        onClick={handleSave}
                        className={`w-full mt-6 py-4 rounded-xl font-semibold transition ${isDark
                            ? 'bg-white text-black hover:bg-neutral-200'
                            : 'bg-black text-white hover:bg-neutral-800'
                            }`}
                    >
                        Save & Continue
                    </button>
                </div>
            </div>
        </main>
    );
};