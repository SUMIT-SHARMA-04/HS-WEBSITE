import { useState } from 'react';
import { X, Plus, Minus, Trash2, Loader } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();
  const [checkoutStatus, setCheckoutStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  // Calculate total price
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Submit cart to Django Backend
  const handleCheckout = async () => {
    // Basic prompt to collect name/phone since Django Admin expects it. 
    // You can replace this with a proper form later if you prefer.
    const customerName = window.prompt("Enter your name for the order:");
    if (!customerName) return;
    
    const customerPhone = window.prompt("Enter your phone number:");
    if (!customerPhone) return;

    setCheckoutStatus('loading');

    try {
      const response = await fetch('http://localhost:8000/orders/', {
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
          status: 'Pending'
        }),
      });

      if (!response.ok) throw new Error('Checkout failed');
      
      setCheckoutStatus('success');
      setTimeout(() => {
        clearCart();
        setIsCartOpen(false);
        setCheckoutStatus('idle');
      }, 2500);

    } catch (error) {
      console.error(error);
      setCheckoutStatus('error');
      setTimeout(() => setCheckoutStatus('idle'), 3000);
    }
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
          <h2 className="font-serif text-2xl font-bold text-brown-900">Your Order</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-brown-500 hover:text-brown-900 transition-colors rounded-full hover:bg-cream-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {checkoutStatus === 'success' ? (
            <div className="h-full flex flex-col items-center justify-center text-green-600 space-y-4">
              <p className="font-serif text-xl font-bold">Order placed successfully!</p>
              <p className="text-sm">We are preparing your meal.</p>
            </div>
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

        {cart.length > 0 && checkoutStatus !== 'success' && (
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