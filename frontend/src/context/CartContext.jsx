import { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE } from '@/config/api';
import { VALID_ROOMS } from '@/config/rooms';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('hsc_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Cart data corrupted, resetting.", error);
      return [];
    }
  });

  const [hotelRoom, setHotelRoom] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room');

    // reject unknown room codes so a bad ?room= link can't poison the session
    if (room && VALID_ROOMS.includes(room)) {
      sessionStorage.setItem('hsc_room', room);
      return room;
    } else if (room && !VALID_ROOMS.includes(room)) {
      return null;
    }

    // sessionStorage, not localStorage: a room scanned once shouldn't
    // silently apply to every future visit — only this browser tab, until
    // it's closed
    return sessionStorage.getItem('hsc_room') || null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (cart.length > 0) {
      fetch(`${API_BASE}/menu/`)
        .then(res => res.json())
        .then(data => {
          const menuArray = Array.isArray(data) ? data : data.results || [];
          setCart(prevCart =>
            prevCart.map(cartItem => {
              const latestItem = menuArray.find(m => m.id === cartItem.id);
              return latestItem ? { ...cartItem, price: latestItem.price, name: latestItem.name } : cartItem;
            })
          );
        })
        .catch(() => console.log("Silent cart hydration failed."));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('hsc_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (nameOrId) => {
    setCart((prev) => prev.filter((i) => i.name !== nameOrId && i.id !== nameOrId));
  };

  const updateQuantity = (nameOrId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
          if (item.name === nameOrId || item.id === nameOrId) {
            const newQty = (item.quantity || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        }).filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('hsc_cart');
  };

  const clearRoom = () => {
    setHotelRoom(null);
    sessionStorage.removeItem('hsc_room');
  }

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, isCartOpen, setIsCartOpen, hotelRoom, clearRoom }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
