import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const { addToCart } = useCart();

  // Fetch menu data from Django API
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/menu/');
        setMenuItems(response.data);
      } catch (error) {
        console.error("Error fetching menu:", error);
      }
    };
    fetchMenu();
  }, []);

  // Extract unique categories for the tabs
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Filter items based on the active tab
  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="section visible">
      <h2 className="page-title">Our Menu</h2>
      
      {/* Menu Tabs */}
      <div className="menu-tabs">
        {categories.map(category => (
          <button 
            key={category}
            className={`menu-tab ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Menu Grid[cite: 6] */}
      <div className="menu-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="menu-item">
            <div className="menu-content">
              <h4>
                <span className="veg-icon"><span className="veg-dot"></span></span>
                {item.name}
              </h4>
              <p>₹{item.price}</p>
              <button 
                className="btn" 
                style={{ width: '100%' }}
                onClick={() => addToCart(item)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}