import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import './Vendors.css';

const Vendors = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorSearch, setVendorSearch] = useState('');

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch('https://localhost:7211/api/Users/vendors');
        if (response.ok) {
          const data = await response.json();
          setVendors(data);
        }
      } catch (error) {
        console.error("Hiba az eladók betöltésekor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
    (v.email && v.email.toLowerCase().includes(vendorSearch.toLowerCase()))
  );

  return (
    <div className="vendors-page">
      <Navbar />

      <main className="vendors-container">
        <div className="vendors-hero">
          <h1>Hivatalos Eladóink</h1>
          <p>Böngéssz megbízható B2B partnereink és viszonteladóink között!</p>
          
          <div className="search-box" style={{ maxWidth: '500px', margin: '30px auto 0 auto', position: 'relative' }}>
            <span className="material-symbols-outlined search-icon">search</span>
            <input 
              type="text" 
              placeholder="Keresés eladó neve vagy email címe alapján..." 
              value={vendorSearch} 
              onChange={(e) => setVendorSearch(e.target.value)} 
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
            />
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Eladók betöltése...</p>
        ) : filteredVendors.length === 0 ? (
          <p className="loading-text">Nincs találat a keresésre.</p>
        ) : (
          <div className="vendors-grid">
            {filteredVendors.map(vendor => (
              <div key={vendor.userId} className="vendor-card">
                <div className="vendor-avatar">
                  <span className="material-symbols-outlined">storefront</span>
                </div>
                <h3>{vendor.name}</h3>
                
                <div className="vendor-contact">
                  {vendor.phone && (
                    <p><span className="material-symbols-outlined">call</span> {vendor.phone}</p>
                  )}
                  <p><span className="material-symbols-outlined">mail</span> {vendor.email}</p>
                </div>

                <button 
                  className="open-shop-btn"
                  onClick={() => navigate('/browse', { state: { selectedVendor: vendor.userId } })}
                >
                  <span className="material-symbols-outlined">store</span>
                  Bolt megnyitása
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Vendors;