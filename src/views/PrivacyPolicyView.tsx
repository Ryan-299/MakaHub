import React from 'react';

const PrivacyPolicyView: React.FC = () => {
    React.useEffect(() => {
        document.title = 'MakaoHub - Privacy Policy';
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
                {/* Heading */}
                <div className="mb-12 border-b border-neutral-200 pb-10 dark:border-neutral-800">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                        Legal
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        MakaoHub Privacy Policy
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
                            MakaoHub respects your privacy and is committed to handling your
                            personal information responsibly, securely, and transparently.
                        </p>

                        <p>
                            This Privacy Policy explains how MakaoHub collects, uses, stores,
                            shares, and protects information when you use our web application
                            and mobile applications for Android and iOS.
                        </p>

                        <p>
                            By creating an account or using MakaoHub, you acknowledge the
                            practices described in this Privacy Policy.
                        </p>
                    </section>

                    {/* 1 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            1. Information We Collect
                        </h2>

                        <p>
                            The information we collect depends on how you use MakaoHub and
                            the features you choose to use.
                        </p>

                        <h3 className="mb-3 mt-6 text-lg font-semibold text-black dark:text-white">
                            1.1 Account Information
                        </h3>

                        <p className="mb-3">
                            When you create or manage a MakaoHub account, we may collect
                            information such as:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Your name.</li>
                            <li>Phone number.</li>
                            <li>Email address.</li>
                            <li>Profile photograph.</li>
                            <li>
                                Account role, such as property seeker or property lister.
                            </li>
                            <li>
                                Account and authentication information necessary to secure your
                                account.
                            </li>
                        </ul>

                        <p className="mt-4">
                            You are responsible for ensuring that the information you provide
                            is accurate and kept up to date.
                        </p>
                    </section>

                    {/* 2 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            2. Property Listing Information
                        </h2>

                        <p>
                            If you use MakaoHub as a landlord, caretaker, agent, property
                            manager, or other authorized property lister, we may collect and
                            display information you provide about rental properties.
                        </p>

                        <p className="mb-3 mt-4">This may include:</p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Name of your property.</li>
                            <li>Location of your property.</li>
                            <li>Rental price.</li>
                            <li>Property type.</li>
                            <li>Vacancy information.</li>
                            <li>Move-in costs and fees.</li>
                            <li>Amenities.</li>
                            <li>Property descriptions.</li>
                            <li>Photographs and videos.</li>
                            <li>Lister contact information, where applicable.</li>
                        </ul>

                        <p className="mt-4">
                            Property listing information is provided for the purpose of
                            making rental properties discoverable to property seekers.
                        </p>

                        <p className="mt-4">
                            Information intentionally included in a public property listing
                            may be visible to other MakaoHub users.
                        </p>
                    </section>

                    {/* 3 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            3. Enquiries and Messages
                        </h2>

                        <p>
                            MakaoHub allows property seekers and property listers to
                            communicate through private enquiries and messaging features.
                        </p>

                        <p className="mb-3 mt-4">We may store information such as:</p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Users participating in the conversation.</li>
                            <li>Property connected to the enquiry.</li>
                            <li>Messages sent between users.</li>
                            <li>Dates and times of messages.</li>
                            <li>Contact information submitted as part of an enquiry.</li>
                            <li>Message and enquiry status information.</li>
                        </ul>

                        <p className="mt-4">
                            Private enquiry conversations are not intended to be publicly
                            displayed.
                        </p>

                        <p className="mb-3 mt-4">
                            MakaoHub personnel may access relevant information where
                            reasonably necessary for purposes such as:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Providing customer support.</li>
                            <li>Investigating reported abuse or fraud.</li>
                            <li>Protecting users.</li>
                            <li>Maintaining the security of MakaoHub.</li>
                            <li>Enforcing our Terms of Service.</li>
                            <li>Complying with legal obligations.</li>
                        </ul>
                    </section>

                    {/* 4 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            4. Location Information
                        </h2>

                        <p>
                            MakaoHub uses location information to help users discover rental
                            properties and view property locations on maps.
                        </p>

                        <h3 className="mb-3 mt-6 text-lg font-semibold text-black dark:text-white">
                            4.1 Property Location
                        </h3>

                        <p>
                            Property listers may provide the location of a rental property
                            when creating a listing.
                        </p>

                        <p className="mt-4">
                            This information may be displayed to users as part of the
                            property listing or map experience.
                        </p>

                        <h3 className="mb-3 mt-6 text-lg font-semibold text-black dark:text-white">
                            4.2 Device Location
                        </h3>

                        <p>
                            Where MakaoHub offers a feature such as{' '}
                            <strong className="text-black dark:text-white">
                                “Use Current Location”
                            </strong>
                            , your device may ask for permission to share location
                            information.
                        </p>

                        <p className="mt-4">Granting location permission is optional.</p>

                        <p className="mb-3 mt-4">
                            If you grant permission, your location information may be used
                            to:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Show properties near you.</li>
                            <li>Improve map positioning.</li>
                            <li>Provide location-based property discovery.</li>
                        </ul>

                        <p className="mt-4">
                            You may disable location access at any time through your browser,
                            device, or application settings.
                        </p>

                        <p className="mt-4">
                            MakaoHub will not intentionally access your device location
                            without the required permission.
                        </p>
                    </section>

                    {/* 5 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            5. Saved Properties and Preferences
                        </h2>

                        <p className="mb-3">
                            MakaoHub may store information about how you personalize your
                            experience, including:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Properties you save or favorite.</li>
                            <li>Property-search preferences.</li>
                            <li>Selected filters.</li>
                            <li>Theme or display preferences.</li>
                            <li>Other preferences associated with your account or device.</li>
                        </ul>

                        <p className="mt-4">
                            This information helps MakaoHub provide a more useful and
                            personalized experience.
                        </p>
                    </section>

                    {/* 6 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            6. Reviews, Reports, and Other User Content
                        </h2>

                        <p className="mb-3">Users may be able to submit:</p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Property reviews.</li>
                            <li>Ratings.</li>
                            <li>Reports.</li>
                            <li>Comments.</li>
                            <li>Photographs.</li>
                            <li>Other permitted content.</li>
                        </ul>

                        <p className="mt-4">
                            Reviews and certain other forms of user-generated content may be
                            publicly visible.
                        </p>

                        <p className="mt-4">
                            Reports submitted to MakaoHub for moderation, fraud prevention,
                            or safety purposes are generally handled privately.
                        </p>

                        <p className="mt-4">
                            We may use reports and related information to investigate
                            possible violations of our Terms of Service.
                        </p>
                    </section>

                    {/* 7 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            7. How We Use Personal Information
                        </h2>

                        <p className="mb-3">MakaoHub may use personal information to:</p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Create and maintain user accounts.</li>
                            <li>Authenticate users.</li>
                            <li>Provide property discovery and search features.</li>
                            <li>Display rental listings.</li>
                            <li>Provide map and location functionality.</li>
                            <li>
                                Allow property seekers and property listers to communicate.
                            </li>
                            <li>Deliver notifications.</li>
                            <li>Save user preferences and favorite properties.</li>
                            <li>Display and manage reviews.</li>
                            <li>Investigate reports.</li>
                            <li>Detect and prevent fraud, abuse, and misuse.</li>
                            <li>Protect MakaoHub systems and users.</li>
                            <li>Provide customer support.</li>
                            <li>
                                Improve the reliability, security, and functionality of our
                                applications.
                            </li>
                            <li>Enforce our Terms of Service.</li>
                            <li>Comply with applicable legal obligations.</li>
                        </ul>

                        <p className="mt-4">
                            We do not use personal information for purposes that are
                            incompatible with the reason for which it was collected, unless
                            otherwise permitted by law.
                        </p>
                    </section>

                    {/* 8 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            8. Sharing Information Between MakaoHub Users
                        </h2>

                        <p>
                            Some MakaoHub features are specifically designed to allow users
                            to communicate and share information with one another.
                        </p>

                        <p className="mt-4">
                            For example, when a property seeker sends an enquiry to a
                            property lister, information submitted with that enquiry may be
                            made available to the relevant lister.
                        </p>

                        <p className="mb-3 mt-4">This may include:</p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>The seeker's name.</li>
                            <li>Phone number.</li>
                            <li>Email address, where provided.</li>
                            <li>Profile photograph, where applicable.</li>
                            <li>Enquiry message.</li>
                        </ul>

                        <p className="mt-4">
                            Similarly, information that a property lister chooses to publish
                            in connection with a rental listing may be visible to property
                            seekers.
                        </p>

                        <p className="mt-4">
                            Users should avoid sharing sensitive, confidential, or
                            unnecessary personal information in listings, reviews, or
                            messages.
                        </p>
                    </section>

                    {/* 9 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            9. We Do Not Sell Personal Information
                        </h2>

                        <p className="font-semibold text-black dark:text-white">
                            MakaoHub does not sell users' personal information.
                        </p>

                        <p className="mb-3 mt-4">
                            Personal information may, however, be processed or shared where
                            reasonably necessary to:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Provide MakaoHub services.</li>
                            <li>Enable communication between users.</li>
                            <li>Operate technical infrastructure.</li>
                            <li>Provide customer support.</li>
                            <li>Investigate fraud, abuse, or security incidents.</li>
                            <li>Comply with applicable laws or lawful requests.</li>
                        </ul>
                    </section>

                    {/* 10 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            10. Service Providers and Third-Party Services
                        </h2>

                        <p>
                            MakaoHub may rely on third-party service providers to operate
                            certain parts of our applications and services.
                        </p>

                        <p className="mb-3 mt-4">These may include providers of:</p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Database and backend infrastructure.</li>
                            <li>Cloud hosting.</li>
                            <li>File and image storage.</li>
                            <li>Authentication services.</li>
                            <li>Map and location services.</li>
                            <li>Email or communication services.</li>
                            <li>Security and technical infrastructure.</li>
                        </ul>

                        <p className="mt-4">
                            These service providers may process information on behalf of
                            MakaoHub where necessary to provide their services.
                        </p>

                        <p className="mb-3 mt-4">
                            MakaoHub may also provide links to or integrations with external
                            services such as:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>WhatsApp.</li>
                            <li>Telephone applications.</li>
                            <li>Mapping applications.</li>
                        </ul>

                        <p className="mt-4">
                            When you choose to use an external service, that service may
                            process your information in accordance with its own privacy
                            policy and terms of service.
                        </p>

                        <p className="mt-4">
                            MakaoHub does not control the privacy practices of independent
                            third-party services.
                        </p>
                    </section>

                    {/* 11 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            11. Data Security
                        </h2>

                        <p className="mb-3">
                            MakaoHub takes reasonable technical and organizational measures
                            to protect personal information against:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Unauthorized access.</li>
                            <li>Unlawful use.</li>
                            <li>Loss.</li>
                            <li>Alteration.</li>
                            <li>Destruction.</li>
                            <li>Unauthorized disclosure.</li>
                        </ul>

                        <p className="mt-4">
                            These measures may include account authentication, access
                            controls, secure communications, backend security controls, and
                            administrative safeguards.
                        </p>

                        <p className="mt-4">
                            However, no website, mobile application, database, electronic
                            communication system, or method of data storage can guarantee
                            absolute security.
                        </p>

                        <p className="mt-4">
                            Users are responsible for keeping their account credentials
                            secure and should never share passwords, authentication codes, or
                            other account-security information with other people.
                        </p>
                    </section>

                    {/* 12 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            12. How Long We Keep Information
                        </h2>

                        <p className="mb-3">
                            MakaoHub retains personal information only for as long as
                            reasonably necessary for purposes such as:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Maintaining an active user account.</li>
                            <li>Providing MakaoHub services.</li>
                            <li>Preserving property listings and user communications.</li>
                            <li>Investigating disputes, fraud, or abuse.</li>
                            <li>Maintaining security records.</li>
                            <li>Complying with legal obligations.</li>
                            <li>Resolving complaints.</li>
                        </ul>

                        <p className="mt-4">
                            Information may be deleted, anonymised, or retained for a limited
                            period after an account is closed where reasonably necessary or
                            legally required.
                        </p>

                        <p className="mt-4">
                            As MakaoHub develops, more specific retention periods may be
                            introduced for particular categories of information.
                        </p>
                    </section>

                    {/* 13 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            13. Your Privacy Rights
                        </h2>

                        <p>
                            Subject to applicable Kenyan law, users may have certain rights
                            concerning their personal information.
                        </p>

                        <p className="mb-3 mt-4">These may include the right to:</p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Know what personal information is being processed.</li>
                            <li>Request access to personal information.</li>
                            <li>
                                Request the correction of inaccurate or incomplete
                                information.
                            </li>
                            <li>Object to certain types of processing.</li>
                            <li>Request the restriction of certain processing.</li>
                            <li>
                                Request the deletion of personal information where legally
                                applicable.
                            </li>
                            <li>
                                Withdraw consent where processing is based on consent.
                            </li>
                            <li>
                                Request information about how personal data is being used.
                            </li>
                        </ul>

                        <p className="mt-4">
                            MakaoHub may need to verify your identity before completing
                            certain privacy-related requests.
                        </p>

                        <p className="mt-4">
                            Some information may need to be retained where required by law or
                            where reasonably necessary for security, fraud prevention,
                            dispute resolution, or other lawful purposes.
                        </p>
                    </section>

                    {/* 14 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            14. Account Deletion
                        </h2>

                        <p>Users may request the deletion of their MakaoHub account.</p>

                        <p className="mt-4">
                            When an account deletion request is completed, MakaoHub may
                            delete or anonymise personal information associated with the
                            account, subject to information that must reasonably or legally
                            be retained.
                        </p>

                        <p className="mb-3 mt-4">
                            Certain information may not disappear immediately where it forms
                            part of:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Fraud or security investigations.</li>
                            <li>Legal records.</li>
                            <li>Disputes.</li>
                            <li>System backups.</li>
                            <li>
                                Information required to be retained under applicable law.
                            </li>
                        </ul>

                        <p className="mt-4">
                            MakaoHub will provide account deletion or support options through
                            the application as those features become available.
                        </p>
                    </section>

                    {/* 15 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            15. Children and Age Requirements
                        </h2>

                        <p>
                            MakaoHub accounts are intended for persons aged{' '}
                            <strong className="text-black dark:text-white">
                                18 years or older
                            </strong>
                            .
                        </p>

                        <p className="mt-4">
                            Persons under the age of 18 should not create a MakaoHub account.
                        </p>

                        <p className="mt-4">
                            If we become aware that an account has been created contrary to
                            this age requirement, MakaoHub may restrict, suspend, or remove
                            the account where appropriate.
                        </p>
                    </section>

                    {/* 16 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            16. Browser Storage, Cookies, and Similar Technologies
                        </h2>

                        <p>
                            MakaoHub may use browser storage, cookies, or similar
                            technologies where necessary to provide and improve application
                            functionality.
                        </p>

                        <p className="mb-3 mt-4">
                            These technologies may be used for purposes such as:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Maintaining login sessions.</li>
                            <li>Remembering theme preferences.</li>
                            <li>Preserving application settings.</li>
                            <li>Improving application functionality.</li>
                            <li>Maintaining security.</li>
                        </ul>

                        <p className="mt-4">
                            If MakaoHub later introduces analytics, advertising, or other
                            technologies that materially change how users are tracked, this
                            Privacy Policy will be updated accordingly.
                        </p>

                        <p className="mt-4">
                            Where required, users will be provided with appropriate
                            information, notices, or controls relating to those technologies.
                        </p>
                    </section>

                    {/* 17 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            17. Payments and Subscriptions
                        </h2>

                        <p>
                            MakaoHub may offer paid services, including subscription plans,
                            featured listings, promotional features, or other premium
                            services provided through our applications.
                        </p>

                        <p className="mb-3 mt-4">
                            When a user purchases a paid MakaoHub service, certain
                            payment-related information may be processed, including:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>The amount paid.</li>
                            <li>The selected service or subscription plan.</li>
                            <li>Payment status.</li>
                            <li>Transaction or payment reference.</li>
                            <li>Date and time of the transaction.</li>
                            <li>
                                Contact information required to complete or confirm the
                                payment.
                            </li>
                            <li>
                                Other information reasonably necessary to process, verify, or
                                record the transaction.
                            </li>
                        </ul>

                        <p className="mt-4">
                            Payments may be processed through authorized third-party payment
                            providers. Where a third-party payment provider is used, that
                            provider may collect and process payment information in
                            accordance with its own privacy policy and applicable legal
                            requirements.
                        </p>

                        <p className="mt-4">
                            MakaoHub does not intend to directly store complete bank-card
                            details, mobile-money PINs, passwords, or other confidential
                            payment credentials handled by authorized payment providers.
                        </p>

                        <p className="mb-3 mt-4">
                            Payment-related information retained by MakaoHub may be used to:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Activate or renew subscriptions.</li>
                            <li>Provide paid or premium features.</li>
                            <li>Confirm successful payments.</li>
                            <li>Maintain transaction records.</li>
                            <li>Resolve payment-related enquiries or disputes.</li>
                            <li>Prevent fraud or misuse.</li>
                            <li>
                                Comply with applicable accounting, tax, or legal obligations.
                            </li>
                        </ul>

                        <p className="mt-4 font-semibold text-black dark:text-white">
                            MakaoHub does not collect or process rent, rental deposits,
                            booking deposits, or other property-related payments between
                            property seekers and property listers.
                        </p>

                        <p className="mt-4">
                            Any such payment arrangements are made independently between the
                            relevant users.
                        </p>

                        <p className="mt-4">
                            If MakaoHub introduces additional payment services in the future
                            that materially change how personal or financial information is
                            processed, this Privacy Policy will be updated accordingly.
                        </p>
                    </section>

                    {/* 18 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            18. International Processing and Storage
                        </h2>

                        <p>
                            Some technical service providers used to operate MakaoHub may
                            process or store information using infrastructure located outside
                            Kenya.
                        </p>

                        <p className="mt-4">
                            Where personal information is transferred, stored, or processed
                            internationally, MakaoHub will seek to use appropriate safeguards
                            where required by applicable data-protection law.
                        </p>
                    </section>

                    {/* 19 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            19. Legal Requirements and Protection of Users
                        </h2>

                        <p className="mb-3">
                            MakaoHub may preserve, access, or disclose information where
                            reasonably necessary to:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Comply with applicable law.</li>
                            <li>
                                Respond to lawful requests from authorised public authorities.
                            </li>
                            <li>Enforce our Terms of Service.</li>
                            <li>Investigate fraud or criminal activity.</li>
                            <li>Protect the rights, safety, or security of users.</li>
                            <li>Protect MakaoHub's systems and services.</li>
                        </ul>

                        <p className="mt-4">
                            MakaoHub will not intentionally disclose personal information to
                            law-enforcement agencies, government authorities, or other public
                            authorities without a lawful basis.
                        </p>
                    </section>

                    {/* 20 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            20. Data Breaches
                        </h2>

                        <p className="mb-3">
                            If MakaoHub becomes aware of a personal-data breach, we will take
                            reasonable steps to:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Investigate the incident.</li>
                            <li>Contain the breach.</li>
                            <li>Protect affected systems.</li>
                            <li>Determine what information may have been affected.</li>
                            <li>Take appropriate corrective measures.</li>
                            <li>
                                Notify affected users or relevant authorities where required by
                                applicable law.
                            </li>
                        </ul>
                    </section>

                    {/* 21 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            21. Changes to This Privacy Policy
                        </h2>

                        <p>
                            MakaoHub may update this Privacy Policy as our applications,
                            services, business operations, and legal obligations change.
                        </p>

                        <p className="mt-4">
                            When significant changes are made, users may be informed through
                            appropriate means, including notifications within MakaoHub where
                            appropriate.
                        </p>

                        <p className="mt-4">
                            The latest version and effective date of this Privacy Policy will
                            remain available through MakaoHub.
                        </p>

                        <p className="mt-4">
                            Significant changes affecting how personal information is
                            processed may require additional notice, consent, or user action
                            where appropriate.
                        </p>
                    </section>

                    {/* 22 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            22. Relationship With Our Terms of Service
                        </h2>

                        <p>
                            This Privacy Policy should be read together with the{' '}
                            <a
                                href="/terms"
                                className="font-semibold text-black underline underline-offset-4 dark:text-white"
                            >
                                MakaoHub Terms of Service
                            </a>
                            .
                        </p>

                        <p className="mt-4">
                            The Terms of Service explain the rules governing the use of
                            MakaoHub, while this Privacy Policy explains how personal
                            information is collected, used, stored, shared, and protected.
                        </p>
                    </section>

                    {/* 23 */}
                    <section>
                        <h2 className="mb-4 text-xl font-bold text-black dark:text-white">
                            23. Contact and Privacy Requests
                        </h2>

                        <p>
                            Questions, concerns, or requests relating to privacy or personal
                            information may be directed to{' '}
                            <strong className="text-black dark:text-white">
                                MakaoHub Support
                            </strong>{' '}
                            through the official contact options provided within our
                            applications.
                        </p>

                        <p className="mb-3 mt-4">
                            Users may contact MakaoHub regarding matters such as:
                        </p>

                        <ul className="list-disc space-y-2 pl-6">
                            <li>Accessing personal information.</li>
                            <li>Correcting personal information.</li>
                            <li>Requesting account deletion.</li>
                            <li>Reporting suspected misuse of personal information.</li>
                            <li>Asking questions about this Privacy Policy.</li>
                        </ul>

                        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-[#111111]">
                            <p className="font-semibold text-black dark:text-white">
                                MakaoHub
                            </p>
                            <p>Developed and operated by SHEN Studios</p>
                            <p>Nakuru, Kenya</p>
                        </div>
                    </section>
                </div>

                {/* Bottom navigation */}
                <div className="mt-16 border-t border-neutral-200 pt-8 dark:border-neutral-800">
                    <div className="flex flex-wrap gap-4 text-sm">
                        <a
                            href="/terms"
                            className="font-medium text-neutral-600 underline underline-offset-4 hover:text-black dark:text-neutral-400 dark:hover:text-white"
                        >
                            Terms of Service
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

export default PrivacyPolicyView;