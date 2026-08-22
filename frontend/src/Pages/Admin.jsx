import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Utensils, CalendarDays, MonitorSmartphone, Search, RefreshCw, 
  ArrowLeft, CheckCircle, XCircle, ChefHat, Printer, Save, Trash2, 
  Plus, Edit2, ClipboardList, Database, Activity, LogOut, TrendingUp, IndianRupee, Bed, CreditCard
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics'); // Default to Analytics
  
  // Data States
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [hotelTabs, setHotelTabs] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  
  // POS State
  const [posItems, setPosItems] = useState([]);
  const [posActiveOrder, setPosActiveOrder] = useState(null);
  const [billItemName, setBillItemName] = useState('');
  const [billItemPrice, setBillItemPrice] = useState('');

  // Menu Management State
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const [menuForm, setMenuForm] = useState({ id: null, name: '', category: '', price: '', img: '' });
  
  // Hotel Management State
  const [newGuestName, setNewGuestName] = useState({});
  const hotelRooms = ['101', '102', '103', '104', '105', '106', '107', '108'];

  // Security Helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    navigate('/admin-login');
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    fetchOrders();
    fetchBookings();
    fetchMenu();
    fetchHotelTabs();
    
    // Auto-refresh live orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders/`, { headers: getAuthHeaders() }); 
      if (res.ok) setOrders(await res.json());
      else if (res.status === 401) handleLogout(); // Token expired
    } catch (e) { console.error(e); }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${API_BASE}/bookings/`, { headers: getAuthHeaders() });
      if (res.ok) setBookings(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchMenu = async () => {
    try {
      const res = await fetch(`${API_BASE}/menu/`);
      if (res.ok) setMenuItems(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchHotelTabs = async () => {
    try {
      // Assuming you created a standard ViewSet for HotelTabs
      const res = await fetch(`${API_BASE}/hotel-tabs/`, { headers: getAuthHeaders() });
      if (res.ok) setHotelTabs(await res.json());
    } catch (e) { console.error(e); }
  };

  // --- ORDER MANAGEMENT ---
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Order #${orderId} marked as ${newStatus}`);
        fetchOrders(); 
      }
    } catch (error) { toast.error("Failed to update status"); }
  };

  // --- HOTEL MANAGEMENT ---
  const handleOpenTab = async (room) => {
    const lastName = newGuestName[room];
    if (!lastName) return toast.error("Please enter guest last name");

    try {
      const res = await fetch(`${API_BASE}/hotel-tabs/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ room_number: room, guest_last_name: lastName, is_active: true })
      });
      if (res.ok) {
        toast.success(`Tab opened for Room ${room}`);
        setNewGuestName({ ...newGuestName, [room]: '' });
        fetchHotelTabs();
      }
    } catch (e) { toast.error("Failed to open tab"); }
  };

  const handleCloseTab = async (tabId, room) => {
    if (!window.confirm(`Close tab for Room ${room}? This blocks further room charges.`)) return;
    try {
      const res = await fetch(`${API_BASE}/hotel-tabs/${tabId}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_active: false })
      });
      if (res.ok) {
        toast.success(`Tab closed for Room ${room}`);
        fetchHotelTabs();
      }
    } catch (e) { toast.error("Failed to close tab"); }
  };

  // --- POS & BILLING SYSTEM ---
  const loadOrderIntoPOS = (order) => {
    setPosActiveOrder(order);
    try { setPosItems(JSON.parse(order.items_json)); } 
    catch (e) { setPosItems([]); }
    setActiveTab('pos');
  };

  const handleAddPosItem = () => {
    const price = parseFloat(billItemPrice);
    if (!billItemName || isNaN(price)) return toast.error("Enter valid item and price.");
    setPosItems([...posItems, { name: billItemName, price: price }]);
    setBillItemName('');
    setBillItemPrice('');
  };

  const savePosOrderToDB = async () => {
    if (!posActiveOrder) return;
    const total = posItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
    try {
      const res = await fetch(`${API_BASE}/orders/${posActiveOrder.id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items_json: JSON.stringify(posItems), total_amount: total })
      });
      if (res.ok) {
        toast.success("Bill updated successfully!");
        fetchOrders();
      }
    } catch (error) { toast.error("Error saving bill."); }
  };

  // --- MENU MANAGEMENT ---
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const method = isEditingMenu ? 'PUT' : 'POST';
    const url = isEditingMenu ? `${API_BASE}/menu/${menuForm.id}/` : `${API_BASE}/menu/`;

    try {
      const res = await fetch(url, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(menuForm)
      });
      if (res.ok) {
        toast.success(isEditingMenu ? "Item updated!" : "Item added!");
        fetchMenu();
        setMenuForm({ id: null, name: '', category: '', price: '', img: '' });
        setIsEditingMenu(false);
      }
    } catch (error) { toast.error("Failed to save menu item"); }
  };

  const deleteMenuItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      const res = await fetch(`${API_BASE}/menu/${id}/`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        toast.success("Item deleted");
        fetchMenu();
      }
    } catch (error) { toast.error("Failed to delete item"); }
  };

  // --- ANALYTICS CALCULATIONS ---
  const validOrders = orders.filter(o => o.status === 'Paid & Preparing' || o.status === 'Completed');
  const totalRevenue = validOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  
  const itemCounts = {};
  validOrders.forEach(order => {
    try {
      const items = JSON.parse(order.items_json);
      items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
      });
    } catch (e) {}
  });

  const popularItemsData = Object.keys(itemCounts)
    .map(key => ({ name: key.substring(0, 12) + '...', sales: itemCounts[key] }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 6); 

  // Helpers
  const filteredOrders = orders.filter(o => (o.customer_name || '').toLowerCase().includes(orderSearch.toLowerCase()));
  const posTotal = posItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
  
  const getStatusStyle = (status) => {
    const styles = {
      'Pending': 'bg-amber-100 text-amber-700',
      'Accepted': 'bg-blue-100 text-blue-700',
      'Paid & Preparing': 'bg-orange-100 text-orange-700',
      'Completed': 'bg-green-100 text-green-700',
      'Rejected': 'bg-red-100 text-red-700',
    };
    return styles[status] || styles['Pending'];
  };

  return (
    <div className="flex h-screen w-screen bg-cream-50 overflow-hidden font-sans text-brown-900">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <div className="w-64 bg-brown-950 text-cream-100 flex flex-col shadow-2xl z-20">
        <div className="text-center p-8 border-b border-brown-800">
          <Utensils className="w-8 h-8 text-gold-400 mx-auto mb-3" />
          <h1 className="font-serif text-xl text-gold-400 tracking-[0.1em] uppercase mb-1">High Spirits</h1>
          <p className="text-cream-400 text-xs tracking-widest uppercase">Admin Portal</p>
        </div>
        
        <div className="flex flex-col py-4 flex-grow overflow-y-auto hide-scrollbar">
          <button onClick={() => setActiveTab('analytics')} className={`flex items-center gap-3 px-8 py-4 text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-brown-900 text-gold-400 border-r-4 border-gold-400' : 'hover:bg-brown-800 text-cream-300'}`}>
            <Activity className="w-5 h-5" /> Analytics
          </button>
          <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-3 px-8 py-4 text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-brown-900 text-gold-400 border-r-4 border-gold-400' : 'hover:bg-brown-800 text-cream-300'}`}>
            <ChefHat className="w-5 h-5" /> Live Orders
          </button>
          <button onClick={() => setActiveTab('hotel')} className={`flex items-center gap-3 px-8 py-4 text-sm font-medium transition-all ${activeTab === 'hotel' ? 'bg-brown-900 text-gold-400 border-r-4 border-gold-400' : 'hover:bg-brown-800 text-cream-300'}`}>
            <Bed className="w-5 h-5" /> Hotel Folios
          </button>
          <button onClick={() => setActiveTab('pos')} className={`flex items-center gap-3 px-8 py-4 text-sm font-medium transition-all ${activeTab === 'pos' ? 'bg-brown-900 text-gold-400 border-r-4 border-gold-400' : 'hover:bg-brown-800 text-cream-300'}`}>
            <MonitorSmartphone className="w-5 h-5" /> POS & Billing
          </button>
          <button onClick={() => setActiveTab('menu')} className={`flex items-center gap-3 px-8 py-4 text-sm font-medium transition-all ${activeTab === 'menu' ? 'bg-brown-900 text-gold-400 border-r-4 border-gold-400' : 'hover:bg-brown-800 text-cream-300'}`}>
            <ClipboardList className="w-5 h-5" /> Manage Menu
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-3 px-8 py-4 text-sm font-medium transition-all ${activeTab === 'bookings' ? 'bg-brown-900 text-gold-400 border-r-4 border-gold-400' : 'hover:bg-brown-800 text-cream-300'}`}>
            <CalendarDays className="w-5 h-5" /> Bookings
          </button>
        </div>
        
        <button onClick={handleLogout} className="flex items-center gap-2 px-8 py-6 border-t border-brown-800 text-red-400 hover:text-red-300 text-sm transition-colors">
          <LogOut className="w-4 h-4" /> Secure Logout
        </button>
      </div>

      {/* Main Content */}
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
                  <p className="text-2xl font-bold text-brown-900">{orders.filter(o => o.status === 'Pending').length}</p>
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

        {/* --- ORDERS PANEL --- */}
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
                <button onClick={fetchOrders} className="p-2.5 bg-white border border-cream-300 rounded-full text-brown-600 hover:text-gold-600 hover:border-gold-400 shadow-sm">
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
                          <p className="font-medium text-brown-900">{isHotel ? order.hotel_tab?.guest_last_name : order.customer_name}</p>
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
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-5 text-right space-x-2 flex justify-end">
                          {order.status === 'Pending' && (
                            <button onClick={() => updateOrderStatus(order.id, 'Accepted')} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100" title="Accept & Await Payment">
                              <ChefHat className="w-4 h-4" />
                            </button>
                          )}
                          
                          {(order.status === 'Accepted' || order.status === 'Paid & Preparing') && (
                            <button onClick={() => updateOrderStatus(order.id, 'Completed')} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100" title="Mark Completed">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          {order.status !== 'Completed' && order.status !== 'Rejected' && (
                            <button onClick={() => updateOrderStatus(order.id, 'Rejected')} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => loadOrderIntoPOS(order)} className="p-2 text-gold-700 bg-gold-50 rounded-lg hover:bg-gold-100" title="Edit in POS">
                            <MonitorSmartphone className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- HOTEL FOLIOS PANEL --- */}
        {activeTab === 'hotel' && (
          <div className="relative z-10 animate-fade-in">
             <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Front Desk</p>
                <h2 className="font-serif text-3xl font-bold">Room Management</h2>
              </div>
              <button onClick={fetchHotelTabs} className="p-2.5 bg-white border border-cream-300 rounded-full text-brown-600 hover:text-gold-600 hover:border-gold-400 shadow-sm">
                  <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hotelRooms.map(room => {
                const activeTab = hotelTabs.find(t => t.room_number === room && t.is_active);
                return (
                  <div key={room} className={`rounded-2xl p-6 border shadow-sm ${activeTab ? 'bg-white border-gold-300' : 'bg-cream-100 border-cream-200 opacity-75'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-serif text-2xl font-bold text-brown-900">Rm {room}</h3>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${activeTab ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {activeTab ? 'Occupied' : 'Vacant'}
                      </span>
                    </div>

                    {activeTab ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-brown-500 uppercase font-medium">Guest Last Name</p>
                          <p className="font-medium text-brown-900 text-lg">{activeTab.guest_last_name}</p>
                        </div>
                        <button onClick={() => handleCloseTab(activeTab.id, room)} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                          Check Out / Close Tab
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-brown-500 uppercase font-medium mb-1 block">New Guest Last Name</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Smith" 
                            value={newGuestName[room] || ''}
                            onChange={(e) => setNewGuestName({...newGuestName, [room]: e.target.value})}
                            className="w-full px-3 py-2 bg-white border border-cream-300 rounded-lg text-sm focus:outline-none focus:border-gold-400"
                          />
                        </div>
                        <button onClick={() => handleOpenTab(room)} className="w-full py-2 bg-brown-900 text-white rounded-lg text-sm font-medium hover:bg-brown-800 transition-colors">
                          Check In Guest
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- POS & BILLING PANEL --- */}
        {activeTab === 'pos' && (
          <div className="relative z-10 animate-fade-in">
            {/* Keeping the existing robust POS logic exactly as it was */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">
                  {posActiveOrder ? `Modifying Order #${posActiveOrder.id}` : 'Standalone POS'}
                </p>
                <h2 className="font-serif text-3xl font-bold">Generate & Print Bill</h2>
              </div>
              <div className="flex gap-3">
                {posActiveOrder && (
                  <button onClick={savePosOrderToDB} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 transition-all shadow-md">
                    <Save className="w-4 h-4" /> Save Edits
                  </button>
                )}
                <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-brown-900 text-cream-100 rounded-full text-sm font-medium hover:bg-brown-800 transition-all shadow-md">
                  <Printer className="w-4 h-4" /> Print Bill
                </button>
              </div>
            </div>
            
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3">
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-cream-200 mb-6">
                  <h3 className="font-serif text-xl font-bold text-brown-900 mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-gold-600" /> Add Custom Item
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-medium text-brown-500 uppercase tracking-wider mb-2">Item Name</label>
                      <input type="text" value={billItemName} onChange={(e) => setBillItemName(e.target.value)} className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-brown-900 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brown-500 uppercase tracking-wider mb-2">Price (₹)</label>
                      <input type="number" value={billItemPrice} onChange={(e) => setBillItemPrice(e.target.value)} className="w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-brown-900 focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400" />
                    </div>
                  </div>
                  <button onClick={handleAddPosItem} className="w-full btn-gold py-3.5 rounded-xl font-medium shadow-md">Add to Receipt</button>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <div id="printable-receipt" className="bg-white p-8 rounded-sm shadow-xl border border-cream-200 font-mono text-sm relative">
                  <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-6">
                    <h3 className="text-lg font-bold text-black tracking-widest mb-1">HIGH SPIRITS CAFE</h3>
                    <p className="text-xs text-gray-600 mt-3">Date: {new Date().toLocaleDateString()}<br/>{posActiveOrder && `Order ID: #${posActiveOrder.id}`}</p>
                  </div>
                  <div className="space-y-3 mb-6 min-h-[200px]">
                    {posItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-start group">
                        <span className="flex-1 pr-4">{item.quantity ? `${item.quantity}x ` : ''}{item.name}</span>
                        <span className="font-medium">₹{item.price}</span>
                        <button onClick={() => handleRemovePosItem(index)} className="ml-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity print:hidden"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="border-t-2 border-dashed border-gray-300 pt-4 flex justify-between items-center text-lg font-bold">
                    <span>TOTAL</span>
                    <span>₹{posTotal}</span>
                  </div>
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
                <div className="lg:col-span-1">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-cream-200">
                    <h3 className="font-serif text-xl font-bold mb-4">{isEditingMenu ? 'Edit Menu Item' : 'Add New Item'}</h3>
                    <form onSubmit={handleMenuSubmit} className="space-y-4">
                      <div><label className="block text-xs font-medium text-brown-500 uppercase mb-1">Item Name</label><input required type="text" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400" /></div>
                      <div><label className="block text-xs font-medium text-brown-500 uppercase mb-1">Category (e.g. Combos & Offers)</label><input required type="text" value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400" /></div>
                      <div><label className="block text-xs font-medium text-brown-500 uppercase mb-1">Price (₹)</label><input required type="number" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400" /></div>
                      <div><label className="block text-xs font-medium text-brown-500 uppercase mb-1">Image URL</label><input required type="url" value={menuForm.img} onChange={e => setMenuForm({...menuForm, img: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400" /></div>
                      <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-brown-900 text-white py-2 rounded-lg hover:bg-brown-800 transition">{isEditingMenu ? 'Update' : 'Add Item'}</button>
                        {isEditingMenu && <button type="button" onClick={() => { setIsEditingMenu(false); setMenuForm({ id: null, name: '', category: '', price: '', img: '' }); }} className="px-4 py-2 border border-brown-300 rounded-lg">Cancel</button>}
                      </div>
                    </form>
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-lg border border-cream-200 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-brown-900 text-gold-400 font-serif">
                        <tr><th className="p-4 font-medium">Image</th><th className="p-4 font-medium">Name & Category</th><th className="p-4 font-medium">Price</th><th className="p-4 font-medium text-right">Actions</th></tr>
                      </thead>
                      <tbody className="divide-y divide-cream-200">
                        {menuItems.map(item => (
                          <tr key={item.id} className="hover:bg-cream-50">
                            <td className="p-4"><img src={item.img} alt={item.name} className="w-12 h-12 object-cover rounded-md" /></td>
                            <td className="p-4"><p className="font-bold">{item.name}</p><span className="text-xs text-brown-500 bg-cream-100 px-2 py-0.5 rounded-full">{item.category}</span></td>
                            <td className="p-4 font-bold text-gold-700">₹{item.price}</td>
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => {setMenuForm(item); setIsEditingMenu(true);}} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
                              <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
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

        {/* --- BOOKINGS PANEL --- */}
        {activeTab === 'bookings' && (
          <div className="relative z-10 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
              <div><p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Reservations</p><h2 className="font-serif text-3xl font-bold">Table Bookings</h2></div>
              <button onClick={fetchBookings} className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-300 rounded-full text-sm font-medium hover:text-gold-600"><RefreshCw className="w-4 h-4" /> Refresh</button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg border border-cream-200 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-brown-900 text-gold-400 font-serif">
                  <tr><th className="p-5 font-medium">Time & Date</th><th className="p-5 font-medium">Guest Details</th><th className="p-5 font-medium">Party Size</th><th className="p-5 font-medium">Requests</th><th className="p-5 font-medium">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-cream-50">
                      <td className="p-5"><strong className="text-brown-900 block">{booking.time}</strong><span className="text-xs text-brown-500">{booking.date}</span></td>
                      <td className="p-5"><p className="font-medium text-brown-900">{booking.customer_name}</p><p className="text-xs text-brown-500 mt-0.5">{booking.customer_phone}</p></td>
                      <td className="p-5 font-medium text-brown-700">{booking.guests} Guests</td>
                      <td className="p-5 text-sm text-brown-600 max-w-[200px] truncate">{booking.special_requests || '-'}</td>
                      <td className="p-5"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${booking.status === 'Pending' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200'}`}>{booking.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}