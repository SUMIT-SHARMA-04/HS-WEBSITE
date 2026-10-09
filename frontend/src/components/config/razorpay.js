// The Key ID is Razorpay's PUBLIC identifier — safe to ship in frontend
// code (unlike the Key Secret, which must only ever live on the backend).
// Leave VITE_RAZORPAY_KEY_ID unset and the app falls back to the existing
// "pay at the counter" flow untouched.
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || null;
