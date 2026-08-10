import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { cartCount } = useCart();
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (cartCount === 0) return;
    setBump(true);
    const timer = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(timer);
  }, [cartCount]);

  return (
    <header className="top-header">
      <h1>High Spirits</h1>
      <nav className="nav-links">
        {/* Use standard anchor tags but point them to the root first so they work from the /cart page */}
        <a href="/#home">Home</a>
        <a href="/#menu">Menu</a>
        <a href="/#book">Book Table</a>
        
        {/* Use React Router's Link for the cart page to prevent page reload */}
        <Link to="/cart" className="cart-link">
          🛒 Cart (<span className={bump ? 'bump' : ''}>{cartCount}</span>)
        </Link>
      </nav>
    </header>
  );
}