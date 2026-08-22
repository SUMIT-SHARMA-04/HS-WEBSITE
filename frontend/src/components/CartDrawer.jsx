import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Plus, Minus, Trash2, Loader, Clock, CheckCircle, XCircle, ChefHat, CreditCard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function CartDrawer() {
  const [searchParams] = useSearchParams();
  const rawRoom = searchParams.get('room'); 
  const validRooms = ['101', '102', '103', '104', '105', '106', '107', '108'];
  const isHotelGuest = validRooms.includes(rawRoom);
  const roomNumber = isHotelGuest ? rawRoom : null;

  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); 
  const [liveOrderId, setLiveOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('Pending');
  
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '', lastName: '' });
  const [isPaying, setIsPaying] = useState(false);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Resume active session if exists
  useEffect(() => {
    const savedOrderId = localStorage.getItem('my_active_order');
    if (savedOrderId) {
      setLiveOrderId(savedOrderId);
      setCheckoutStatus('tracking');
    }
  }, []);

  // Polling for live status updates
  useEffect(() => {
    let interval;
    if (checkoutStatus === 'tracking' && liveOrderId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/orders/${liveOrderId}/status/`);
          if (res.ok) {
            const data = await res.json();
            setOrderStatus(data.status);
            if (data.status === 'Completed' || data.status === 'Rejected') {
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error("Failed to fetch order status");
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [checkoutStatus, liveOrderId]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setCheckoutStatus('loading');

    const payload = isHotelGuest 
      ? {
          order_type: 'Hotel',
          room_number: roomNumber,
          last_name: customerDetails.lastName,
          items_json: JSON.stringify(cart),
          total_amount: cartTotal,
        }
      : {
          order_type: 'Standard',
          customer_name: customerDetails.name,
          customer_phone: customerDetails.phone,
          items_json: JSON.stringify(cart),
          total_amount: cartTotal,
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
      
      setLiveOrderId(data.order_id);
      setOrderStatus(data.status); 
      setCheckoutStatus('tracking');
      setShowCheckoutForm(false);
      clearCart();
      localStorage.setItem('my_active_order', data.order_id);

    } catch (error) {
      toast.error('Network error. Please try again.');
      setCheckoutStatus('idle');
    }
  };

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const res = await fetch(`${API_BASE}/orders/${liveOrderId}/status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Paid & Preparing' })
      });
      if (res.ok) {
        setOrderStatus('Paid & Preparing');
        toast.success("Payment successful! Kitchen is preparing your food.");
      } else throw new Error();
    } catch (e) {
      toast.error("Payment failed.");
    } finally {
      setIsPaying(false);
    }
  };

  const renderTrackingUI = () => {
    const statusConfig = {
      'Pending': { icon: Clock, color: 'text-amber-500', text: 'Waiting for restaurant to review your order...' },
      'Accepted': { icon: ChefHat, color: 'text-blue-500', text: 'Order accepted! Please complete payment to begin preparation.' },
      'Paid & Preparing': { icon: ChefHat, color: 'text-orange-500', text: 'Payment received! Chefs are cooking your meal.' },
      'Completed': { icon: CheckCircle, color: 'text-green-600', text: 'Food is ready and completed!' },
      'Rejected': { icon: XCircle, color: 'text-red-500', text: 'Order was declined by the restaurant.' },
    };

    const currentConfig = statusConfig[orderStatus] || statusConfig['Pending'];
    const Icon = currentConfig.icon;

    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 text-center px-6 animate-fade-in">
        <div className={`w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center ${currentConfig.color}`}>
          <Icon className="w-10 h-10" />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-bold text-brown-900 mb-2">Order #{liveOrderId}</h3>
          <p className="text-brown-600 font-medium">{currentConfig.text}</p>
        </div>
        
        {orderStatus === 'Accepted' && (
          <div className="w-full mt-4 p-6 bg-white border border-gold-200 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4 font-serif font-bold text-lg">
              <span>Total Amount:</span>
              <span className="text-gold-700">₹{cartTotal}</span>
            </div>
            <button 
              onClick={handlePayment}
              disabled={isPaying}
              className="w-full btn-gold py-3.5 rounded-xl font-medium flex justify-center items-center gap-2 shadow-md"
            >
              {isPaying ? <Loader className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5"/> Pay Securely Now</>}
            </button>
          </div>
        )}
        
        {(orderStatus === 'Completed' || orderStatus === 'Rejected') && (
          <button 
            onClick={() => {
              setCheckoutStatus('idle');
              setIsCartOpen(false);
              localStorage.removeItem('my_active_order');
            }} 
            className="btn-gold-outline px-6 py-2 rounded-full font-medium mt-4"
          >
            Close Tracker
          </button>
        )}
      </div>
    );
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-brown-950/60 backdrop-blur-sm z-[60] transition-opacity" onClick={() => setIsCartOpen(false)} />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-cream-50 z-[70] shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-6 border-b border-cream-200 bg-white">
          <h2 className="font-serif text-2xl font-bold text-brown-900">
            {checkoutStatus === 'tracking' ? 'Live Order Status' : 'Your Order'}
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 text-brown-500 hover:text-brown-900 rounded-full hover:bg-cream-100 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {checkoutStatus === 'tracking' ? renderTrackingUI() : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-brown-400 space-y-4">
              <p>Your cart is empty.</p>
              <button onClick={() => setIsCartOpen(false)} className="btn-gold-outline px-6 py-2 rounded-full font-medium">Browse Menu</button>
            </div>
          ) : (
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.name} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-cream-200">
                  <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-medium text-brown-900 text-sm">{item.name}</h3>
                    <p className="text-gold-700 font-semibold text-sm">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-cream-100 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.name, -1)} className="p-1 hover:bg-white rounded text-brown-600 transition-colors"><Minus className="w-4 h-4" /></button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.name, 1)} className="p-1 hover:bg-white rounded text-brown-600 transition-colors"><Plus className="w-4 h-4" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.name)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
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
                {isHotelGuest ? `Charge to Room ${roomNumber}` : 'Proceed to Details'}
              </button>
            ) : (
              <form onSubmit={handleCheckout} className="space-y-3 animate-slide-up">
                {isHotelGuest ? (
                  <>
                    <p className="text-sm text-brown-600 font-medium mb-2">Room {roomNumber} Verification</p>
                    <input required type="text" placeholder="Enter Guest Last Name" value={customerDetails.lastName} onChange={e => setCustomerDetails({...customerDetails, lastName: e.target.value})} className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-sm focus:outline-none focus:border-gold-400" />
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