import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Utensils, CalendarDays, MonitorSmartphone, Search, RefreshCw, 
  CheckCircle, XCircle, ChefHat, Printer, Trash2, 
  Plus, Edit2, ClipboardList, Activity, LogOut, TrendingUp, 
  IndianRupee, Bed, Mail, Clock, Star, Volume2, VolumeX, Layers,
  QrCode
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_BASE = API_BASE.replace(/^http/, 'ws');

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics'); 
  const [data, setData] = useState({ orders: [], bookings: [], menu: [], hotel: [], messages: [], reviews: [] });
  const [orderSearch, setOrderSearch] = useState('');
  
  const [isEditingMenu, setIsEditingMenu] = useState(false);
  const emptyMenu = { id: null, name: '', category: '', price: '', img: '', is_available: true };
  const [menuForm, setMenuForm] = useState(emptyMenu);
  
  const [menuFormMode, setMenuFormMode] = useState('standard'); 
  const [comboItems, setComboItems] = useState([]);

  const [posItems, setPosItems] = useState([]);
  const [posCustomerName, setPosCustomerName] = useState('Walk-in Customer');
  const [posCustomerPhone, setPosCustomerPhone] = useState('0000000000');

  const [printData, setPrintData] = useState(null);
  const [printQRs, setPrintQRs] = useState(false);

  const [audioEnabled, setAudioEnabled] = useState(() => localStorage.getItem('hsc_admin_audio') === 'true');
  const audioEnabledRef = useRef(audioEnabled);
  useEffect(() => { audioEnabledRef.current = audioEnabled; }, [audioEnabled]);

  const singleAlertAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/1110/1110-preview.mp3')); 
  const continuousAlarmAudio = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/1114/1114-preview.mp3'));

  const pending = {
    o: data.orders.filter(x => x.status === 'Pending').length,
    b: data.bookings.filter(x => x.status === 'Pending').length,
    m: data.messages.length,
    r: data.reviews.filter(x => !x.is_approved).length
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintData(null);
      setPrintQRs(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  // Continuous looping audio enabled
  useEffect(() => {
    continuousAlarmAudio.current.loop = true;
    const hasUrgentPending = pending.o > 0 || pending.b > 0;

    if (audioEnabled && hasUrgentPending) {
      const playPromise = continuousAlarmAudio.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.warn("Alarm blocked by browser auto-play policy.", e);
        });
      }
    } else {
      continuousAlarmAudio.current.pause();
      continuousAlarmAudio.current.currentTime = 0;
    }
    return () => { continuousAlarmAudio.current.pause(); };
  }, [pending.o, pending.b, audioEnabled]);

  const secureApiCall = async (url, options = {}) => {
    let token = localStorage.getItem('admin_access_token');
    let headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res = await fetch(url, { ...options, headers });
    if (res.status === 401 || res.status === 403) {
      const refresh = localStorage.getItem('admin_refresh_token');
      if (refresh) {
        const refreshRes = await fetch(`${API_BASE}/api/token/refresh/`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh })
        });
        if (refreshRes.ok) {
          const tokenData = await refreshRes.json();
          localStorage.setItem('admin_access_token', tokenData.access);
          headers['Authorization'] = `Bearer ${tokenData.access}`;
          res = await fetch(url, { ...options, headers }); 
        } else {
          localStorage.clear();
          navigate('/admin-login');
        }
      }
    }
    return res;
  };

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    localStorage.setItem('hsc_admin_audio', newState);
    
    if (newState) {
      singleAlertAudio.current.play().catch(e => console.log("Audio unlock failed", e));
      toast.success("Audio Notifications Enabled!");
    } else {
      continuousAlarmAudio.current.pause();
      continuousAlarmAudio.current.currentTime = 0;
      toast.success("Audio Notifications Muted");
    }
  };

  const alertOwner = (type) => {
    const alerts = {
      order: { text: "New food order received", title: "New Order!" },
      booking: { text: "New table reservation request", title: "New Reservation!" },
      message: { text: "New customer message", title: "New Message!" },
      review: { text: "New review submitted", title: "New Review Pending" }
    };
    
    if (audioEnabledRef.current && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(alerts[type]?.text || "New Notification");
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(alerts[type]?.title, { body: alerts[type]?.text, icon: '/vite.svg' });
    }
  };

  const loadData = async () => {
    try {
      const [o, b, m, h, msg, r] = await Promise.all([
        secureApiCall(`${API_BASE}/orders/`).then(res => res.json()),
        secureApiCall(`${API_BASE}/bookings/`).then(res => res.json()),
        secureApiCall(`${API_BASE}/menu/`).then(res => res.json()),
        secureApiCall(`${API_BASE}/hotel-tabs/`).then(res => res.json()),
        secureApiCall(`${API_BASE}/contact/`).then(res => res.json()),
        secureApiCall(`${API_BASE}/reviews/`).then(res => res.json())
      ]);
      setData({ orders: o, bookings: b, menu: m, hotel: h, messages: msg, reviews: r });
    } catch (e) { console.log("Silent refresh failed"); }
  };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    loadData();
    const pollInterval = setInterval(() => { loadData(); }, 15000);

    let ws;
    let reconnectTimer;
    
    const connectWs = () => {
      const token = localStorage.getItem('admin_access_token');
      if (!token) return;
      ws = new WebSocket(`${WS_BASE}/ws/admin-notifications/?token=${token}`);
      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        alertOwner(payload.event);
        loadData();
      };
      ws.onclose = () => { reconnectTimer = setTimeout(connectWs, 3000); };
    };

    connectWs();

    return () => {
      clearInterval(pollInterval);
      clearTimeout(reconnectTimer);
      if (ws) { ws.onclose = null; ws.close(); }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (menuFormMode === 'combo' && !isEditingMenu) {
      if (comboItems.length > 0) {
        const autoName = comboItems.map(i => i.name.split(' ')[0]).join(' + ') + ' Combo';
        setMenuForm(prev => ({ ...prev, name: autoName }));
      } else {
        setMenuForm(prev => ({ ...prev, name: '' }));
      }
    }
  }, [comboItems, menuFormMode, isEditingMenu]);

  const handleAction = async (url, method, payload, successMsg) => {
    try {
      const options = { method };
      if (payload) {
          options.body = JSON.stringify(payload);
          options.headers = { 'Content-Type': 'application/json' };
      }
      const res = await secureApiCall(url, options);
      if (res.ok) { 
        toast.success(successMsg); 
        await loadData(); 
      } else {
        const errText = await res.text();
        let errObj = {};
        try { errObj = JSON.parse(errText); } catch(e) {}
        toast.error(errObj.error || `Action failed (${res.status}). Check console.`);
      }
    } catch (error) { toast.error("Network connection error."); }
  };

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    const method = isEditingMenu ? 'PUT' : 'POST';
    const url = isEditingMenu ? `${API_BASE}/menu/${menuForm.id}/` : `${API_BASE}/menu/`;
    const res = await secureApiCall(url, { method, body: JSON.stringify(menuForm) });
    if (res.ok) {
      toast.success(isEditingMenu ? "Menu item updated!" : "New item added!");
      setMenuForm(emptyMenu);
      setComboItems([]);
      setMenuFormMode('standard');
      setIsEditingMenu(false);
      loadData();
    } else { toast.error("Failed to save menu item"); }
  };

  const toggleComboItem = (item) => {
    setComboItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.filter(i => i.id !== item.id);
      return [...prev, item];
    });
  };

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

  const handlePOSPrint = async (e) => {
    e.preventDefault();
    if (posItems.length === 0) return toast.error("Add items to print bill");
    
    const cleanName = posCustomerName.trim() || 'Walk-in Customer';
    
    try {
      const payload = {
        order_type: 'Standard', 
        customer_name: cleanName, 
        customer_phone: posCustomerPhone || '0000000000',
        items_json: JSON.stringify(posItems), 
        total_amount: posTotal, 
        idempotency_key: crypto.randomUUID()
      };
      
      const response = await secureApiCall(`${API_BASE}/orders/checkout/`, { method: 'POST', body: JSON.stringify(payload) });
      
      if (response.ok) {
        const orderData = await response.json();
        await secureApiCall(`${API_BASE}/orders/${orderData.order_id}/status/`, { method: 'PUT', body: JSON.stringify({ status: 'Completed' }) });
        
        setPrintData({ 
          title: 'Standalone Bill', 
          subtitle: `Guest: ${cleanName}`, 
          items: posItems, 
          total: posTotal 
        });
        
        continuousAlarmAudio.current.pause();
        continuousAlarmAudio.current.currentTime = 0;
        
        await loadData();
        
        setTimeout(() => { 
          window.print(); 
          setPosItems([]); 
          setPosCustomerName('Walk-in Customer');
          setPosCustomerPhone('0000000000');
        }, 500);
      } else {
        const errorText = await response.json();
        toast.error(errorText.error || "Failed to process POS order.");
      }
    } catch (error) { toast.error("Network error. Please try again."); }
  };

  // FIX: Read names securely using `order.customer?.name` instead of `order.customer_name`
  const printExistingOrder = (order) => {
    let parsedItems = [];
    try {
      let raw = order.items_json;
      if (typeof raw === 'string') raw = JSON.parse(raw);
      if (typeof raw === 'string') raw = JSON.parse(raw); 
      parsedItems = Array.isArray(raw) ? raw : [];
    } catch (e) {
      toast.error("Corrupted order data, cannot print.");
      return;
    }
    
    setPrintData({
      title: order.order_type === 'Hotel' ? `Room ${order.hotel_tab?.room_number} Folio` : 'Walk-in Bill',
      subtitle: `Guest: ${order.order_type === 'Hotel' ? order.hotel_tab?.guest_name : order.customer?.name}`,
      items: parsedItems,
      total: parseFloat(order.total_amount)
    });
    setTimeout(() => { window.print(); }, 500);
  };

  const handleHotelCheckout = async (tab, room) => {
    if (!window.confirm(`Check out Room ${room} and generate final bill?`)) return;
    
    const tabOrders = data.orders.filter(o => o.hotel_tab?.id === tab.id && (o.status === 'Completed' || o.status === 'Paid & Preparing'));
    let grandTotal = 0;
    const combinedItems = {};

    tabOrders.forEach(o => {
      grandTotal += parseFloat(o.total_amount);
      try {
        let items = o.items_json;
        if (typeof items === 'string') items = JSON.parse(items);
        if (typeof items === 'string') items = JSON.parse(items);
        
        if (Array.isArray(items)) {
          items.forEach(item => {
            if (combinedItems[item.name]) combinedItems[item.name].quantity += (item.quantity || 1);
            else combinedItems[item.name] = { ...item, quantity: item.quantity || 1 };
          });
        }
      } catch(e) { console.error(e) }
    });

    setPrintData({ title: `Room ${room} Folio`, subtitle: `Guest: ${tab.guest_name}`, items: Object.values(combinedItems), total: grandTotal });
    await handleAction(`${API_BASE}/hotel-tabs/${tab.id}/`, 'PATCH', {is_active: false}, `Room ${room} Checked Out successfully`);
    setTimeout(() => { window.print(); }, 500);
  };

  const handleLogout = () => { localStorage.clear(); navigate('/admin-login'); };

  const getStyle = (s) => ({
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'Accepted': 'bg-blue-100 text-blue-700 border-blue-200',
    'Paid & Preparing': 'bg-orange-100 text-orange-700 border-orange-200',
    'Completed': 'bg-green-100 text-green-700 border-green-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200',
  }[s] || 'bg-gray-100 text-gray-700');

  const hotelRooms = ['101', '102', '103', '104', '105', '106', '107', '108'];
  
  // FIX: Filter by reading standard customer name from the nested object
  const filteredOrders = data.orders.filter(o => (o.customer?.name || o.hotel_tab?.guest_name || '').toLowerCase().includes(orderSearch.toLowerCase()));
  
  const validOrders = data.orders.filter(o => o.status !== 'Rejected');
  const totalRevenue = validOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  const itemCounts = {};
  
  validOrders.forEach(order => {
    try {
      let items = order.items_json;
      if (typeof items === 'string') items = JSON.parse(items);
      if (typeof items === 'string') items = JSON.parse(items); 
      
      if (Array.isArray(items)) {
        items.forEach(item => { 
          if (item.name) {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1); 
          }
        });
      }
    } catch (e) {
      console.error("Analytics parsing error:", e);
    }
  });

  const popularItemsData = Object.keys(itemCounts).map(key => ({ name: key.substring(0, 12) + '...', sales: itemCounts[key] })).sort((a, b) => b.sales - a.sales).slice(0, 6);

  return (
    <>
      <div className="hidden print:block bg-white text-black font-mono w-full min-h-screen p-8">
        {printData && !printQRs && (
          <div className="max-w-md mx-auto">
            <h2 className="text-center font-bold text-2xl mb-1 tracking-widest">HIGH SPIRITS CAFE</h2>
            <p className="text-center text-sm mb-4">Date: {new Date().toLocaleDateString()}</p>
            <div className="text-center border-y-2 border-dashed border-gray-400 py-3 mb-6">
              <p className="font-bold text-lg uppercase tracking-wider">{printData.title}</p>
              <p className="text-sm">{printData.subtitle}</p>
            </div>
            <table className="w-full mb-6 text-sm">
              <thead><tr className="border-b border-gray-300"><th className="text-left pb-2">Item</th><th className="text-center pb-2">Qty</th><th className="text-right pb-2">Price</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {printData.items.map((item, idx) => (
                  <tr key={idx}><td className="py-3 pr-2">{item.name}</td><td className="text-center py-3">{item.quantity}</td><td className="text-right py-3">₹{(item.price * item.quantity).toFixed(2)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="border-t-2 border-dashed border-gray-400 pt-4 flex justify-between font-bold text-xl"><span>TOTAL</span><span>₹{printData.total.toFixed(2)}</span></div>
            <p className="text-center mt-12 text-sm italic">Thank you for dining with us!</p>
          </div>
        )}
        
        {printQRs && (
          <div className="max-w-4xl mx-auto font-sans">
            <h2 className="text-center font-bold text-3xl mb-8 tracking-widest border-b-4 border-black pb-4">ROOM SERVICE SCAN CODES</h2>
            <div className="grid grid-cols-2 gap-8">
              {hotelRooms.map((room) => {
                 const roomUrl = `${window.location.origin}/?room=${room}`;
                 const qrApi = `https://quickchart.io/qr?text=${encodeURIComponent(roomUrl)}&margin=1&size=400`;
                 return (
                   <div key={room} className="border-4 border-black p-6 flex flex-col items-center justify-center rounded-3xl text-center break-inside-avoid shadow-sm">
                     <h3 className="font-black text-5xl mb-6 text-black">ROOM {room}</h3>
                     <img src={qrApi} alt={`QR for Room ${room}`} className="w-56 h-56 mb-6" />
                     <p className="text-lg font-bold uppercase tracking-widest text-black">Scan to Order</p>
                     <p className="text-sm font-medium text-gray-600 mt-1">High Spirits Cafe</p>
                   </div>
                 )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex h-screen w-screen bg-cream-50 overflow-hidden font-sans text-brown-900 print:hidden">
        <Toaster position="top-right" />
        <div className="w-64 bg-brown-950 text-cream-100 flex flex-col z-20 shadow-2xl relative">
          <button onClick={toggleAudio} className={`absolute top-4 left-4 p-2 rounded-full transition-colors ${audioEnabled ? 'bg-gold-500 text-brown-900 shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'bg-brown-800 text-gray-500'}`} title={audioEnabled ? "Disable Audio Alerts" : "Enable Audio Alerts"}>
            {audioEnabled ? <Volume2 className="w-4 h-4"/> : <VolumeX className="w-4 h-4"/>}
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

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-200/20 rounded-full blur-3xl pointer-events-none" />
          
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
                    <p className="text-sm font-medium text-brown-500 uppercase tracking-wider mb-1">Active / Complete Orders</p>
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
                <div className="w-full h-[300px]">
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
                    <tr><th className="p-5 font-medium tracking-wide">ID / Type</th><th className="p-5 font-medium tracking-wide">Customer Info</th><th className="p-5 font-medium tracking-wide">Items</th><th className="p-5 font-medium tracking-wide">Total</th><th className="p-5 font-medium tracking-wide">Status</th><th className="p-5 font-medium tracking-wide text-right">Actions</th></tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {filteredOrders.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-brown-400">No active orders found.</td></tr>
                    ) : filteredOrders.map(order => {
                      let items = [];
                      try {
                        let raw = order.items_json;
                        if (typeof raw === 'string') raw = JSON.parse(raw);
                        if (typeof raw === 'string') raw = JSON.parse(raw);
                        items = Array.isArray(raw) ? raw : [];
                      } catch (e) {}

                      const isHotel = order.order_type === 'Hotel';
                      return (
                        <tr key={order.id} className={`hover:bg-cream-50 transition-colors ${order.status === 'Pending' ? 'bg-amber-50/50' : ''}`}>
                          <td className="p-5">
                            <strong className="text-brown-900 block" title={order.id}>#{order.id.substring(0,8)}...</strong>
                            {isHotel ? (
                              <span className="inline-flex items-center gap-1 mt-1 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"><Bed className="w-3 h-3"/> Rm {order.hotel_tab?.room_number}</span>
                            ) : (
                              <span className="inline-flex items-center gap-1 mt-1 bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Walk-in</span>
                            )}
                          </td>
                          <td className="p-5">
                            {/* FIX: Correctly reading nested customer name for Walk-in orders */}
                            <p className="font-medium text-brown-900">{isHotel ? order.hotel_tab?.guest_name : order.customer?.name}</p>
                            {!isHotel && <p className="text-xs text-brown-500 mt-0.5">{order.customer?.phone === '0000000000' ? 'POS System' : order.customer?.phone}</p>}
                          </td>
                          <td className="p-5">
                            <div className="max-h-24 overflow-y-auto pr-2 text-sm text-brown-700 space-y-1">
                              {items.map((item, i) => (
                                <div key={i} className="flex justify-between"><span>{item.quantity ? `${item.quantity}x ` : ''}{item.name}</span><span className="text-brown-400">₹{item.price}</span></div>
                              ))}
                            </div>
                          </td>
                          <td className="p-5"><strong className="text-gold-700">₹{order.total_amount}</strong></td>
                          <td className="p-5"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStyle(order.status)}`}>{order.status}</span></td>
                          <td className="p-5 text-right space-x-2 flex justify-end">
                            <button onClick={() => printExistingOrder(order)} className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 border border-gray-200" title="Print Bill">
                              <Printer className="w-4 h-4" />
                            </button>
                            {order.status === 'Pending' && <button onClick={() => handleAction(`${API_BASE}/orders/${order.id}/status/`, 'PUT', {status: 'Accepted'}, 'Order Accepted')} className="p-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 border border-blue-200" title="Accept"><ChefHat className="w-4 h-4" /></button>}
                            {(order.status === 'Accepted' || order.status === 'Paid & Preparing') && <button onClick={() => handleAction(`${API_BASE}/orders/${order.id}/status/`, 'PUT', {status: 'Completed'}, 'Order Completed')} className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100" title="Mark Completed"><CheckCircle className="w-4 h-4" /></button>}
                            {order.status !== 'Completed' && order.status !== 'Rejected' && <button onClick={() => handleAction(`${API_BASE}/orders/${order.id}/status/`, 'PUT', {status: 'Rejected'}, 'Order Rejected')} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100" title="Reject"><XCircle className="w-4 h-4" /></button>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'pos' && (
            <div className="relative z-10 animate-fade-in flex flex-col lg:flex-row gap-6 h-full min-h-[600px]">
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

              <form onSubmit={handlePOSPrint} className="w-full lg:w-96 bg-white rounded-2xl shadow-lg border border-cream-200 p-6 flex flex-col h-full sticky top-0">
                <h3 className="font-serif text-xl font-bold text-brown-900 mb-4 border-b border-cream-200 pb-4">Current Bill</h3>
                
                <div className="mb-4 space-y-3">
                  <input required type="text" pattern="^[A-Za-z\s\-\.]{3,50}$" title="Letters, spaces, hyphens, and dots only (e.g. Mr. Smith)" placeholder="Customer Name" value={posCustomerName} onChange={e => setPosCustomerName(e.target.value)} className="w-full text-sm px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400 bg-cream-50" />
                  <input type="tel" pattern="^([6-9]\d{9}|0000000000)?$" title="Valid 10-digit mobile number, or leave as 0000000000" placeholder="Phone Number (Optional)" value={posCustomerPhone} onChange={e => setPosCustomerPhone(e.target.value)} className="w-full text-sm px-4 py-2 border border-cream-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400 bg-cream-50" />
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {posItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center group">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-brown-900 leading-tight">{item.name}</div>
                        <div className="text-xs text-brown-500 mt-0.5">₹{item.price} x {item.quantity}</div>
                      </div>
                      <div className="font-bold text-sm text-brown-900 w-16 text-right">₹{item.price * item.quantity}</div>
                      <button type="button" onClick={() => removeFromPOS(idx)} className="ml-2 p-1 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {posItems.length === 0 && <p className="text-sm text-brown-400 text-center mt-6 italic">Select items to add to bill</p>}
                </div>
                <div className="border-t border-cream-200 pt-4 mt-auto">
                  <div className="flex justify-between items-center font-bold text-xl text-brown-900 mb-6"><span>Total</span><span className="text-gold-700">₹{posTotal.toFixed(2)}</span></div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => {setPosItems([]); setPosCustomerName('Walk-in Customer'); setPosCustomerPhone('0000000000');}} className="px-5 py-3 bg-cream-100 text-brown-600 rounded-xl font-medium hover:bg-cream-200 transition-colors">Clear</button>
                    <button type="submit" className="flex-1 bg-brown-900 text-gold-400 py-3 rounded-xl font-bold hover:bg-brown-800 flex justify-center items-center gap-2 shadow-md transition-colors"><Printer className="w-5 h-5"/> Print Bill</button>
                  </div>
                </div>
              </form>
            </div>
          )}

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
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-cream-200 sticky top-8">
                      <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
                        {isEditingMenu ? <Edit2 className="w-5 h-5 text-blue-500"/> : <Plus className="w-5 h-5 text-gold-500"/>} {isEditingMenu ? 'Edit Menu Item' : 'Add to Menu'}
                      </h3>
                      {!isEditingMenu && (
                        <div className="flex gap-2 mb-6 p-1 bg-cream-100 rounded-lg">
                          <button onClick={() => { setMenuFormMode('standard'); setMenuForm(emptyMenu); setComboItems([]); }} className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${menuFormMode === 'standard' ? 'bg-white shadow text-brown-900' : 'text-brown-500'}`}>Standard Item</button>
                          <button onClick={() => { setMenuFormMode('combo'); setMenuForm({...emptyMenu, category: 'Combos & Offers'}); }} className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all flex items-center justify-center gap-1 ${menuFormMode === 'combo' ? 'bg-white shadow text-gold-600' : 'text-brown-500'}`}><Layers className="w-3 h-3" /> Combo Builder</button>
                        </div>
                      )}
                      <form onSubmit={handleMenuSubmit} className="space-y-4">
                        {menuFormMode === 'combo' && !isEditingMenu && (
                          <div className="mb-4 border border-gold-200 bg-gold-50/30 rounded-xl p-4">
                            <label className="block text-xs font-bold text-brown-700 uppercase mb-2">Select Items to Combine</label>
                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                              {data.menu.filter(m => m.category !== 'Combos & Offers').map(item => (
                                <label key={item.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-cream-200 cursor-pointer hover:border-gold-300 transition-colors">
                                  <input type="checkbox" checked={comboItems.some(i => i.id === item.id)} onChange={() => toggleComboItem(item)} className="accent-gold-500 w-4 h-4 rounded" />
                                  <span className="text-sm font-medium text-brown-900 truncate">{item.name}</span>
                                  <span className="ml-auto text-xs font-bold text-brown-500">₹{item.price}</span>
                                </label>
                              ))}
                            </div>
                            {comboItems.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-gold-200 flex justify-between items-center"><span className="text-xs font-bold uppercase text-brown-600">Original Total Value:</span><span className="text-sm font-black text-red-500 line-through">₹{comboItems.reduce((s, i) => s + parseFloat(i.price), 0)}</span></div>
                            )}
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-medium text-brown-500 uppercase mb-1">Item / Combo Name</label>
                          <input required type="text" value={menuForm.name} onChange={e => setMenuForm({...menuForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-brown-500 uppercase mb-1">Category</label>
                          <input required type="text" readOnly={menuFormMode === 'combo' && !isEditingMenu} placeholder="e.g. Starters" value={menuForm.category} onChange={e => setMenuForm({...menuForm, category: e.target.value})} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400 ${menuFormMode === 'combo' && !isEditingMenu ? 'bg-gray-100 text-gray-500' : ''}`} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-brown-500 uppercase mb-1">{menuFormMode === 'combo' ? 'Discounted Combo Price (₹)' : 'Price (₹)'}</label>
                          <input required type="number" min="1" value={menuForm.price} onChange={e => setMenuForm({...menuForm, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-brown-500 uppercase mb-1">Image URL</label>
                          <input required type="url" value={menuForm.img} onChange={e => setMenuForm({...menuForm, img: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-gold-400" />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button type="submit" className="flex-1 bg-brown-900 text-white font-bold py-3 rounded-lg hover:bg-brown-800 transition">{isEditingMenu ? 'Update Item' : menuFormMode === 'combo' ? 'Launch New Combo' : 'Add Item'}</button>
                          {isEditingMenu && <button type="button" onClick={() => { setIsEditingMenu(false); setMenuForm(emptyMenu); }} className="px-4 py-2 border border-brown-300 rounded-lg text-sm font-bold">Cancel</button>}
                        </div>
                      </form>
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg border border-cream-200 overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-brown-900 text-gold-400 font-serif"><tr><th className="p-4 font-medium">Image</th><th className="p-4 font-medium">Name & Category</th><th className="p-4 font-medium">Price</th><th className="p-4 font-medium text-right">Actions</th></tr></thead>
                        <tbody className="divide-y divide-cream-200">
                          {data.menu.map(item => {
                            const isCombo = item.category.toLowerCase().includes('combo');
                            return (
                              <tr key={item.id} className={`hover:bg-cream-50 transition-colors ${!item.is_available ? 'opacity-60 bg-gray-50' : ''}`}>
                                <td className="p-4"><img src={item.img} alt={item.name} className="w-12 h-12 object-cover rounded-md" /></td>
                                <td className="p-4">
                                  <p className="font-bold text-brown-900">{item.name}</p>
                                  <div className="flex gap-2 mt-1 items-center">
                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isCombo ? 'bg-gold-100 text-gold-700' : 'bg-cream-200 text-brown-500'}`}>{item.category}</span>
                                    {!item.is_available && <span className="text-[10px] text-red-700 bg-red-100 px-2 py-0.5 rounded-full font-bold uppercase">Out of Stock</span>}
                                  </div>
                                </td>
                                <td className="p-4 font-bold text-gold-700 text-lg">₹{item.price}</td>
                                <td className="p-4 text-right space-x-2">
                                  <button onClick={() => handleAction(`${API_BASE}/menu/${item.id}/`, 'PUT', {...item, is_available: !item.is_available}, 'Inventory Updated')} className={`p-2 rounded-lg ${item.is_available ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-amber-600 bg-amber-50 hover:bg-amber-100'}`} title={item.is_available ? "Mark Out of Stock" : "Mark Available"}><RefreshCw className="w-4 h-4" /></button>
                                  <button onClick={() => {setMenuForm(item); setIsEditingMenu(true); window.scrollTo({top: 0, behavior: 'smooth'});}} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => handleAction(`${API_BASE}/menu/${item.id}/`, 'DELETE', null, 'Item deleted')} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'hotel' && (
            <div className="relative z-10 animate-fade-in">
               <div className="flex justify-between items-center mb-8">
                <div><p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Front Desk</p><h2 className="font-serif text-3xl font-bold">Automated Room Management</h2></div>
                <div className="flex gap-3">
                  <button onClick={() => { setPrintQRs(true); setTimeout(() => { window.print(); setPrintQRs(false); }, 1000); }} className="flex items-center gap-2 px-4 py-2.5 bg-brown-900 text-gold-400 rounded-xl text-sm font-bold shadow-md hover:bg-brown-800 transition-colors"><QrCode className="w-5 h-5"/> Print Room QRs</button>
                  <button onClick={loadData} className="p-2.5 bg-white border border-cream-300 rounded-xl text-brown-600 hover:text-gold-600 shadow-sm"><RefreshCw className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {hotelRooms.map(room => {
                  const activeTab = data.hotel.find(t => t.room_number === room && t.is_active);
                  return (
                    <div key={room} className={`rounded-2xl p-6 border shadow-sm transition-all ${activeTab ? 'bg-white border-gold-300 shadow-md' : 'bg-cream-100 border-cream-200 opacity-75'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-serif text-2xl font-bold text-brown-900">Rm {room}</h3>
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${activeTab ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{activeTab ? 'Occupied' : 'Vacant'}</span>
                      </div>
                      {activeTab ? (
                        <div className="space-y-4">
                          <div><p className="text-xs text-brown-500 uppercase font-medium">Guest Details</p><p className="font-medium text-brown-900 text-lg">{activeTab.guest_name}</p><p className="text-xs text-brown-500">{activeTab.guest_phone}</p></div>
                          <button onClick={() => handleHotelCheckout(activeTab, room)} className="w-full py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors shadow-sm flex justify-center items-center gap-2"><Printer className="w-4 h-4"/> Check Out & Print Bill</button>
                        </div>
                      ) : (
                        <div className="space-y-4 py-3 text-center border-t border-cream-200/50 mt-4"><p className="text-xs text-brown-400 italic">Waiting for guest's first room service order to auto-start tab.</p></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="relative z-10 animate-fade-in">
              <div className="flex justify-between items-center mb-8">
                <div><p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Reservations</p><h2 className="font-serif text-3xl font-bold">Table Bookings</h2></div>
                <button onClick={loadData} className="flex items-center gap-2 px-4 py-2 bg-white border border-cream-300 rounded-full text-sm font-medium hover:text-gold-600"><RefreshCw className="w-4 h-4" /> Refresh</button>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-cream-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-brown-900 text-gold-400 font-serif"><tr><th className="p-5 font-medium">Time & Date</th><th className="p-5 font-medium">Guest Details</th><th className="p-5 font-medium">Party Size</th><th className="p-5 font-medium">Requests</th><th className="p-5 font-medium">Status / Action</th></tr></thead>
                  <tbody className="divide-y divide-cream-200">
                    {data.bookings.map(booking => (
                      <tr key={booking.id} className={`hover:bg-cream-50 ${booking.status === 'Pending' ? 'bg-amber-50/50' : ''}`}>
                        <td className="p-5"><strong className="text-brown-900 block">{booking.time}</strong><span className="text-xs text-brown-500">{booking.date}</span></td>
                        <td className="p-5"><p className="font-medium text-brown-900">{booking.customer_name}</p><p className="text-xs text-brown-500 mt-0.5">{booking.customer_phone}</p></td>
                        <td className="p-5 font-medium text-brown-700">{booking.guests} Guests</td>
                        <td className="p-5 text-sm text-brown-600 max-w-[200px] truncate">{booking.special_requests || '-'}</td>
                        <td className="p-5 flex items-center gap-2">
                          {booking.status === 'Pending' ? (
                             <><button onClick={() => handleAction(`${API_BASE}/bookings/${booking.id}/`, 'PATCH', {status: 'Accepted'}, 'Booking Accepted')} className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-bold hover:bg-blue-200 transition-colors">Accept</button><button onClick={() => handleAction(`${API_BASE}/bookings/${booking.id}/`, 'PATCH', {status: 'Rejected'}, 'Booking Rejected')} className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded text-xs font-bold hover:bg-red-200 transition-colors">Reject</button></>
                          ) : (
                             <span className={`px-3 py-1 rounded-full text-xs font-bold border ${booking.status === 'Accepted' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{booking.status}</span>
                          )}
                          <button onClick={() => handleAction(`${API_BASE}/bookings/${booking.id}/`, 'DELETE', null, 'Booking Deleted')} className="p-1 text-gray-400 hover:text-red-600 transition-colors ml-2" title="Delete Record"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inbox' && (
            <div className="relative z-10 animate-fade-in">
               <div className="flex justify-between items-center mb-8">
                <div><p className="text-gold-600 text-sm font-medium uppercase tracking-[0.2em] mb-1">Communications</p><h2 className="font-serif text-3xl font-bold">Contact Inbox</h2></div>
                <button onClick={loadData} className="p-2.5 bg-white border border-cream-300 rounded-full text-brown-600 hover:text-gold-600 hover:border-gold-400 shadow-sm"><RefreshCw className="w-5 h-5" /></button>
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
                        <div><h3 className="font-bold text-brown-900 text-lg">{msg.name}</h3><a href={`mailto:${msg.email}`} className="text-sm text-blue-600 hover:underline">{msg.email}</a></div>
                        <span className="text-xs text-brown-400 bg-cream-100 px-2 py-1 rounded-md">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-brown-700 text-sm leading-relaxed whitespace-pre-wrap flex-grow mb-6">{msg.message}</p>
                      <button onClick={() => handleAction(`${API_BASE}/contact/${msg.id}/`, 'DELETE', null, 'Message Deleted')} className="mt-auto self-end flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /> Mark Resolved & Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
                      {!r.is_approved && <button onClick={() => handleAction(`${API_BASE}/reviews/${r.id}/`, 'PATCH', {is_approved: true}, 'Review Approved!')} className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold hover:bg-green-200">Approve</button>}
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