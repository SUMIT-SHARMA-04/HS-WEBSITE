import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, Loader, Clock, CheckCircle, XCircle, ChefHat } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // 'idle' | 'loading' | 'tracking' | 'error'
  const [liveOrderId, setLiveOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('Pending');

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Poll the backend every 5 seconds if we are tracking an order
  useEffect(() => {
    let interval;
    if (checkoutStatus === 'tracking' && liveOrderId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:8000/orders/${liveOrderId}/status/`);
          if (res.ok) {
            const data = await res.json();
            setOrderStatus(data.status);
            
            // Stop polling if the order reaches a final state
            if (data.status === 'Completed' || data.status === 'Rejected') {
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error("Failed to fetch order status", error);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [checkoutStatus, liveOrderId]);

  const handleCheckout = async () => {
    const customerName = window.prompt("Enter your name for the order:");
    if (!customerName) return;
    
    const customerPhone = window.prompt("Enter your phone number:");
    if (!customerPhone) return;

    setCheckoutStatus('loading');

    try {
      const response = await fetch('http://localhost:8000/orders/checkout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          items_json: JSON.stringify(cart), 
          total_amount: cartTotal,
        }),
      });

      if (!response.ok) throw new Error('Checkout failed');
      
      const data = await response.json();
      setLiveOrderId(data.order_id);
      setOrderStatus(data.status); 
      setCheckoutStatus('tracking');
      clearCart();

    } catch (error) {
      console.error(error);
      setCheckoutStatus('error');
      setTimeout(() => setCheckoutStatus('idle'), 3000);
    }
  };

  const renderTrackingUI = () => {
    const statusConfig = {
      'Pending': { icon: Clock, color: 'text-amber-500', text: 'Waiting for restaurant to accept...' },
      'Accepted': { icon: ChefHat, color: 'text-blue-500', text: 'Order accepted! Chefs are cooking.' },
      'Completed': { icon: CheckCircle, color: 'text-green-600', text: 'Food is ready!' },
      'Rejected': { icon: XCircle, color: 'text-red-500', text: 'Order was declined by the restaurant.' },
    };

    const currentConfig = statusConfig[orderStatus] || statusConfig['Pending'];
    const Icon = currentConfig.icon;

    return (
      <div className="h-full flex flex-col items-center justify-center space-y-6 text-center px-6">
        <div className={`w-20 h-20 rounded-full bg-cream-100 flex items-center justify-center ${currentConfig.color}`}>
          <Icon className="w-10 h-10" />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-bold text-brown-900 mb-2">Order #{liveOrderId}</h3>
          <p className="text-brown-600 font-medium">{currentConfig.text}</p>
        </div>
        
        {(orderStatus === 'Completed' || orderStatus === 'Rejected') && (
          <button 
            onClick={() => {
              setCheckoutStatus('idle');
              setIsCartOpen(false);
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
      <div 
        className="fixed inset-0 bg-brown-950/60 backdrop-blur-sm z-[60] transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-cream-50 z-[70] shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-6 border-b border-cream-200 bg-white">
          <h2 className="font-serif text-2xl font-bold text-brown-900">
            {checkoutStatus === 'tracking' ? 'Live Order Status' : 'Your Order'}
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-brown-500 hover:text-brown-900 transition-colors rounded-full hover:bg-cream-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {checkoutStatus === 'tracking' ? (
            renderTrackingUI()
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-brown-400 space-y-4">
              <p>Your cart is empty.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="btn-gold-outline px-6 py-2 rounded-full font-medium"
              >
                Browse Menu
              </button>
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
                    <button 
                      onClick={() => updateQuantity(item.name, -1)}
                      className="p-1 hover:bg-white rounded text-brown-600 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.name, 1)}
                      className="p-1 hover:bg-white rounded text-brown-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.name)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && checkoutStatus !== 'tracking' && (
          <div className="border-t border-cream-200 p-6 bg-white space-y-4">
            <div className="flex justify-between items-center font-serif text-xl font-bold text-brown-900">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
            
            {checkoutStatus === 'error' && (
              <p className="text-red-600 text-sm text-center">Checkout failed. Please try again.</p>
            )}

            <button 
              onClick={handleCheckout}
              disabled={checkoutStatus === 'loading'}
              className="w-full btn-gold py-4 rounded-xl font-medium text-lg flex justify-center items-center gap-2"
            >
              {checkoutStatus === 'loading' ? <Loader className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}