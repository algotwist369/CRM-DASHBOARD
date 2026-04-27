import React, { useEffect } from 'react';
import SEO from '../../../components/common/SEO';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0a0a0a]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title="Privacy Policy & Terms - SpaAdvisor"
        description="Terms and Conditions and Privacy Policy for SpaAdvisor.in - India's trusted spa discovery & booking marketplace."
      />

      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-base text-[#0a0a0a] font-medium py-4"> 
            Terms & Privacy Policy
          </h1>
          <p className="text-base text-[#0a0a0a]">
            Last Updated: 24 April 2026
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="text-[#0a0a0a]">
          <p className="text-base text-[#0a0a0a]">
            Welcome to SpaAdvisor.in (hereinafter referred to as "SpaAdvisor", "we", "us", or "our").
          </p>
          <p className="text-base">
            By accessing or using our website, mobile application(pending), or any related services (collectively the "Platform"), you agree to be bound by these Terms and Conditions ("Terms") and our Privacy Policy. If you do not agree, please do not use the Platform.
          </p>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">1. Introduction & Acceptance of Terms</h2>
            <div className="text-base">
              <p>
                SpaAdvisor is India's trusted spa discovery & booking marketplace that connects users with verified spa, massage, and wellness centres across India. We operate as an online aggregator and intermediary only.
              </p>
              <p>
                These Terms constitute a legally binding agreement between you and SpaAdvisor. We may update these Terms from time to time; continued use of the Platform constitutes acceptance of the revised Terms.
              </p>
            </div>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">2. User Eligibility & Account Responsibilities</h2>
            <ul className="list-disc pl-6 text-base">
              <li>You must be at least 18 years of age and a resident of India to use the Platform.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.</li>
              <li>You agree to provide accurate, complete, and up-to-date information (name, phone number, email, location).</li>
              <li>One person may maintain only one account unless expressly permitted by us.</li>
              <li>We reserve the right to suspend or terminate accounts for any violation of these Terms.</li>
            </ul>
            <p className="text-base">Account Security: Notify us immediately of any unauthorised use of your account.</p>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">3. Platform Role - We Are an Aggregator Only</h2>
            <div>
              <h3 className="text-base text-[#0a0a0a] uppercase tracking-tight">IMPORTANT DISCLAIMER:</h3>
              <p className="text-[#0a0a0a] text-base">
                SpaAdvisor is NOT a spa operator or service provider. We act solely as a technology platform that:
              </p>
              <ul className="list-disc pl-6 text-[#0a0a0a] text-base">
                <li>Lists verified spas and wellness centres</li>
                <li>Facilitates discovery, search, and instant booking</li>
                <li>Processes payments and manages schedules</li>
              </ul>
            </div>
            <p className="text-base">
              All spa services are provided directly by independent third-party spas ("Service Providers"). SpaAdvisor has no control over the quality, safety, or execution of the actual services. Any contract for services is formed directly between you and the Service Provider.
            </p>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">4. Spa Discovery, Listings & Booking System</h2>
            <ul className="list-disc pl-6 text-base">
              <li>Discovery: Search by location, service type (Thai massage, Swedish, deep tissue, couples massage, facials, Ayurvedic therapies, etc.), price, ratings, and availability.</li>
              <li>Verified Listings: We verify spas through documentation and periodic checks, but we do not guarantee 100% accuracy or ongoing compliance.</li>
              <li>Booking Process:
                <ul className="list-disc pl-6">
                  <li>Select spa → service → date & time slot</li>
                  <li>Review details and pricing</li>
                  <li>Make payment (where applicable)</li>
                  <li>Receive instant confirmation via SMS/email/WhatsApp or push notification</li>
                </ul>
              </li>
            </ul>
            <p className="text-base">
              Advance booking is generally allowed up to 20 days (subject to spa policy). Minimum slot duration is displayed on each listing.
            </p>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">5. Membership Purchase System</h2>
            <p className="text-base">
              SpaAdvisor offers various Spa Membership Plans that provide discounted rates, priority booking, bundled services, exclusive deals, and other benefits at partner spas across India.
            </p>

            <div className="mt-4">
              <h3 className="text-base text-[#0a0a0a]">CRITICAL NOTICE – MEMBERSHIP TERMS</h3>
              <p className="text-[#0a0a0a] text-base"> ALL MEMBERSHIP PAYMENTS ARE STRICTLY NON-REFUNDABLE</p>
              <p className="text-[#0a0a0a] text-base">“सदस्यता शुल्क वापसी योग्य नहीं है”</p>
              <p className="text-base mt-2">By purchasing any membership plan, you explicitly agree to the following terms:</p>
              <ul className="list-disc pl-6 text-[#0a0a0a] text-base mt-2">
                <li><span className="font-medium">Non-Refundable Policy:</span> Once purchased, membership fees cannot be refunded, cancelled, transferred, or converted into cash or any other form of credit under any circumstances, including change of mind, relocation, dissatisfaction with services, or unused benefits.</li>
                <li><span className="font-medium">Redeemable Only:</span> Memberships and any credits/benefits are valid only for redeeming spa services at SpaAdvisor’s partner centres listed on the Platform. They cannot be encashed, transferred to another person, or used for any other purpose.</li>
                <li><span className="font-medium">Validity Period:</span> All memberships are valid for a maximum of 12 months from the date of purchase unless a different validity period is clearly mentioned at the time of purchase. Unused credits, services, or benefits automatically expire at the end of the validity period with no carry-forward or extension.</li>
                <li><span className="font-medium">Non-Transferable:</span> Memberships are strictly non-transferable and can only be used by the registered account holder.</li>
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="text-base text-[#0a0a0a]">SpaAdvisor’s Right to Modify Membership Policy</h3>
              <p className="text-base">
                SpaAdvisor reserves the absolute right to modify, amend, suspend, withdraw, or terminate any membership plan, benefits, pricing, terms, or conditions at any time, with or without notice to members.
              </p>
              <p className="text-base mt-2">
                Any such changes will be effective immediately upon posting on the Platform or via email/SMS notification (where feasible). Continued use of the membership after such changes constitutes your acceptance of the revised terms.
              </p>
              <p className="text-base mt-2">
                SpaAdvisor shall not be liable for any loss, inconvenience, or damage suffered by members due to any modification, suspension, or discontinuation of membership plans or benefits.
              </p>
              <p className="text-base mt-2">We may, at our sole discretion:</p>
              <ul className="list-disc pl-6 text-[#0a0a0a] text-base">
                <li>Change discount percentages, available services, partner spas, or redemption rules</li>
                <li>Introduce new restrictions, blackout dates, or minimum spend requirements</li>
                <li>Limit the number of redemptions per member</li>
                <li>Modify or cancel any promotional offers associated with memberships</li>
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="text-base text-[#0a0a0a]">Additional Important Terms</h3>
              <ul className="list-disc pl-6 text-[#0a0a0a] text-base">
                <li>Membership benefits are subject to availability at partner spas and their individual policies. SpaAdvisor does not guarantee service availability at all times.</li>
                <li>Repeated no-shows, cancellations, or misuse of membership may result in suspension or permanent termination of the membership without refund.</li>
                <li>SpaAdvisor reserves the right to refuse membership purchase or redemption to any user at its sole discretion.</li>
                <li>All membership purchases are final and binding.</li>
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="text-base text-[#0a0a0a]"> STRONG WARNING</h3>
              <ul className="list-disc pl-6 text-[#0a0a0a] text-base">
                <li>MEMBERSHIP FEES ARE STRICTLY NON-REFUNDABLE</li>
                <li>Services can ONLY be redeemed – they cannot be converted to cash, refunded, or transferred.</li>
                <li>SpaAdvisor may change membership rules, benefits, or validity at any time without prior notice.</li>
              </ul>
            </div>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">6. Payments, Pricing & Billing</h2>
            <ul className="list-disc pl-6 text-base">
              <li>All prices displayed are inclusive of applicable taxes unless stated otherwise.</li>
              <li>Payments are processed securely through third-party payment gateways (Razorpay, PhonePe, UPI, cards, etc.).</li>
              <li>We reserve the right to correct pricing errors and cancel bookings made at incorrect prices.</li>
              <li>You authorise us to charge your chosen payment method for memberships, bookings, and any additional fees.</li>
            </ul>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">7. Booking, Cancellation, Rescheduling & No-Show Policy</h2>
            <div>
              <div>
                <h3 className="text-base text-[#0a0a0a]">Booking Appointments</h3>
                <ul className="list-disc pl-6 text-base">
                  <li>All bookings are confirmed only after successful payment (where required).</li>
                  <li>You will receive a digital voucher/QR code that must be presented at the spa.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-base text-[#0a0a0a]">Cancellation & Rescheduling Rules</h3>
                <ul className="list-disc pl-6 text-base">
                  <li>Cancellations must be made at least 10 hours before the scheduled appointment (exact window shown on each booking).</li>
                  <li>Cancellations within 10 hours or no-shows will result in forfeiture of the booking amount (no refund).</li>
                  <li>Rescheduling is allowed up to 10 hours before the appointment, subject to slot availability.</li>
                  <li>Missed Appointments / No-Show: The full amount is non-refundable. Repeated no-shows may lead to account suspension or blacklisting.</li>
                </ul>
              </div>
            </div>
            <p className="text-base">
              Membership Redemptions follow the same rules unless the specific membership plan states otherwise.
            </p>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">8. User Conduct & Prohibited Activities</h2>
            <p className="text-base">You agree not to:</p>
            <ul className="list-disc pl-6 text-base">
              <li>Misuse the Platform for fraudulent bookings or spam</li>
              <li>Post fake reviews or defamatory content</li>
              <li>Attempt to circumvent our payment or booking systems</li>
              <li>Use the Platform for any illegal or unauthorised purpose</li>
              <li>Harass spa staff or other users</li>
            </ul>
            <p className="text-base">
              We reserve the right to remove content, suspend accounts, and report violations to authorities.
            </p>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">9. Intellectual Property</h2>
            <div className="text-base">
              <p>
                All content on the Platform (logos, text, images, design, software) is owned by SpaAdvisor or its licensors. You are granted a limited, non-exclusive, revocable licence to use the Platform for personal, non-commercial purposes.
              </p>
              <p>
                You retain ownership of reviews you post, but grant us a perpetual, royalty-free licence to use them.
              </p>
            </div>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">10. Limitation of Liability</h2>
            <div className="text-base">
              <p className="text-[#0a0a0a] uppercase tracking-tight">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
              <p>SpaAdvisor is not liable for any direct, indirect, incidental, or consequential damages arising from:</p>
              <ul className="list-disc pl-6">
                <li>Spa service quality, injury, or dissatisfaction</li>
                <li>Cancellation or unavailability of services</li>
                <li>Technical glitches, payment failures, or third-party actions</li>
              </ul>
              <p>
                Our total liability shall not exceed the amount paid by you in the last 12 months for the specific service in question.
              </p>
              <p>
                We do not guarantee uninterrupted access or error-free operation of the Platform.
              </p>
            </div>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">11. Dispute Resolution & Governing Law</h2>
            <div className="text-base">
              <div>
                <h3 className="text-base text-[#0a0a0a]">Governing Law</h3>
                <p>
                  These Terms and Conditions, Privacy Policy, and any disputes arising out of or in connection with your use of the Platform shall be governed by and construed in accordance with the laws of India.
                </p>
              </div>
              <div>
                <h3 className="text-base text-[#0a0a0a]">Exclusive Jurisdiction</h3>
                <p>
                  IMPORTANT – JURISDICTION CLAUSE
                </p>
                <p>
                  By using SpaAdvisor.in, you expressly agree that:
                </p>
                <ul className="list-disc pl-6">
                  <li>In the event of any dispute, claim, controversy, or legal proceeding arising out of or relating to these Terms, your use of the Platform, any booking, membership, or transaction, the courts at Mumbai, Maharashtra shall have exclusive jurisdiction.</li>
                  <li>You hereby irrevocably submit to the exclusive jurisdiction of the courts located in Mumbai, Maharashtra and waive any objection to such jurisdiction or venue.</li>
                  <li>You agree not to initiate any legal action or proceeding against SpaAdvisor in any court other than the courts in Mumbai. Any such action filed elsewhere shall be considered null and void, and SpaAdvisor reserves the right to contest jurisdiction and seek appropriate remedies including costs and damages.</li>
                  <li>This clause survives termination of your account or these Terms.</li>
                </ul>
                <p>
                   All disputes must be resolved exclusively in Mumbai courts only. This provision is designed to provide certainty and operational protection to the company.
                </p>
              </div>
              <div>
                <h3 className="text-base text-[#0a0a0a]">Dispute Resolution Process</h3>
                <ul className="list-disc pl-6">
                  <li>Amicable Resolution: Any complaint or dispute must first be reported to us at support@spaadvisor.in. We will endeavour to resolve it within 30 days.</li>
                  <li>Arbitration (Optional): At SpaAdvisor’s sole discretion, disputes may be referred to arbitration under the Arbitration and Conciliation Act, 1996, seated in Mumbai, before a single arbitrator appointed by SpaAdvisor.</li>
                  <li>Court Proceedings: If arbitration is not chosen or not successful, only the courts in Mumbai shall have jurisdiction.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">12. Termination</h2>
            <p className="text-base">
              We may terminate or suspend your account at any time, with or without notice, for violation of these Terms. You may terminate your account by contacting support; however, memberships already purchased remain non-refundable.
            </p>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">13. Miscellaneous</h2>
            <ul className="list-disc pl-6 text-base">
              <li>These Terms constitute the entire agreement between you and SpaAdvisor.</li>
              <li>If any provision is held invalid, the remainder remains in full force.</li>
              <li>No waiver of any breach shall constitute a waiver of any other breach.</li>
            </ul>
          </section>

          <div className="text-base text-[#0a0a0a] py-3">
             Exclusive Jurisdiction: All legal disputes shall be subject to the exclusive jurisdiction of the Courts in Mumbai, Maharashtra only.
          </div>

          <section className="py-3">
            <h1 className="text-base text-[#0a0a0a]">Privacy Policy</h1>
            <p className="text-base text-[#0a0a0a]">Effective Date: 24 April 2026</p>
            <p className="text-base">
              At SpaAdvisor, we respect your privacy and are committed to protecting your personal data in compliance with the Digital Personal Data Protection Act, 2023 and other applicable Indian laws.
            </p>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">14. Information We Collect</h2>
            <div className="text-base">
              <p>We collect the following types of information:</p>
              <ul className="list-disc pl-6">
                <li>Personal Information: Name, phone number, email address, date of birth, gender, and location details.</li>
                <li>Payment Information: Payment method details and transaction history (processed via secure third-party gateways).</li>
                <li>Health & Wellness Preferences: Service preferences, health conditions (if voluntarily disclosed), and booking history.</li>
                <li>Device & Usage Data: IP address, device identifiers, browser type, and browsing behavior on our Platform.</li>
                <li>Communications: Records of your interactions with our support team, including chat, email, and call logs.</li>
              </ul>
            </div>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">15. How We Use Your Information</h2>
            <div className="text-base">
              <p>We use your information to:</p>
              <ul className="list-disc pl-6">
                <li>Process bookings, payments, and memberships</li>
                <li>Send confirmations, reminders, and promotional communications (with your consent)</li>
                <li>Improve our Platform and personalise your experience</li>
                <li>Comply with legal obligations and protect our rights</li>
                <li>Detect and prevent fraud, spam, or misuse</li>
              </ul>
            </div>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">16. Data Sharing & Third Parties</h2>
            <div className="text-base">
              <p>We may share your data with:</p>
              <ul className="list-disc pl-6">
                <li>Service Providers: Partner spas to facilitate your bookings.</li>
                <li>Payment Gateways: For secure payment processing.</li>
                <li>Legal Authorities: When required by law or to protect our legal interests.</li>
              </ul>
              <p>We do not sell your personal data to third parties.</p>
            </div>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">17. Data Security</h2>
            <p className="text-base">
              We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">18. Your Rights</h2>
            <p className="text-base">Under the Digital Personal Data Protection Act, 2023, you have the right to:</p>
            <ul className="list-disc pl-6 text-base">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request erasure of your data</li>
              <li>Raise grievances with our Data Protection Officer</li>
            </ul>
            <p className="text-base">
              To exercise these rights, contact us at <a href="mailto:support@spaadvisor.in" className="text-[#0a0a0a] underline hover:text-gray-600">support@spaadvisor.in</a>.
            </p>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">19. Cookies & Tracking</h2>
            <p className="text-base">
              We use cookies to enhance your browsing experience. You can manage your cookie preferences through your browser settings. Disabling cookies may affect some functionality of our Platform.
            </p>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">20. Children's Privacy</h2>
            <p className="text-base">
              Our Platform is not intended for individuals under 18 years of age. We do not knowingly collect data from minors.
            </p>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">21. Changes to This Policy</h2>
            <p className="text-base">
              We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised "Last Updated" date. Continued use of our Platform after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="py-3">
            <h2 className="text-base text-[#0a0a0a]">22. Contact Us</h2>
            <div className="text-base">
              <p>If you have questions, concerns, or grievances regarding this Privacy Policy or our data practices, please contact us:</p>
              <p>
                Email: <a href="mailto:support@spaadvisor.in" className="text-[#0a0a0a] underline hover:text-gray-600">support@spaadvisor.in</a><br />
                Address: SpaAdvisor, Mumbai, Maharashtra, India
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
