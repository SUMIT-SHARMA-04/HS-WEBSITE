import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('hs_cart');
    if (!savedCart) return [];

    try {
      const parsedCart = JSON.parse(savedCart);
      
      // FIX: Clean up old local storage data. 
      // Merges duplicate items into a single item with an accurate 'quantity'
      const cleanedCart = [];
      parsedCart.forEach(item => {
        const existingItem = cleanedCart.find(c => c.name === item.name);
        const itemQty = item.quantity ? item.quantity : 1; // Default to 1 if from old vanilla JS
        
        if (existingItem) {
          existingItem.quantity += itemQty;
        } else {
          cleanedCart.push({ ...item, quantity: itemQty });
        }
      });
      
      return cleanedCart;
    } catch (error) {
      return []; // Return empty if JSON is corrupted
    }
  });

  useEffect(() => {
    localStorage.setItem('hs_cart', JSON.stringify(cart));
  }, [cart]);

  // Add item or increase quantity if it already exists
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

  // Increase or decrease quantity safely
  const updateQuantity = (itemName, amount) => {
    setCart((prevCart) => 
      prevCart.map((item) => {
        if (item.name === itemName) {
          const newQuantity = item.quantity + amount;
          return { ...item, quantity: Math.max(1, newQuantity) }; // Prevents going to 0 or negative
        }
        return item;
      })
    );
  };

  // Remove item entirely
  const removeFromCart = (itemName) => {
    setCart((prevCart) => prevCart.filter((item) => item.name !== itemName));
  };

  // Clear cart after checkout
  const clearCart = () => {
    setCart([]);
  };

  // Safely calculate total items for the navbar badge
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);