import React from 'react';

export const CATEGORIES = [
  { id: 'all', label: 'Minden termék', icon: 'apps' },
  { id: 'favorites', label: 'Kedvenceim', icon: 'favorite' },
  { id: '1', label: 'Gamer felszerelés', icon: 'sports_esports' },
  { id: '2', label: 'Háztartási gép', icon: 'vacuum' },
  { id: '3', label: 'Elektronika & TV', icon: 'tv' },
  { id: '4', label: 'Bútor', icon: 'chair' },
  { id: '5', label: 'Kiegészítők', icon: 'charging_station' },
  { id: '6', label: 'Cipő & Ruházat', icon: 'checkroom' },
  { id: '7', label: 'Táska & Tárca', icon: 'wallet' },
  { id: '8', label: 'Sport & Hobbi', icon: 'fitness_center' },
  { id: '9', label: 'Iroda', icon: 'inventory_2' },
  { id: '10', label: 'Szépségápolás', icon: 'health_and_safety' },
];

const BrowseSidebar = ({ activeCategory, setActiveCategory, setSearchTerm, isFrontPage = false }) => {
  
  const displayCategories = isFrontPage 
    ? CATEGORIES.filter(cat => cat.id === 'all' || cat.id === 'favorites')
    : CATEGORIES;

  return (
    <aside className="sidebar sticky-sidebar">
      <div className="category-card">
        <h3 className="section-title">KATEGÓRIÁK</h3>
        <nav className="cat-nav">
          {displayCategories.map(cat => (
            <button 
              key={cat.id}
              className={`cat-item ${activeCategory === cat.id ? 'active' : ''} ${cat.id === 'favorites' ? 'fav-item' : ''}`}
              onClick={() => { 
                setActiveCategory(cat.id); 
                if(setSearchTerm) setSearchTerm(''); 
              }} 
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: cat.id === 'favorites' ? "'FILL' 1" : "'FILL' 0" }}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="pro-membership-card">
        <h4>B2B Pro Tagság</h4>
        <p>Érje el vállalatának magas szintú online reputációját a Vendorával.</p>
        <button className="outline-btn">Tovább</button>
      </div>
    </aside>
  );
};

export default BrowseSidebar;