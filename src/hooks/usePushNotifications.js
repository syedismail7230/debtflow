/**
 * usePushNotifications
 * Requests browser notification permission and fires alerts for overdue/due-soon loans.
 * No backend required — uses the browser Notification API.
 */

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
};

export const sendBrowserNotification = (title, body, icon = '/vite.svg') => {
  if (Notification.permission !== 'granted') return;
  new Notification(title, { body, icon });
};

export const checkAndNotifyOverdueLoans = (loans, currencySymbol = '₹') => {
  if (Notification.permission !== 'granted') return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  loans.forEach(loan => {
    if (loan.amount <= 0) return;
    const dueDateStr = loan.lastDateToClear || loan.dateOfPayment;
    if (!dueDateStr) return;
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      sendBrowserNotification(
        `⚠️ Overdue: ${loan.title}`,
        `${currencySymbol}${loan.amount.toLocaleString()} is overdue by ${Math.abs(daysLeft)} day(s). Pay now on DebtFlow.`
      );
    } else if (daysLeft <= 3) {
      sendBrowserNotification(
        `🔔 Due Soon: ${loan.title}`,
        `${currencySymbol}${loan.amount.toLocaleString()} is due in ${daysLeft} day(s). Don't miss it!`
      );
    }
  });
};
