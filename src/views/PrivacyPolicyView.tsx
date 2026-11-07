import React from 'react';

const PrivacyPolicyView: React.FC = () => {
    React.useEffect(() => {
        document.title = 'Rentike - Privacy Policy';
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
                        style={{ fontFamily: '"Anurati", sans-serif' }}
                    >
                        RENTIKE{' '}
                        <span
                            className="text-white dark:text-black"
                            style={{
                                backgroundColor: '#B68B5A',
                                borderRadius: '6px',
                                padding: '2px 5px',
                            }}
                        >
                            254
                        </span>
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
                        Rentike Privacy Policy
                    </h1>

                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                        <span>Effective date: 4 November 2026</span>
                        <span>Version 1.0</span>
                    </div>
                </div>


                <div className="space-y-10 text-[15px] leading-7 text-neutral-700 dark:text-neutral-300 sm:text-base">
                    {/* Introduction */}
                    <section className="space-y-4">
                        <p>
                            Rentike respects your privacy and is committed to handling
                            your personal information responsibly, securely and transparently.
                        </p>
                        <p>
                            This Privacy Policy explains how Rentike collects, uses, stores,
                            shares and protects information when you access our website,
                            web application or installed Progressive Web App (PWA).
                        </p>
                        <p>
                            Rentike is a Kenyan rental-property discovery platform developed
                            and operated by Shen Studios, based in Nakuru, Kenya.
                            This policy applies to visitors, property seekers and property listers.
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            1. Information We Collect
                        </h2>
                        <p>
                            The information we collect depends on how you use Rentike
                            and the features you choose to access.
                        </p>

                        <h3 className="pt-2 text-lg font-semibold text-black dark:text-white">
                            1.1 Account Information
                        </h3>
                        <p>When you register or manage a Rentike account, we may collect:</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Your name or company name.</li>
                            <li>Email address.</li>
                            <li>Phone number, where provided.</li>
                            <li>Profile photograph.</li>
                            <li>Account role, such as Seeker or Lister.</li>
                            <li>Lister category and profile information.</li>
                            <li>Authentication and account-security information.</li>
                            <li>Account creation and update records.</li>
                        </ul>
                        <p>
                            Some information is necessary to create and secure an account.
                            Other information, such as a profile photograph, public introduction
                            or contact phone number, may be optional. If required information
                            is not provided, some features may be unavailable.
                        </p>
                        <p>
                            You are responsible for providing accurate information and
                            keeping it reasonably up to date.
                        </p>

                        <h3 className="pt-2 text-lg font-semibold text-black dark:text-white">
                            1.2 Technical and Device Information
                        </h3>
                        <p>
                            When you access Rentike, technical service providers may process
                            browser type, device information, IP address, session identifiers,
                            and security or diagnostic records to operate the application
                            and protect its users.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            2. Guest Browsing
                        </h2>
                        <p>
                            Rentike allows visitors to explore certain rental property information
                            without creating an account. Guests may browse listings, view photographs
                            and videos, explore maps, and use available search and filtering tools.
                        </p>
                        <p>An account is required for activities such as:</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Sending property enquiries or accessing private messages.</li>
                            <li>Saving or favouriting properties.</li>
                            <li>Publishing or managing property listings.</li>
                            <li>Submitting ratings or reviews.</li>
                            <li>Managing an account or public profile.</li>
                        </ul>
                        <p>
                            Rentike may still use essential browser storage and process limited
                            technical information when visitors browse without signing in.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            3. Property Listing Information
                        </h2>
                        <p>
                            Property listers may submit information about properties
                            they are authorised to advertise, including:
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Property name, description and type.</li>
                            <li>Address, location or geographic coordinates.</li>
                            <li>Monthly rent and move-in costs.</li>
                            <li>Available units and vacancy information.</li>
                            <li>Amenities and facilities.</li>
                            <li>Property photographs and videos.</li>
                            <li>Contact information associated with a listing, where applicable.</li>
                        </ul>
                        <p>
                            This information helps property seekers discover homes and compare
                            available options. Approved listings and associated details may be
                            publicly visible, including to visitors without accounts.
                        </p>
                        <p>
                            Listers should avoid including unnecessary private or sensitive
                            information in public descriptions, photographs or videos.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            4. Public Profiles and Contact Information
                        </h2>
                        <p>
                            Public lister profiles may display a name or business name,
                            profile photograph, lister category, introduction, contact phone
                            number and contact email address when provided for public contact.
                        </p>
                        <p className="font-semibold text-black dark:text-white">
                            Information displayed on a public profile may be visible
                            to other Rentike users or visitors.
                        </p>
                        <p>
                            Only provide contact information you are comfortable making available
                            for property-related communication. Account passwords and verification
                            codes are not intended for public display.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            5. Enquiries and Private Messages
                        </h2>
                        <p>
                            Rentike allows property seekers and listers to communicate
                            through enquiries and messaging features. We may process:
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Users participating in a conversation.</li>
                            <li>Property associated with an enquiry.</li>
                            <li>Messages exchanged between users.</li>
                            <li>Message timestamps and status.</li>
                            <li>Contact information submitted during an enquiry.</li>
                        </ul>
                        <p>
                            Private enquiries and conversations are not intended for public display.
                            Authorised Rentike personnel may access relevant information where
                            reasonably necessary for support, complaints, fraud prevention,
                            security, enforcement of platform rules or legal compliance.
                        </p>
                        <p>
                            Do not share passwords, verification codes or unnecessary
                            sensitive information through messages.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            6. Location Information
                        </h2>
                        <h3 className="pt-2 text-lg font-semibold text-black dark:text-white">
                            6.1 Property Locations
                        </h3>
                        <p>
                            Property listers may provide addresses, map positions and geographic
                            coordinates when creating a listing. These may be displayed
                            on property pages and maps.
                        </p>
                        <h3 className="pt-2 text-lg font-semibold text-black dark:text-white">
                            6.2 Device Location
                        </h3>
                        <p>
                            Some features may request permission to access your device location.
                            Granting this permission is optional. With your permission,
                            location information may be used to show nearby properties,
                            centre maps and help calculate routes or distances.
                        </p>
                        <p>
                            You can withdraw permission through browser or device settings.
                            Rentike will not intentionally access precise device location
                            without the required permission.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            7. Saved Properties and Preferences
                        </h2>
                        <p>
                            Rentike may store saved or favourited properties, searches and filters,
                            display preferences, theme settings and other account or device
                            preferences to support a consistent experience.
                        </p>
                        <p>
                            Some preferences may be stored locally on your device;
                            account-related data may be stored through Rentike backend services.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            8. Reviews, Ratings and Reports
                        </h2>
                        <p>
                            Registered users may be able to submit property reviews, ratings,
                            comments and reports. We may process their content, associated
                            properties, account details and submission dates.
                        </p>
                        <p>
                            Reviews, ratings and comments may be publicly visible. Reports
                            of suspicious properties, users or activity are generally handled
                            privately and may be reviewed to investigate complaints
                            or enforce platform rules.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            9. Notifications and Communications
                        </h2>
                        <p>
                            Rentike may send account and security messages, email verification
                            codes, account-change notices, enquiry and property-activity
                            notifications, listing updates and important service announcements.
                        </p>
                        <p>
                            Communications may be delivered within Rentike, by email or through
                            supported browser or device notifications. With push notifications
                            enabled, relevant subscription information may be processed
                            to deliver them.
                        </p>
                        <p>
                            You can manage supported notification permissions in your browser
                            or device settings. Certain account-security communications
                            may remain necessary to protect your account.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            10. How We Use Personal Information
                        </h2>
                        <p>Rentike processes personal information to:</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Create, authenticate and maintain user accounts.</li>
                            <li>Publish and display property listings.</li>
                            <li>Provide search, discovery, maps and location tools.</li>
                            <li>Connect property seekers with listers through enquiries and messages.</li>
                            <li>Manage saved properties, preferences and public profiles.</li>
                            <li>Deliver notifications and service communications.</li>
                            <li>Display and moderate reviews and investigate reports.</li>
                            <li>Prevent fraud, abuse and unauthorised access.</li>
                            <li>Maintain security, reliability and customer support.</li>
                            <li>Comply with applicable legal requirements.</li>
                        </ul>
                        <p>
                            We aim to process personal information for specific, legitimate
                            purposes and in accordance with applicable data-protection law.
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            11. Legal Grounds for Processing
                        </h2>
                        <p>
                            Depending on the circumstances, personal information may be
                            processed to provide services users request, to operate and secure
                            the platform, to meet legal obligations, for legitimate interests
                            permitted by law, or where valid consent is given.
                        </p>
                        <p>
                            Where processing is based on consent, users may withdraw it
                            subject to applicable law and any consequences for features
                            that require the information.
                        </p>
                    </section>

                    {/* Section 12 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            12. Sharing Personal Information
                        </h2>
                        <p className="font-semibold text-black dark:text-white">
                            Rentike does not sell users' personal information.
                        </p>
                        <h3 className="pt-2 text-lg font-semibold text-black dark:text-white">
                            12.1 Sharing Between Users
                        </h3>
                        <p>
                            Information submitted in an enquiry may be shared with the relevant
                            property lister. Information placed in public profiles or property
                            listings may be available to seekers and other visitors.
                        </p>
                        <h3 className="pt-2 text-lg font-semibold text-black dark:text-white">
                            12.2 Technology Service Providers
                        </h3>
                        <p>
                            Rentike uses service providers for authentication (including Clerk),
                            backend infrastructure (including Convex), hosting (including Cloudflare),
                            mapping (including Google Maps), and email delivery. These providers
                            may process information needed to provide their services.
                        </p>
                        <h3 className="pt-2 text-lg font-semibold text-black dark:text-white">
                            12.3 External Communication Services
                        </h3>
                        <p>
                            Where Rentike links to services such as WhatsApp, telephone applications
                            or Google Maps, those services operate under their own privacy policies
                            and terms.
                        </p>
                        <h3 className="pt-2 text-lg font-semibold text-black dark:text-white">
                            12.4 Legal and Safety Requirements
                        </h3>
                        <p>
                            Relevant information may be preserved or shared where legally permitted
                            or required to respond to valid legal requests, investigate fraud,
                            protect users, enforce platform rules or maintain security.
                        </p>
                    </section>

                    {/* Section 13 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            13. Cookies and Browser Storage
                        </h2>
                        <p>
                            Rentike may use cookies, local storage and similar technologies
                            necessary for the operation of its website and web application.
                        </p>
                        <p>
                            These technologies may help maintain authentication sessions,
                            secure accounts, remember theme preferences, preserve settings
                            and support essential web-app functionality.
                        </p>
                        <p>
                            Some may be provided by third-party services used to operate Rentike.
                            You can manage cookies and website data through your browser settings,
                            although blocking essential storage may affect sign-in and other features.
                        </p>
                        <p>
                            If Rentike introduces additional tracking technologies requiring
                            specific notices or consent, appropriate information and controls
                            will be provided as required by law.
                        </p>
                    </section>

                    {/* Section 14 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            14. Data Security
                        </h2>
                        <p>
                            Rentike takes reasonable technical and organisational measures
                            intended to protect personal information against unauthorised
                            access, misuse, alteration, disclosure and loss.
                        </p>
                        <p>
                            These measures may include secure authentication, access controls,
                            protected communications, backend security and administrative safeguards.
                            No internet-connected service can guarantee absolute security.
                        </p>
                        <p>
                            Users should protect their credentials and never share
                            passwords or verification codes.
                        </p>
                    </section>

                    {/* Section 15 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            15. How Long We Retain Information
                        </h2>
                        <p>
                            Rentike retains personal information for as long as reasonably necessary
                            to maintain accounts, provide listings and communications, preserve
                            appropriate records, resolve complaints, investigate fraud or security
                            incidents and meet legal requirements.
                        </p>
                        <p>
                            When information is no longer needed, it may be deleted or anonymised
                            as appropriate. Some information may temporarily remain in backups
                            or be retained where legally required.
                        </p>
                    </section>

                    {/* Section 16 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            16. Your Privacy Rights
                        </h2>
                        <p>Subject to applicable Kenyan law, users may have the right to:</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Be informed about how personal information is used.</li>
                            <li>Request access to personal information.</li>
                            <li>Request correction of inaccurate or misleading information.</li>
                            <li>Object to certain processing.</li>
                            <li>Request deletion or restriction where applicable.</li>
                            <li>Withdraw consent where processing relies on consent.</li>
                            <li>Request data portability where applicable.</li>
                        </ul>
                        <p>
                            Rentike may request identity verification before handling certain
                            privacy requests. You can contact Rentike Support to exercise these
                            rights or raise concerns with Kenya's Office of the Data Protection
                            Commissioner where applicable.
                        </p>
                    </section>

                    {/* Section 17 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            17. Account Deletion
                        </h2>
                        <p>
                            Users may request deletion of their Rentike accounts through
                            available account-management or support options.
                        </p>
                        <p>
                            When a request is processed, relevant personal information may
                            be deleted or anonymised, subject to legal and operational requirements.
                            Some records may be retained for legal compliance, security investigations,
                            fraud prevention, dispute resolution or system backups.
                        </p>
                    </section>

                    {/* Section 18 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            18. Children and Age Requirements
                        </h2>
                        <p>
                            Rentike accounts are intended for individuals aged 18 years
                            or older. Persons under 18 should not create an account.
                        </p>
                        <p>
                            If Rentike becomes aware of an account created contrary
                            to this requirement, appropriate steps may be taken to restrict
                            or remove it.
                        </p>
                    </section>

                    {/* Section 19 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            19. International Data Processing
                        </h2>
                        <p>
                            Some third-party technology providers may process or store information
                            using infrastructure outside Kenya. Where personal information is
                            transferred internationally, Rentike will seek to apply lawful transfer
                            conditions and appropriate safeguards as required by Kenyan data-protection law.
                        </p>
                    </section>

                    {/* Section 20 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            20. Personal Data Breaches
                        </h2>
                        <p>
                            If Rentike becomes aware of a personal-data breach, appropriate steps
                            may be taken to investigate and contain it, secure affected systems,
                            assess possible harm, take corrective measures and notify affected
                            individuals or relevant authorities where required by law.
                        </p>
                    </section>

                    {/* Section 21 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            21. Changes to This Privacy Policy
                        </h2>
                        <p>
                            Rentike may update this Privacy Policy to reflect changes in its
                            services, security practices, data processing or legal obligations.
                        </p>
                        <p>
                            The latest version and effective date will remain available through
                            Rentike. Significant changes may require additional notice or
                            user action where appropriate.
                        </p>
                    </section>

                    {/* Section 22 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            22. Relationship With Our Terms of Service
                        </h2>
                        <p>
                            This Privacy Policy should be read together with Rentike's Terms of Service.
                            The Terms of Service govern platform use; this Privacy Policy explains
                            how personal information is collected, processed, stored, shared and protected.
                        </p>
                        <p>
                            <a
                                href="/terms"
                                className="font-semibold text-black underline underline-offset-4 dark:text-white"
                            >
                                View the Terms of Service
                            </a>
                        </p>
                    </section>

                    {/* Section 23 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            23. Contact and Privacy Requests
                        </h2>
                        <p>
                            For questions, concerns or requests about privacy, personal
                            information, account correction, deletion or suspected misuse, contact:
                        </p>
                        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-800 dark:bg-[#111111]">
                            <p className="font-semibold text-black dark:text-white">
                                Rentike Support
                            </p>
                            <p>
                                <a
                                    href="mailto:support@rentike.co.ke"
                                    className="underline underline-offset-4"
                                >
                                    support@rentike.co.ke
                                </a>
                            </p>
                            <p className="mt-3 font-semibold text-black dark:text-white">
                                Rentike
                            </p>
                            <p>Developed and operated by Shen Studios</p>
                            <p>Nakuru, Kenya</p>
                        </div>
                        <p>
                            Users may also contact support with questions
                            concerning this Privacy Policy.
                        </p>
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
                            Return to Rentike
                        </button>
                    </div>

                    <p className="mt-8 text-xs text-neutral-500">
                        © 2026 Rentike. Developed and operated by Shen Studios.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicyView;