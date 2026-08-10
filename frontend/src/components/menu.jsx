import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const imgs = {
    burger: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80",
    sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&q=80",
    pizza: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=500&q=80",
    dosa: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&q=80",
    idli: "https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=500&q=80",
    paneer: "https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=500&q=80",
    paneerTikka: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&q=80",
    dal: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80",
    kofta: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500&q=80",
    roti: "https://images.unsplash.com/photo-1626082895617-2c6f140d3a51?w=500&q=80",
    rice: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=500&q=80",
    biryani: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
    raita: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=500&q=80",
    salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
    pakoda: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&q=80",
    maggie: "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&q=80",
    fries: "https://images.unsplash.com/photo-1576107232684-1279f3908581?w=500&q=80",
    pasta: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=500&q=80",
    coffee: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=500&q=80",
    tea: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80",
    mixVeg: "https://images.unsplash.com/photo-1554054204-b2f70b09d031?w=500&q=80",
    curryPot: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=500&q=80",
    saagRice: "https://images.unsplash.com/photo-1582576163090-09d3b6f8a969?w=500&q=80"
};

const menuData = {
    "Fast Food": [
        { name: "Aloo Tikki Burger", price: 60, img: imgs.burger }, 
        { name: "Cheese Burger", price: 100, img: imgs.burger }, 
        { name: "Paneer Burger", price: 100, img: imgs.burger }, 
        { name: "Veg Grill Sandwich", price: 80, img: imgs.sandwich }, 
        { name: "Cheese Sandwich", price: 120, img: imgs.sandwich }, 
        { name: "Tanduri Sandwich", price: 100, img: imgs.sandwich }, 
        { name: "Pizza Sandwich", price: 150, img: imgs.sandwich }, 
        { name: "Margherita Pizza", price: 140, img: imgs.pizza }, 
        { name: "Onion Capsicum Pizza", price: 180, img: imgs.pizza }, 
        { name: "Cheese Pizza", price: 220, img: imgs.pizza }, 
        { name: "Paneer Pizza", price: 220, img: imgs.pizza }, 
        { name: "Farm House Pizza", price: 280, img: imgs.pizza }, 
        { name: "Sweet Corn Pizza", price: 240, img: imgs.pizza }
    ],
    "South Indian": [
        { name: "Idli (4-piece)", price: 100, img: imgs.idli }, 
        { name: "Masala Idli", price: 130, img: imgs.idli }, 
        { name: "Plain Dosa", price: 80, img: imgs.dosa }, 
        { name: "Masala Dosa", price: 120, img: imgs.dosa }, 
        { name: "Chocolate Dosa", price: 170, img: imgs.dosa }, 
        { name: "Paneer Dosa", price: 160, img: imgs.dosa }, 
        { name: "Cheese Dosa", price: 180, img: imgs.dosa }, 
        { name: "Upma Dosa", price: 200, img: imgs.dosa }, 
        { name: "Butter Masala Dosa", price: 170, img: imgs.dosa }, 
        { name: "Mysore Bonda (4-piece)", price: 100, img: imgs.idli }, 
        { name: "Medu Vada", price: 80, img: imgs.idli }, 
        { name: "Upma", price: 80, img: imgs.idli }
    ],
    "Sabji": [
        { name: "Paneer Butter Masala", price: 170, img: imgs.paneer }, 
        { name: "Shahi Paneer", price: 200, img: imgs.paneer }, 
        { name: "Paneer Lababdar", price: 200, img: imgs.paneer }, 
        { name: "Palak Paneer", price: 180, img: imgs.saagRice }, 
        { name: "Aloo Palak", price: 140, img: imgs.saagRice }, 
        { name: "Dal Fry", price: 140, img: imgs.dal }, 
        { name: "Kadi", price: 100, img: imgs.curryPot }, 
        { name: "Paneer Patiyala", price: 220, img: imgs.paneer }, 
        { name: "Dahi Fry", price: 120, img: imgs.raita }, 
        { name: "Chana Masala", price: 160, img: imgs.curryPot }, 
        { name: "Chola Paneer", price: 180, img: imgs.paneer }, 
        { name: "Khoya Matar Paneer", price: 200, img: imgs.paneer }, 
        { name: "Paneer Cheese", price: 220, img: imgs.paneer }, 
        { name: "Aloo Gobhi", price: 140, img: imgs.mixVeg }, 
        { name: "Sev Paneer", price: 170, img: imgs.paneer }, 
        { name: "Kadi Pakoda", price: 140, img: imgs.curryPot }, 
        { name: "Mix Veg", price: 180, img: imgs.mixVeg }, 
        { name: "Besan Gatta", price: 140, img: imgs.curryPot }, 
        { name: "Sev Tomato", price: 140, img: imgs.dal }, 
        { name: "Papad Sabji", price: 120, img: imgs.salad }, 
        { name: "Kadhai Paneer", price: 200, img: imgs.paneer }, 
        { name: "Matar Paneer", price: 180, img: imgs.paneer }, 
        { name: "Paneer Pyaaza", price: 180, img: imgs.paneer }, 
        { name: "Aloo Paneer", price: 160, img: imgs.paneer }, 
        { name: "Dal Palak", price: 160, img: imgs.saagRice }, 
        { name: "Dal Tadka", price: 140, img: imgs.dal }, 
        { name: "Paneer Burji", price: 170, img: imgs.paneer }, 
        { name: "Kaju Curry", price: 250, img: imgs.curryPot }, 
        { name: "Dal Paneer", price: 170, img: imgs.dal }, 
        { name: "Aloo Chola", price: 160, img: imgs.curryPot }, 
        { name: "Khoya Paneer", price: 180, img: imgs.paneer }, 
        { name: "Paneer Tikka", price: 220, img: imgs.paneerTikka }, 
        { name: "Aloo Matar", price: 140, img: imgs.mixVeg }, 
        { name: "Aloo Jeera", price: 140, img: imgs.mixVeg }, 
        { name: "Sev Bhaji Paneer", price: 170, img: imgs.paneer }, 
        { name: "Aloo Gobhi Matar", price: 160, img: imgs.mixVeg }, 
        { name: "Green Mix Veg", price: 160, img: imgs.mixVeg }, 
        { name: "Malai Kofta", price: 250, img: imgs.kofta }, 
        { name: "Aloo Masala", price: 140, img: imgs.mixVeg }, 
        { name: "Sev Bhaji Milk", price: 140, img: imgs.raita }
    ],
    "Breads, Rice & Sides": [
        { name: "Tava Plain", price: 10, img: imgs.roti }, 
        { name: "Tava Butter", price: 12, img: imgs.roti }, 
        { name: "Tava Ghee", price: 15, img: imgs.roti }, 
        { name: "Plain Paratha", price: 25, img: imgs.roti }, 
        { name: "Plain Paratha Butter", price: 25, img: imgs.roti }, 
        { name: "Plain Paratha Ghee", price: 40, img: imgs.roti }, 
        { name: "Onion Paratha", price: 60, img: imgs.roti }, 
        { name: "Aloo Paratha", price: 60, img: imgs.roti }, 
        { name: "Aloo Pyaaz Paratha", price: 60, img: imgs.roti }, 
        { name: "Paneer Paratha", price: 80, img: imgs.roti }, 
        { name: "Missi Roti", price: 40, img: imgs.roti }, 
        { name: "Bajra Roti", price: 40, img: imgs.roti }, 
        { name: "Extra Butter", price: 30, img: imgs.roti }, 
        { name: "Matar Pulav", price: 150, img: imgs.biryani }, 
        { name: "Paneer Pulav", price: 160, img: imgs.biryani }, 
        { name: "Vegetable Pulav", price: 160, img: imgs.biryani }, 
        { name: "Veg Biryani", price: 160, img: imgs.biryani }, 
        { name: "Plain Rice", price: 100, img: imgs.rice }, 
        { name: "Jeera Rice", price: 120, img: imgs.saagRice }, 
        { name: "Dal Khichdi", price: 180, img: imgs.rice }, 
        { name: "Dal Spicy Khichdi", price: 200, img: imgs.rice }, 
        { name: "Veg Raita", price: 70, img: imgs.raita }, 
        { name: "Boondi Raita", price: 70, img: imgs.raita }, 
        { name: "Butter Chaach", price: 20, img: imgs.raita }, 
        { name: "Curd", price: 25, img: imgs.raita }, 
        { name: "Sweet Lassi", price: 50, img: imgs.raita }, 
        { name: "Plain Raita", price: 50, img: imgs.raita }
    ],
    "Salad": [
        { name: "Tomato Salad", price: 50, img: imgs.salad }, 
        { name: "Kheera Salad", price: 50, img: imgs.salad }, 
        { name: "Onion Salad", price: 50, img: imgs.salad }, 
        { name: "Green Salad", price: 50, img: imgs.salad }, 
        { name: "Mix Salad", price: 50, img: imgs.salad }, 
        { name: "Kachumbar Salad", price: 60, img: imgs.salad }, 
        { name: "Plain Papad", price: 30, img: imgs.salad }, 
        { name: "Fry Papad", price: 50, img: imgs.salad }, 
        { name: "Masala Papad", price: 70, img: imgs.salad }, 
        { name: "Peanut Masala", price: 70, img: imgs.salad }
    ],
    "Snacks": [
        { name: "Paneer Pakoda", price: 150, img: imgs.pakoda }, 
        { name: "Aloo Pakoda", price: 160, img: imgs.pakoda }, 
        { name: "Mix Pakoda", price: 160, img: imgs.pakoda }, 
        { name: "Bread Pakoda (1-pc)", price: 80, img: imgs.pakoda }, 
        { name: "Onion Pakoda", price: 150, img: imgs.pakoda }, 
        { name: "Mirchi Pakoda (2-pc)", price: 80, img: imgs.pakoda }, 
        { name: "Plain Maggie", price: 80, img: imgs.maggie }, 
        { name: "Veg Maggie", price: 100, img: imgs.maggie }, 
        { name: "Chatpati Maggie", price: 120, img: imgs.maggie }, 
        { name: "Tanduri Maggie", price: 120, img: imgs.maggie }, 
        { name: "Poha", price: 50, img: imgs.pakoda }, 
        { name: "Pav Bhaji", price: 100, img: imgs.pakoda }, 
        { name: "Vada Pav", price: 80, img: imgs.pakoda }, 
        { name: "French Fries", price: 80, img: imgs.fries }, 
        { name: "Spring Roll", price: 150, img: imgs.pakoda }, 
        { name: "Bread Paneer Pakoda", price: 120, img: imgs.pakoda }, 
        { name: "Soya Chaap", price: 190, img: imgs.pakoda }, 
        { name: "Red Pasta", price: 150, img: imgs.pasta }, 
        { name: "White Pasta", price: 150, img: imgs.pasta }
    ],
    "Beverages": [
        { name: "Plain Tea", price: 30, img: imgs.tea }, 
        { name: "Coffee", price: 50, img: imgs.coffee }, 
        { name: "Cold Coffee", price: 90, img: imgs.coffee }, 
        { name: "Milk", price: 50, img: imgs.coffee }, 
        { name: "Cold Coffee w/ Icecream", price: 120, img: imgs.coffee }
    ]
};

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [animatingBtn, setAnimatingBtn] = useState(null);
  const { addToCart } = useCart();

  const categories = ['All', ...Object.keys(menuData)];

  const handleAddToCart = (item) => {
    addToCart(item);
    setAnimatingBtn(item.name); // Using the item name to track the active button
    setTimeout(() => setAnimatingBtn(null), 1000);
  };

  return (
    <section id="menu" className="section visible">
      <h2 className="page-title">Our Menu</h2>
      
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
      
      <div id="menu-container">
        {Object.entries(menuData).map(([category, items]) => {
          if (activeCategory !== 'All' && activeCategory !== category) return null;
          
          return (
            <div key={category} className="menu-category-group">
              <h3 className="menu-category cat-visible">{category}</h3>
              <div className="menu-grid">
                {items.map((item, index) => (
                  <div key={item.name} className="menu-item" style={{ animationDelay: `${Math.min(index * 0.05, 1.5)}s` }}>
                    <div className="menu-img-wrap">
                      <img src={item.img} alt={item.name} className="menu-img loaded" loading="lazy" />
                    </div>
                    <div className="menu-content">
                      <h4>
                        <span className="veg-icon"><span className="veg-dot"></span></span>
                        {item.name}
                      </h4>
                      <div>
                        <p>₹{item.price}</p>
                        <button 
                          className="btn" 
                          style={{ 
                            width: '100%',
                            background: animatingBtn === item.name ? '#008a00' : '',
                            color: animatingBtn === item.name ? 'white' : '',
                            transform: animatingBtn === item.name ? 'scale(0.95)' : 'scale(1)'
                          }}
                          onClick={() => handleAddToCart(item)}
                        >
                          {animatingBtn === item.name ? 'Added!' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}