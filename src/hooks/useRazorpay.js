/**
 * useRazorpay — triggers the Razorpay checkout popup.
 * Usage:
 *   const pay = useRazorpay();
 *   pay({ amount: 5000, loanTitle: 'Home Loan', onSuccess: (txnId) => {} });
 *
 * To use in production, replace RAZORPAY_KEY_ID with your live key from
 * https://dashboard.razorpay.com/app/keys
 */

const RAZORPAY_KEY_ID = 'rzp_live_RQuwNOxotGRMaW';

const useRazorpay = () => {
  const openPayment = ({ amount, loanTitle, userName, userEmail, onSuccess, onFailure }) => {
    if (!window.Razorpay) {
      alert('Payment gateway not loaded. Please check your internet connection.');
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      name: 'DebtFlow',
      description: `Repayment: ${loanTitle}`,
      image: '', // optional logo URL
      prefill: {
        name: userName || '',
        email: userEmail || '',
      },
      theme: {
        color: '#8b5cf6',
      },
      modal: {
        ondismiss: () => {
          if (onFailure) onFailure('Payment cancelled by user.');
        },
      },
      handler: (response) => {
        // response.razorpay_payment_id is the confirmed transaction ID
        if (onSuccess) onSuccess(response.razorpay_payment_id);
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      if (onFailure) onFailure(response.error.description);
    });
    rzp.open();
  };

  return openPayment;
};

export default useRazorpay;
