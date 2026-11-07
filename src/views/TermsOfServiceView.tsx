import React from 'react';

const TermsOfServiceView: React.FC = () => {
    React.useEffect(() => {
        document.title = 'Rentike - Terms of Service';
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
                {/* Page Heading */}
                <div className="mb-12 border-b border-neutral-200 pb-10 dark:border-neutral-800">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
                        Legal
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Rentike Terms of Service
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
                            Welcome to Rentike.
                        </p>
                        <p>
                            These Terms of Service govern your access to and use of the
                            Rentike website, web application, installed Progressive Web
                            App (PWA), and related services.
                        </p>
                        <p>
                            Rentike is developed and operated by Shen Studios,
                            based in Nakuru, Kenya.
                        </p>
                        <p>
                            By creating an account or accessing and using Rentike,
                            you agree to comply with these Terms of Service and our{' '}
                            <a
                                href="/privacy"
                                className="font-semibold text-black underline underline-offset-4 dark:text-white"
                            >
                                Privacy Policy
                            </a>.
                        </p>
                        <p>
                            If you do not agree with these Terms, you should not
                            use the platform.
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            1. What Is Rentike?
                        </h2>
                        <p>
                            Rentike is a Kenyan rental-property discovery platform
                            designed to help people find available rental homes
                            and help property owners and their authorised
                            representatives showcase vacancies.
                        </p>
                        <p>
                            Rentike connects property seekers with landlords,
                            caretakers, property managers, real estate agents,
                            property agencies and other property listers.
                        </p>
                        <p>The platform provides features such as:</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Rental property listings and vacancy information.</li>
                            <li>Property photographs, videos and descriptions.</li>
                            <li>Property search and filtering.</li>
                            <li>Maps and location discovery.</li>
                            <li>Saved and favourite properties.</li>
                            <li>Private enquiries and communication.</li>
                            <li>Property ratings, reviews and comments.</li>
                            <li>Public lister profiles.</li>
                        </ul>
                        <p className="font-semibold text-black dark:text-white">
                            Rentike is a technology platform for rental discovery
                            and communication.
                        </p>
                        <p>
                            Rentike does not itself own the properties advertised
                            by independent listers, guarantee the availability
                            of a rental property, or automatically become a party
                            to a rental agreement between users.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            2. Eligibility and Accounts
                        </h2>
                        <p>
                            You must be{' '}
                            <strong className="text-black dark:text-white">
                                18 years or older
                            </strong>{' '}
                            to create a Rentike account.
                        </p>
                        <p>
                            When registering, you agree to provide accurate,
                            current and truthful information.
                        </p>
                        <p>
                            You must not impersonate another person, use another
                            person's identity without permission or create
                            accounts for fraudulent purposes.
                        </p>
                        <p>
                            You are responsible for protecting your account
                            credentials and for activities carried out
                            through your account.
                        </p>
                        <p>
                            If you suspect unauthorised account access,
                            you should contact Rentike Support promptly.
                        </p>
                        <p>
                            Rentike may require email verification or other
                            security checks to protect accounts and platform users.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            3. Guest Browsing and Registered Users
                        </h2>
                        <p>
                            Rentike allows visitors to explore available rental
                            properties without creating an account.
                        </p>
                        <p>
                            Guests may browse listings, view property details,
                            photographs and videos, use search and filtering
                            tools, and explore available map features.
                        </p>
                        <p>
                            However, certain activities require registration
                            and authentication.
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Saving or favouriting properties.</li>
                            <li>Sending property enquiries.</li>
                            <li>Accessing private messages.</li>
                            <li>Submitting ratings and reviews.</li>
                            <li>Publishing or managing property listings.</li>
                            <li>Managing an account or public profile.</li>
                        </ul>
                        <p>
                            Rentike reserves the right to introduce reasonable
                            security or account requirements for features
                            where necessary.
                        </p>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            4. Property Seekers
                        </h2>
                        <p>
                            Property seekers may use Rentike to discover rental
                            homes, compare available options and connect
                            with property listers.
                        </p>
                        <p>
                            Seekers are responsible for independently confirming
                            important property information before entering
                            into any rental agreement.
                        </p>
                        <p>This includes verifying:</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Property location and availability.</li>
                            <li>Rental prices and additional charges.</li>
                            <li>Property condition.</li>
                            <li>
                                The identity and authority of the person
                                advertising the property.
                            </li>
                            <li>
                                Any requirements associated with occupying
                                the property.
                            </li>
                        </ul>
                        <p>
                            Users are encouraged to arrange appropriate property
                            inspections and exercise caution when dealing
                            with unfamiliar individuals.
                        </p>
                        <p className="font-semibold text-black dark:text-white">
                            A property appearing on Rentike does not guarantee
                            that it is genuine, available or suitable
                            for a particular user.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            5. Property Listers
                        </h2>
                        <p>
                            Landlords, caretakers, property managers, agents,
                            agencies, property companies and other listers
                            must have the necessary authority to advertise
                            the properties they publish.
                        </p>
                        <p>
                            Listers are responsible for ensuring that their listings
                            contain reasonably accurate and current information.
                        </p>
                        <p>This includes, where applicable:</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Property name and location.</li>
                            <li>Rental price and applicable move-in costs.</li>
                            <li>Available units and vacancy status.</li>
                            <li>Property descriptions and amenities.</li>
                            <li>Authentic property photographs and videos.</li>
                            <li>Contact information.</li>
                        </ul>
                        <p>
                            Listers must promptly update or remove information
                            that is no longer accurate.
                        </p>
                        <p>
                            They must not advertise properties without permission,
                            deliberately misrepresent a property's condition
                            or availability, or use false identities
                            to attract enquiries.
                        </p>
                        <p>
                            Where professional registration or licensing is
                            required by applicable law, listers are responsible
                            for complying with those requirements.
                        </p>
                        <p>
                            Rentike may review, reject, restrict or remove listings
                            that violate these Terms or raise legitimate concerns
                            about authenticity, safety or legality.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            6. Property Listings and Verification
                        </h2>
                        <p>
                            Rentike may review property listings before
                            or after publication.
                        </p>
                        <p>
                            However, moderation, approval or publication
                            of a listing does not constitute a guarantee
                            or certification of:
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Property ownership.</li>
                            <li>
                                A lister's identity or professional credentials.
                            </li>
                            <li>The condition or safety of a property.</li>
                            <li>Availability of a vacancy.</li>
                            <li>
                                Accuracy of advertised prices or descriptions.
                            </li>
                            <li>
                                Suitability of the property for a particular user.
                            </li>
                        </ul>
                        <p>
                            Rentike does not independently inspect every
                            property published on the platform.
                        </p>
                        <p>
                            Users should conduct appropriate checks
                            before making rental decisions.
                        </p>
                        <p>
                            Rentike may remove or restrict listings where there
                            is reasonable evidence of fraud, misrepresentation,
                            unlawful activity or violations of these Terms.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            7. Rental Agreements and Payments Between Users
                        </h2>
                        <p>
                            Rental negotiations, agreements and arrangements
                            are made directly between the relevant property
                            seekers and property listers.
                        </p>
                        <p>
                            Rentike is not automatically a party to these arrangements.
                        </p>
                        <p>
                            Rentike does not currently provide an in-app payment
                            system for rent, rental deposits or property-related
                            transactions between seekers and listers.
                        </p>
                        <p>
                            Any payment arrangement made directly between users
                            is independent of Rentike.
                        </p>
                        <p>
                            Users should exercise caution before transferring
                            money, particularly when a property has not been
                            inspected or the recipient's authority
                            has not been established.
                        </p>
                        <p>
                            Nothing in this section excludes responsibilities
                            or remedies that cannot lawfully be excluded
                            under Kenyan law.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            8. Private Enquiries and Communication
                        </h2>
                        <p>
                            Rentike provides communication features to help
                            seekers and listers discuss available properties.
                        </p>
                        <p>
                            Users must communicate respectfully and lawfully.
                        </p>
                        <p>
                            You must not use Rentike's enquiry system, messages,
                            contact details, telephone links or external
                            communication features to:
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Harass or threaten another person.</li>
                            <li>Send fraudulent messages.</li>
                            <li>Impersonate another user.</li>
                            <li>Distribute spam.</li>
                            <li>Request passwords or security verification codes.</li>
                            <li>Attempt to obtain money through deception.</li>
                            <li>Engage in unlawful or abusive behaviour.</li>
                        </ul>
                        <p>
                            Private messages are intended for their participants,
                            subject to access reasonably necessary for support,
                            safety, investigations or legal compliance as explained
                            in our Privacy Policy.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            9. Reviews, Ratings and User Content
                        </h2>
                        <p>
                            Rentike may allow registered users to publish ratings,
                            comments, reviews and other permitted content.
                        </p>
                        <p>
                            Users are responsible for the information they submit.
                        </p>
                        <p>Content must not be:</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Knowingly false or misleading.</li>
                            <li>Defamatory or unlawfully threatening.</li>
                            <li>Discriminatory, abusive or harassing.</li>
                            <li>Fraudulent.</li>
                            <li>Unlawful or obscene.</li>
                            <li>
                                Published in violation of another person's
                                intellectual-property rights.
                            </li>
                            <li>
                                Intended to manipulate ratings or reviews.
                            </li>
                        </ul>
                        <p>
                            Rentike may investigate reports and remove or restrict
                            content that violates these Terms.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            10. Prohibited Conduct
                        </h2>
                        <p>Users must not:</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Create fake property listings.</li>
                            <li>
                                Advertise properties without appropriate authority.
                            </li>
                            <li>
                                Provide deliberately false rental prices
                                or vacancy details.
                            </li>
                            <li>Scam or attempt to defraud other users.</li>
                            <li>Impersonate individuals or organisations.</li>
                            <li>
                                Access another person's account without permission.
                            </li>
                            <li>
                                Attempt to compromise Rentike's security.
                            </li>
                            <li>Upload malware or harmful code.</li>
                            <li>
                                Scrape or harvest users' personal information
                                without authorisation.
                            </li>
                            <li>
                                Abuse messaging, reporting or review systems.
                            </li>
                            <li>
                                Use Rentike to facilitate unlawful activities.
                            </li>
                        </ul>
                        <p>
                            Rentike may take appropriate action against accounts
                            or content involved in prohibited conduct.
                        </p>
                    </section>

                    {/* Section 11 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            11. Public Profiles and Contact Information
                        </h2>
                        <p>
                            Property listers may choose to provide profile
                            information and contact details for property-related
                            communication.
                        </p>
                        <p>
                            Information intentionally displayed through a public
                            profile or listing may be visible to other users
                            or visitors.
                        </p>
                        <p>
                            Users are responsible for ensuring that information
                            they publish is accurate and that they have
                            permission to disclose it.
                        </p>
                        <p>
                            Users must not collect, distribute or misuse another
                            person's contact information for spam, harassment,
                            fraud or other unauthorised purposes.
                        </p>
                    </section>

                    {/* Section 12 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            12. Intellectual Property
                        </h2>
                        <p>
                            The Rentike name, branding, original interface,
                            software and platform content are owned by Shen Studios
                            or used under appropriate licences or permissions.
                        </p>
                        <p>
                            Users retain ownership of content they lawfully submit,
                            including their own property photographs,
                            descriptions and other original material.
                        </p>
                        <p>
                            By uploading content, users grant Rentike a non-exclusive
                            permission to store, process, display and make that
                            content available as reasonably necessary to operate
                            and promote the relevant listings and platform services.
                        </p>
                        <p>
                            Users must not upload content they do not own
                            or have permission to use.
                        </p>
                        <p>
                            The Rentike name, logo and original platform materials
                            must not be reproduced or used in a misleading
                            manner without appropriate authorisation.
                        </p>
                    </section>

                    {/* Section 13 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            13. Reports, Moderation and Account Restrictions
                        </h2>
                        <p>
                            Users may report suspicious listings, misleading
                            information, abusive behaviour or other concerns
                            through available reporting and support channels.
                        </p>
                        <p>
                            Rentike may investigate reports and take reasonable
                            action, including:
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>Requesting clarification from users.</li>
                            <li>Restricting or removing content.</li>
                            <li>Rejecting or removing property listings.</li>
                            <li>Limiting access to particular features.</li>
                            <li>Suspending or terminating accounts.</li>
                        </ul>
                        <p>
                            Such action may be taken where there is reasonable
                            evidence of fraud, misuse, security threats,
                            unlawful activity or repeated violations of these Terms.
                        </p>
                        <p>
                            Where appropriate, users may be given an opportunity
                            to explain or challenge a moderation decision.
                        </p>
                    </section>

                    {/* Section 14 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            14. Account Suspension and Deletion
                        </h2>
                        <p>
                            Users may request account deletion through available
                            account-management or support options.
                        </p>
                        <p>
                            Rentike may suspend, restrict or terminate accounts
                            for legitimate reasons, including violations
                            of these Terms.
                        </p>
                        <p>
                            Account deletion and the handling of associated
                            personal information are governed by the Rentike
                            Privacy Policy and applicable Kenyan law.
                        </p>
                        <p>
                            Certain records may need to be retained for legal,
                            security or dispute-resolution purposes.
                        </p>
                    </section>

                    {/* Section 15 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            15. Third-Party Services
                        </h2>
                        <p>
                            Rentike may use or link to external services, including
                            mapping applications, telephone services, WhatsApp
                            and authentication providers.
                        </p>
                        <p>
                            These services are operated by their respective providers
                            and may have their own terms and privacy policies.
                        </p>
                        <p>
                            Rentike does not control independent third-party services.
                        </p>
                        <p>
                            Users are responsible for reviewing applicable terms
                            when choosing to access external services.
                        </p>
                    </section>

                    {/* Section 16 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            16. Privacy and Personal Information
                        </h2>
                        <p>
                            The collection, processing, storage and protection
                            of personal information are governed by the{' '}
                            <a
                                href="/privacy"
                                className="font-semibold text-black underline underline-offset-4 dark:text-white"
                            >
                                Rentike Privacy Policy
                            </a>.
                        </p>
                        <p>
                            Users retain privacy and data-protection rights
                            provided by applicable Kenyan law.
                        </p>
                        <p>
                            Rentike is committed to handling personal
                            information responsibly and transparently.
                        </p>
                    </section>

                    {/* Section 17 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            17. Availability and Changes to Rentike
                        </h2>
                        <p>
                            Rentike aims to provide a reliable and accessible service.
                        </p>
                        <p>
                            However, continuous or uninterrupted availability
                            cannot be guaranteed.
                        </p>
                        <p>
                            The platform may occasionally experience maintenance,
                            technical issues, security incidents or interruptions
                            beyond its reasonable control.
                        </p>
                        <p>
                            Rentike may improve, modify, introduce or discontinue
                            features as the platform develops.
                        </p>
                        <p>
                            Where changes materially affect users' rights
                            or obligations, reasonable notice will be
                            provided where appropriate.
                        </p>
                    </section>

                    {/* Section 18 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            18. Limitation of Responsibility
                        </h2>
                        <p>
                            Rentike provides a platform through which independent
                            users can discover properties and communicate.
                        </p>
                        <p>
                            Rentike does not guarantee the accuracy, authenticity,
                            availability, condition or suitability of properties
                            advertised by third parties.
                        </p>
                        <p>
                            Property seekers and listers are responsible for their
                            own representations, decisions and agreements.
                        </p>
                        <p>
                            To the extent permitted by applicable law, Rentike
                            is not responsible for losses arising solely from
                            independent arrangements or misconduct between users
                            outside Rentike's control.
                        </p>
                        <p className="font-semibold text-black dark:text-white">
                            Nothing in these Terms excludes or limits liability,
                            consumer rights or legal remedies that cannot
                            lawfully be excluded under Kenyan law.
                        </p>
                    </section>

                    {/* Section 19 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            19. Changes to These Terms
                        </h2>
                        <p>
                            Rentike may revise these Terms of Service when
                            its features, operations or legal obligations change.
                        </p>
                        <p>
                            Updated Terms will include the applicable
                            effective date and version.
                        </p>
                        <p>
                            Where material changes affect users' rights
                            or obligations, Rentike may provide appropriate
                            notice or require renewed acceptance where necessary.
                        </p>
                        <p>
                            Continued use of the platform after updated Terms
                            take effect may constitute acceptance where legally permitted.
                        </p>
                    </section>

                    {/* Section 20 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            20. Governing Law
                        </h2>
                        <p>
                            These Terms of Service are governed by the laws
                            of the{' '}
                            <strong className="text-black dark:text-white">
                                Republic of Kenya
                            </strong>.
                        </p>
                        <p>
                            Nothing in these Terms prevents users from exercising
                            rights or pursuing remedies available under
                            applicable Kenyan law.
                        </p>
                    </section>

                    {/* Section 21 */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-black dark:text-white">
                            21. Contact Information
                        </h2>
                        <p>
                            For questions, concerns, complaints or enquiries
                            regarding these Terms, contact:
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
                            Return to Rentike
                        </button>
                    </div>

                    <p className="mt-8 text-xs text-neutral-500">
                        © 2026 Rentike. Developed and operated by SHEN Studios.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default TermsOfServiceView;