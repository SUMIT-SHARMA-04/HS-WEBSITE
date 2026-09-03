import { X, Minus, Plus, Loader, BellRing, Clock, ChefHat, CreditCard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE = API_BASE.replace(/^http/, 'ws');

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '', guestName: '' });
  const [checkoutStatus, setCheckoutStatus] = useState('idle');
  const [liveOrderId, setLiveOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  
  const [finalTotal, setFinalTotal] = useState(0);
  const [autoPayTriggered, setAutoPayTriggered] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const urlParams = new URLSearchParams(window.location.search);
  const roomNumber = urlParams.get('room');
  const isHotelGuest = !!roomNumber;

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  // WEBSOCKET TRACKER
  useEffect(() => {
    let ws;
    if (checkoutStatus === 'tracking' && liveOrderId) {
      ws = new WebSocket(`${WS_BASE}/ws/orders/${liveOrderId}/`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setOrderStatus(data.status);
        if (data.status === 'Prepared' || data.status === 'Rejected') ws.close();
      };
    }
    return () => { if (ws) ws.close(); };
  }, [checkoutStatus, liveOrderId]);

  // RAZORPAY TRIGGER (Fires automatically when Admin accepts order)
  const handlePayment = () => {
    if (!window.Razorpay) return toast.error("Payment gateway failed to load.");
    
    const options = {
      key: "rzp_test_YOUR_KEY_HERE", // Replace with real Razorpay Key
      amount: finalTotal * 100,
      currency: "INR",
      name: "High Spirits Cafe",
      description: "Order Payment",
      handler: async function (response) {
        toast.success("Payment successful! Kitchen is preparing your food.");
        await fetch(`${API_BASE}/orders/${liveOrderId}/status/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'Paid & Preparing' })
        });
        setOrderStatus('Paid & Preparing');
      },
      prefill: { name: customerDetails.name, contact: customerDetails.phone },
      theme: { color: "#D4AF37" }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
    rzp.on('payment.failed', function () {
      toast.error("Payment failed. You can retry from the tracker.");
    });
  };

  // Watch for Admin Acceptance to trigger popup
  useEffect(() => {
    if (orderStatus === 'Accepted' && !isHotelGuest && !autoPayTriggered) {
      setAutoPayTriggered(true);
      handlePayment();
    }
  }, [orderStatus, isHotelGuest, autoPayTriggered]);

  // INITIAL CHECKOUT (Sends to Pending Status)
  const handleCheckout = async (e) => {
    e.preventDefault();
    setCheckoutStatus('loading');
    setFinalTotal(cartTotal); // Save total before clearing cart

    const payload = isHotelGuest ? {
      order_type: 'Hotel', room_number: roomNumber, guest_name: customerDetails.guestName,
      items_json: JSON.stringify(cart), total_amount: cartTotal, idempotency_key: idempotencyKey
    } : {
      order_type: 'Standard', customer_name: customerDetails.name, customer_phone: customerDetails.phone,
      items_json: JSON.stringify(cart), total_amount: cartTotal, idempotency_key: idempotencyKey
    };

    try {
      const response = await fetch(`${API_BASE}/orders/checkout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || 'Checkout failed');
        setCheckoutStatus('idle');
        return;
      }
      
      // Send directly to Tracking screen (Pending State)
      setLiveOrderId(data.order_id);
      setOrderStatus(data.status); 
      setCheckoutStatus('tracking');
      setShowCheckoutForm(false);
      clearCart();
    } catch (error) {
      toast.error('Network error.');
      setCheckoutStatus('idle');
    }
  };

  const getStepStatus = (stepName) => {
    const sequence = ['Pending', 'Accepted', 'Paid & Preparing', 'Prepared'];
    const currentIndex = sequence.indexOf(orderStatus);
    const stepIndex = sequence.indexOf(stepName);
    
    if (orderStatus === 'Rejected') return 'rejected';
    if (currentIndex >= stepIndex) return 'active';
    return 'inactive';
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-cream-50 z-50 flex flex-col shadow-2xl animate-slide-left">
        <div className="p-6 bg-brown-950 text-cream-100 flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold tracking-wide">Your Order</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-brown-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {checkoutStatus === 'tracking' ? (
            <div className="py-6 animate-fade-in flex flex-col items-center">
              <h3 className="font-serif text-2xl text-brown-900 font-bold mb-2">Order #{liveOrderId}</h3>
              <p className="text-sm text-brown-500 mb-8">Tracking Live Status</p>

              {/* VISUAL ORDER TRACKER */}
              <div className="w-full space-y-6 px-4">
                <div className={`flex items-center gap-4 ${getStepStatus('Pending') === 'active' ? 'text-gold-600' : 'text-gray-400'}`}>
                  <Clock className="w-8 h-8" />
                  <div>
                    <p className="font-bold">Order Placed</p>
                    <p className="text-xs">Waiting for restaurant to accept</p>
                  </div>
                </div>
                
                <div className={`flex items-center gap-4 ${getStepStatus('Accepted') === 'active' ? 'text-blue-600' : 'text-gray-400'}`}>
                  <CreditCard className="w-8 h-8" />
                  <div>
                    <p className="font-bold">Order Accepted</p>
                    <p className="text-xs">{isHotelGuest ? 'Charged to room folio' : 'Payment required to start cooking'}</p>
                  </div>
                </div>

                <div className={`flex items-center gap-4 ${getStepStatus('Paid & Preparing') === 'active' ? 'text-orange-500' : 'text-gray-400'}`}>
                  <ChefHat className="w-8 h-8" />
                  <div>
                    <p className="font-bold">Preparing Food</p>
                    <p className="text-xs">Our chefs are cooking your meal</p>
                  </div>
                </div>

                <div className={`flex items-center gap-4 ${getStepStatus('Prepared') === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                  <BellRing className="w-8 h-8" />
                  <div>
                    <p className="font-bold">Ready to Serve</p>
                    <p className="text-xs">Your meal is prepared!</p>
                  </div>
                </div>

                {/* Manual Pay Button if auto-popup was closed */}
                {orderStatus === 'Accepted' && !isHotelGuest && (
                   <button onClick={handlePayment} className="w-full mt-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 animate-pulse shadow-lg">
                      Pay ₹{finalTotal} Now
                   </button>
                )}

                {orderStatus === 'Rejected' && (
                  <div className="p-4 bg-red-100 text-red-700 rounded-lg text-center font-bold mt-4">
                    Order was cancelled by the restaurant.
                  </div>
                )}
              </div>

              <button onClick={() => { setCheckoutStatus('idle'); setIsCartOpen(false); }} className="mt-12 text-brown-500 underline font-medium">Close Tracker</button>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-brown-500 mb-4">Your cart is empty.</p>
              <button onClick={() => setIsCartOpen(false)} className="btn-gold px-6 py-2 rounded-full text-sm font-medium">Browse Menu</button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-cream-200 shadow-sm">
                <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-medium text-brown-900 text-sm leading-tight">{item.name}</h4>
                  <p className="text-gold-700 font-bold text-sm mt-1">₹{item.price}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-cream-100 text-brown-600 rounded hover:bg-gold-200 transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-cream-100 text-brown-600 rounded hover:bg-gold-200 transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-2 text-brown-400 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && checkoutStatus !== 'tracking' && (
          <div className="border-t border-cream-200 p-6 bg-white space-y-4">
            <div className="flex justify-between items-center font-serif text-xl font-bold text-brown-900 mb-4">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
            
            {!showCheckoutForm ? (
              <button onClick={() => setShowCheckoutForm(true)} className="w-full btn-gold py-4 rounded-xl font-medium text-lg transition-all">
                {isHotelGuest ? `Charge to Room ${roomNumber}` : 'Proceed to Checkout'}
              </button>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-3 animate-slide-up">
                {isHotelGuest ? (
                  <>
                    <p className="text-sm text-brown-600 font-medium mb-2">Room {roomNumber} Folio Verification</p>
                    <input required type="text" placeholder="Enter Guest Full Name" value={customerDetails.guestName || ''} onChange={e => setCustomerDetails({...customerDetails, guestName: e.target.value})} className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-gold-400" />
                  </>
                ) : (
                  <>
                    <input required type="text" placeholder="Your Name" value={customerDetails.name} onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})} className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-gold-400" />
                    <input required type="tel" placeholder="Your Phone Number" value={customerDetails.phone} onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})} className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-gold-400" />
                  </>
                )}
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowCheckoutForm(false)} className="px-4 py-3 text-brown-500 bg-cream-100 rounded-xl text-sm font-medium">Back</button>
                  <button type="submit" disabled={checkoutStatus === 'loading'} className="flex-1 btn-gold py-3 rounded-xl font-medium flex justify-center items-center gap-2">
                    {checkoutStatus === 'loading' ? <Loader className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}