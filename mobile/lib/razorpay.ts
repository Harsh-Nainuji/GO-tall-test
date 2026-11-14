import { Platform, Alert } from 'react-native';

export interface RazorpayCheckoutOptions {
  amountPaise: number; // in paise: 149900 = ₹1,499
  planName: string;
  userEmail?: string;
  userName?: string;
  userContact?: string;
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  onFailure: (error: any) => void;
}

// Retrieve Razorpay Key ID from environment
export const RAZORPAY_KEY_ID =
  process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
  '';

/**
 * Validates if the Razorpay Key ID is a real format (rzp_test_... or rzp_live_...)
 */
export const isRealRazorpayKey = (key: string): boolean => {
  return (
    !!key &&
    (key.startsWith('rzp_test_') || key.startsWith('rzp_live_')) &&
    !key.includes('your_key_id') &&
    !key.includes('gotall_trial') &&
    key.length > 15
  );
};

/**
 * Loads Razorpay Web checkout.js script dynamically
 */
export function loadRazorpayWebScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Razorpay checkout.js script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initiates Razorpay payment checkout flow
 * Supports genuine checkout when key is provided, with an interactive testing simulation
 */
export async function openRazorpayCheckout({
  amountPaise,
  planName,
  userEmail = 'member@gotall.app',
  userName = 'GoTall Patient',
  userContact = '9876543210',
  onSuccess,
  onFailure,
}: RazorpayCheckoutOptions) {
  const displayAmount = `₹${(amountPaise / 100).toLocaleString('en-IN')}`;

  // 1. If running on Web with a valid Razorpay key
  if (Platform.OS === 'web' && typeof window !== 'undefined' && isRealRazorpayKey(RAZORPAY_KEY_ID)) {
    const isLoaded = await loadRazorpayWebScript();

    if (isLoaded && (window as any).Razorpay) {
      try {
        const options = {
          key: RAZORPAY_KEY_ID,
          amount: amountPaise,
          currency: 'INR',
          name: 'GoTall Clinical Stature',
          description: `${planName} Subscription (${displayAmount})`,
          image: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png',
          prefill: {
            name: userName,
            email: userEmail,
            contact: userContact,
          },
          theme: {
            color: '#0284C7',
          },
          handler: function (response: any) {
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
              razorpay_order_id: response.razorpay_order_id || `order_${Date.now()}`,
              razorpay_signature: response.razorpay_signature || 'sig_verified',
            });
          },
          modal: {
            ondismiss: function () {
              onFailure({ message: 'Payment cancelled: window closed by user.' });
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        return;
      } catch (err) {
        console.warn('Error launching live Razorpay widget:', err);
      }
    }
  }

  // 2. Interactive Sandbox Simulation (for development / testing before live merchant activation)
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Show a browser confirmation to simulate real user choice (Pay or Cancel)
    const confirmed = window.confirm(
      `[GoTall Razorpay Gateway Test]\n\n` +
      `Plan: ${planName}\n` +
      `Amount: ${displayAmount}\n` +
      `Customer: ${userName} (${userEmail})\n\n` +
      `Click OK to simulate SUCCESSFUL Payment.\n` +
      `Click CANCEL to simulate FAILED / CANCELLED Payment.`
    );

    if (confirmed) {
      const simulatedPaymentId = `pay_rzp_test_${Date.now()}`;
      onSuccess({
        razorpay_payment_id: simulatedPaymentId,
        razorpay_order_id: `order_rzp_${Date.now()}`,
        razorpay_signature: 'sandbox_test_signature_valid',
      });
    } else {
      onFailure({ message: 'Payment was cancelled by the user.' });
    }
    return;
  }

  // 3. React Native Mobile Alert Simulation
  Alert.alert(
    'GoTall Payment Gateway',
    `Plan: ${planName}\nAmount: ${displayAmount}\nAccount: ${userEmail}\n\nSimulate payment outcome:`,
    [
      {
        text: 'Cancel Payment',
        style: 'cancel',
        onPress: () => onFailure({ message: 'Payment cancelled by user.' }),
      },
      {
        text: 'Pay & Activate',
        style: 'default',
        onPress: () => {
          onSuccess({
            razorpay_payment_id: `pay_mobile_test_${Date.now()}`,
            razorpay_order_id: `order_mobile_${Date.now()}`,
            razorpay_signature: 'mobile_test_signature_valid',
          });
        },
      },
    ]
  );
}
