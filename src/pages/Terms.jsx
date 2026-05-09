import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
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
        <h1 style={{ color: 'white', fontSize: '1.1rem', fontWeight: '800' }}>Terms & Conditions</h1>
      </div>

      <div style={{ padding: '24px', maxWidth: '680px', margin: '0 auto', color: 'rgba(255,255,255,0.75)', fontSize: '14px', lineHeight: '1.8' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '24px' }}>Effective Date: {EFFECTIVE_DATE}</p>

        {[
          {
            title: '1. Acceptance of Terms',
            body: `By downloading, accessing, or using the ${APP_NAME} application ("App"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the App.`
          },
          {
            title: '2. Description of Service',
            body: `${APP_NAME} is a personal debt management application that helps users track loans, schedule EMI payments, and manage repayments. The App does not process real financial transactions between users — all payment processing is handled by Razorpay, a PCI-DSS compliant payment gateway.`
          },
          {
            title: '3. Subscription & Free Trial',
            body: `${APP_NAME} offers a 30-day free trial upon account creation. After the trial period, continued access requires an active subscription at ₹100 per month. Subscriptions auto-renew monthly unless cancelled. You may cancel at any time through the App's settings or by contacting us at ${CONTACT_EMAIL}. No refunds are provided for partial months.`
          },
          {
            title: '4. User Accounts',
            body: `You are responsible for maintaining the confidentiality of your account credentials. You must be at least 13 years of age to use this App. You agree to provide accurate and current information during registration. We reserve the right to suspend accounts that violate these terms.`
          },
          {
            title: '5. Payments & Billing',
            body: `All subscription payments are processed through Razorpay. ${APP_NAME} does not store your card or payment information. Subscription fees are non-refundable except where required by law. In case of a payment dispute, contact us within 7 days at ${CONTACT_EMAIL}.`
          },
          {
            title: '6. User Data & Privacy',
            body: `Your financial data (loan records, transaction history) is stored securely in Google Firebase Firestore. We do not sell or share your personal data with third parties except as required by law or to operate the service (e.g., payment processing). Refer to our Privacy Policy for full details.`
          },
          {
            title: '7. Prohibited Activities',
            body: `You agree not to: (a) use the App for any illegal purpose; (b) attempt to access other users' accounts; (c) reverse-engineer, decompile, or disassemble any part of the App; (d) use automated tools to scrape or extract data; (e) upload malicious content or malware.`
          },
          {
            title: '8. Disclaimer of Warranties',
            body: `${APP_NAME} is provided "as is" without warranties of any kind, express or implied. We do not guarantee that the App will be error-free, uninterrupted, or free from harmful components. Financial decisions made based on App data are the sole responsibility of the user.`
          },
          {
            title: '9. Limitation of Liability',
            body: `To the maximum extent permitted by law, ${APP_NAME} and its developers shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the App, including data loss, financial loss, or business interruption.`
          },
          {
            title: '10. Termination',
            body: `We reserve the right to terminate or suspend your account at any time for violation of these Terms. Upon termination, your right to use the App ceases immediately. Provisions that by their nature should survive termination shall survive.`
          },
          {
            title: '11. Changes to Terms',
            body: `We may update these Terms at any time. Continued use of the App after changes constitutes acceptance of the new Terms. We will notify you of significant changes via the App or by email.`
          },
          {
            title: '12. Governing Law',
            body: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts located in India.`
          },
          {
            title: '13. Contact Us',
            body: `For questions about these Terms, contact us at: ${CONTACT_EMAIL}`
          },
        ].map(({ title, body }) => (
          <div key={title} style={{ marginBottom: '28px' }}>
            <h2 style={{ color: 'white', fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>{title}</h2>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Terms;
