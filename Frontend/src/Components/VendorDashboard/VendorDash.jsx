import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VendorDash.css';
import { CATEGORIES } from '../Browser/BrowseSidebar';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const getUserInfoFromToken = () => {
    let cleanToken = token ? token.replace(/^"|"$/g, '') : '';
    if (!cleanToken || cleanToken.split('.').length !== 3) return { email: 'Nincs Token', role: 'Ismeretlen' };
    try {
      let base64Url = cleanToken.split('.')[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      let jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(jsonPayload);
      const emailKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
      const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
      return {
        email: payload[emailKey] || payload.email || payload.Email || 'Nem található email',
        role: payload[roleKey] || payload.role || payload.Role || 'User'
      };
    } catch (error) { return { email: 'Hiba a dekódoláskor', role: 'Hiba' }; }
  };

  const userInfo = getUserInfoFromToken();
  const isAdmin = userInfo.role === 'Admin' || userInfo.role === '0';
  const isVendor = userInfo.role === 'Vendor' || userInfo.role === '1';
  
  const [activeTab, setActiveTab] = useState(isAdmin || isVendor ? 'overview' : 'my-orders');
  const [isLoading, setIsLoading] = useState(false);

  const isMyOrdersTab = activeTab === 'my-orders';
  const isVendorTab = activeTab === 'vendor-orders';
  const isAdminTab = activeTab === 'all-orders';
  const isSellerTab = isVendorTab || isAdminTab;

  const [dashboardStats, setDashboardStats] = useState({ totalRevenue: 0, totalSales: 0, pendingOrders: 0, activeProducts: 0 });

  const [products, setProducts] = useState([]);
  const [expandedProducts, setExpandedProducts] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock_quantity: '', category_id: '', imageUrl: '' });
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [allAccounts, setAllAccounts] = useState([]);
  const [accountSearch, setAccountSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({ firstName: '', lastName: '', companyName: '', role: '' });

  const [tickets, setTickets] = useState([]);
  const [answerInputs, setAnswerInputs] = useState({});
  const [newQuestion, setNewQuestion] = useState("");

  const [allOrders, setAllOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});

  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketFilter, setTicketFilter] = useState('all');

  const handleAuthError = (response) => {
    if (response.status === 401) {
      localStorage.removeItem('token');
      navigate('/');
      return true; 
    }
    return false;
  };

  useEffect(() => {
    if (!token) navigate('/'); 
    else {
      if (activeTab === 'overview' && (isAdmin || isVendor)) fetchStats();
      if (activeTab === 'products') fetchProducts();
      if (activeTab === 'support') fetchTickets();
      if (activeTab === 'accounts' && isAdmin) fetchAllAccounts();
      if (isMyOrdersTab || isVendorTab || isAdminTab) fetchOrders(); 
    }
  }, [token, navigate, activeTab]);

  const fetchStats = async () => {
    try {
      const response = await fetch('https://localhost:7211/api/Orders/stats', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        setDashboardStats(await response.json());
      } else {
        handleAuthError(response);
      }
    } catch (error) { console.error("Hiba a statisztikák lekérésekor:", error); }
  };

  const fetchOrders = async () => {
    try {
      let finalUrl = '';
      if (isVendorTab) {
        finalUrl = 'https://localhost:7211/api/Orders/vendor-orders';
      } else if (isAdminTab) {
        finalUrl = 'https://localhost:7211/api/Orders/all-orders';
      } else {
        finalUrl = 'https://localhost:7211/api/Orders/my-orders';
      }
      
      const response = await fetch(finalUrl, { headers: { 'Authorization': `Bearer ${token}` } });
      
      if (response.ok) {
        const data = await response.json();
        
        if (isVendorTab) {
          const grouped = {};
          data.forEach(item => {
            if (!grouped[item.orderId]) {
              grouped[item.orderId] = {
                id: item.orderId,
                orderDate: item.orderDate,
                userName: item.userName,
                shippingAddress: item.shippingAddress,
                paymentMethod: item.paymentMethod || 'Ismeretlen mód', 
                totalAmount: 0,
                items: []
              };
            }
            grouped[item.orderId].items.push({
               itemId: item.itemId,
               name: item.productName,
               quantity: item.quantity,
               price: item.paidAmount / item.quantity,
               status: item.status,
               img: item.productImage || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070"
            });
            grouped[item.orderId].totalAmount += item.paidAmount;
          });
          setAllOrders(Object.values(grouped).sort((a,b) => new Date(b.orderDate) - new Date(a.orderDate)));
        } else {
          setAllOrders(data);
        }
      } else {
        handleAuthError(response);
      }
    } catch (error) { console.error("Hiba a rendelések lekérésekor:", error); }
  };

  const filteredOrders = Array.isArray(allOrders) ? allOrders.filter(order => {
    const searchLower = orderSearch.toLowerCase();
    const matchSearch = String(order.id).includes(searchLower) || (order.userName || '').toLowerCase().includes(searchLower);
    
    let matchFilter = true;
    if (orderFilter !== 'all') {
      if (isVendorTab && order.items) {
        matchFilter = order.items.some(item => item.status === orderFilter);
      } else {
        matchFilter = order.status === orderFilter;
      }
    }
    
    return matchSearch && matchFilter;
  }) : [];

  const filteredTickets = Array.isArray(tickets) ? tickets.filter(ticket => {
    const searchLower = ticketSearch.toLowerCase();
    const matchSearch = String(ticket.id).includes(searchLower) || ticket.question.toLowerCase().includes(searchLower);
    const matchFilter = ticketFilter === 'all' || ticket.status.toLowerCase() === ticketFilter;
    return matchSearch && matchFilter;
  }) : [];

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`https://localhost:7211/api/Orders/${orderId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(newStatus)
      });
      if (response.ok) fetchOrders(); 
    } catch (error) { console.error(error); }
  };

  const handleUpdateItemStatus = async (itemId, newStatus) => {
    try {
      const response = await fetch(`https://localhost:7211/api/Orders/item/${itemId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(newStatus)
      });
      if (response.ok) fetchOrders(); 
    } catch (error) { console.error(error); }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("VIGYÁZAT: Biztosan törlöd ezt a rendelést?")) return;
    try {
      const response = await fetch(`https://localhost:7211/api/Orders/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) fetchOrders();
    } catch (error) { console.error(error); }
  };

  const toggleOrderExpand = (id) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://localhost:7211/api/Products/dashboard', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        setProducts(await response.json()); 
      } else {
        handleAuthError(response);
      }
    } catch (error) { console.error("Hiba:", error); } 
    finally { setIsLoading(false); }
  };

  const toggleProductExpand = (id) => {
    setExpandedProducts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await fetch('https://localhost:7211/api/Products/upload-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: uploadData
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
      } else {
        alert("A kép feltöltése sikertelen volt.");
      }
    } catch (error) {
      console.error("Hálózati hiba képfeltöltéskor:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const isUpdating = editingProduct !== null;
    const url = isUpdating ? `https://localhost:7211/api/Products/${editingProduct.id}` : 'https://localhost:7211/api/Products'; 
    const payload = { ...formData, price: parseFloat(formData.price), stockQuantity: parseInt(formData.stock_quantity), categoryId: formData.category_id ? parseInt(formData.category_id) : 0 };
    try {
      const response = await fetch(url, { method: isUpdating ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (response.ok) { setIsModalOpen(false); fetchProducts(); }
    } catch (error) { console.error("Hiba:", error); }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a terméket?")) return;
    try {
      const response = await fetch(`https://localhost:7211/api/Products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) fetchProducts(); 
    } catch (error) { console.error(error); }
  };

  const handleToggleProductStatus = async (id, isApproved) => {
    const actionText = isApproved ? 'deaktiválni (elrejteni a boltból)' : 'aktiválni (publikálni)';
    if (!window.confirm(`Biztosan ${actionText} szeretnéd ezt a terméket?`)) return;
    try {
      const response = await fetch(`https://localhost:7211/api/Products/toggle-status/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) fetchProducts();
    } catch (error) { console.error(error); }
  };

  const openCreateModal = () => { setEditingProduct(null); setFormData({ name: '', description: '', price: '', stock_quantity: '', category_id: '', imageUrl: '' }); setIsModalOpen(true); };
  const openEditModal = (product) => { setEditingProduct(product); setFormData({ name: product.name, description: product.description, price: product.price, stock_quantity: product.stockQuantity, category_id: product.categoryId, imageUrl: product.imageUrl || '' }); setIsModalOpen(true); };

  const filteredProducts = Array.isArray(products) ? products.filter(p => {
    const searchLower = productSearch.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(searchLower) || (p.description && p.description.toLowerCase().includes(searchLower));
    const matchFilter = productFilter === 'all' || (productFilter === 'approved' && p.isApproved) || (productFilter === 'pending' && !p.isApproved);
    return matchSearch && matchFilter;
  }) : [];

  const fetchAllAccounts = async () => {
    try {
      const response = await fetch('https://localhost:7211/api/Users/all', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        setAllAccounts(await response.json());
      } else {
        handleAuthError(response);
      }
    } catch (error) { console.error(error); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("VIGYÁZAT: Biztosan törlöd ezt a felhasználót? (A profil eltűnik, de az adatok megmaradnak)")) return;
    try {
      const response = await fetch(`https://localhost:7211/api/Users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) fetchAllAccounts();
    } catch (error) { console.error(error); }
  };

  const handleToggleAccountStatus = async (id, currentStatus) => {
    const actionText = currentStatus === 'Active' ? 'deaktiválni (felfüggeszteni)' : 'aktiválni';
    if (!window.confirm(`Biztosan ${actionText} szeretnéd ezt a fiókot?`)) return;
    try {
      const response = await fetch(`https://localhost:7211/api/Users/toggle-status/${id}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) fetchAllAccounts(); 
    } catch (error) { console.error(error); }
  };

  const openEditUserModal = (user) => {
    setEditingUser(user);
    setUserFormData({ firstName: user.firstName || '', lastName: user.lastName || '', companyName: user.companyName || '', role: user.role || 'Customer' });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const id = editingUser.userId || editingUser.UserId;
    try {
      const response = await fetch(`https://localhost:7211/api/Users/admin-update/${id}`, { 
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(userFormData) 
      });
      if (response.ok) { setIsUserModalOpen(false); fetchAllAccounts(); } else { alert("Hiba a mentés során!"); }
    } catch (error) { console.error("Hiba:", error); }
  };

  const filteredAccounts = Array.isArray(allAccounts) ? allAccounts.filter(acc => {
    const searchLower = accountSearch.toLowerCase();
    const mail = (acc.email || acc.Email || '').toLowerCase();
    const fName = (acc.firstName || acc.FirstName || '').toLowerCase();
    const lName = (acc.lastName || acc.LastName || '').toLowerCase();
    const cName = (acc.companyName || acc.CompanyName || '').toLowerCase();
    const r = acc.role || acc.Role || '';
    const nameMatch = fName.includes(searchLower) || lName.includes(searchLower) || cName.includes(searchLower);
    const emailMatch = mail.includes(searchLower);
    const roleMatch = roleFilter === 'all' || r === roleFilter;
    return (nameMatch || emailMatch) && roleMatch;
  }) : [];

  const fetchTickets = async () => {
    try {
      const response = await fetch('https://localhost:7211/api/Support/tickets', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        setTickets(await response.json());
      } else {
        handleAuthError(response);
      }
    } catch (error) { console.error(error); }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if(!newQuestion.trim()) return;
    try {
      const response = await fetch('https://localhost:7211/api/Support/ask', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ question: newQuestion }) });
      if (response.ok) { alert("Kérdés sikeresen beküldve!"); setNewQuestion(""); fetchTickets(); } 
      else { alert("Hiba történt a küldés során."); }
    } catch (error) { console.error("Hiba a kérdés beküldésekor:", error); }
  };

  const submitAnswer = async (id) => {
    const answer = answerInputs[id];
    if (!answer || !answer.trim()) return alert("A válasz nem lehet üres!");
    try {
      const response = await fetch(`https://localhost:7211/api/Support/${id}/answer`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ answer }) });
      if (response.ok) { alert("Válasz elmentve!"); setAnswerInputs(prev => ({...prev, [id]: ''})); fetchTickets(); }
    } catch (error) { console.error(error); }
  };

  const deleteTicket = async (id) => {
    if(!window.confirm("Biztosan törölni akarod ezt a kérdést?")) return;
    try {
      const response = await fetch(`https://localhost:7211/api/Support/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) fetchTickets();
    } catch (error) { console.error(error); }
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'Processing': return { text: '⚙️ Feldolgozás alatt', color: '#f59e0b' };
      case 'Paid': return { text: '💳 Fizetve', color: '#3b82f6' };
      case 'Shipped': return { text: '🚚 Szállítva', color: '#8b5cf6' };
      case 'Delivered': return { text: '✅ Kézbesítve', color: '#10b981' };
      case 'Cancelled': return { text: '❌ Törölve', color: '#ef4444' };
      default: return { text: status, color: 'var(--text-muted)' };
    }
  }

  return (
    <div className="vendor-dashboard">
      <aside className="v-sidebar">
        <div className="v-brand" onClick={() => navigate('/')}>
          <div className="v-logo-icon"><span className="material-symbols-outlined">shopping_bag</span></div>
          <div>
            <span className="v-company">{isAdmin ? 'VENDORA ADMIN' : 'VENDORA DASH'}</span>
            <span className="v-sub">Vezérlőpult</span>
          </div>
        </div>

        <nav className="v-nav">
          
          {(isAdmin || isVendor) && (
            <div className={`v-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <span className="material-symbols-outlined">dashboard</span> 
              <span className="v-nav-text">Áttekintés</span>
            </div>
          )}

          <div className={`v-nav-item ${activeTab === 'my-orders' ? 'active' : ''}`} onClick={() => setActiveTab('my-orders')}>
            <span className="material-symbols-outlined">shopping_bag</span> 
            <span className="v-nav-text">Saját Rendeléseim</span>
          </div>

          {(isAdmin || isVendor) && (
            <div className={`v-nav-item ${activeTab === 'vendor-orders' ? 'active' : ''}`} onClick={() => setActiveTab('vendor-orders')}>
              <span className="material-symbols-outlined">storefront</span> 
              <span className="v-nav-text">Beérkezett Rendelések</span>
            </div>
          )}

          {isAdmin && (
            <div className={`v-nav-item ${activeTab === 'all-orders' ? 'active' : ''}`} onClick={() => setActiveTab('all-orders')}>
              <span className="material-symbols-outlined">local_shipping</span> 
              <span className="v-nav-text">Összes Rendelés</span>
            </div>
          )}

          {(isAdmin || isVendor) && (
            <div className={`v-nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
              <span className="material-symbols-outlined">inventory_2</span> Termékek
            </div>
          )}
          
          {isAdmin && (
            <div className={`v-nav-item ${activeTab === 'accounts' ? 'active' : ''}`} onClick={() => setActiveTab('accounts')}>
              <span className="material-symbols-outlined">group</span> Fiókok
            </div>
          )}

          <div className={`v-nav-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
            <span className="material-symbols-outlined">manage_accounts</span> Fiókom
          </div>
          <div className={`v-nav-item ${activeTab === 'support' ? 'active' : ''}`} onClick={() => setActiveTab('support')}>
            <span className="material-symbols-outlined">forum</span> Support Q&A
          </div>
        </nav>

        <div className="v-user-card">
          <p className="v-user-label">Bejelentkezve:</p>
          <p className="v-user-email">{userInfo.email}</p>
          <span className="v-user-role">{userInfo.role}</span>
        </div>

        <button className="v-logout-btn" onClick={() => { localStorage.removeItem('token'); navigate('/'); }}>
          <span className="material-symbols-outlined">logout</span> Kijelentkezés
        </button>
      </aside>

      <main className="v-main">
        <div className="v-content-fade-in">

          {activeTab === 'overview' && (isAdmin || isVendor) && (
            <>
              <div className="v-page-header">
                <div>
                  <h1 style={{ margin: '0 0 10px 0' }}>Szia, {userInfo.email.split('@')[0]}! 👋</h1>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Itt van egy gyors áttekintés az üzleted jelenlegi állásáról.</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', margin: 0, fontWeight: 'bold' }}>Teljes Bevétel</p>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>payments</span>
                  </div>
                  <h2 style={{ color: 'var(--text-highlight)', margin: 0, fontSize: '28px' }}>{(Number(dashboardStats.totalRevenue) || 0).toLocaleString()} Ft</h2>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #10b981', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', margin: 0, fontWeight: 'bold' }}>Eladott Termékek</p>
                    <span className="material-symbols-outlined" style={{ color: '#10b981' }}>shopping_cart_checkout</span>
                  </div>
                  <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '28px' }}>{(Number(dashboardStats.totalSales) || 0).toLocaleString()} db</h2>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #f59e0b', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', margin: 0, fontWeight: 'bold' }}>Várakozó Tételek</p>
                    <span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>pending_actions</span>
                  </div>
                  <h2 style={{ color: '#f59e0b', margin: 0, fontSize: '28px' }}>{(Number(dashboardStats.pendingOrders) || 0).toLocaleString()} db</h2>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', borderLeft: '4px solid #8b5cf6', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase', margin: 0, fontWeight: 'bold' }}>Aktív Termékeid</p>
                    <span className="material-symbols-outlined" style={{ color: '#8b5cf6' }}>inventory_2</span>
                  </div>
                  <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '28px' }}>{(Number(dashboardStats.activeProducts) || 0).toLocaleString()} db</h2>
                </div>
              </div>
            </>
          )}

          {(isMyOrdersTab || isVendorTab || isAdminTab) && (
            <>
              <div className="v-page-header" style={{ alignItems: 'flex-end' }}>
                <div>
                  <h1 style={{ margin: '0 0 10px 0' }}>
                    {isAdminTab ? 'Platform Összes Rendelése' : 
                    (isVendorTab ? 'Eladott Termékeid Rendelései' : 'Saját Vásárlásaim')}
                  </h1>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
                    {isAdminTab ? 'A rendszer összes megrendelésének áttekintése és kezelése.' : 
                    (isVendorTab ? 'Azok a rendelések, melyeket a vásárlók a te termékeidre adtak le.' : 'Az általad leadott rendelések és státuszuk.')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ position: 'relative', width: '250px' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)', fontSize: '20px' }}>search</span>
                    <input type="text" className="v-input-field" placeholder="Keresés ID / Név alapján..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} style={{ paddingLeft: '35px' }} />
                  </div>
                  <select className="v-input-field v-select" value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} style={{ width: '180px', cursor: 'pointer' }}>
                    <option value="all">Minden státusz</option>
                    <option value="Processing">Feldolgozás alatt</option>
                    <option value="Paid">Fizetve</option>
                    <option value="Shipped">Szállítva</option>
                    <option value="Delivered">Kézbesítve</option>
                    <option value="Cancelled">Törölve</option>
                  </select>
                </div>
              </div>
              <div className="v-table-container">
                <table className="v-table">
                  {isSellerTab ? (
                    <thead>
                      <tr>
                        <th>Rendelés ID</th>
                        <th>Dátum</th>
                        <th>Vásárló</th>
                        <th>Érték</th>
                        <th className="text-right">Műveletek</th>
                      </tr>
                    </thead>
                  ) : (
                    <thead>
                      <tr>
                        <th>Rendelés ID</th>
                        <th>Dátum</th>
                        <th>Végösszeg</th>
                        <th>Státusz</th>
                      </tr>
                    </thead>
                  )}

                  <tbody>
                    {!Array.isArray(filteredOrders) || filteredOrders.length === 0 ? (
                      <tr><td colSpan="5" className="text-center" style={{padding: '40px'}}>Nincs találat a keresésre.</td></tr>
                    ) : (
                      filteredOrders.map(order => {
                        const displayId = order.id;
                        const displayDate = order.orderDate || order.date;
                        const displayTotal = order.totalAmount || order.total;

                        if (isSellerTab) {
                          const isExpanded = expandedOrders[displayId];
                          return (
                            <React.Fragment key={`seller-order-${displayId}`}>
                              <tr style={{ background: isExpanded ? 'var(--bg-input)' : 'transparent', transition: 'background 0.2s' }}>
                                <td className="v-font-bold">#{displayId}</td>
                                <td>{new Date(displayDate).toLocaleDateString()}</td>
                                <td>
                                  <span className="v-font-bold v-block">{order.userName || 'Ismeretlen'}</span>
                                  {isAdminTab && <span style={{fontSize: '11px', color: 'var(--text-muted)'}}>ID: {order.userId}</span>}
                                </td>
                                <td className="v-text-highlight">{(Number(displayTotal) || 0).toLocaleString()} Ft</td>
                                <td className="text-right v-actions" style={{ whiteSpace: 'nowrap' }}>
                                  <button onClick={() => toggleOrderExpand(displayId)} className="v-btn-icon" title="Részletek megnyitása" style={{ color: 'var(--primary)', marginRight: '5px' }}>
                                    <span className="material-symbols-outlined">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                                  </button>
                                  {isAdminTab && (
                                    <button onClick={() => handleDeleteOrder(displayId)} className="v-btn-icon v-btn-delete" title="Rendelés törlése">
                                      <span className="material-symbols-outlined">delete</span>
                                    </button>
                                  )}
                                </td>
                              </tr>
                              
                              {isExpanded && (
                                <tr>
                                  <td colSpan="5" style={{ background: 'var(--bg-input)', padding: '24px', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
                                      <div>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Szállítási Cím</h4>
                                        <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', fontWeight: '600' }}>{order.shippingAddress}</p>
                                      </div>
                                      <div>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fizetési Mód & Összeg</h4>
                                        <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', fontWeight: '600' }}>
                                          {order.paymentMethod} - <span className="v-text-highlight">{(Number(displayTotal) || 0).toLocaleString()} Ft</span>
                                        </p>
                                      </div>
                                      
                                      {isAdminTab && (
                                        <div>
                                          <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rendelés Állapota</h4>
                                          <select className="v-input-field" style={{ padding: '6px 12px', width: 'auto', minWidth: '150px', height: 'auto', fontSize: '14px', borderColor: 'var(--primary)', cursor: 'pointer' }} value={order.status} onChange={(e) => handleUpdateOrderStatus(displayId, e.target.value)}>
                                            <option value="Processing">⚙️ Feldolgozás alatt</option>
                                            <option value="Paid">💳 Fizetve</option>
                                            <option value="Shipped">🚚 Szállítva</option>
                                            <option value="Delivered">✅ Kézbesítve</option>
                                            <option value="Cancelled">❌ Törölve</option>
                                          </select>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                      {isVendorTab ? 'Érintett Termékeid' : 'Rendelt Termékek'}
                                    </h4>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-card)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                      <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)' }}>Termék</th>
                                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)' }}>Mennyiség</th>
                                          <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)' }}>Tétel Státusz (Módosítható)</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {order.items && order.items.length > 0 ? (
                                          order.items.map((item, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                                              <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                  <img src={item.img} alt={item.name} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                                                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-main)' }}>{item.name}</span>
                                                </div>
                                              </td>
                                              <td style={{ padding: '12px', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{item.quantity} db</td>
                                              <td style={{ padding: '12px' }}>
                                                <select 
                                                  className="v-input-field" 
                                                  style={{ padding: '6px', width: 'auto', fontSize: '12px', height: 'auto', borderColor: 'var(--primary)', cursor: 'pointer' }} 
                                                  value={item.status} 
                                                  onChange={(e) => handleUpdateItemStatus(item.itemId, e.target.value)}
                                                >
                                                  <option value="Processing">⚙️ Feldolgozás alatt</option>
                                                  <option value="Paid">💳 Fizetve</option>
                                                  <option value="Shipped">🚚 Szállítva</option>
                                                  <option value="Delivered">✅ Kézbesítve</option>
                                                  <option value="Cancelled">❌ Törölve</option>
                                                </select>
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr><td colSpan="3" style={{ padding: '12px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>Nincsenek adatok a termékekről.</td></tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        } 
                        else {
                          const groupedItems = order.items.reduce((acc, item) => {
                            if (!acc[item.status]) acc[item.status] = [];
                            acc[item.status].push(item);
                            return acc;
                          }, {});

                          return (
                            <tr key={`customer-order-${displayId}`}>
                              <td className="v-font-bold" style={{verticalAlign: 'top', paddingTop: '16px'}}>#{displayId}</td>
                              <td style={{verticalAlign: 'top', paddingTop: '16px'}}>{new Date(displayDate).toLocaleDateString()}</td>
                              <td className="v-text-highlight" style={{verticalAlign: 'top', paddingTop: '16px'}}>{(Number(displayTotal) || 0).toLocaleString()} Ft</td>
                              <td>
                                {Object.entries(groupedItems).map(([status, items]) => {
                                  const statusInfo = getStatusInfo(status);
                                  return (
                                    <div key={status} style={{ marginBottom: '16px', background: 'var(--bg-page)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                      <span className="v-badge" style={{ background: statusInfo.color, color: 'white', marginBottom: '8px', display: 'inline-block' }}>
                                        {statusInfo.text}
                                      </span>
                                      <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '13px', color: 'var(--text-main)' }}>
                                        {items.map((item, idx) => (
                                          <li key={idx} style={{ marginBottom: '4px' }}>
                                            <span style={{fontWeight: 'bold'}}>{item.quantity}x</span> {item.name}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )
                                })}
                              </td>
                            </tr>
                          );
                        }
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'products' && (
            <>
              <div className="v-page-header" style={{ alignItems: 'flex-end' }}>
                <div>
                  <h1 style={{ margin: '0 0 10px 0' }}>Termékek Kezelése</h1>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>
                    {isAdmin ? 'Platform összes termékének kezelése és moderálása.' : 'Figyelem: A feltöltött termékek Admin jóváhagyás után jelennek meg a boltban!'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ position: 'relative', width: '250px' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)', fontSize: '20px' }}>search</span>
                    <input type="text" className="v-input-field" placeholder="Keresés név alapján..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} style={{ paddingLeft: '35px' }} />
                  </div>
                  {isAdmin && (
                    <select className="v-input-field v-select" value={productFilter} onChange={(e) => setProductFilter(e.target.value)} style={{ width: '180px', cursor: 'pointer' }}>
                      <option value="all">Minden státusz</option>
                      <option value="approved">✅ Publikus</option>
                      <option value="pending">⏳ Várakozik</option>
                    </select>
                  )}
                  <button className="v-btn-primary" onClick={openCreateModal} style={{ flexShrink: 0 }}>
                    <span className="material-symbols-outlined">add</span> Új termék
                  </button>
                </div>
              </div>
              <div className="v-table-container">
                {isLoading ? (
                  <p className="v-loading" style={{padding: '20px'}}>Termékek betöltése...</p>
                ) : (
                  <table className="v-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Név</th>
                        {isAdmin && <th>Feltöltő (Vendor)</th>}
                        <th>Állapot</th>
                        <th className="text-right">Műveletek</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.length === 0 ? (
                        <tr><td colSpan="6" className="text-center" style={{padding: '30px'}}>Nincs találat a keresésre.</td></tr>
                      ) : (
                        filteredProducts.map(product => {
                          const isExpanded = expandedProducts[product.id];
                          return (
                            <React.Fragment key={product.id}>
                              <tr style={{ background: isExpanded ? 'var(--bg-input)' : 'transparent', transition: 'background 0.2s' }}>
                                <td className="v-font-bold">#{product.id}</td>
                                <td className="v-font-bold">{product.name}</td>
                                {isAdmin && (
                                  <td>
                                    <span className="v-font-bold v-block">{product.userName || 'Ismeretlen'}</span>
                                    <span style={{fontSize: '11px', color: 'var(--text-muted)'}}>ID: {product.userId}</span>
                                  </td>
                                )}
                                <td>
                                  {product.isApproved ? (
                                    <span className="v-badge" style={{ background: '#10b981', color: 'white' }}>Publikus</span>
                                  ) : (
                                    <span className="v-badge" style={{ background: '#f59e0b', color: 'white' }}>Várakozik</span>
                                  )}
                                </td>
                                <td className="text-right v-actions" style={{ whiteSpace: 'nowrap' }}>
                                  <button onClick={() => toggleProductExpand(product.id)} className="v-btn-icon" title="Részletek" style={{ color: 'var(--primary)', marginRight: '5px' }}>
                                    <span className="material-symbols-outlined">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                                  </button>
                                  <button onClick={() => openEditModal(product)} className="v-btn-icon v-btn-edit" title="Szerkesztés">
                                    <span className="material-symbols-outlined">edit</span>
                                  </button>
                                  {isAdmin && (
                                    <button onClick={() => handleToggleProductStatus(product.id, product.isApproved)} className="v-btn-icon" style={{ color: product.isApproved ? '#f59e0b' : '#10b981', marginRight: '5px' }} title={product.isApproved ? "Termék elrejtése" : "Termék publikálása"}>
                                      <span className="material-symbols-outlined">{product.isApproved ? 'block' : 'check_circle'}</span>
                                    </button>
                                  )}
                                  <button onClick={() => handleDeleteProduct(product.id)} className="v-btn-icon v-btn-delete" title="Törlés">
                                    <span className="material-symbols-outlined">delete</span>
                                  </button>
                                </td>
                              </tr>
                              
                              {isExpanded && (
                                <tr>
                                  <td colSpan={isAdmin ? "5" : "4"} style={{ background: 'var(--bg-input)', padding: '24px', borderBottom: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                        {product.imageUrl && (
                                          <img src={product.imageUrl} alt={product.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        )}
                                        <div style={{ flex: 1, minWidth: '300px' }}>
                                          <div style={{ display: 'flex', gap: '24px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                            <div>
                                              <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ár</h4>
                                              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--text-highlight)' }}>{(Number(product.price) || 0).toLocaleString()} Ft</p>
                                            </div>
                                            <div>
                                              <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Készlet</h4>
                                              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>{product.stockQuantity} db</p>
                                            </div>
                                            <div>
                                              <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Kategória</h4>
                                              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)' }}>{product.categoryName || 'Ismeretlen'}</p>
                                            </div>
                                          </div>
                                          <div>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Leírás</h4>
                                            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-main)', lineHeight: '1.5' }}>{product.description}</p>
                                          </div>
                                        </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {activeTab === 'accounts' && isAdmin && (
            <>
              <div className="v-page-header" style={{ alignItems: 'flex-end' }}>
                <div>
                  <h1 style={{ margin: '0 0 10px 0' }}>Felhasználói Fiókok</h1>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '14px' }}>Platform összes regisztrált felhasználójának kezelése.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ position: 'relative', width: '250px' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)', fontSize: '20px' }}>search</span>
                    <input type="text" className="v-input-field" placeholder="Keresés név/email..." value={accountSearch} onChange={(e) => setAccountSearch(e.target.value)} style={{ paddingLeft: '35px' }} />
                  </div>
                  <select className="v-input-field v-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: '180px', cursor: 'pointer' }}>
                    <option value="all">Minden szerepkör</option>
                    <option value="Admin">Admin</option>
                    <option value="Vendor">Eladó (Vendor)</option>
                    <option value="Customer">Vásárló (Customer)</option>
                  </select>
                </div>
              </div>
              <div className="v-table-container">
                <table className="v-table">
                  <thead>
                    <tr>
                      <th>ID / Dátum</th>
                      <th>Név / Cégnév</th>
                      <th>Email</th>
                      <th>Szerepkör</th>
                      <th>Státusz</th>
                      <th className="text-right" style={{ minWidth: '100px' }}>Műveletek</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.length === 0 ? (
                      <tr><td colSpan="6" className="text-center" style={{padding: '30px'}}>Nincs találat a keresésre.</td></tr>
                    ) : (
                      filteredAccounts.map(acc => {
                        const id = acc.userId || acc.UserId;
                        const date = acc.createdAt || acc.CreatedAt;
                        const company = acc.companyName || acc.CompanyName;
                        const first = acc.firstName || acc.FirstName || '';
                        const last = acc.lastName || acc.LastName || '';
                        const email = acc.email || acc.Email;
                        const role = acc.role || acc.Role;
                        const status = acc.status || acc.Status;

                        return (
                          <tr key={id}>
                            <td>
                              <span className="v-text-muted" style={{display: 'block'}}>#{id}</span>
                              <span style={{fontSize: '12px', color: 'var(--text-muted)'}}>{date ? new Date(date).toLocaleDateString() : '-'}</span>
                            </td>
                            <td>
                              <span className="v-font-bold v-block">{company || `${first} ${last}`.trim() || 'Ismeretlen'}</span>
                            </td>
                            <td className="v-text-muted">{email}</td>
                            <td>
                              <span className="v-badge" style={{ background: role === 'Admin' ? 'var(--text-main)' : (role === 'Vendor' ? 'var(--primary)' : 'var(--bg-page)'), color: role === 'Admin' || role === 'Vendor' ? 'var(--bg-card)' : 'var(--text-main)', border: '1px solid var(--primary)' }}>{role}</span>
                            </td>
                            <td>
                              {status === 'Active' ? ( <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '13px' }}>Aktív</span> ) : status === 'Pending' ? ( <span style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '13px' }}>Felfüggesztve</span> ) : ( <span style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '13px' }}>{status}</span> )}
                            </td>
                            <td className="text-right v-actions" style={{ whiteSpace: 'nowrap' }}>
                              <button onClick={() => openEditUserModal(acc)} className="v-btn-icon v-btn-edit" title="Fiók szerkesztése">
                                <span className="material-symbols-outlined">edit</span>
                              </button>
                              {role !== 'Admin' && (
                                <button onClick={() => handleToggleAccountStatus(id, status)} className="v-btn-icon" style={{ color: status === 'Active' ? '#f59e0b' : 'var(--primary)', marginRight: '5px' }} title={status === 'Active' ? "Fiók felfüggesztése" : "Fiók aktiválása"}>
                                  <span className="material-symbols-outlined">{status === 'Active' ? 'block' : 'check_circle'}</span>
                                </button>
                              )}
                              <button onClick={() => handleDeleteUser(id)} className="v-btn-icon v-btn-delete" title="Fiók törlése">
                                <span className="material-symbols-outlined">delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'account' && (
            <>
              <div className="v-page-header">
                <h1>Fiók adatai</h1>
              </div>
              <div className="v-card-container">
                <h2 className="v-account-title">{userInfo.email}</h2>
                <span className="v-badge v-badge-info">Szerepkör: {userInfo.role}</span>
                <div className="v-grid-2">
                  <div className="v-info-box">
                    <p className="v-info-label">Azonosítási token</p>
                    <p className="v-info-value v-text-success">Érvényes (Aktív)</p>
                  </div>
                  <div className="v-info-box">
                    <p className="v-info-label">Jogosultságok</p>
                    <p className="v-info-value v-text-highlight">
                      {isAdmin ? 'Teljes platform kezelése (Admin)' : 'Csak saját termékek kezelése'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'support' && (
            <>
              <div className="v-page-header" style={{ alignItems: 'flex-end', borderBottom: 'none' }}>
                <div>
                  <h1 style={{ margin: '0 0 10px 0' }}>Support Tickets</h1>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ position: 'relative', width: '250px' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)', fontSize: '20px' }}>search</span>
                    <input type="text" className="v-input-field" placeholder="Keresés ID vagy kérdés..." value={ticketSearch} onChange={(e) => setTicketSearch(e.target.value)} style={{ paddingLeft: '35px' }} />
                  </div>
                  <select className="v-input-field v-select" value={ticketFilter} onChange={(e) => setTicketFilter(e.target.value)} style={{ width: '180px', cursor: 'pointer' }}>
                    <option value="all">Minden kérdés</option>
                    <option value="pending">Válaszra vár (Pending)</option>
                    <option value="answered">Megválaszolva</option>
                  </select>
                </div>
              </div>

              <div className="v-card-container" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '12px', color: 'var(--text-main)' }}>Új kérdés feltevése</h2>
                <form onSubmit={handleAskQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <textarea 
                    className="v-input-field v-textarea" 
                    placeholder="Miben segíthetünk? Írd ide a kérdésed..." 
                    value={newQuestion} 
                    onChange={(e) => setNewQuestion(e.target.value)}
                    rows="3"
                    required
                  />
                  <button type="submit" className="v-btn-primary" style={{ alignSelf: 'flex-start' }}>
                    Kérdés beküldése
                  </button>
                </form>
              </div>

              <div className="v-ticket-list">
                {filteredTickets.map(ticket => (
                  <div key={ticket.id} className={`v-ticket-card ${ticket.status.toLowerCase() === 'pending' ? 'pending' : 'answered'}`}>
                    <div className="v-ticket-header">
                      <div>
                        <span className="v-ticket-meta">ID: {ticket.id} | Beküldve: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <h3 className="v-ticket-question">{ticket.question}</h3>
                      </div>
                      {isAdmin && (
                        <button onClick={() => deleteTicket(ticket.id)} className="v-btn-icon v-btn-delete">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      )}
                    </div>
                    {ticket.status.toLowerCase() === 'pending' ? (
                      <div className="v-ticket-reply-box">
                        {isAdmin ? (
                          <>
                            <input type="text" className="v-input-field" placeholder="Írd be a választ..." value={answerInputs[ticket.id] || ''} onChange={(e) => setAnswerInputs({...answerInputs, [ticket.id]: e.target.value})} />
                            <button onClick={() => submitAnswer(ticket.id)} className="v-btn-primary">Válasz közzététele</button>
                          </>
                        ) : (
                          <p style={{ color: '#f59e0b', fontSize: '14px', fontWeight: 'bold' }}>Válaszra vár...</p>
                        )}
                      </div>
                    ) : (
                      <div className="v-ticket-answered-box">
                        <strong className="v-text-success">Publikált válasz:</strong> <br/> {ticket.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="v-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="v-modal-card" onClick={e => e.stopPropagation()}>
            <div className="v-modal-header">
              <h2>{editingProduct ? 'Termék Szerkesztése' : 'Új Termék Létrehozása'}</h2>
              <button className="v-modal-close" onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="v-form">
              <div className="v-form-group">
                <label>Termék neve</label>
                <input type="text" className="v-input-field" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="v-form-group">
                <label>Leírás</label>
                <textarea className="v-input-field v-textarea" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              
              <div className="v-form-group">
                <label>Termék Képe</label>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
                  <input type="file" id="imageUploadInput" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  <label htmlFor="imageUploadInput" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-page)', border: '1px dashed var(--primary)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-input)'} onMouseOut={(e) => e.currentTarget.style.background = 'var(--bg-page)'}>
                    <span className="material-symbols-outlined">upload_file</span>
                    Kép feltöltése
                  </label>
                  {isUploadingImage && (
                    <span className="v-text-muted" style={{fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px'}}>
                      <span className="material-symbols-outlined spinning" style={{fontSize: '16px'}}>sync</span> Feltöltés folyamatban...
                    </span>
                  )}
                </div>
                <input type="text" className="v-input-field" placeholder="Vagy illeszd be közvetlenül a kép URL-t..." value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
                {formData.imageUrl && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', display: 'inline-block' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '11px', color: 'var(--text-muted)' }}>Előnézet:</p>
                    <img src={formData.imageUrl} alt="Előnézet" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                  </div>
                )}
              </div>

              <div className="v-form-row">
                <div className="v-form-group flex-1">
                  <label>Ár (Ft)</label>
                  <input type="number" className="v-input-field" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="v-form-group flex-1">
                  <label>Készlet (db)</label>
                  <input type="number" className="v-input-field" required value={formData.stock_quantity} onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})} />
                </div>
                <div className="v-form-group flex-1">
                  <label>Kategória</label>
                  <select className="v-input-field v-select" required value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} style={{ cursor: 'pointer' }}>
                    <option value="">Válassz...</option>
                    {CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'favorites').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="v-btn-primary v-btn-full" disabled={isUploadingImage}>
                {editingProduct ? 'Változtatások mentése' : 'Termék hozzáadása'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isUserModalOpen && (
        <div className="v-modal-overlay" onClick={() => setIsUserModalOpen(false)}>
          <div className="v-modal-card" onClick={e => e.stopPropagation()}>
            <div className="v-modal-header">
              <h2>Felhasználó Szerkesztése</h2>
              <button className="v-modal-close" onClick={() => setIsUserModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="v-form">
              <div className="v-form-row">
                <div className="v-form-group flex-1">
                  <label>Keresztnév</label>
                  <input type="text" className="v-input-field" value={userFormData.firstName} onChange={(e) => setUserFormData({...userFormData, firstName: e.target.value})} />
                </div>
                <div className="v-form-group flex-1">
                  <label>Vezetéknév</label>
                  <input type="text" className="v-input-field" value={userFormData.lastName} onChange={(e) => setUserFormData({...userFormData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="v-form-group">
                <label>Cégnév (Opcionális)</label>
                <input type="text" className="v-input-field" value={userFormData.companyName} onChange={(e) => setUserFormData({...userFormData, companyName: e.target.value})} />
              </div>
              <div className="v-form-group">
                <label>Szerepkör</label>
                <select className="v-input-field v-select" value={userFormData.role} onChange={(e) => setUserFormData({...userFormData, role: e.target.value})} style={{ cursor: 'pointer' }}>
                  <option value="Customer">Vásárló (Customer)</option>
                  <option value="Vendor">Eladó (Vendor)</option>
                  <option value="Admin">Adminisztrátor (Admin)</option>
                </select>
              </div>
              <button type="submit" className="v-btn-primary v-btn-full">
                Fiók mentése
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;