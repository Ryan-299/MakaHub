import React from 'react';

const TermsOfServiceView: React.FC = () => {
    React.useEffect(() => {
        document.title = 'MakaoHub - Terms of Service';
    }, []);

    const handleBack = () => {
        if (window.opener && !window.opener.closed) {
            window.close();
            return;
        }

        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-white text-neutral-900 dark:bg-[#0a0a0a] dark:text-white">
            {/* Top Bar */}
            <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-[#0a0a0a]/95">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="text-sm font-medium text-neutral-600 transition hover:text-black dark:text-neutral-400 dark:hover:text-white"
                    >
                        ← Back
                    </button>
                    <span
                        className="text-lg tracking-[0.18em] text-black dark:text-white"
                        style={{ fontFamily: "'Anurati', sans-serif" }}
                    >
                        MAKAOHUB
                    </span>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
                {/* Page Heading */}
                <div className="mb-12 border-b border-neutral-200 pb-10 dark:border-neutral-800">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                        Legal
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        MakaoHub Terms of Service
                    </h1>

                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                        <span>Effective date: 8 September 2026</span>
                        <span>Version 1.0</span>
                    </div>
                </div>

                <div className="space-y-10 text-[15px] leading-7 text-neutral-700 dark:text-neutral-300 sm:text-base">
                    {/* Introduction */}
                    <section className="space-y-4">
                        <p>
                            Welcome to MakaoHub. These Terms of Service govern your access
                            to and use of our web application, our mobile applications for
                            Android and iOS, and all related features, tools and services.
                            MakaoHub is developed and operated by SHEN Studios.
                        </p>

                        <p>
                            By creating an account, accessing or using MakaoHub, you agree
                            to these Terms of Service and our{' '}
                            <a
                                href="/privacy"
                                className="font-semibold text-black underline underline-offset-4 dark:text-white"
                            >
                                Privacy Policy
                            </a>
                            .
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            1. What Is MakaoHub?
                        </h2>

                        <p>
                            MakaoHub is a rental-property discovery and communication
                            application that helps property seekers find rental homes and
                            helps landlords, caretakers, agents and property managers
                            advertise available properties. The application provides tools
                            for property listings, vacancy information, maps, property
                            discovery, private enquiries, reviews and direct communication
                            between users.
                        </p>

                        <p className="mt-4 font-semibold text-black dark:text-white">
                            MakaoHub is not the landlord, tenant, estate agent, property
                            owner, guarantor or party to a rental agreement between users.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            2. Who May Use MakaoHub?
                        </h2>

                        <div className="space-y-4">
                            <p>
                                You must be{' '}
                                <strong className="text-black dark:text-white">
                                    18 years or older
                                </strong>{' '}
                                to create a MakaoHub account.
                            </p>

                            <p>
                                You must provide accurate information when registering and
                                must not impersonate another person or create an account using
                                false or misleading information.
                            </p>

                            <p>
                                You are responsible for maintaining the security of your
                                account and for activity carried out through it.
                            </p>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            3. Property Seekers
                        </h2>

                        <p className="mb-3">Property seekers may use MakaoHub to:</p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Search and compare rental properties.</li>
                            <li>View prices, vacancies, locations and move-in costs.</li>
                            <li>Save properties.</li>
                            <li>Submit private enquiries.</li>
                            <li>
                                Contact property listers through MakaoHub, telephone or
                                WhatsApp.
                            </li>
                            <li>Leave reviews where permitted.</li>
                        </ul>

                        <p className="mt-4">
                            Seekers are responsible for independently confirming important
                            information before entering into a rental agreement or making
                            payments to a property owner or representative.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            4. Property Listers
                        </h2>

                        <p>
                            Landlords, caretakers, agents, property managers and other
                            authorized listers must only publish properties they are
                            authorized to advertise.
                        </p>

                        <p className="mb-3 mt-4">
                            A lister must provide information that is reasonably accurate
                            and current, including where applicable:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Property location.</li>
                            <li>Rental price.</li>
                            <li>Vacancy information.</li>
                            <li>Property type.</li>
                            <li>Photographs and videos.</li>
                            <li>Fees and move-in costs.</li>
                            <li>Amenities and property descriptions.</li>
                        </ul>

                        <p className="mt-4">
                            Listers must promptly update information that becomes
                            inaccurate.
                        </p>

                        <p className="mt-4">
                            MakaoHub may review, approve, reject, suspend or remove listings
                            that violate these Terms or appear fraudulent, misleading,
                            unlawful or unsafe.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            5. Listings Are Not Guarantees
                        </h2>

                        <p className="mb-3">
                            MakaoHub may moderate listings, but publication or approval of a
                            listing does{' '}
                            <strong className="text-black dark:text-white">not</strong> mean
                            that MakaoHub guarantees:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Ownership of the property.</li>
                            <li>The identity of every lister.</li>
                            <li>The physical condition of the property.</li>
                            <li>Availability at the time a user visits.</li>
                            <li>Accuracy of every statement made by a lister.</li>
                            <li>Suitability of a property for a particular user.</li>
                        </ul>

                        <p className="mt-4">
                            Users should carry out reasonable checks before making important
                            rental decisions.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            6. Payments Between Users
                        </h2>

                        <div className="space-y-4">
                            <p>
                                Unless MakaoHub expressly introduces a payment feature,
                                MakaoHub does{' '}
                                <strong className="text-black dark:text-white">not</strong>{' '}
                                collect rent, deposits or other property payments on behalf of
                                landlords or tenants.
                            </p>

                            <p>
                                Users should exercise caution before transferring money to
                                another user.
                            </p>

                            <p>
                                MakaoHub is not responsible for private payment arrangements
                                made outside our applications or services, except where
                                applicable law provides otherwise.
                            </p>
                        </div>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            7. Private Enquiries and Communication
                        </h2>

                        <div className="space-y-4">
                            <p>
                                MakaoHub provides private enquiry and messaging tools so
                                seekers and listers can communicate about rental properties.
                            </p>

                            <p>
                                Private enquiry messages are intended only for the relevant
                                participants and authorized MakaoHub personnel where access is
                                reasonably necessary for security, support, abuse prevention
                                or legal compliance.
                            </p>

                            <p>
                                Users must not use MakaoHub messaging, telephone links or
                                WhatsApp links to harass, threaten, scam or unlawfully contact
                                another person.
                            </p>
                        </div>
                    </section>

                    {/* Section 8 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            8. Reviews and User Content
                        </h2>

                        <p className="mb-3">
                            Users may be able to publish reviews, comments, property
                            photographs and other content.
                        </p>

                        <p className="mb-3">You must not publish content that is:</p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Knowingly false or misleading.</li>
                            <li>Defamatory or unlawfully threatening.</li>
                            <li>Discriminatory or abusive.</li>
                            <li>Fraudulent.</li>
                            <li>Obscene or unlawful.</li>
                            <li>
                                Copied in violation of another person's intellectual-property
                                rights.
                            </li>
                            <li>Intended to manipulate ratings or reviews.</li>
                        </ul>

                        <p className="mt-4">
                            MakaoHub may investigate reports and remove content that
                            violates these Terms.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            9. Prohibited Conduct
                        </h2>

                        <p className="mb-3">You must not:</p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Create fake property listings.</li>
                            <li>Advertise a property without authority.</li>
                            <li>Scam or attempt to defraud another user.</li>
                            <li>
                                Deliberately provide false vacancy or pricing information.
                            </li>
                            <li>Impersonate another person.</li>
                            <li>Access another user's account without permission.</li>
                            <li>
                                Attempt to interfere with MakaoHub's systems or security.
                            </li>
                            <li>
                                Scrape or harvest personal information without permission.
                            </li>
                            <li>Upload malware or malicious code.</li>
                            <li>Abuse reviews, reports or messaging systems.</li>
                        </ul>

                        <p className="mt-4">
                            Kenyan law separately prohibits forms of unauthorized access,
                            interference and computer fraud. These Terms do not replace
                            those legal obligations.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            10. Account Suspension and Removal
                        </h2>

                        <p className="mb-3">
                            MakaoHub may warn, restrict, suspend or terminate an account
                            where there is reasonable evidence of:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Fraud or attempted fraud.</li>
                            <li>Fake or misleading listings.</li>
                            <li>Harassment or abuse.</li>
                            <li>Repeated violations of these Terms.</li>
                            <li>Threats to application security.</li>
                            <li>Unlawful activity.</li>
                            <li>Misuse of reviews or reports.</li>
                        </ul>

                        <p className="mt-4">
                            Where appropriate, users may be given an opportunity to explain
                            or appeal a moderation decision.
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            11. Third-Party Services
                        </h2>

                        <div className="space-y-4">
                            <p>
                                MakaoHub may provide links or integrations with third-party
                                services such as maps, telephone applications or WhatsApp.
                            </p>

                            <p>
                                Those services are operated by their respective providers and
                                may have their own terms and privacy policies.
                            </p>

                            <p>MakaoHub does not control those external services.</p>
                        </div>
                    </section>

                    {/* Section 12 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            12. Privacy
                        </h2>

                        <p>
                            MakaoHub's collection and use of personal information is
                            governed by the{' '}
                            <a
                                href="/privacy"
                                className="font-semibold text-black underline underline-offset-4 dark:text-white"
                            >
                                MakaoHub Privacy Policy
                            </a>
                            .
                        </p>

                        <p className="mt-4">
                            Users retain rights provided by applicable Kenyan
                            data-protection law, including rights relating to access and
                            correction of personal data.
                        </p>
                    </section>

                    {/* Section 13 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            13. Intellectual Property
                        </h2>

                        <div className="space-y-4">
                            <p>
                                The MakaoHub name, branding, interface, software and original
                                application content are owned by SHEN Studios or used under
                                the appropriate rights or licences.
                            </p>

                            <p>
                                Users retain ownership of content they lawfully upload.
                            </p>

                            <p>
                                By uploading content necessary for a listing or review, you
                                give MakaoHub permission to display, store and process that
                                content for the purpose of operating and promoting MakaoHub
                                services.
                            </p>
                        </div>
                    </section>

                    {/* Section 14 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            14. Availability of the Service
                        </h2>

                        <div className="space-y-4">
                            <p>
                                We aim to keep MakaoHub available and reliable, but we cannot
                                guarantee uninterrupted access at all times.
                            </p>

                            <p>
                                The service may occasionally be unavailable because of
                                maintenance, security incidents, technical failures or
                                circumstances outside MakaoHub's reasonable control.
                            </p>
                        </div>
                    </section>

                    {/* Section 15 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            15. Limitation of Responsibility
                        </h2>

                        <div className="space-y-4">
                            <p>
                                MakaoHub facilitates connections between independent users.
                            </p>

                            <p>
                                MakaoHub is not responsible for the conduct of landlords,
                                caretakers, agents, property managers, seekers or other
                                independent users.
                            </p>

                            <p>
                                Nothing in these Terms is intended to remove or limit any
                                rights or remedies that cannot lawfully be excluded under
                                Kenyan law. Kenya's Consumer Protection Act protects consumers
                                against unfair practices and requires consumer disclosures to
                                be clear and comprehensible.
                            </p>
                        </div>
                    </section>

                    {/* Section 16 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            16. Changes to MakaoHub
                        </h2>

                        <div className="space-y-4">
                            <p>
                                We may add, change or discontinue features as MakaoHub
                                develops.
                            </p>

                            <p>
                                If a material change affects users' rights or obligations, we
                                will provide reasonable notice where appropriate.
                            </p>
                        </div>
                    </section>

                    {/* Section 17 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            17. Changes to These Terms
                        </h2>

                        <div className="space-y-4">
                            <p>We may update these Terms from time to time.</p>

                            <p>
                                The current version and effective date will always be made
                                available through MakaoHub. Continued use after an updated
                                version takes effect may constitute acceptance where legally
                                permitted.
                            </p>
                        </div>
                    </section>

                    {/* Section 18 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            18. Governing Law
                        </h2>

                        <div className="space-y-4">
                            <p>
                                These Terms are governed by the laws of the{' '}
                                <strong className="text-black dark:text-white">
                                    Republic of Kenya
                                </strong>
                                .
                            </p>

                            <p>
                                Nothing in these Terms prevents a user from exercising rights
                                or remedies available under applicable Kenyan law.
                            </p>
                        </div>
                    </section>

                    {/* Section 19 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            19. Contact
                        </h2>

                        <p>
                            Questions about these Terms may be directed to{' '}
                            <strong className="text-black dark:text-white">
                                MakaoHub Support
                            </strong>{' '}
                            through the contact options provided within our applications or
                            official MakaoHub contact channels.
                        </p>

                        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-[#111111]">
                            <p className="font-semibold text-black dark:text-white">
                                MakaoHub
                            </p>
                            <p>Developed and operated by SHEN Studios</p>
                            <p>Nakuru, Kenya.</p>
                        </div>
                    </section>
                </div>

                {/* Bottom Legal Navigation */}
                <div className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <a
                            href="/privacy"
                            className="font-medium text-neutral-600 underline underline-offset-4 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                        >
                            Privacy Policy
                        </a>

                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="font-medium text-neutral-600 underline underline-offset-4 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                        >
                            Return to MakaoHub
                        </button>
                    </div>

                    <p className="mt-8 text-xs text-neutral-500">
                        © 2026 MakaoHub. Developed and operated by SHEN Studios.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default TermsOfServiceView;