import { X, Minus, Plus, Loader, CheckCircle2, Clock, ChefHat, CheckSquare, AlertCircle, CreditCard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE = API_BASE.replace(/^http/, 'ws');

// FIXED: Dynamically inject Razorpay script to bypass ad-blockers blocking static scripts
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, clearCart } = useCart();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '', guestName: '' });
  
  const [checkoutStatus, setCheckoutStatus] = useState('idle');
  const [liveOrderId, setLiveOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [liveOrderAmount, setLiveOrderAmount] = useState(0);
  
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const urlParams = new URLSearchParams(window.location.search);
  const roomNumber = urlParams.get('room');
  const isHotelGuest = !!roomNumber;

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  useEffect(() => {
    const savedOrderId = localStorage.getItem('my_active_order');
    const savedAmount = localStorage.getItem('my_active_order_amount');
    
    if (savedOrderId) {
      setLiveOrderId(savedOrderId);
      setLiveOrderAmount(Number(savedAmount) || 0);
      setCheckoutStatus('tracking');
      setIsCartOpen(true);
      
      fetch(`${API_BASE}/orders/${savedOrderId}/status/`)
        .then(res => res.json())
        .then(data => {
          if (data.status) {
            setOrderStatus(data.status);
          } else {
            closeTracker();
          }
        })
        .catch(() => {});
    }
  }, [setIsCartOpen]);

  useEffect(() => {
    let ws;
    if (checkoutStatus === 'tracking' && liveOrderId) {
      ws = new WebSocket(`${WS_BASE}/ws/orders/${liveOrderId}/`);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setOrderStatus(data.status);
      };
    }
    return () => { if (ws) ws.close(); };
  }, [checkoutStatus, liveOrderId]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setCheckoutStatus('loading');

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
        toast.error(data.error || 'Failed to place order');
        setCheckoutStatus('idle');
        return;
      }

      setLiveOrderId(data.order_id);
      setOrderStatus(data.status);
      setLiveOrderAmount(cartTotal);
      setCheckoutStatus('tracking');
      setShowCheckoutForm(false);
      clearCart();
      
      localStorage.setItem('my_active_order', data.order_id);
      localStorage.setItem('my_active_order_amount', cartTotal.toString());
      
      toast.success("Order sent to kitchen! Awaiting confirmation.");

    } catch (error) {
      toast.error('Network error. Please try again.');
      setCheckoutStatus('idle');
    }
  };

  const handlePayment = async () => {
    const isScriptLoaded = await loadRazorpayScript();
    
    if (!isScriptLoaded) {
      toast.error("Payment gateway failed to load. Please check your internet connection.");
      return;
    }

    // CRITICAL: Razorpay will close instantly and look like a "blocked pop-up" if this key is invalid!
    const options = {
      key: "rzp_test_YOUR_KEY_HERE", 
      amount: liveOrderAmount * 100,
      currency: "INR",
      name: "High Spirits Cafe",
      description: `Payment for Order #${liveOrderId}`,
      handler: async function () {
        toast.success("Payment successful! Kitchen is preparing your order.");
        
        try {
          await fetch(`${API_BASE}/orders/${liveOrderId}/status/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Paid & Preparing' })
          });
          setOrderStatus('Paid & Preparing');
        } catch (error) {
          console.error("Failed to update status after payment");
        }
      },
      prefill: { name: customerDetails.name, contact: customerDetails.phone },
      theme: { color: "#D4AF37" }
    };
    
    const rzp = new window.Razorpay(options);
    rzp.open();
    rzp.on('payment.failed', function () {
      toast.error("Payment failed. Please try again.");
    });
  };

  const closeTracker = () => {
    setCheckoutStatus('idle');
    setLiveOrderId(null);
    setOrderStatus('');
    setLiveOrderAmount(0);
    setIsCartOpen(false);
    localStorage.removeItem('my_active_order');
    localStorage.removeItem('my_active_order_amount');
  };

  const trackerSteps = [
    { id: 'Pending', label: 'Order Placed', desc: 'Awaiting restaurant confirmation', icon: Clock },
    { id: 'Accepted', label: 'Order Accepted', desc: 'Please complete payment to begin', icon: CheckSquare },
    { id: 'Paid & Preparing', label: 'Preparing Food', desc: 'Our chefs are cooking your meal', icon: ChefHat },
    { id: 'Completed', label: 'Ready / Delivered', desc: 'Enjoy your meal!', icon: CheckCircle2 }
  ];

  const getStepState = (stepIndex) => {
    const sequence = ['Pending', 'Accepted', 'Paid & Preparing', 'Completed'];
    const currentIndex = sequence.indexOf(orderStatus);
    
    if (orderStatus === 'Rejected') return 'rejected';
    if (currentIndex === stepIndex) return 'current';
    if (currentIndex > stepIndex) return 'completed';
    return 'upcoming';
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-cream-50 z-50 flex flex-col shadow-2xl animate-slide-left border-l border-gold-500/20">
        
        <div className="p-6 bg-brown-950 text-cream-100 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/food.png')] opacity-10"></div>
          <h2 className="font-serif text-2xl font-bold tracking-wide relative z-10">Your Order</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-brown-800 rounded-full transition-colors relative z-10"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar">
          
          {checkoutStatus === 'tracking' ? (
            <div className="py-2 animate-fade-in flex flex-col">
              
              <div className="text-center mb-8">
                <h3 className="font-serif text-3xl text-brown-900 font-bold tracking-tight mb-2">Order #{liveOrderId}</h3>
                <p className="text-sm text-gold-600 font-medium tracking-widest uppercase">Live Status Tracking</p>
              </div>

              {orderStatus === 'Rejected' ? (
                 <div className="bg-red-50 border border-red-200 p-6 rounded-2xl text-center shadow-sm">
                   <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                   <h4 className="text-red-800 font-bold text-lg mb-2">Order Declined</h4>
                   <p className="text-red-600 text-sm">The kitchen is currently unable to accept this order. No payment has been taken.</p>
                 </div>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-[47px] top-6 bottom-12 w-1 bg-cream-200 rounded-full"></div>
                  
                  <div className="absolute left-[47px] top-6 w-1 bg-gold-500 rounded-full transition-all duration-1000 ease-in-out" 
                       style={{ 
                         height: 
                           orderStatus === 'Pending' ? '0%' : 
                           orderStatus === 'Accepted' ? '33%' : 
                           orderStatus === 'Paid & Preparing' ? '66%' : 
                           '100%' 
                       }}>
                  </div>

                  <div className="space-y-10">
                    {trackerSteps.map((step, index) => {
                      const state = getStepState(index);
                      const Icon = step.icon;

                      return (
                        <div key={step.id} className="relative flex items-center gap-6 z-10">
                          <div className={`
                            w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-all duration-700 ease-out border-4 border-cream-50
                            ${state === 'completed' ? 'bg-gold-500 text-white scale-100 shadow-md' : ''}
                            ${state === 'current' ? 'bg-gold-500 text-white shadow-[0_0_20px_rgba(212,175,55,0.6)] ring-4 ring-gold-100 scale-110' : ''}
                            ${state === 'upcoming' ? 'bg-cream-200 text-brown-400 scale-95' : ''}
                          `}>
                            <Icon className={`w-6 h-6 ${state === 'current' ? 'animate-pulse' : ''}`} />
                          </div>

                          <div className={`transition-all duration-500 ${state === 'upcoming' ? 'opacity-40 translate-x-2' : 'opacity-100 translate-x-0'}`}>
                            <h4 className={`font-bold tracking-wide ${state === 'current' ? 'text-gold-700 text-lg' : 'text-brown-900 text-base'}`}>{step.label}</h4>
                            <p className="text-xs text-brown-500 font-medium mt-1">{step.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {orderStatus === 'Accepted' && !isHotelGuest && (
                <div className="mt-10 bg-gold-50 border border-gold-200 p-6 rounded-2xl text-center shadow-md animate-slide-up">
                  <p className="text-brown-900 font-bold mb-2 text-lg">Kitchen Approved!</p>
                  <p className="text-sm text-brown-600 mb-5 leading-relaxed">Your food is ready to be cooked. Please complete your payment to begin preparation.</p>
                  <button onClick={handlePayment} className="w-full btn-gold py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                    <CreditCard className="w-5 h-5" /> Pay ₹{liveOrderAmount} Now
                  </button>
                </div>
              )}
              
              {orderStatus === 'Accepted' && isHotelGuest && (
                <div className="mt-10 bg-green-50 border border-green-200 p-6 rounded-2xl text-center shadow-md animate-slide-up">
                  <p className="text-green-800 font-bold mb-2 text-lg">Order Confirmed!</p>
                  <p className="text-sm text-green-700 leading-relaxed">Your order has been accepted and billed to Room {roomNumber}. The kitchen will begin preparing your food shortly.</p>
                </div>
              )}

              <button onClick={closeTracker} className="mt-10 mx-auto block px-8 py-3 text-brown-500 bg-cream-100 hover:bg-cream-200 rounded-full text-sm font-bold tracking-wide transition-colors">
                Dismiss Tracker
              </button>
            </div>
          ) : cart.length === 0 ? (
            
            <div className="text-center py-20 animate-fade-in">
              <div className="w-24 h-24 bg-cream-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ChefHat className="w-10 h-10 text-brown-300" />
              </div>
              <p className="text-brown-500 font-medium mb-6 text-lg">Your cart is empty.</p>
              <button onClick={() => setIsCartOpen(false)} className="btn-gold px-8 py-3 rounded-full font-bold shadow-md hover:-translate-y-1 transition-all">
                Browse Menu
              </button>
            </div>
          ) : (
            
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center bg-white p-3 rounded-2xl border border-cream-200 shadow-sm hover:shadow-md transition-shadow group">
                  <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h4 className="font-bold text-brown-900 text-sm leading-tight">{item.name}</h4>
                    <p className="text-gold-700 font-black text-sm mt-1">₹{item.price}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-cream-100 text-brown-600 rounded-lg hover:bg-gold-200 transition-colors"><Minus className="w-4 h-4" /></button>
                      <span className="text-sm font-bold w-4 text-center text-brown-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-cream-100 text-brown-600 rounded-lg hover:bg-gold-200 transition-colors"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-cream-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"><X className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && checkoutStatus !== 'tracking' && (
          <div className="border-t border-cream-200 p-6 bg-white space-y-5 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className="flex justify-between items-center font-serif text-2xl font-bold text-brown-900 mb-2">
              <span>Total</span>
              <span className="text-gold-600">₹{cartTotal}</span>
            </div>
            
            {!showCheckoutForm ? (
              <button onClick={() => setShowCheckoutForm(true)} className="w-full btn-gold py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                Proceed to Checkout
              </button>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-3 animate-slide-up">
                {isHotelGuest ? (
                  <>
                    <p className="text-sm text-brown-600 font-bold uppercase tracking-wider mb-2">Room {roomNumber} Folio Verification</p>
                    <input required type="text" placeholder="Enter Guest Full Name" value={customerDetails.guestName || ''} onChange={e => setCustomerDetails({...customerDetails, guestName: e.target.value})} className="w-full px-4 py-4 bg-cream-50 border border-cream-200 rounded-xl text-sm font-medium focus:outline-none focus:border-gold-400 focus:bg-white transition-colors" />
                  </>
                ) : (
                  <>
                    <input required type="text" placeholder="Your Full Name" value={customerDetails.name} onChange={e => setCustomerDetails({...customerDetails, name: e.target.value})} className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-sm font-medium focus:outline-none focus:border-gold-400 focus:bg-white transition-colors" />
                    <input required type="tel" placeholder="Phone Number (for updates)" value={customerDetails.phone} onChange={e => setCustomerDetails({...customerDetails, phone: e.target.value})} className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-sm font-medium focus:outline-none focus:border-gold-400 focus:bg-white transition-colors" />
                  </>
                )}
                <div className="flex gap-3 pt-3">
                  <button type="button" onClick={() => setShowCheckoutForm(false)} className="px-6 py-4 text-brown-500 bg-cream-100 hover:bg-cream-200 rounded-xl text-sm font-bold transition-colors">Back</button>
                  <button type="submit" disabled={checkoutStatus === 'loading'} className="flex-1 btn-gold py-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md hover:shadow-lg transition-all">
                    {checkoutStatus === 'loading' ? <Loader className="w-5 h-5 animate-spin" /> : 'Send to Kitchen'}
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