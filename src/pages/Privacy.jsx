import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
  const navigate = useNavigate();
  const APP_NAME = 'DebtFlow';
  const CONTACT_EMAIL = 'support@debtflow.app';
  const EFFECTIVE_DATE = 'May 9, 2025';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '0 0 64px' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: 'var(--bg-main)', zIndex: 10 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '12px', padding: '10px', cursor: 'pointer' }}>
          <ChevronLeft size={20} color="white" />
        </button>
        <h1 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '800' }}>Privacy Policy</h1>
      </div>

      <div style={{ padding: '24px', maxWidth: '680px', margin: '0 auto', color: 'rgba(255,255,255,0.75)', fontSize: '14px', lineHeight: '1.8' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '24px' }}>Effective Date: {EFFECTIVE_DATE}</p>

        {[
          {
            title: '1. Information We Collect',
            body: `When you use ${APP_NAME}, we collect:
• Account Information: Name, email address, and profile photo (from Google or manual signup).
• Financial Data: Loan amounts, vendor names, repayment history, and EMI schedules — entered by you.
• Device Information: Device type, OS version, and browser type (for debugging purposes only).
• Usage Data: App interactions and feature usage to improve the experience.
We do not collect payment card numbers or bank account information — all payments are processed by Razorpay.`
          },
          {
            title: '2. How We Use Your Information',
            body: `We use the information we collect to:
• Provide and maintain the ${APP_NAME} service.
• Process subscription payments via Razorpay.
• Send you push notifications and email reminders about upcoming due dates (only if you opt in).
• Improve the App and troubleshoot issues.
• Comply with legal obligations.`
          },
          {
            title: '3. Data Storage & Security',
            body: `Your data is stored securely on Google Firebase Firestore, which uses industry-standard encryption at rest and in transit. Access is protected by Firebase Authentication. We implement appropriate technical and organizational security measures to protect your data against unauthorized access, alteration, or destruction.`
          },
          {
            title: '4. Third-Party Services',
            body: `We use the following third-party services:
• Google Firebase (Authentication, Firestore Database) — for account management and data storage.
• Razorpay — for payment processing. Razorpay is PCI-DSS Level 1 certified and handles all card data.
• EmailJS (optional) — for sending email reminders, if you enable this feature.
These services have their own privacy policies, and we encourage you to review them.`
          },
          {
            title: '5. Data Sharing',
            body: `We do not sell, trade, or otherwise transfer your personal information to third parties, except:
• To Razorpay for payment processing.
• When required by law, court order, or government authority.
• To protect the rights, property, or safety of ${APP_NAME}, our users, or the public.`
          },
          {
            title: '6. Your Rights (DPDP Act, 2023 — India)',
            body: `Under the Digital Personal Data Protection Act, 2023, you have the right to:
• Access the personal data we hold about you.
• Correct inaccurate or incomplete data.
• Request deletion of your data (available via "Delete Account" in Profile Settings).
• Withdraw consent for data processing at any time.
• Nominate someone to exercise your rights in case of death or incapacity.
To exercise any of these rights, contact us at ${CONTACT_EMAIL}.`
          },
          {
            title: '7. Data Retention',
            body: `We retain your data for as long as your account is active. If you delete your account, we delete all associated data (loans, transactions, user settings) from our servers within 30 days. Anonymized, aggregated usage statistics may be retained indefinitely.`
          },
          {
            title: '8. Children\'s Privacy',
            body: `${APP_NAME} is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will delete it immediately.`
          },
          {
            title: '9. Notifications & Communications',
            body: `We may send you:
• Push notifications (if you grant browser permission) for overdue loan alerts.
• Email reminders for upcoming due dates (only if you enable Email Reminders in settings).
• Transactional emails (e.g., subscription confirmation).
You can opt out of all non-transactional communications at any time in your Profile settings.`
          },
          {
            title: '10. Cookies & Local Storage',
            body: `The App uses browser localStorage to:
• Track whether daily email reminders have been sent (to prevent duplicates).
• Store UI preferences and session state.
We do not use tracking cookies or third-party advertising cookies.`
          },
          {
            title: '11. Changes to This Policy',
            body: `We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy in the App and updating the "Effective Date" above. Continued use of the App after changes constitutes acceptance of the updated policy.`
          },
          {
            title: '12. Contact Us',
            body: `If you have questions or concerns about this Privacy Policy or our data practices, contact us at:\n\n📧 ${CONTACT_EMAIL}\n\nWe respond to all privacy inquiries within 72 hours.`
          },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: '28px' }}>
            <h2 style={{ color: 'white', fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>{title}</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{body}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Privacy;
