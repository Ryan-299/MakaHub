import React from 'react';
import { X, HelpCircle, Phone, Mail, Info, Shield, FileText, CheckCircle2 } from 'lucide-react';

export type HelpLegalModalType = 'faq' | 'contact' | 'about' | 'privacy' | 'terms' | null;

interface HelpAndLegalModalsProps {
  activeModal: HelpLegalModalType;
  onClose: () => void;
}

export const HelpAndLegalModals: React.FC<HelpAndLegalModalsProps> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  return (
    <div
      className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            {activeModal === 'faq' && <HelpCircle className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />}
            {activeModal === 'contact' && <Phone className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />}
            {activeModal === 'about' && <Info className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />}
            {activeModal === 'privacy' && <Shield className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />}
            {activeModal === 'terms' && <FileText className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />}
            <h3 className="font-bold text-base sm:text-lg">
              {activeModal === 'faq' && 'FAQ / Help Centre'}
              {activeModal === 'contact' && 'Contact Us'}
              {activeModal === 'about' && 'About MakaoHub'}
              {activeModal === 'privacy' && 'Privacy Policy'}
              {activeModal === 'terms' && 'Terms of Service'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-4 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {activeModal === 'faq' && (
            <div className="space-y-8 text-sm leading-6 text-neutral-700 dark:text-neutral-300">
              {/* Getting Started */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
                  Getting Started
                </h3>

                <div className="space-y-5">
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      What is MakaoHub?
                    </h4>
                    <p className="mt-1">
                      MakaoHub is a rental-property discovery and communication
                      application that connects property seekers with landlords,
                      caretakers, agents, property managers, and other authorized property
                      listers across Kenya.
                    </p>

                    <p className="mt-2">
                      The application helps property seekers discover available rental
                      homes while giving property listers a place to showcase their
                      properties, manage vacancies, and communicate directly with
                      interested seekers.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Do I need an account to use MakaoHub?
                    </h4>
                    <p className="mt-1">
                      Yes, you need an account. Some property information may be available
                      for browsing without an account. However, features such as saving
                      properties, sending enquiries, publishing listings, managing
                      vacancies, leaving reviews, and managing your profile require a
                      MakaoHub account.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Is MakaoHub available across Kenya?
                    </h4>
                    <p className="mt-1">
                      Yes. MakaoHub is designed to support rental-property discovery and
                      property listings across Kenya.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Property Seekers */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
                  For Property Seekers
                </h3>

                <div className="space-y-5">
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      How do I find a rental property?
                    </h4>
                    <p className="mt-1">
                      You can use MakaoHub&apos;s search, filters, and map features to
                      discover available properties based on factors such as location,
                      property type, price, and other available preferences.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      How do I contact a property lister?
                    </h4>
                    <p className="mt-1">
                      You can send an enquiry directly through MakaoHub. Where contact
                      options are available, you may also contact the property lister using
                      the Call or WhatsApp options provided.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Does MakaoHub guarantee that a property is still vacant?
                    </h4>
                    <p className="mt-1">
                      No. Vacancy information is provided and maintained by property
                      listers.
                    </p>

                    <p className="mt-2">
                      Property seekers should confirm the current availability of a
                      property directly with the lister before making arrangements to
                      visit, rent, or make any payment relating to the property.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Can I save properties for later?
                    </h4>
                    <p className="mt-1">
                      Yes. Signed-in property seekers can save properties they are
                      interested in and access them later from their saved-properties
                      section.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Does MakaoHub own the properties shown in the application?
                    </h4>
                    <p className="mt-1">
                      No. MakaoHub does not own the rental properties advertised by
                      independent property listers.
                    </p>

                    <p className="mt-2">
                      MakaoHub provides tools that help property seekers discover
                      properties and communicate with the people advertising them.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Property Listers */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
                  For Property Listers
                </h3>

                <div className="space-y-5">
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Who can list a property on MakaoHub?
                    </h4>
                    <p className="mt-1">
                      Landlords, caretakers, agents, property managers, and other persons
                      authorised to advertise a rental property may submit listings on
                      MakaoHub.
                    </p>

                    <p className="mt-2">
                      Users must not advertise properties they are not authorised to list.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Are property listings published immediately?
                    </h4>
                    <p className="mt-1">
                      Property listings may be reviewed by MakaoHub before becoming
                      publicly available.
                    </p>

                    <p className="mt-2">
                      MakaoHub may approve, reject, suspend, or request changes to a listing
                      where necessary.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      What happens if my property listing is rejected?
                    </h4>
                    <p className="mt-1">
                      If a property listing is rejected, the lister may be informed that
                      the listing was not approved and, where available, be provided with
                      information explaining the reason for the decision.
                    </p>

                    <p className="mt-2">
                      The lister may be able to correct the relevant information and submit
                      the property again where appropriate.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Can I update my property&apos;s vacancy information?
                    </h4>
                    <p className="mt-1">
                      Yes. Property listers can manage their listings and update relevant
                      property information, including vacancy details.
                    </p>

                    <p className="mt-2">
                      Listers are encouraged to keep property information accurate and up
                      to date.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Can I edit a property after publishing it?
                    </h4>
                    <p className="mt-1">
                      Where editing is available, listers may update relevant details of
                      their property listings.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Enquiries */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
                  Enquiries &amp; Communication
                </h3>

                <div className="space-y-5">
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      How do enquiries work?
                    </h4>
                    <p className="mt-1">
                      Property seekers can send enquiries about properties they are
                      interested in.
                    </p>
                    <p className="mt-2">
                      The relevant property lister receives the enquiry and can reply
                      through MakaoHub.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Where can I see my enquiries?
                    </h4>
                    <p className="mt-1">
                      Property seekers and property listers can access their enquiry
                      conversations from the enquiries or messages section of their
                      MakaoHub account.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Are enquiries private?
                    </h4>
                    <p className="mt-1">
                      Enquiry conversations are not publicly displayed.
                    </p>

                    <p className="mt-2">
                      They are intended for the users participating in the conversation.
                      Relevant MakaoHub personnel may access information where reasonably
                      necessary for customer support, security, fraud prevention,
                      moderation, or legal compliance, as explained in our Privacy Policy.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Can I contact someone outside MakaoHub?
                    </h4>
                    <p className="mt-1">
                      Where available, MakaoHub may provide Call and WhatsApp options that
                      allow seekers and listers to communicate directly.
                    </p>

                    <p className="mt-2">
                      When using an external service such as WhatsApp, that service is
                      governed by its own terms and privacy practices.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Reviews */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
                  Reviews &amp; Reports
                </h3>

                <div className="space-y-5">
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Can users leave property reviews?
                    </h4>
                    <p className="mt-1">
                      Yes, where the review feature is available.
                    </p>

                    <p className="mt-2">
                      Reviews should reflect genuine experiences and must not contain
                      knowingly false, fraudulent, abusive, discriminatory, threatening, or
                      unlawful content.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Can I report a suspicious property or user?
                    </h4>
                    <p className="mt-1">
                      Yes. Where a reporting option is available, users may report
                      suspicious listings, reviews, accounts, or other activity to
                      MakaoHub.
                    </p>

                    <p className="mt-2">
                      Reports may be reviewed by the MakaoHub administration team.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Will the person I report know that I reported them?
                    </h4>
                    <p className="mt-1">
                      MakaoHub generally handles reports privately.
                    </p>

                    <p className="mt-2">
                      However, information may be disclosed where reasonably necessary to
                      investigate a report, protect users, comply with applicable law, or
                      provide another user with a fair opportunity to respond to action
                      taken against their account or listing.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      What happens after I submit a report?
                    </h4>
                    <p className="mt-1">
                      MakaoHub may review the report and any relevant information.
                    </p>

                    <p className="mt-2">
                      Depending on the circumstances, MakaoHub may take no action, request
                      additional information, issue a warning, remove content, reject or
                      suspend a listing, restrict an account, or take other appropriate
                      action.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Accounts */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
                  Accounts &amp; Profiles
                </h3>

                <div className="space-y-5">
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Can I change my account information?
                    </h4>

                    <p className="mt-1">
                      MakaoHub may allow users to update account information such as:
                    </p>

                    <ul className="mt-2 list-disc space-y-1 pl-6">
                      <li>Name or company name.</li>
                      <li>Phone number.</li>
                      <li>Email address.</li>
                      <li>Profile photograph.</li>
                    </ul>

                    <p className="mt-2">
                      Certain changes may require verification for account-security
                      purposes.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Can I permanently delete my MakaoHub account?
                    </h4>

                    <p className="mt-1">
                      MakaoHub provides or may provide an account-deletion option that
                      allows users to request permanent deletion of their account.
                    </p>

                    <p className="mt-2">
                      Some information may need to be retained where reasonably necessary
                      for legal obligations, security, fraud prevention, dispute
                      resolution, or other lawful purposes.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      What should I do if I think someone has accessed my account?
                    </h4>

                    <p className="mt-1">
                      Change your account credentials as soon as possible and contact
                      MakaoHub Support.
                    </p>

                    <p className="mt-2">
                      Do not share your password, verification codes, or other
                      account-security information with another person.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Payments */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
                  Payments &amp; Subscriptions
                </h3>

                <div className="space-y-5">
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Does MakaoHub collect rent or rental deposits?
                    </h4>

                    <p className="mt-1 font-semibold text-black dark:text-white">No.</p>

                    <p className="mt-2">
                      MakaoHub does not collect or process rent, rental deposits, booking
                      deposits, or other property-related payments between property seekers
                      and property listers.
                    </p>

                    <p className="mt-2">
                      Any such arrangements are made independently between the relevant
                      users.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Does MakaoHub offer paid services?
                    </h4>

                    <p className="mt-1">
                      MakaoHub may offer subscription plans, featured listings, promotional
                      features, or other premium services.
                    </p>

                    <p className="mt-2">
                      Available services, prices, and payment information will be shown to
                      the user before a purchase is completed.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Does paying for a MakaoHub service guarantee that my property will be
                      rented?
                    </h4>

                    <p className="mt-1 font-semibold text-black dark:text-white">No.</p>

                    <p className="mt-2">
                      Paid MakaoHub services may provide additional features or visibility,
                      but they do not guarantee enquiries, tenants, rental income, or any
                      particular result.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Safety */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
                  Safety
                </h3>

                <div className="space-y-5">
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Should I send money before viewing a property?
                    </h4>

                    <p className="mt-1">
                      Property seekers should exercise caution before transferring money to
                      another person.
                    </p>

                    <p className="mt-2">
                      Where possible, independently confirm important property and lister
                      information before entering into a rental agreement or making
                      property-related payments.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Does MakaoHub guarantee property owners or listers?
                    </h4>

                    <p className="mt-1 font-semibold text-black dark:text-white">No.</p>

                    <p className="mt-2">
                      MakaoHub may moderate property listings, but publication or approval
                      of a listing does not guarantee ownership, identity, property
                      condition, vacancy, or the accuracy of every statement made by a
                      property lister.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      What should I do if something looks suspicious?
                    </h4>

                    <p className="mt-1">
                      Do not proceed with a transaction you are uncomfortable with.
                    </p>

                    <p className="mt-2">
                      Where available, use MakaoHub&apos;s reporting tools and provide
                      enough information to help us review the issue.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Privacy and Legal */}
              <section>
                <h3 className="mb-4 text-lg font-bold text-black dark:text-white">
                  Privacy &amp; Legal
                </h3>

                <div className="space-y-5">
                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Where can I read MakaoHub&apos;s Privacy Policy?
                    </h4>

                    <p className="mt-1">
                      The full MakaoHub{' '}
                      <a
                        href="/privacy"
                        className="font-semibold text-black underline underline-offset-4 dark:text-white"
                      >
                        Privacy Policy
                      </a>{' '}
                      is available within our applications.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      Where can I read the Terms of Service?
                    </h4>

                    <p className="mt-1">
                      The full MakaoHub{' '}
                      <a
                        href="/terms"
                        className="font-semibold text-black underline underline-offset-4 dark:text-white"
                      >
                        Terms of Service
                      </a>{' '}
                      are available within our applications.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-black dark:text-white">
                      How is my information used?
                    </h4>

                    <p className="mt-1">
                      MakaoHub collects and processes information necessary to provide
                      accounts, property listings, enquiries, reviews, maps, notifications,
                      subscriptions, security, support, and other application features.
                    </p>

                    <p className="mt-2">
                      For more information, please read the MakaoHub Privacy Policy.
                    </p>
                  </div>
                </div>
              </section>

              <hr className="border-neutral-200 dark:border-neutral-800" />

              {/* Support */}
              <section>
                <h3 className="mb-3 text-lg font-bold text-black dark:text-white">
                  Still Need Help?
                </h3>

                <p>
                  If you cannot find the answer you are looking for, contact{' '}
                  <strong className="text-black dark:text-white">
                    MakaoHub Support
                  </strong>{' '}
                  through the official support options provided within our applications.
                </p>

                <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-[#111111]">
                  <p className="font-semibold text-black dark:text-white">
                    MakaoHub
                  </p>
                  <p>Developed and operated by SHEN Studios</p>
                  <p>Nakuru, Kenya</p>
                </div>
              </section>
            </div>

          )}
          {activeModal === 'contact' && (
            <div className="space-y-4">
              <p>
                Have questions or need assistance with finding or listing a rental home?
              </p>
              <div className="space-y-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-3 text-xs">
                  <Mail className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
                  <span>Support messages can be submitted directly through your active user enquiries.</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-neutral-700 dark:text-neutral-300 shrink-0" />
                  <span>Our support team actively monitors listing verification and user feedback.</span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 text-center pt-2">
                Contact information and automated ticketing integration will be available here.
              </p>
            </div>
          )}

          {activeModal === 'about' && (
            <div className="space-y-3">
              <p className="font-medium text-neutral-900 dark:text-white">
                Finding a home or filling a vacancy shouldn’t be a complicated process.
              </p>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                MakaoHub connects property seekers with landlords, caretakers, agents and property managers across Kenya. Seekers can discover available homes, compare prices and move-in costs, check vacancies, explore locations and contact listers directly. Property listers can showcase their rentals, manage vacancies and connect with genuinely interested tenants from one place.
              </p>
              <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                  <span>Discover & Compare Rental Homes</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                  <span>List Properties & Manage Vacancies</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-neutral-900 dark:text-white">
                  <CheckCircle2 className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
                  <span>Direct Enquiries, Calls, WhatsApp & Reviews</span>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'privacy' && (
            <div className="space-y-3 text-xs sm:text-sm">
              <p className="font-semibold text-neutral-900 dark:text-white">
                MakaoHub Privacy Policy
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                We value your privacy and are committed to safeguarding personal information collected when you browse, save listings, or enquire about properties on MakaoHub.
              </p>
              <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                <p>• <strong>Location Data:</strong> Used strictly to present properties near you when location permissions are granted.</p>
                <p>• <strong>Contact Details:</strong> Shared with property listers only when you explicitly submit an enquiry for a listing.</p>
                <p>• <strong>Preferences:</strong> Theme choices and saved properties are stored locally for seamless browsing.</p>
              </div>
            </div>
          )}

          {activeModal === 'terms' && (
            <div className="space-y-3 text-xs sm:text-sm">
              <p className="font-semibold text-neutral-900 dark:text-white">
                MakaoHub Terms of Service
              </p>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                By accessing or using MakaoHub, you agree to comply with our platform terms and community guidelines.
              </p>
              <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                <p>• <strong>Accuracy:</strong> Listers must provide accurate monthly rent, deposit figures, and real vacancy numbers.</p>
                <p>• <strong>Safety:</strong> Seekers should verify properties in person before making off-platform financial commitments.</p>
                <p>• <strong>Conduct:</strong> Spam, fraudulent listings, and harassment are strictly prohibited.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
