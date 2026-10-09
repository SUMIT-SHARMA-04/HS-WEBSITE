// Loads Razorpay's checkout widget script on demand (once), instead of
// unconditionally on every page like index.html used to. Returns a promise
// that resolves true/false depending on whether it loaded successfully.
let scriptPromise = null;

export function loadRazorpayScript() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => { scriptPromise = null; resolve(false); };
    document.body.appendChild(script);
  });

  return scriptPromise;
}
