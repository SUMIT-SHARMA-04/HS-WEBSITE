import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Order() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [formData, setFormData] = useState({ customer_name: '', customer_phone: '' });
  const [orderStatus, setOrderStatus] = useState(null);

  // Calculate the total price
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    // Formatting data exactly how the Django backend expects it
    const orderData = {
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      items_json: JSON.stringify(cart),
      total_amount: totalAmount,
      status: 'Pending'
    };

    try {
      const response = await fetch('http://localhost:8000/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setOrderStatus('success');
        clearCart();
      } else {
        setOrderStatus('error');
      }
    } catch (error) {
      setOrderStatus('error');
    }
  };

  if (orderStatus === 'success') {
    return (
      <section className="section visible container" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <h2 className="page-title">Order Placed Successfully!</h2>
        <p>Thank you, {formData.customer_name}. Your order has been sent to the kitchen.</p>
        <a href="/" className="btn" style={{ marginTop: '2rem' }}>Return to Menu</a>
      </section>
    );
  }

  return (
    <section className="section visible container" style={{ paddingTop: '80px', minHeight: '80vh' }}>
      <h2 className="page-title">Your Cart</h2>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Your cart is currently empty.</p>
          <a href="/#menu" className="btn">Browse Menu</a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          
          {/* Cart Items List */}
          <div className="cart-items">
            {cart.map((item) => (
              <div 
                key={item.name} 
                style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  background: 'white', padding: '1.2rem', borderRadius: '8px', 
                  marginBottom: '1rem', border: '1px solid var(--gold-light)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {item.img && (
                    <img src={item.img} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                  )}
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h4>
                    <p style={{ color: 'var(--gold-dark)', fontWeight: 'bold', margin: 0 }}>₹{item.price}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Quantity Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--gold)', borderRadius: '4px', overflow: 'hidden' }}>
                    <button 
                      onClick={() => updateQuantity(item.name, -1)}
                      style={{ background: 'var(--cream-bg)', border: 'none', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '1.2rem' }}
                    >-</button>
                    <span style={{ padding: '0 0.8rem', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.name, 1)}
                      style={{ background: 'var(--cream-bg)', border: 'none', padding: '0.3rem 0.8rem', cursor: 'pointer', fontSize: '1.2rem' }}
                    >+</button>
                  </div>
                  
                  {/* Remove Button */}
                  <button 
                    onClick={() => removeFromCart(item.name)}
                    style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                    title="Remove Item"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="checkout-sidebar">
            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid var(--gold-light)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <h3 style={{ borderBottom: '2px dashed #ccc', paddingBottom: '1rem', marginBottom: '1.5rem', fontFamily: 'Playfair Display, serif', color: 'var(--gold-dark)' }}>Order Summary</h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--gold-dark)' }}>₹{totalAmount}</span>
              </div>

              <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  required 
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', outline: 'none' }}
                />
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  required 
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '1rem', outline: 'none' }}
                />
                <button type="submit" className="btn" style={{ width: '100%', marginTop: '1rem', fontSize: '1.1rem' }}>
                  Place Order
                </button>
              </form>
              
              {orderStatus === 'error' && (
                <div className="msg-box" style={{ marginTop: '1rem', background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }}>
                  Error communicating with server. Please try again.
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </section>
  );
}