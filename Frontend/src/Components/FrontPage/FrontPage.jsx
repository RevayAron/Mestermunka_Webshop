import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FrontPage.css';
import Navbar from '../Navbar/Navbar'; 
import Cart from '../Cart/Cart'; 
import Footer from '../Footer/Footer'; 
import { useCart } from '../Cart/CartContext';
import { useWishlist } from '../Wishlist/WishlistContext'; 
import BrowseSidebar from '../Browser/BrowseSidebar';

const FrontPage = () => {
  const navigate = useNavigate(); 
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { addToCart } = useCart();

  const HERO_IMAGES = [
    "https://img.nh-hotels.net/zZj6g/DX39o1/original/Budapest.jpg?output-quality=70&resize=*:*&background-color=white", // Ruhabolt / divat
    "https://media.cnn.com/api/v1/images/stellar/prod/budapest-panorama-8.jpg?c=16x9&q=h_833,w_1480,c_fill", // Kosár / tech
    "https://images.contentstack.io/v3/assets/blt06f605a34f1194ff/bltfde92aef92ecf073/6787eae0bf32fe28813c50fe/BCC-2024-EXPLORER-BUDAPEST-LANDMARKS-HEADER-_MOBILE.jpg?format=webp&quality=60&width=1440",
    "https://images.contentstack.io/v3/assets/blt06f605a34f1194ff/blt35532e1d0c86a2c3/67b07f7c254c9b5ba1eaca8e/iStock-1488953464-Header_Mobile.jpg?fit=crop&disable=upscale&auto=webp&quality=60&crop=smart"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const response = await fetch('https://localhost:7211/api/Products');
        const data = await response.json();
        
        const shuffled = data.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 6);
        
        setRecommendedProducts(selected);
      } catch (error) {
        console.error("Hiba az ajánlott termékek betöltésekor:", error);
      }
    };
    fetchRecommended();
  }, []);

  const handleProductClick = (productId) => navigate(`/product/${productId}`);

  return (
    <div className="front-page">
      
      <Navbar />

      <main className="content-wrapper">
        <section className="main-area">
          
          <div className="hero-banner">
            {HERO_IMAGES.map((img, index) => (
              <div 
                key={index} 
                className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                style={{ backgroundImage: `url(${img})` }}
              />
            ))}
            
            <div className="hero-overlay"></div> 

            <div className="hero-content">
              <span className="badge">Jelentkezzen be, vagy ha még nincs fiókja regisztráljon.</span>
              <h1>Üdvözli a<br/> Vendora csapata!</h1>
              <p>Böngésszen belföldi vállalkozók, cégek termékei közt.</p>
              <div className="hero-actions">
                <button className="btn-primary" onClick={() => navigate('/browse')}>BÖNGÉSZÉS</button>
              </div>
            </div>
          </div>

          <div className="section-header">
            <h2>Önnek ajánljuk!</h2>
            <a href="#" className="view-all" onClick={(e) => { e.preventDefault(); navigate('/browse'); }}>
              Összes megtekintése <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>

          <div className="products-grid">
            {recommendedProducts.map(p => (
              <ProductCard 
                key={p.id}
                id={p.id}
                onClick={() => handleProductClick(p.id)}
                title={p.name}
                price={p.price}
                brand="VENDORA"
                img={p.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070"}
                bulk={(p.price * 0.9).toFixed(0)}
                tag={p.stockQuantity < 10 ? "LOW STOCK" : null}
                addToCart={addToCart}
              />
            ))}
          </div>

          <div className="b2b-banner">
            <div className="b2b-info">
              <h3>Szívesen látjuk hazánk vállalatait!</h3>
              <p>Regisztrálja cégét, mi pedig miután megbizonyosodunk róla, aktiváljuk is Vendor fiókját!</p>
              <div className="b2b-features">
                <span><span className="material-symbols-outlined">verified</span> Megbízhatóság</span>
                <span><span className="material-symbols-outlined">credit_card</span> Termék eladás</span>
              </div>
            </div>
            <button 
              className="btn-primary large" 
              onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'register', company: true } }))}
            >
                <span>Vendor fiók létrehozása</span>
            </button>
          </div>
        </section>

        <BrowseSidebar 
          isFrontPage={true} 
          activeCategory={null} 
          setSearchTerm={() => {}}
          setActiveCategory={(catId) => navigate('/browse', { state: { selectedCategory: catId } })} 
        />

      </main>

      <Footer />
      <Cart />
    </div>
  );
};

function ProductCard({ id, onClick, title, price, oldPrice, brand, img, tag, bulk, addToCart }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isFav = isInWishlist(id);

  return (
    <div className="product-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <div className="image-container">
        <img src={img} alt={title} style={{ height: '200px', objectFit: 'cover' }} />
        {tag && <span className="card-tag">{tag}</span>}
        
        <button 
          className="wishlist-btn" 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(id); }}
          style={{
            color: isFav ? 'var(--bg-page)' : 'var(--text-muted)',
            backgroundColor: isFav ? 'var(--text-main)' : 'var(--bg-card)', 
            border: isFav ? '1px solid var(--text-main)' : '1px solid var(--border)',
            boxShadow: isFav ? '0 0 15px var(--text-main-alpha-40)' : '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
        </button>
      </div>
      <div className="card-content">
        <p className="brand-name">{brand}</p>
        <h3 className="product-title">{title}</h3>
        <div className="price-row">
          <div className="price-info">
            <span className="current-price">{Number(price).toLocaleString()} Ft</span>
            {oldPrice && <span className="old-price">{Number(oldPrice).toLocaleString()} Ft</span>}
            {bulk && <p className="bulk-price">Bulk: {Number(bulk).toLocaleString()} Ft</p>}
          </div>
          <button className="add-cart-btn" onClick={(e) => { e.stopPropagation(); addToCart(id, 1); }}>
            <span className="material-symbols-outlined">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default FrontPage;