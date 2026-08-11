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
        <a href="/#home">Home</a>
        <a href="/#about">About</a>
        <a href="/#menu">Menu</a>
        <a href="/#offers">Offers</a>
        <a href="/#reviews">Reviews</a>
        <a href="/#book">Book Table</a>
        <a href="/#contact">Contact</a>
        
        <Link to="/cart" className="cart-link">
          🛒 Cart (<span className={bump ? 'bump' : ''}>{cartCount}</span>)
        </Link>
      </nav>
    </header>
  );
}