import { createContext, useContext, useState, useEffect } from 'react';

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
    if (room) {
      localStorage.setItem('hsc_room', room);
      return room;
    }
    return localStorage.getItem('hsc_room') || null;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('hsc_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (nameOrId) => {
    setCart((prev) => prev.filter((i) => i.name !== nameOrId && i.id !== nameOrId));
  };

  const updateQuantity = (nameOrId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.name === nameOrId || item.id === nameOrId) {
            const newQty = (item.quantity || 1) + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('hsc_cart');
    // We intentionally keep hsc_room so they stay logged into their room folio
  };

  const clearRoom = () => {
    setHotelRoom(null);
    localStorage.removeItem('hsc_room');
  }

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        hotelRoom,
        clearRoom
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);