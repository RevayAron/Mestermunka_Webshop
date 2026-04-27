import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../Cart/CartContext';
import Login from '../Login/Login'; 
import Register from '../Register/Register';

const Navbar = () => {
  const navigate = useNavigate(); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  const [authCompany, setAuthCompany] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false); 
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const { cartCount, toggleCart } = useCart();

  const getRoleFromToken = (token) => {
    if (!token) return null;
    try {
      let cleanToken = token.replace(/^"|"$/g, '');
      let base64Url = cleanToken.split('.')[1];
      let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      let jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(jsonPayload);
      const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
      return payload[roleKey] || payload.role || payload.Role || 'Customer';
    } catch (error) {
      return null;
    }
  };

  const checkLoginState = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      setUserRole(getRoleFromToken(token));
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  };

  useEffect(() => {
    checkLoginState();

    const handleOpenAuth = (e) => openAuth(e.detail.mode, e.detail.company);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    
    window.addEventListener('storage', checkLoginState);

    return () => {
      window.removeEventListener('open-auth-modal', handleOpenAuth);
      window.removeEventListener('storage', checkLoginState);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserRole(null);
    setShowLogoutAlert(true);
    setTimeout(() => setShowLogoutAlert(false), 3000);
    navigate('/'); 
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const openAuth = (mode, isCompany = false) => {
    setAuthMode(mode);
    setAuthCompany(isCompany);
    setShowAuth(true);
  };

  const handleSearch = (e) => {
    e.preventDefault(); 
    if (searchTerm.trim() !== '') {
      navigate('/browse', { state: { searchQuery: searchTerm } });
      setSearchTerm('');
      setIsMenuOpen(false);
    } else {
      navigate('/browse');
    }
  };

  const isAdmin = userRole === 'Admin' || userRole === '0';
  const isVendor = userRole === 'Vendor' || userRole === '1';

  return (
    <>
      <header className="main-header">
        <div className="nav-container">
          
          <div 
            className="logo" 
            onClick={() => navigate('/')} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px' }}
          >
            <div style={{ 
              background: 'var(--primary)', color: 'var(--bg-card)', padding: '10px', 
              borderRadius: '12px', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', boxShadow: '0 0 15px var(--primary-alpha-40)' 
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>shopping_bag</span>
            </div>
            <h2 className="logo-text" style={{ 
              margin: 0, fontSize: '28px', fontWeight: '900', 
              color: 'var(--text-main)', letterSpacing: '1.5px' 
            }}>
              VENDORA
            </h2>
          </div>
          
          <form className="search-box" onSubmit={handleSearch}>
            <span className="material-symbols-outlined search-icon">search</span>
            <input 
              type="text" 
              placeholder="Keresés a termékek között..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          <button className="hamburger-btn" onClick={toggleMenu}>
            <span className="material-symbols-outlined">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <div className={`header-links ${isMenuOpen ? 'active' : ''}`}>
            <nav className="desktop-nav">
              <Link to="/vendors">Vendors</Link>
              <Link to="/support">GYIK</Link>
            </nav>
            
            <div className="user-utilities">
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <button className="icon-btn" onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} title="Vezérlőpult">
                      <span className="material-symbols-outlined">dashboard</span>
                      <span className="hide-on-mobile">Vezérlőpult</span>
                    </button>
                  )}

                  {isVendor && (
                    <button className="icon-btn" onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} title="Termékeim">
                      <span className="material-symbols-outlined">inventory_2</span>
                      <span className="hide-on-mobile">Termékeim</span>
                    </button>
                  )}
                  
                  <button className="icon-btn" onClick={() => { navigate('/account'); setIsMenuOpen(false); }} title="Fiókom">
                    <span className="material-symbols-outlined">manage_accounts</span>
                    <span className="hide-on-mobile">Fiókom</span>
                  </button>

                  <button className="icon-btn" onClick={handleLogout} title="Kijelentkezés">
                    <span className="material-symbols-outlined" style={{ color: 'var(--text-main)' }}>logout</span>
                  </button>
                </>
              ) : (
                <button className="icon-btn" onClick={() => { openAuth('login'); setIsMenuOpen(false); }}>
                  <span className="material-symbols-outlined">person</span>
                  <span>Belépés</span>
                </button>
              )}
              
              <button className="cart-btn" onClick={() => { toggleCart(); setIsMenuOpen(false); }}>
                <span className="material-symbols-outlined">shopping_cart</span>
                <span>Kosár</span>
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </button>
            </div>
          </div>
        </div>
      </header>

      {showAuth && authMode === 'login' && (
        <Login 
          onClose={() => setShowAuth(false)} 
          onSwitchToRegister={() => setAuthMode('register')} 
          onLoginSuccess={() => {
            setShowAuth(false);
            checkLoginState();
            setShowSuccessAlert(true); 
            setTimeout(() => setShowSuccessAlert(false), 3000); 
          }} 
        />
      )}
      
      {showAuth && authMode === 'register' && (
        <Register 
          onClose={() => setShowAuth(false)} 
          onSwitchToLogin={() => setAuthMode('login')} 
          onLoginSuccess={() => {
            setShowAuth(false);
            checkLoginState();
            setShowSuccessAlert(true); 
            setTimeout(() => setShowSuccessAlert(false), 3000); 
          }} 
          company={authCompany}
        />
      )}

      {showSuccessAlert && (
        <div className="modal-overlay">
          <div className="login-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
            <div className="v-logo-icon" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg-card)', margin: '0 auto 20px auto', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>check_circle</span>
            </div>
            <h2 style={{ color: 'var(--text-main)' }}>Sikeres bejelentkezés!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Üdvözlünk újra a rendszerben.</p>
            <button className="v-btn-primary full-width" onClick={() => setShowSuccessAlert(false)}>Tovább</button>
          </div>
        </div>
      )}

      {showLogoutAlert && (
        <div className="modal-overlay">
          <div className="login-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
            <div className="v-logo-icon" style={{ backgroundColor: 'var(--text-main)', color: 'var(--bg-card)', margin: '0 auto 20px auto', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>waving_hand</span>
            </div>
            <h2 style={{ color: 'var(--text-main)' }}>Sikeres kijelentkezés!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Várunk vissza!</p>
            <button className="v-btn-primary full-width" onClick={() => setShowLogoutAlert(false)}>Rendben</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;