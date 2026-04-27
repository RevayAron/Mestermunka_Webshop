import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar'; 
import { useCart } from '../Cart/CartContext';
import { useWishlist } from '../Wishlist/WishlistContext';
import BrowseSidebar, { CATEGORIES } from './BrowseSidebar';
import './Browser.css';

const Browse = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeCategory, setActiveCategory] = useState(location.state?.selectedCategory || 'all');
  const [activeVendor, setActiveVendor] = useState(location.state?.selectedVendor || null);
  const [searchTerm, setSearchTerm] = useState(location.state?.searchQuery || ''); 
  
  const [viewMode, setViewMode] = useState('grid');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isInWishlist } = useWishlist();

  useEffect(() => {
    if (location.state?.searchQuery !== undefined) setSearchTerm(location.state.searchQuery);
    if (location.state?.selectedCategory !== undefined) setActiveCategory(location.state.selectedCategory);
    if (location.state?.selectedVendor !== undefined) setActiveVendor(location.state.selectedVendor);
  }, [location.state]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://localhost:7211/api/Products');
        if (!response.ok) throw new Error('Hiba az adatok lekérésekor.');
        
        const data = await response.json();
        const formattedData = data.map(p => ({
          id: p.id,
          title: p.name || p.title,
          price: p.price,
          description: p.description,
          category: p.categoryId ? p.categoryId.toString() : 'all',
          img: p.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070",
          brand: "VENDORA",
          stock: p.stockQuantity
        }));

        setProducts(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
                          product.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    let categoryMatch = false;
    if (activeCategory === 'all') categoryMatch = true;
    else if (activeCategory === 'favorites') categoryMatch = isInWishlist(product.id);
    else categoryMatch = product.category === activeCategory;

    let vendorMatch = true;
    if (activeVendor) {
      const pVendorId = product.userId || product.vendorId; 
      if (pVendorId) vendorMatch = pVendorId === activeVendor;
    }

    return matchesSearch && categoryMatch && vendorMatch;
  });

  const showCategoryCards = activeCategory === 'all' && searchTerm === '' && !activeVendor;

  return (
    <div className="front-page">
      <Navbar />

      <main className="content-wrapper">
        <section className="main-area">
          {showCategoryCards ? (
            <div className="v-content-fade-in">
              <div className="section-header" style={{ marginBottom: '20px' }}>
                <h2>Milyen kategóriában keresel?</h2>
              </div>
              <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'favorites').map(cat => (
                  <div 
                    key={cat.id} 
                    className="product-card" 
                    onClick={() => setActiveCategory(cat.id)}
                    style={{ height: '200px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-card)' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '16px' }}>{cat.icon}</span>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', textAlign: 'center' }}>{cat.label}</h3>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="v-content-fade-in">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <button 
                    onClick={() => { setActiveCategory('all'); setSearchTerm(''); setActiveVendor(null); }}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px', padding: 0, fontWeight: 'bold' }}
                  >
                    <span className="material-symbols-outlined">arrow_back</span> Vissza
                  </button>
                  <h2>
                    {searchTerm 
                      ? `Keresés: "${searchTerm}"` 
                      : activeVendor 
                        ? 'Vendor termékei'
                        : CATEGORIES.find(c => c.id === activeCategory)?.label}
                  </h2>
                </div>

                <div className="view-toggles">
                  <button onClick={() => setViewMode('grid')} className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}>
                    <span className="material-symbols-outlined">grid_view</span>
                  </button>
                  <button onClick={() => setViewMode('list')} className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}>
                    <span className="material-symbols-outlined">view_list</span>
                  </button>
                </div>
              </div>

              <div className={`products-${viewMode}`} style={{ 
                display: 'grid', 
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', 
                gap: '24px',
                alignItems: 'stretch'
              }}>
                {loading ? (
                  <p className="loading-spinner">Termékek betöltése...</p>
                ) : error ? (
                  <p className="error-message">Hiba történt: {error}</p>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id}
                      {...product}
                      onClick={() => navigate(`/product/${product.id}`)}
                      viewMode={viewMode}
                    />
                  ))
                ) : (
                  <p className="no-products">
                    {searchTerm 
                      ? 'Nem találtunk a keresésnek megfelelő terméket.' 
                      : activeCategory === 'favorites' 
                        ? 'Még nem adtál egy terméket sem a kedvenceidhez.' 
                        : 'Ebben a kategóriában jelenleg nincs termék.'}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        <BrowseSidebar 
          activeCategory={activeCategory} 
          setActiveCategory={setActiveCategory} 
          setSearchTerm={setSearchTerm} 
        />
        
      </main>
    </div>
  );
};

const ProductCard = ({ id, onClick, title, price, brand, img, tag, viewMode }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isFav = isInWishlist(id);

  return (
    <div className="product-card" onClick={onClick} style={{ cursor: 'pointer', display: 'flex', flexDirection: viewMode === 'list' ? 'row' : 'column', alignItems: viewMode === 'list' ? 'center' : 'stretch', gap: viewMode === 'list' ? '24px' : '0', padding: viewMode === 'list' ? '15px' : '0' }}>
      <div className="image-container" style={{ width: viewMode === 'list' ? '220px' : '100%', height: viewMode === 'list' ? '200px' : '220px', flexShrink: 0 }}>
        <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: viewMode === 'list' ? '8px' : 'inherit' }} />
        {tag && <span className="card-tag">{tag}</span>}
        <button className="wishlist-btn" onClick={(e) => { e.stopPropagation(); toggleWishlist(id); }}
          style={{ color: isFav ? '#2A1F2D' : '#C6AD94', backgroundColor: isFav ? '#FAB3A9' : 'var(--bg-card)', border: isFav ? '1px solid #FAB3A9' : '1px solid var(--border)', boxShadow: isFav ? '0 0 15px rgba(250, 179, 169, 0.9), 0 0 30px rgba(250, 179, 169, 0.4)' : '0 2px 4px rgba(0,0,0,0.3)', transition: 'all 0.3s' }}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
        </button>
      </div>
      <div className="card-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: viewMode === 'list' ? '0 15px 0 0' : '20px' }}>
        <p className="brand-name" style={{ color: '#5B6C5D', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>{brand}</p>
        <h3 className="product-title" style={{ fontSize: '16px', margin: '8px 0', color: '#FAB3A9' }}>{title}</h3>
        <div style={{ marginTop: 'auto' }}>
          <div className="price-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
            <div className="price-info"><span className="current-price" style={{ fontSize: '20px', fontWeight: 'bold', color: '#FAB3A9' }}>{Number(price).toLocaleString()} Ft</span></div>
            <button className="add-cart-btn" onClick={(e) => { e.stopPropagation(); addToCart(id, 1); }}><span className="material-symbols-outlined">add_shopping_cart</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Browse;