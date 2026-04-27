import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../Cart/CartContext';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to fetch product data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleAddToCart = async () => {
    console.log(`Kosárba rakva: ${quantity} db, ID: ${product?.id}`);
    alert(`${quantity} db ${product?.title || 'termék'} a kosárba került!`);
  };

  if (loading) return <div className="product-page">Loading...</div>;
  if (error) return <div className="product-page error">{error}</div>;
  if (!product) return <div className="product-page">Product not found.</div>;

  return (
    <div className="product-page">
      <header className="main-header">
        <div className="nav-container">
          <div className="logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
            <span className="material-symbols-outlined">shopping_bag</span>
            <h2 className="logo-text">VENDORA</h2>
          </div>
          
          <div className="search-box">
            <span className="material-symbols-outlined search-icon">search</span>
            <input type="text" placeholder="Search products..." />
          </div>

          <button className="hamburger-btn" onClick={toggleMenu}>
            <span className="material-symbols-outlined">
              {isMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <div className={`header-links ${isMenuOpen ? 'active' : ''}`}>
            <nav className="desktop-nav">
              <Link to="/b2b">B2B Deals</Link>
              <Link to="/vendors">Vendors</Link>
            </nav>
            <div className="user-utilities">
              <button className="cart-btn">
                <span className="material-symbols-outlined">shopping_cart</span>
                <span>Cart</span>
                <span className="cart-badge">3</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="content-wrapper product-detail-wrapper">
        <div className="breadcrumbs">
          <Link to="/">Home</Link> &gt; <Link to="/products">Products</Link> &gt; <span>{product.title}</span>
        </div>

        <section className="product-detail-grid">
          <div className="product-image-section">
            <img src={product.img || 'https://via.placeholder.com/600'} alt={product.title} className="main-product-image" />
          </div>

          <div className="product-info-section">
            <p className="brand-name">{product.brand}</p>
            <h1 className="product-title-large">{product.title}</h1>
            <p className="sku-text">SKU: {product.sku || product.id}</p>

            <div className="pricing-box">
              <div className="retail-price">
                <span className="current-price-large">${Number(product.price).toFixed(2)}</span>
              </div>
              {product.bulkPrice && (
                <div className="b2b-price-box">
                  <span className="material-symbols-outlined">verified</span>
                  <span className="bulk-price-large">Bulk: ${Number(product.bulkPrice).toFixed(2)} / db</span>
                </div>
              )}
            </div>

            <p className="product-description">{product.description}</p>

            {product.features && product.features.length > 0 && (
              <div className="features-list">
                <h4>Jellemzők:</h4>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}><span className="material-symbols-outlined">check</span> {feature}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="purchase-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button className="btn-primary add-to-cart-large" onClick={handleAddToCart}>
                <span className="material-symbols-outlined">add_shopping_cart</span>
                Kosárba
              </button>
            </div>
            
            <p className="stock-info">
              Raktáron: {product.stock !== undefined ? product.stock : 'Ismeretlen mennyiség'} db
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Product;