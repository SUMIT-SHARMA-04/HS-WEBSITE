import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // --- NEW: Global state for cart visibility ---
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('hs_cart');
    if (!savedCart) return [];

    try {
      const parsedCart = JSON.parse(savedCart);
      const cleanedCart = [];
      parsedCart.forEach(item => {
        const existingItem = cleanedCart.find(c => c.name === item.name);
        const itemQty = item.quantity ? item.quantity : 1; 
        
        if (existingItem) {
          existingItem.quantity += itemQty;
        } else {
          cleanedCart.push({ ...item, quantity: itemQty });
        }
      });
      return cleanedCart;
    } catch (error) {
      return []; 
    }
  });

  useEffect(() => {
    localStorage.setItem('hs_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.name === item.name);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.name === item.name
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemName, amount) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.name === itemName) {
          const newQuantity = item.quantity + amount;
          return { ...item, quantity: Math.max(1, newQuantity) }; 
        }
        return item;
      })
    );
  };

  const removeFromCart = (itemName) => {
    setCart((prevCart) => prevCart.filter((item) => item.name !== itemName));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    // --- NEW: Added isCartOpen and setIsCartOpen to the value ---
    <CartContext.Provider value={{ 
      cart, cartCount, addToCart, updateQuantity, removeFromCart, clearCart,
      isCartOpen, setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);