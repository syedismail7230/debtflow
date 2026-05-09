/**
 * EmailJS integration for loan due-date reminder emails.
 * Setup: https://www.emailjs.com
 *
 * Steps to activate:
 * 1. Create account at emailjs.com
 * 2. Add Email Service (Gmail recommended) → get SERVICE_ID
 * 3. Create Email Template with variables:
 *    {{to_email}}, {{user_name}}, {{loan_title}}, {{amount}}, {{due_date}}, {{days_left}}
 * 4. Get your PUBLIC_KEY from Account → API Keys
 * 5. Fill in the constants below
 */

const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // e.g. 'template_xyz456'
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // e.g. 'user_abcDEF123'

export const sendReminderEmail = async ({ toEmail, userName, loanTitle, amount, dueDate, daysLeft, currencySymbol = '₹' }) => {
  if (!window.emailjs) {
    console.warn('EmailJS SDK not loaded');
    return false;
  }
  try {
    await window.emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        to_email: toEmail,
        user_name: userName || 'there',
        loan_title: loanTitle,
        amount: `${currencySymbol}${amount.toLocaleString()}`,
        due_date: dueDate,
        days_left: daysLeft > 0 ? `${daysLeft} days` : 'OVERDUE',
        app_name: 'DebtFlow',
      },
      EMAILJS_PUBLIC_KEY
    );
    return true;
  } catch (err) {
    console.error('EmailJS error:', err);
    return false;
  }
};

export const checkAndSendReminderEmails = async (loans, userEmail, userName, currencySymbol = '₹') => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastSent = localStorage.getItem('debtflow_email_sent_date');
  const todayStr = today.toISOString().split('T')[0];
  // Only send once per day
  if (lastSent === todayStr) return;

  for (const loan of loans) {
    if (loan.amount <= 0) continue;
    const dueDateStr = loan.lastDateToClear || loan.dateOfPayment;
    if (!dueDateStr) continue;
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) {
      await sendReminderEmail({
        toEmail: userEmail,
        userName,
        loanTitle: loan.title,
        amount: loan.amount,
        dueDate: dueDateStr,
        daysLeft,
        currencySymbol
      });
    }
  }
  localStorage.setItem('debtflow_email_sent_date', todayStr);
};
