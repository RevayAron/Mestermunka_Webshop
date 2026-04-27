import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import FrontPage from './Components/FrontPage/FrontPage';
import VendorDashboard from './Components/VendorDashboard/VendorDash';
import Browse from './Components/Browser/Browser';
import Support from './Components/Support/Support';
import Vendors from './Components/Vendors/Vendors';
import Account from './Components/Account/Account';
import Checkout from './Components/Checkout/Checkout'; 
import ThemeToggle from './Components/ThemeToggle/ThemeToggle';
import { CartProvider } from './Components/Cart/CartContext';
import { WishlistProvider } from './Components/Wishlist/WishlistContext'; 

// --- AZ ÚJ TERMÉKOLDAL BEIMPORTÁLÁSA A RÉGI HELYETT ---
import ProductDetail from './Components/ProductDetail/ProductDetail'; 

// --- 1. BEIMPORTÁLJUK A KOSARAT IDE ---
import Cart from './Components/Cart/Cart'; 

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/" element={<FrontPage />} />
              <Route path="/dashboard" element={<VendorDashboard />} />
              
              {/* --- ITT A VARÁZSLAT: Most már a ProductDetail nyílik meg! --- */}
              <Route path="/product/:id" element={<ProductDetail />} />
              
              <Route path="/browse" element={<Browse />} />
              <Route path="/support" element={<Support />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/account" element={<Account />} />
              <Route path="/checkout" element={<Checkout />} />
              
              {/* 404 OLDAL - Színek frissítve a dinamikus változókra! */}
              <Route path="*" element={
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-page)', color: 'var(--text-main)', fontFamily: 'Inter, sans-serif' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '80px', color: 'var(--primary)', margin: '0 0 20px 0' }}>sentiment_dissatisfied</span>
                  <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>404</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', margin: '0 0 30px 0' }}>Hoppá! Ez az oldal nem létezik, vagy el lett távolítva.</p>
                  <a href="/" style={{ backgroundColor: 'var(--primary)', color: 'var(--bg-card)', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Vissza a főoldalra</a>
                </div>
              } />
            </Routes>

            {/* --- GLOBÁLIS KOSÁR --- */}
            <Cart />
            
            {/* --- GLOBÁLIS TÉMA VÁLTÓ GOMB --- */}
            <ThemeToggle />

          </div>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;