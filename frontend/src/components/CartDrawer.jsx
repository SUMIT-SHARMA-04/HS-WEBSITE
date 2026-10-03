import { X, Minus, Plus, Loader, CheckCircle2, Clock, ChefHat, CheckSquare, AlertCircle } from 'lucide-react';
import { useCart } from '@/components/context/CartContext';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import FloatingInput from './FloatingInput';
import useLiveSocket from '@/components/hooks/useLiveSocket';
import { API_BASE, WS_BASE } from '@/components/config/api';
import { VALID_ROOMS } from '@/components/config/rooms';

export default function CartDrawer() {
  const { cart, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen, clearCart, hotelRoom } = useCart();
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '' });
  const [checkoutStatus, setCheckoutStatus] = useState('idle');
  const [liveOrderId, setLiveOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    if (!isCartOpen) return;
    const handleEscape = (e) => { if (e.key === 'Escape') setIsCartOpen(false); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isCartOpen, setIsCartOpen]);

  const roomNumber = hotelRoom;
  const isHotelGuest = !!hotelRoom;
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  useEffect(() => {
    const savedOrderId = localStorage.getItem('my_active_order');
    if (savedOrderId && (!isHotelGuest || VALID_ROOMS.includes(roomNumber))) {
      setLiveOrderId(savedOrderId); setCheckoutStatus('tracking'); setIsCartOpen(true);
      fetch(`${API_BASE}/orders/${savedOrderId}/status/`)
        .then(res => res.json()).then(data => { if (data.status) { setOrderStatus(data.status); } else { closeTracker(); } }).catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsCartOpen]);

  const isTracking = checkoutStatus === 'tracking' && !!liveOrderId;

  useLiveSocket(
    `${WS_BASE}/ws/orders/${liveOrderId}/`,
    {
      onMessage: (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data?.status) setOrderStatus(data.status);
        } catch (e) { console.error('Bad order WS payload:', e); }
      },
    },
    { enabled: isTracking, restartKey: liveOrderId }
  );

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isHotelGuest && !VALID_ROOMS.includes(roomNumber)) return toast.error(`Invalid Room.`);
    setCheckoutStatus('loading');

    try {
      const menuRes = await fetch(`${API_BASE}/menu/`);
      if (menuRes.ok) {
        const rawData = await menuRes.json();
        const menuArray = Array.isArray(rawData) ? rawData : rawData.results || [];
        const nowUnavailable = cart.filter((item) => {
          const latest = menuArray.find((m) => m.id === item.id);
          return latest && !latest.is_available;
        });
        if (nowUnavailable.length > 0) {
          nowUnavailable.forEach((item) => removeFromCart(item.id));
          toast.error(`${nowUnavailable.map((i) => i.name).join(', ')} just sold out — removed from your order. Please review and try again.`);
          setCheckoutStatus('idle');
          return;
        }
      }
    } catch (err) {
      // this check itself failing (e.g. offline) shouldn't block checkout —
      // fall through and let the actual order attempt succeed or fail normally
    }

    const payload = isHotelGuest ? { order_type: 'Hotel', room_number: roomNumber, guest_name: customerDetails.name, guest_phone: customerDetails.phone, items_json: JSON.stringify(cart), total_amount: cartTotal, idempotency_key: idempotencyKey } : { order_type: 'Standard', customer_name: customerDetails.name, customer_phone: customerDetails.phone, items_json: JSON.stringify(cart), total_amount: cartTotal, idempotency_key: idempotencyKey };

    try {
      const response = await fetch(`${API_BASE}/orders/checkout/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) { toast.error(data.error || 'Failed to place order'); setCheckoutStatus('idle'); return; }
      setLiveOrderId(data.order_id); setOrderStatus(data.status); setCheckoutStatus('tracking'); setShowCheckoutForm(false); clearCart(); setCustomerDetails({ name: '', phone: '' }); localStorage.setItem('my_active_order', data.order_id); setIdempotencyKey(crypto.randomUUID()); toast.success("Order sent to kitchen!");
    } catch (error) { toast.error('Network error. Please try again.'); setCheckoutStatus('idle'); }
  };

  const handleConfirmOrder = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/${liveOrderId}/status/`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'Paid & Preparing' }) });
      if (response.ok) { setOrderStatus('Paid & Preparing'); toast.success("Order confirmed!"); }
      else toast.error("Failed to confirm order.");
    } catch (error) { toast.error("Network error."); }
  };

  const closeTracker = () => { setCheckoutStatus('idle'); setLiveOrderId(null); setOrderStatus(''); setIsCartOpen(false); setCustomerDetails({ name: '', phone: '' }); localStorage.removeItem('my_active_order'); };

  const trackerSteps = [{ id: 'Pending', label: 'Order Placed', desc: 'Awaiting kitchen confirmation', icon: Clock }, { id: 'Accepted', label: 'Order Accepted', desc: isHotelGuest ? 'Billed to room. Preparing food.' : 'Please confirm to begin preparation', icon: CheckSquare }, { id: 'Paid & Preparing', label: 'Preparing Food', desc: 'Our chefs are cooking your meal', icon: ChefHat }, { id: 'Completed', label: 'Ready / Delivered', desc: 'Enjoy your meal!', icon: CheckCircle2 }];

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
      <div className="fixed inset-0 bg-brown-950/40 backdrop-blur-md z-50 transition-opacity" onClick={() => setIsCartOpen(false)} />

      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-cream-50 z-50 flex flex-col shadow-[-20px_0_40px_rgba(0,0,0,0.1)] animate-slide-in-right border-l border-gold-400/20">
        <div className="p-6 bg-brown-950 text-cream-50 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold tracking-widest uppercase">Your Order</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 text-white/50 hover:text-gold-400 hover:bg-white/5 rounded-full transition-colors active-scale"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 hide-scrollbar relative">
          {checkoutStatus === 'tracking' ? (
            <div className="py-2 animate-fade-in flex flex-col relative z-10">
              <div className="text-center mb-10"><h3 className="font-serif text-3xl text-brown-900 font-bold tracking-tight mb-2">Order Status</h3><p className="text-[10px] text-brown-400 font-bold tracking-widest uppercase">#{liveOrderId.substring(0,8)}</p></div>
              {orderStatus === 'Rejected' ? (
                 <div className="bg-transparent border border-red-200/50 p-8 rounded-none text-center relative overflow-hidden"><div className="absolute inset-0 bg-red-50 opacity-50" /><AlertCircle className="relative z-10 w-10 h-10 text-red-500 mx-auto mb-4" /><h4 className="relative z-10 text-red-800 font-bold text-sm uppercase tracking-widest mb-2">Order Declined</h4><p className="relative z-10 text-red-600/80 text-xs">The kitchen is currently unable to accept this order.</p></div>
              ) : (
                <div className="relative pl-6">
                  <div className="absolute left-[47px] top-6 bottom-12 w-[1px] bg-cream-200" />
                  <div className="absolute left-[46px] top-6 w-[3px] bg-gold-400 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ height: orderStatus === 'Pending' ? '0%' : orderStatus === 'Accepted' ? '33%' : orderStatus === 'Paid & Preparing' ? '66%' : '100%' }} />
                  <div className="space-y-12">
                    {trackerSteps.map((step, index) => {
                      const state = getStepState(index); const Icon = step.icon;
                      return (
                        <div key={step.id} className="relative flex items-center gap-8 z-10">
                          <div className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-700 ease-out border-2 ${state === 'completed' ? 'bg-gold-500 border-gold-500 text-brown-950 shadow-md' : state === 'current' ? 'bg-brown-950 border-brown-950 text-gold-400 shadow-[0_0_20px_rgba(212,168,65,0.3)] scale-110' : 'bg-cream-100 border-cream-200 text-brown-300'}`}><Icon className={`w-5 h-5 ${state === 'current' ? 'animate-pulse' : ''}`} /></div>
                          <div className={`transition-all duration-500 ${state === 'upcoming' ? 'opacity-40 translate-x-2' : 'opacity-100 translate-x-0'}`}><h4 className={`font-bold tracking-widest uppercase text-xs mb-1 ${state === 'current' ? 'text-brown-900' : 'text-brown-500'}`}>{step.label}</h4><p className="text-[10px] uppercase tracking-wider text-brown-400">{step.desc}</p></div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {(orderStatus === 'Paid & Preparing' || (orderStatus === 'Accepted' && isHotelGuest)) && (
                <div className="mt-10 bg-gold-50/50 border border-gold-400/30 p-4 rounded-none text-center animate-fade-in shadow-inner">
                  <p className="text-gold-700 font-bold text-xs uppercase tracking-widest animate-pulse flex justify-center items-center gap-2">
                    <Clock className="w-4 h-4" /> Est. Prep & Delivery: 15-20 Mins
                  </p>
                  {isHotelGuest && (
                    <p className="text-xs text-brown-950 font-bold mt-3 uppercase tracking-[0.1em] bg-gold-400 py-2 px-4 inline-block">
                      Delivering to Room {roomNumber}
                    </p>
                  )}
                </div>
              )}

              {orderStatus === 'Accepted' && !isHotelGuest && (
                <div className="mt-12 bg-brown-950 p-8 text-center shadow-xl animate-slow-in-view">
                  <p className="text-gold-400 font-bold mb-3 text-xs uppercase tracking-widest">Kitchen Approved</p>
                  <p className="text-xs text-white/60 mb-6 leading-relaxed font-light">
                    Your order has been reviewed. Click below to confirm and we will begin preparation.
                    <br/><br/><strong className="text-gold-400 font-normal">Payment will be collected at the counter.</strong>
                  </p>
                  <button onClick={handleConfirmOrder} className="w-full bg-gold-500 text-brown-950 py-4 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gold-400 transition-colors active-scale"><ChefHat className="w-4 h-4" /> Start Cooking</button>
                </div>
              )}
              <button onClick={closeTracker} className="mt-16 mx-auto block text-[10px] text-brown-400 uppercase tracking-widest font-bold border-b border-transparent hover:border-brown-400 transition-all pb-1">Dismiss Tracker</button>
            </div>
          ) : cart.length === 0 ? (
            <div className="text-center py-32 animate-slow-in-view"><ChefHat className="w-12 h-12 text-brown-200 mx-auto mb-6" /><p className="text-brown-900 font-serif text-2xl mb-2">Your order is empty</p><p className="text-brown-400 text-xs uppercase tracking-widest mb-8">Begin your culinary journey</p><button onClick={() => { setIsCartOpen(false); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} className="text-[10px] uppercase tracking-widest font-bold text-gold-600 border-b border-gold-400 pb-1 hover:text-brown-900 transition-colors">Browse Menu</button></div>
          ) : (
            <div className="space-y-6 pt-2">
              {cart.map((item, index) => (
                <div key={item.id} className="animate-cascade flex gap-5 items-center bg-transparent border-b border-cream-200 pb-6 group relative" style={{ animationDelay: `${index * 80}ms` }}>
                  <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-none shadow-sm" />

                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-brown-900 text-sm leading-tight mb-1 flex items-start gap-2">
                      <span className="mt-0.5 inline-flex items-center justify-center w-3 h-3 border-[1.5px] border-green-700 rounded-sm shrink-0">
                        <span className="w-1.5 h-1.5 bg-green-700 rounded-full" />
                      </span>
                      <span className="line-clamp-2">{item.name}</span>
                    </h4>

                    <p className="text-gold-600 font-serif text-sm font-bold">₹{item.price}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <button onClick={() => updateQuantity(item.id, -1)} className="text-brown-400 hover:text-brown-900 transition-colors active-scale"><Minus className="w-4 h-4" /></button>
                      <span className="text-xs font-bold w-4 text-center text-brown-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="text-brown-400 hover:text-brown-900 transition-colors active-scale"><Plus className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="absolute right-0 top-0 p-2 text-brown-300 hover:text-red-500 transition-colors active-scale"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && checkoutStatus !== 'tracking' && (
          <div className="border-t border-cream-200 bg-cream-50 p-6 md:p-8 z-20">
            <div className="flex justify-between items-end mb-6"><span className="text-xs uppercase tracking-widest font-bold text-brown-500">Subtotal</span><span className="font-serif text-2xl font-bold text-brown-900">₹{cartTotal}</span></div>
            {!showCheckoutForm ? (
              <button onClick={() => setShowCheckoutForm(true)} className="w-full bg-brown-900 text-gold-400 py-5 font-bold text-xs uppercase tracking-[0.2em] transition-colors hover:bg-brown-800 active-scale rounded-none">Proceed to Checkout</button>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-6 animate-slow-in-view pt-2">
                {isHotelGuest && (
                  <p className="text-[10px] text-brown-900 font-bold uppercase tracking-[0.2em] mb-2">Room {roomNumber} Folio Verification</p>
                )}
                <FloatingInput
                  id="chkName"
                  label={isHotelGuest ? 'Registered Guest Name *' : 'Your Full Name *'}
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  required
                  pattern="^[A-Za-z\s\-\.]{3,50}$"
                />
                <FloatingInput
                  id="chkPhone"
                  label={isHotelGuest ? 'Phone (10 digits) *' : 'Phone Number (10 digits) *'}
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  required
                  pattern="^[6-9]\d{9}$"
                />

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowCheckoutForm(false)} className="px-6 py-4 text-brown-400 border border-brown-200 hover:border-brown-400 text-[10px] uppercase tracking-widest font-bold transition-colors active-scale">Back</button>
                  <button type="submit" disabled={checkoutStatus === 'loading'} className="flex-1 bg-gold-500 text-brown-950 py-4 font-bold text-[10px] uppercase tracking-[0.2em] flex justify-center items-center gap-3 hover:bg-gold-400 transition-colors active-scale disabled:opacity-50">{checkoutStatus === 'loading' ? <><Loader className="w-4 h-4 animate-spin" /> Transmitting...</> : 'Send to Kitchen'}</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </>
  );
}
