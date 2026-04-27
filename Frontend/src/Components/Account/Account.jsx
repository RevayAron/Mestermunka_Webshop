import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './Account.css';

const Account = () => {
  const navigate = useNavigate();
  const location = useLocation(); 
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', companyName: '' });
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [userAvatar, setUserAvatar] = useState(null); 
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(null); 

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchMyProfile();
    fetchMyOrders(); 
  }, [token, navigate]);

  const fetchMyOrders = async () => {
    try {
      const response = await fetch('https://localhost:7211/api/Orders/my-orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyOrders(data); 
      }
    } catch (err) {
      console.error('Hiba a rendelések lekérésekor', err);
    }
  }; 

  const filteredMyOrders = myOrders.filter(order => {
    const matchSearch = String(order.id).includes(orderSearch);
    const matchFilter = orderFilter === 'all' || order.status === orderFilter;
    return matchSearch && matchFilter;
  });

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://localhost:7211/api/Users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        setUserAvatar(data.imageUrl || data.profilePicture || null); 
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          companyName: data.companyName || ''
        });
      }
    } catch (err) {
      console.error('Hiba a profil betöltésekor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPendingAvatarFile(file); 
    setPreviewUrl(URL.createObjectURL(file)); 
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsUploading(true);

    try {
      if (pendingAvatarFile) {
        const uploadData = new FormData();
        uploadData.append('file', pendingAvatarFile);

        const uploadRes = await fetch('https://localhost:7211/api/Users/upload-avatar', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: uploadData
        });

        if (!uploadRes.ok) throw new Error("A kép feltöltése nem sikerült.");
      }

      const response = await fetch('https://localhost:7211/api/Users/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccessMsg('Minden adat sikeresen elmentve!');
        setIsEditing(false);
        setPendingAvatarFile(null);
        setPreviewUrl(null);
        fetchMyProfile(); 
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError('Hiba történt a mentés során.');
      }
    } catch (err) {
      setError(err.message || 'Hálózati hiba a mentéskor.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPendingAvatarFile(null);
    setPreviewUrl(null);
    setFormData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      companyName: userData.companyName || ''
    });
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Biztosan TÖRÖLNI szeretnéd a fiókodat? Ez a művelet nem vonható vissza!")) return;
    
    try {
      const response = await fetch(`https://localhost:7211/api/Users/${userData.userId || userData.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        localStorage.removeItem('token');
        alert("Fiók sikeresen törölve.");
        navigate('/');
      } else {
        setError('Hiba történt a törlés során.');
      }
    } catch (err) {
      setError('Hálózati hiba a törléskor.');
    }
  };

  if (loading) return <div className="account-page"><Navbar /><div className="loading-spinner">Betöltés...</div></div>;
  if (!userData) return <div className="account-page"><Navbar /><div className="error-message">Nincs adat.</div></div>;

  return (
    <div className="account-page">
      <Navbar />

      <main className="account-container">
        <div className="account-header">
          <h1>Személyes Fiókom</h1>
        </div>

        {error && <div className="error-alert">{error}</div>}
        {successMsg && <div className="success-alert">{successMsg}</div>}

        <div className="account-tabs">
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => { setActiveTab('profile'); setSelectedOrder(null); }}>
            <span className="material-symbols-outlined">person</span> Adataim
          </button>
          <button className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <span className="material-symbols-outlined">local_shipping</span> Rendeléseim
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="account-card fade-in">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              
              <div className="profile-image-section" style={{ position: 'relative', width: '100px', height: '100px' }}>
                <input 
                  type="file" 
                  id="avatarInput" 
                  hidden 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                  disabled={!isEditing} 
                />
                
                <label htmlFor={isEditing ? "avatarInput" : ""} style={{ cursor: isEditing ? 'pointer' : 'default', display: 'block' }}>
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '16px',
                    backgroundColor: 'var(--bg-input)',
                    backgroundImage: `url(${previewUrl || userAvatar || ''})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isEditing ? '3px dashed var(--primary)' : '3px solid var(--border)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                  >
                    {!(previewUrl || userAvatar) && <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--text-muted)' }}>person</span>}
                    
                    {isUploading && (
                      <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.5)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="material-symbols-outlined spinning" style={{ color: '#fff' }}>sync</span>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-5px',
                      right: '-5px',
                      background: 'var(--primary)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid var(--bg-card)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#fff' }}>edit</span>
                    </div>
                  )}
                </label>
              </div>
              
              <div className="user-titles" style={{ flex: 1 }}>
                <h2>{userData.firstName} {userData.lastName}</h2>
                <p className="user-email">{userData.email}</p>
                <span className="role-badge">
                  {userData.role === 0 || userData.role === '0' || userData.role === 'Admin' ? 'Admin' :
                   userData.role === 1 || userData.role === '1' || userData.role === 'Vendor' ? 'Eladó (Vendor)' :
                   userData.role === 2 || userData.role === '2' || userData.role === 'Customer' ? 'Vásárló' : 
                   userData.role}
                </span>
              </div>
              
              {!isEditing && (
                <button className="outline-btn" style={{ width: 'auto' }} onClick={() => setIsEditing(true)}>
                  Profil szerkesztése
                </button>
              )}
            </div>

            <div className="card-body" style={{ marginTop: '30px', borderTop: '1px solid var(--border)', paddingTop: '30px' }}>
              {isEditing ? (
                <form onSubmit={handleSave} className="edit-form">
                  <div className="form-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>Keresztnév</label>
                      <input type="text" className="v-input-field" style={{ width: '100%' }} value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                      <label>Vezetéknév</label>
                      <input type="text" className="v-input-field" style={{ width: '100%' }} value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                    </div>
                  </div>

                  {userData.role === 'Vendor' && (
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                      <label>Cégnév</label>
                      <input type="text" className="v-input-field" style={{ width: '100%' }} value={formData.companyName} onChange={(e) => setFormData({...formData, companyName: e.target.value})} />
                    </div>
                  )}

                  <div className="form-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" className="outline-btn" style={{ width: 'auto' }} onClick={handleCancel}>Mégse</button>
                    <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={isUploading}>Mentés</button>
                  </div>
                </form>
              ) : (
                <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  <div className="info-box"><span className="info-label">Keresztnév</span><p style={{ fontWeight: 'bold' }}>{userData.firstName || '-'}</p></div>
                  <div className="info-box"><span className="info-label">Vezetéknév</span><p style={{ fontWeight: 'bold' }}>{userData.lastName || '-'}</p></div>
                  <div className="info-box"><span className="info-label">Email</span><p style={{ fontWeight: 'bold' }}>{userData.email}</p></div>
                  {userData.role === 'Vendor' && (
                    <div className="info-box"><span className="info-label">Cégnév</span><p style={{ fontWeight: 'bold' }}>{userData.companyName || '-'}</p></div>
                  )}
                </div>
              )}
            </div>

            <div className="card-footer" style={{ marginTop: '40px', padding: '20px', background: 'var(--bg-input)', borderRadius: '12px' }}>
              <h3 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>Veszélyes Zóna</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '15px' }}>A fiók törlése végleges. Minden adatod és megrendelésed elvész.</p>
              <button className="outline-btn" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={handleDeleteAccount}>Fiók végleges törlése</button>
            </div>

          </div>
        )}

        {/*Rendelések fül*/}
        {activeTab === 'orders' && (
          <div className="account-card fade-in">
            <div className="card-body">
              {!selectedOrder ? (
                myOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--text-muted)', marginBottom: '20px' }}>shopping_basket</span>
                    <h2>Még nincsenek rendeléseid</h2>
                    <button className="btn-primary" style={{ marginTop: '20px', width: 'auto' }} onClick={() => navigate('/browse')}>Vásárlás indítása</button>
                  </div>
                ) : (
                  <div className="orders-list">
                    {myOrders.map((order, idx) => (
                      <div key={idx} className="order-history-card clickable" onClick={() => setSelectedOrder(order)}>
                        <div className="order-history-header">
                          <span className="order-id">#{order.id}</span>
                          <span className="order-status pending" style={{fontWeight: 'bold'}}>{order.status}</span>
                        </div>
                        <div className="order-history-footer">
                          <span>{new Date(order.date).toLocaleDateString()}</span>
                          <span className="order-grand-total">{order.total.toLocaleString()} Ft</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="order-detail-view fade-in">
                  <button className="back-to-list" onClick={() => setSelectedOrder(null)}>
                    <span className="material-symbols-outlined">arrow_back</span> Vissza a listához
                  </button>
                  
                  <div className="order-detail-header">
                    <h2>Rendelés: #{selectedOrder.id}</h2>
                    <span className="order-status pending" style={{fontWeight: 'bold', fontSize: '16px'}}>{selectedOrder.status}</span>
                  </div>
                  
                  <div className="order-info-grid">
                    <div className="info-box"><span className="info-label">Dátum</span><p>{new Date(selectedOrder.date).toLocaleString()}</p></div>
                    <div className="info-box"><span className="info-label">Fizetési mód</span><p>{selectedOrder.paymentMethod || '-'}</p></div>
                    <div className="info-box" style={{ gridColumn: 'span 2' }}><span className="info-label">Cím</span><p>{selectedOrder.shippingAddress}</p></div>
                  </div>
                
                  <h3 style={{marginTop: '30px', marginBottom: '15px', color: 'var(--text-main)'}}>Megrendelt termékek állapota:</h3>
                  <div className="order-items-detailed" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="detail-item-card" style={{display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border)'}}>
                        <img src={item.img} alt={item.name} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px'}} />
                        <div className="detail-item-info" style={{flex: 1}}>
                          <h4 style={{margin: '0 0 5px 0'}}>{item.name}</h4>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px'}}>
                            <span style={{color: 'var(--text-muted)'}}>{item.quantity} db x {item.price.toLocaleString()} Ft</span>
                          
                            <span style={{
                              background: 'var(--bg-page)', 
                              border: '1px solid var(--primary)', 
                              color: 'var(--primary)', 
                              padding: '4px 10px', 
                              borderRadius: '20px', 
                              fontSize: '12px', 
                              fontWeight: 'bold'
                            }}>
                              {item.status}
                            </span>
                            
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-final-summary" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px dashed var(--border)' }}>
                    <div className="summary-row total" style={{display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)'}}>
                      <span>Mindösszesen:</span>
                      <span>{selectedOrder.total.toLocaleString()} Ft</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Account;