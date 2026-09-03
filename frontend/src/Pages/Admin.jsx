import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchWithAuth } from '@/utils/api';
import { 
  Utensils, CalendarDays, MonitorSmartphone, Search, RefreshCw, 
  CheckCircle, XCircle, ChefHat, Printer, Trash2, 
  Plus, Edit2, ClipboardList, Activity, LogOut, TrendingUp, 
  IndianRupee, Bed, Mail, Clock, Star, Volume2, VolumeX 
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE = API_BASE.replace(/^http/, 'ws');

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics'); 
  const [data, setData] = useState({ orders: [], bookings: [], menu: [], hotel: [], messages: [], reviews: [] });
  const [orderSearch, setOrderSearch] = useState('');
  
  // Menu Management States
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [menuForm, setMenuForm] = useState({ id: null, name: '', category: '', price: '', img: '', is_available: true });

  // POS & Billing States
  const [posItems, setPosItems] = useState([]);
  const [printData, setPrintData] = useState(null);

  // --- AUDIO & NOTIFICATION ENGINE ---
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioRef = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3')); // Classic Ding

  const toggleAudio = () => {
    if (!audioEnabled) {
      audioRef.current.play().catch(e => console.log("Audio unlock failed", e));
      toast.success("Audio Alerts Enabled!");
    }
    setAudioEnabled(!audioEnabled);
  };

  const alertOwner = (type) => {
    const alerts = {
      order: { text: "Received food order", title: "New Order!" },
      booking: { text: "Table booking", title: "New Reservation!" },
      message: { text: "Request message", title: "New Message!" },
      review: { text: "New review submitted", title: "New Review Pending" }
    };
    
    // Play ringtone ding
    if (audioEnabled) {
      audioRef.current.play().catch(e => {});
      
      // Followed by Text to speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(alerts[type]?.text || "New Notification");
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
      }
    }
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alerts[type]?.title, { body: alerts[type]?.text, icon: '/vite.svg' });
    }
  };

  // --- DATA FETCHING ---
  const loadData = async () => {
    try {
      const [o, b, m, h, msg, r] = await Promise.all([
        fetchWithAuth(`${API_BASE}/orders/`).then(res => res.json()),
        fetchWithAuth(`${API_BASE}/bookings/`).then(res => res.json()),
        fetch(`${API_BASE}/menu/`).then(res => res.json()),
        fetchWithAuth(`${API_BASE}/hotel-tabs/`).then(res => res.json()),
        fetchWithAuth(`${API_BASE}/contact/`).then(res => res.json()),
        fetchWithAuth(`${API_BASE}/reviews/`).then(res => res.json())
      ]);
      setData({ orders: o, bookings: b, menu: m, hotel: h, messages: msg, reviews: r });
    } catch (e) { 
      navigate('/admin-login'); 
    }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    loadData();

    // WebSocket connection replacing setInterval
    const ws = new WebSocket(`${WS_BASE}/ws/admin-notifications/`);
    ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      alertOwner(payload.event);
      loadData();
    };
    return () => ws.close();
  }, [audioEnabled]);

  const handleAction = async (url, method, payload, successMsg) => {
    const res = await fetchWithAuth(url, { method, body: payload ? JSON.stringify(payload) : null });
    if (res.ok) { 
      toast.success(successMsg); 
      loadData(); 
    } else {
      toast.error("Action failed");
    }
  };

  // --- MENU MANAGEMENT ---
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const method = isEditingMenu ? 'PUT' : 'POST';
    const url = isEditingMenu ? `${API_BASE}/menu/${menuForm.id}/` : `${API_BASE}/menu/`;
    
    const res = await fetchWithAuth(url, { method, body: JSON.stringify(menuForm) });
    if (res.ok) {
      toast.success(isEditingMenu ? "Menu item updated!" : "New item added!");
      setMenuForm({ id: null, name: '', category: '', price: '', img: '', is_available: true });
      setIsEditingMenu(false);
      loadData();
    } else {
      toast.error("Failed to save menu item");
    }
  };

  // --- POS & BILLING SYSTEM ---
  const addToPOS = (menuItem) => {
    const existingIndex = posItems.findIndex(i => i.id === menuItem.id);
    if (existingIndex >= 0) {
      const newItems = [...posItems];
      newItems[existingIndex].quantity += 1;
      setPosItems(newItems);
    } else {
      setPosItems([...posItems, { ...menuItem, quantity: 1 }]);
    }
  };

  const removeFromPOS = (index) => {
    const newItems = [...posItems];
    newItems.splice(index, 1);
    setPosItems(newItems);
  };

  const posTotal = posItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const handlePOSPrint = () => {
    if (posItems.length === 0) return toast.error("Add items to print bill");
    setPrintData({
      title: 'Standalone Bill',
      subtitle: 'Walk-in Customer',
      items: posItems,
      total: posTotal
    });
    setTimeout(() => window.print(), 500);
  };

  // --- AUTOMATED HOTEL CHECKOUT & BILLING ---
  const handleHotelCheckout = async (tab, room) => {
    if (!window.confirm(`Check out Room ${room} and generate final bill?`)) return;

    // 1. Gather all orders tied to this room's active tab
    const tabOrders = data.orders.filter(o => o.hotel_tab?.id === tab.id);
    let grandTotal = 0;
    const combinedItems = {};

    // 2. Consolidate items perfectly for the final receipt
    tabOrders.forEach(o => {
      grandTotal += parseFloat(o.total_amount);
      const items = JSON.parse(o.items_json || '[]');
      items.forEach(item => {
        if (combinedItems[item.name]) {
          combinedItems[item.name].quantity += (item.quantity || 1);
        } else {
          combinedItems[item.name] = { ...item, quantity: item.quantity || 1 };
        }
      });
    });

    // 3. Prepare Print Data
    setPrintData({
      title: `Room ${room} Folio`,
      subtitle: `Guest: ${tab.guest_name}`,
      items: Object.values(combinedItems),
      total: grandTotal
    });

    // 4. Close the Tab in the Database
    await handleAction(`${API_BASE}/hotel-tabs/${tab.id}/`, 'PATCH', {is_active: false}, `Room ${room} Checked Out successfully`);
    
    // 5. Trigger the Browser Print Dialog automatically
    setTimeout(() => window.print(), 500);
  };

  const handleLogout = () => {
    localStorage.clear(); 
    navigate('/admin-login');
  };

  // --- UI METRICS ---
  const pending = {
    o: data.orders.filter(x => x.status === 'Pending').length,
    b: data.bookings.filter(x => x.status === 'Pending').length,
    m: data.messages.length,
    r: data.reviews.filter(x => !x.is_approved).length
  };

  const getStyle = (s) => ({
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'Accepted': 'bg-blue-100 text-blue-700 border-blue-200',
    'Paid & Preparing': 'bg-orange-100 text-orange-700 border-orange-200',
    'Completed': 'bg-green-100 text-green-700 border-green-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200',
  }[s] || 'bg-gray-100 text-gray-700');

  const hotelRooms = ['101', '102', '103', '104', '105', '106', '107', '108'];
  const filteredOrders = data.orders.filter(o => (o.customer_name || o.hotel_tab?.guest_name || '').toLowerCase().includes(orderSearch.toLowerCase()));
  
  const validOrders = data.orders.filter(o => o.status === 'Paid & Preparing' || o.status === 'Completed' || o.status === 'Accepted');
  const totalRevenue = validOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  const itemCounts = {};
  
  validOrders.forEach(order => {
    try {
      const items = JSON.parse(order.items_json);
      items.forEach(item => { itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1); });
    } catch (e) {}
  });

  const popularItemsData = Object.keys(itemCounts).map(key => ({ name: key.substring(0, 12) + '...', sales: itemCounts[key] })).sort((a, b) => b.sales - a.sales).slice(0, 6);

  return (
    <>
      {/* --- PRINTABLE RECEIPT LAYER (Hidden on screen, visible only when printing) --- */}
      <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-8 text-black font-mono">
        {printData && (
          <div className="max-w-md mx-auto">
            <h2 className="text-center font-bold text-2xl mb-1 tracking-widest">HIGH SPIRITS CAFE</h2>
            <p className="text-center text-sm mb-4">Date: {new Date().toLocaleDateString()}</p>
            
            <div className="text-center border-y-2 border-dashed border-gray-400 py-3 mb-6">
              <p className="font-bold text-lg uppercase tracking-wider">{printData.title}</p>
              <p className="text-sm">{printData.subtitle}</p>
            </div>
            
            <table className="w-full mb-6 text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left pb-2">Item</th>
                  <th className="text-center pb-2">Qty</th>
                  <th className="text-right pb-2">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {printData.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 pr-2">{item.name}</td>
                    <td className="text-center py-3">{item.quantity}</td>
                    <td className="text-right py-3">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="border-t-2 border-dashed border-gray-400 pt-4 flex justify-between font-bold text-xl">
              <span>TOTAL</span>
              <span>₹{printData.total.toFixed(2)}</span>
            </div>
            <p className="text-center mt-12 text-sm italic">Thank you for dining with us!</p>
          </div>
        )}
      </div>

      {/* --- MAIN DASHBOARD LAYER (Visible on screen, hidden when printing) --- */}
      <div className="flex h-screen w-screen bg-cream-50 overflow-hidden font-sans text-brown-900 print:hidden">
        <Toaster position="top-right" />
        
        {/* SIDEBAR */}
        <div className="w-64 bg-brown-950 text-cream-100 flex flex-col z-20 shadow-2xl relative">
          
          {/* AUDIO TOGGLE */}
          <button onClick={toggleAudio} className="absolute top-4 left-4 p-2 bg-brown-800 rounded-full text-gold-400 hover:text-white transition-colors" title={audioEnabled ? "Disable Audio Alerts" : "Enable Audio Alerts"}>
            {audioEnabled ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4 text-gray-500"/>}
          </button>

          <div className="text-center p-8 border-b border-brown-800">
            <Utensils className="w-8 h-8 text-gold-400 mx-auto mb-3 mt-4" />
            <h1 className="font-serif text-xl text-gold-400 tracking-[0.1em] uppercase">High Spirits</h1>
            <p className="text-cream-400 text-xs tracking-widest uppercase mt-1">Admin Portal</p>
          </div>
          
          <div className="flex flex-col py-4 flex-grow overflow-y-auto hide-scrollbar">
            {[
              { id: 'analytics', icon: Activity, label: 'Analytics' },
              { id: 'orders', icon: ChefHat, label: 'Live Orders', badge: pending.o },
              { id: 'pos', icon: MonitorSmartphone, label: 'POS & Billing' },
              { id: 'hotel', icon: Bed, label: 'Hotel Folios' },
              { id: 'menu', icon: ClipboardList, label: 'Manage Menu' },
              { id: 'bookings', icon: CalendarDays, label: 'Bookings', badge: pending.b },
              { id: 'inbox', icon: Mail, label: 'Inbox', badge: pending.m },
              { id: 'reviews', icon: Star, label: 'Reviews', badge: pending.r },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-brown-900 text-gold-400 border-r-4 border-gold-400' : 'hover:bg-brown-800 text-cream-300'}`}>
                <tab.icon className="w-5 h-5" /> {tab.label}
                {tab.badge > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center font-bold rounded-full shadow-sm animate-pulse">{tab.badge}</span>}
              </button>
            ))}
          </div>
          
          <button onClick={handleLogout} className="flex items-center gap-2 px-8 py-6 border-t border-brown-800 text-red-400 hover:text-red-300 text-sm transition-colors">
            <LogOut className="w-4 h-4" /> Secure Logout
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-200/20 rounded-full blur-3xl pointer-events-none" />

          {/* --- ANALYTICS PANEL --- */}
          {activeTab === 'analytics' && (
            <div className="relative z-10 animate-fade-in">
              <div className="mb-8">
                <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Overview</p>
                <h2 className="font-serif text-3xl font-bold">Performance Dashboard</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><IndianRupee className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm font-medium text-brown-500 uppercase tracking-wider mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-brown-900">₹{totalRevenue.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><TrendingUp className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm font-medium text-brown-500 uppercase tracking-wider mb-1">Completed Orders</p>
                    <p className="text-2xl font-bold text-brown-900">{validOrders.length}</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center"><Clock className="w-6 h-6" /></div>
                  <div>
                    <p className="text-sm font-medium text-brown-500 uppercase tracking-wider mb-1">Pending Orders</p>
                    <p className="text-2xl font-bold text-brown-900">{pending.o}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-200">
                <h3 className="font-serif text-lg font-bold text-brown-900 mb-6">Top Selling Items</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={popularItemsData}>
                      <XAxis dataKey="name" tick={{fill: '#78716c', fontSize: 12}} />
                      <YAxis tick={{fill: '#78716c', fontSize: 12}} />
                      <Tooltip cursor={{fill: '#fefce8'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="sales" fill="#d97706" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* --- LIVE ORDERS PANEL --- */}
          {activeTab === 'orders' && (
            <div className="relative z-10 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Kitchen Dashboard</p>
                  <h2 className="font-serif text-3xl font-bold">Live Orders</h2>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-400" />
                    <input type="text" placeholder="Search customer..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-cream-300 rounded-full text-sm text-brown-900 focus:outline-none focus:border-gold-400 focus:ring-1" />
                  </div>
                  <button onClick={loadData} className="p-2.5 bg-white border border-cream-300 rounded-full text-brown-600 hover:text-gold-600 hover:border-gold-400 shadow-sm">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg border border-cream-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-brown-900 text-gold-400 font-serif">
                    <tr>
                      <th className="p-5 font-medium tracking-wide">ID / Type</th>
                      <th className="p-5 font-medium tracking-wide">Customer Info</th>
                      <th className="p-5 font-medium tracking-wide">Items</th>
                      <th className="p-5 font-medium tracking-wide">Total</th>
                      <th className="p-5 font-medium tracking-wide">Status</th>
                      <th className="p-5 font-medium tracking-wide text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-brown-400">No active orders found.</td></tr>
                    ) : filteredOrders.map(order => {
                      const items = JSON.parse(order.items_json || '[]');
                      const isHotel = order.order_type === 'Hotel';
                      
                      return (
                        <tr key={order.id} className="hover:bg-cream-50 transition-colors">
                          <td className="p-5">
                            <strong className="text-brown-900 block">#{order.id}</strong>
                            {isHotel ? (
                              <span className="inline-flex items-center gap-1 mt-1 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                <Bed className="w-3 h-3"/> Rm {order.hotel_tab?.room_number}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Walk-in</span>
                            )}
                          </td>
                          <td className="p-5">
                            <p className="font-medium text-brown-900">{isHotel ? order.hotel_tab?.guest_name : order.customer_name}</p>
                            {!isHotel && <p className="text-xs text-brown-500 mt-0.5">{order.customer_phone}</p>}
                          </td>
                          <td className="p-5">
                            <div className="max-h-24 overflow-y-auto pr-2 text-sm text-brown-700 space-y-1">
                              {items.map((item, i) => (
                                <div key={i} className="flex justify-between">
                                  <span>{item.quantity ? `${item.quantity}x ` : ''}{item.name}</span>
                                  <span className="text-brown-400">₹{item.price}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-5"><strong className="text-gold-700">₹{order.total_amount}</strong></td>
                          <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStyle(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-5 text-right space-x-2 flex justify-end">
                            {order.status === 'Pending' && (
                              <button onClick={() => handleAction(`${API_BASE}/orders/${order.id}/status/`, 'PUT', {status: 'Accepted'}, 'Order Accepted')} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100" title="Accept">
                                <ChefHat className="w-4 h-4" />
                              </button>
                            )}
                            {(order.status === 'Accepted' || order.status === 'Paid & Preparing') && (
                              <button onClick={() => handleAction(`${API_BASE}/orders/${order.id}/status/`, 'PUT', {status: 'Completed'}, 'Order Completed')} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100" title="Mark Completed">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {order.status !== 'Completed' && order.status !== 'Rejected' && (
                              <button onClick={() => handleAction(`${API_BASE}/orders/${order.id}/status/`, 'PUT', {status: 'Rejected'}, 'Order Rejected')} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100" title="Reject">
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- POS & BILLING PANEL --- */}
          {activeTab === 'pos' && (
            <div className="relative z-10 animate-fade-in flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
              {/* Menu Grid */}
              <div className="flex-1 overflow-y-auto pr-2">
                <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Point of Sale</p>
                <h2 className="font-serif text-3xl font-bold mb-6">Create Custom Bill</h2>
                
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.menu.filter(m => m.is_available).map(item => (
                    <button key={item.id} onClick={() => addToPOS(item)} className="bg-white p-4 rounded-xl shadow-sm border border-cream-200 text-left hover:border-gold-500 hover:shadow-md transition-all active:scale-95">
                      <div className="font-bold text-brown-900 mb-1 leading-tight">{item.name}</div>
                      <div className="text-gold-700 font-medium text-sm">₹{item.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Receipt Sidebar */}
              <div className="w-full lg:w-96 bg-white rounded-2xl shadow-lg border border-cream-200 p-6 flex flex-col h-full sticky top-0">
                <h3 className="font-serif text-xl font-bold text-brown-900 mb-4 border-b border-cream-200 pb-4">Current Bill</h3>
                
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {posItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-brown-900 leading-tight">{item.name}</div>
                        <div className="text-xs text-brown-500 mt-0.5">₹{item.price} x {item.quantity}</div>
                      </div>
                      <div className="font-bold text-sm text-brown-900 w-16 text-right">₹{item.price * item.quantity}</div>
                      <button onClick={() => removeFromPOS(idx)} className="ml-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {posItems.length === 0 && <p className="text-sm text-brown-400 text-center mt-12 italic">Select items to add to bill</p>}
                </div>
                
                <div className="border-t border-cream-200 pt-4 mt-auto">
                  <div className="flex justify-between items-center font-bold text-xl text-brown-900 mb-6">
                    <span>Total</span>
                    <span className="text-gold-700">₹{posTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setPosItems([])} className="px-5 py-3 bg-cream-100 text-brown-600 rounded-xl font-medium hover:bg-cream-200 transition-colors">Clear</button>
                    <button onClick={handlePOSPrint} className="flex-1 bg-brown-900 text-gold-400 py-3 rounded-xl font-bold hover:bg-brown-800 flex justify-center items-center gap-2 shadow-md transition-colors">
                      <Printer className="w-5 h-5"/> Print Bill
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- MENU MANAGEMENT PANEL --- */}
          {activeTab === 'menu' && (
            <div className="relative z-10 animate-fade-in">
               <div className="flex justify-between items-center mb-8">
                  <div>
                    <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Website Controller</p>
                    <h2 className="font-serif text-3xl font-bold">Manage Digital Menu</h2>
                  </div>
               </div>

               <div className="grid lg:grid-cols-3 gap-8">
                  {/* Form Section */}
                  <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-cream-200 sticky top-8">
                      <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
                        {isEditingMenu ? <Edit2 className="w-5 h-5 text-blue-500"/> : <Plus className="w-5 h-5 text-gold-500"/>} 
                        {isEditingMenu ? 'Edit Item' : 'Add New Item'}
                      </h3>
                      <form onSubmit={handleMenuSubmit} className="space-y-4">
                        <div>
                          <label className="block text-xs font-medium text-brown-500 uppercase mb-1">Item Name</label>
                          <input required type="text" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-brown-500 uppercase mb-1">Category</label>
                          <input required type="text" placeholder="e.g. Combos & Offers" value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-brown-500 uppercase mb-1">Price (₹)</label>
                          <input required type="number" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-brown-500 uppercase mb-1">Image URL</label>
                          <input required type="url" value={menuForm.img} onChange={e => setMenuForm({...menuForm, img: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400" />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button type="submit" className="flex-1 bg-brown-900 text-white py-2 rounded-lg hover:bg-brown-800 transition">{isEditingMenu ? 'Update Item' : 'Add Item'}</button>
                          {isEditingMenu && (
                            <button type="button" onClick={() => { setIsEditingMenu(false); setMenuForm({ id: null, name: '', category: '', price: '', img: '', is_available: true }); }} className="px-4 py-2 border border-brown-300 rounded-lg text-sm">Cancel</button>
                          )}
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Table Section */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg border border-cream-200 overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-brown-900 text-gold-400 font-serif">
                          <tr><th className="p-4 font-medium">Image</th><th className="p-4 font-medium">Name & Category</th><th className="p-4 font-medium">Price</th><th className="p-4 font-medium text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-cream-200">
                          {data.menu.map(item => (
                            <tr key={item.id} className={`hover:bg-cream-50 ${!item.is_available ? 'opacity-60 bg-gray-50' : ''}`}>
                              <td className="p-4"><img src={item.img} alt={item.name} className="w-12 h-12 object-cover rounded-md" /></td>
                              <td className="p-4">
                                <p className="font-bold">{item.name}</p>
                                <div className="flex gap-2 mt-1">
                                  <span className="text-xs text-brown-500 bg-cream-100 px-2 py-0.5 rounded-full">{item.category}</span>
                                  {!item.is_available && <span className="text-xs text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-bold">Out of Stock</span>}
                                </div>
                              </td>
                              <td className="p-4 font-bold text-gold-700">₹{item.price}</td>
                              <td className="p-4 text-right space-x-2">
                                {/* Stock Toggle Button */}
                                <button onClick={() => handleAction(`${API_BASE}/menu/${item.id}/`, 'PUT', {...item, is_available: !item.is_available}, 'Inventory Updated')} className={`p-2 rounded-lg ${item.is_available ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-amber-600 bg-amber-50 hover:bg-amber-100'}`} title={item.is_available ? "Mark Out of Stock" : "Mark Available"}>
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                                {/* Edit Button */}
                                <button onClick={() => {setMenuForm(item); setIsEditingMenu(true); window.scrollTo({top: 0, behavior: 'smooth'});}} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
                                {/* Delete Button */}
                                <button onClick={() => handleAction(`${API_BASE}/menu/${item.id}/`, 'DELETE', null, 'Item deleted')} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* --- HOTEL FOLIOS PANEL --- */}
          {activeTab === 'hotel' && (
            <div className="relative z-10 animate-fade-in">
               <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Front Desk</p>
                  <h2 className="font-serif text-3xl font-bold">Automated Room Management</h2>
                </div>
                <button onClick={loadData} className="p-2.5 bg-white border border-cream-300 rounded-full text-brown-600 hover:text-gold-600 shadow-sm">
                    <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {hotelRooms.map(room => {
                  const activeTab = data.hotel.find(t => t.room_number === room && t.is_active);
                  return (
                    <div key={room} className={`rounded-2xl p-6 border shadow-sm transition-all ${activeTab ? 'bg-white border-gold-300 shadow-md' : 'bg-cream-100 border-cream-200 opacity-75'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-serif text-2xl font-bold text-brown-900">Rm {room}</h3>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${activeTab ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                          {activeTab ? 'Occupied' : 'Vacant'}
                        </span>
                      </div>

                      {activeTab ? (
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs text-brown-500 uppercase font-medium">Guest Name</p>
                            <p className="font-medium text-brown-900 text-lg">{activeTab.guest_name}</p>
                          </div>
                          <button onClick={() => handleHotelCheckout(activeTab, room)} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors shadow-sm flex justify-center items-center gap-2">
                            <Printer className="w-4 h-4"/> Check Out & Print Bill
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 py-3 text-center border-t border-cream-200/50 mt-4">
                          <p className="text-xs text-brown-400 italic">Waiting for guest's first room service order to auto-start tab.</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* --- BOOKINGS PANEL --- */}
          {activeTab === 'bookings' && (
            <div className="relative z-10 animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Reservations</p>
                  <h2 className="font-serif text-3xl font-bold">Table Bookings</h2>
                </div>
                <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-300 rounded-full text-sm font-medium hover:text-gold-600"><RefreshCw className="w-4 h-4" /> Refresh</button>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg border border-cream-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-brown-900 text-gold-400 font-serif">
                    <tr><th className="p-5 font-medium">Time & Date</th><th className="p-5 font-medium">Guest Details</th><th className="p-5 font-medium">Party Size</th><th className="p-5 font-medium">Requests</th><th className="p-5 font-medium">Status / Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {data.bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-cream-50">
                        <td className="p-5"><strong className="text-brown-900 block">{booking.time}</strong><span className="text-xs text-brown-500">{booking.date}</span></td>
                        <td className="p-5"><p className="font-medium text-brown-900">{booking.customer_name}</p><p className="text-xs text-brown-500 mt-0.5">{booking.customer_phone}</p></td>
                        <td className="p-5 font-medium text-brown-700">{booking.guests} Guests</td>
                        <td className="p-5 text-sm text-brown-600 max-w-[200px] truncate">{booking.special_requests || '-'}</td>
                        <td className="p-5 flex gap-2">
                          {booking.status === 'Pending' ? (
                             <button onClick={() => handleAction(`${API_BASE}/bookings/${booking.id}/`, 'PATCH', {status: 'Accepted'}, 'Booking Accepted')} className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">Accept</button>
                          ) : (
                             <span className="px-3 py-1 rounded-full text-xs font-bold border bg-green-100 text-green-700 border-green-200">{booking.status}</span>
                          )}
                          <button onClick={() => handleAction(`${API_BASE}/bookings/${booking.id}/`, 'DELETE', null, 'Booking Deleted')} className="p-1 text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- INBOX PANEL --- */}
          {activeTab === 'inbox' && (
            <div className="relative z-10 animate-fade-in">
               <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Communications</p>
                  <h2 className="font-serif text-3xl font-bold">Contact Inbox</h2>
                </div>
                <button onClick={loadData} className="p-2.5 bg-white border border-cream-300 rounded-full text-brown-600 hover:text-gold-600 hover:border-gold-400 shadow-sm">
                    <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              {data.messages.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl shadow-lg border border-cream-200">
                  <Mail className="w-12 h-12 text-cream-300 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-medium text-brown-900 mb-2">You're all caught up!</h3>
                  <p className="text-brown-500">No new messages from customers at this time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.messages.map(msg => (
                    <div key={msg.id} className="bg-white p-6 rounded-2xl shadow-lg border border-cream-200 flex flex-col relative">
                      <div className="flex justify-between items-start mb-4 border-b border-cream-100 pb-4">
                        <div>
                          <h3 className="font-bold text-brown-900 text-lg">{msg.name}</h3>
                          <a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline">{msg.email}</a>
                        </div>
                        <span className="text-xs text-brown-400 bg-cream-100 px-2 py-1 rounded-md">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-brown-700 text-sm leading-relaxed whitespace-pre-wrap flex-grow mb-6">
                        {msg.message}
                      </p>
                      <button 
                        onClick={() => handleAction(`${API_BASE}/contact/${msg.id}/`, 'DELETE', null, 'Message Deleted')} 
                        className="mt-auto self-end flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Mark Resolved & Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- REVIEWS MODERATION PANEL --- */}
          {activeTab === 'reviews' && (
            <div className="relative z-10 animate-fade-in">
              <div className="mb-8">
                <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Public Reputation</p>
                <h2 className="font-serif text-3xl font-bold">Review Moderation</h2>
              </div>
              <div className="space-y-4">
                {data.reviews.map(r => (
                  <div key={r.id} className={`p-6 bg-white rounded-xl shadow-sm flex justify-between items-center border-l-4 ${r.is_approved ? 'border-green-400' : 'border-amber-400'}`}>
                    <div>
                      <h3 className="font-bold text-brown-900">{r.name} <span className="text-sm font-normal text-gray-500">({r.rating} Stars)</span></h3>
                      <p className="italic text-gray-700 mt-1">"{r.text}"</p>
                    </div>
                    <div className="flex gap-2">
                      {!r.is_approved && (
                        <button onClick={() => handleAction(`${API_BASE}/reviews/${r.id}/`, 'PATCH', {is_approved: true}, 'Review Approved!')} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200">Approve</button>
                      )}
                      <button onClick={() => handleAction(`${API_BASE}/reviews/${r.id}/`, 'DELETE', null, 'Review Deleted')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"><Trash2 className="w-5 h-5"/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}