import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Cart from '../Cart/Cart';
import { useCart } from '../Cart/CartContext';
import { useWishlist } from '../Wishlist/WishlistContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); 

  // --- ÉRTÉKELÉSI (REVIEW) STATE-EK ---
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const token = localStorage.getItem('token');
  const isFav = product ? isInWishlist(product.id) : false;

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://localhost:7211/api/Products/${id}`);
      if (!response.ok) throw new Error('Nem sikerült betölteni a terméket.');
      
      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) return;

    setReviewError('');
    setReviewSuccess('');
    setIsSubmittingReview(true);

    try {
      const response = await fetch(`https://localhost:7211/api/Products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment })
      });

      if (!response.ok) {
        let errorMsg = 'Hiba történt az értékelés beküldésekor.';
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          errorMsg = errorData.Message || errorMsg;
        } else {
          const errorText = await response.text();
          errorMsg = errorText || `Szerver hiba! (Kód: ${response.status}) - Valószínűleg nem fut a legújabb backend kód.`;
        }
        throw new Error(errorMsg);
      }

      setReviewSuccess('Köszönjük az értékelést!');
      setReviewComment('');
      setReviewRating(5);
      
      fetchProductDetails();

    } catch (err) {
      setReviewError(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className="material-symbols-outlined" style={{ color: i <= rating ? '#f59e0b' : 'var(--border)', fontVariationSettings: i <= rating ? "'FILL' 1" : "'FILL' 0", fontSize: '20px' }}>
          star
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="front-page">
      <Navbar />

      <main className="content-wrapper" style={{ justifyContent: 'center' }}>
        <div className="product-detail-container">
          
          <button className="back-btn" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span> Vissza
          </button>

          {loading ? (
            <div className="loading-spinner">Termék betöltése...</div>
          ) : error ? (
            <div className="error-message">
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-muted)' }}>error</span>
              <h3>Hiba történt</h3>
              <p>{error}</p>
              <button className="btn-primary" onClick={() => navigate('/browse')}>Vissza a boltba</button>
            </div>
          ) : product ? (
            <div className="product-detail-grid">
              
              <div className="pd-image-section">
                <img 
                  src={product.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070"} 
                  alt={product.name || product.title} 
                />
                <button 
                  className="pd-wishlist-btn" 
                  onClick={() => toggleWishlist(product.id)}
                  style={{
                    color: isFav ? 'var(--bg-page)' : 'var(--text-muted)',
                    backgroundColor: isFav ? 'var(--text-main)' : 'var(--bg-card)', 
                    borderColor: isFav ? 'var(--text-main)' : 'var(--border)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                </button>
              </div>

              <div className="pd-info-section">
                <p className="pd-brand">{product.categoryName || 'VENDORA'}</p>
                <h1 className="pd-title">{product.name || product.title}</h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex' }}>
                    {renderStars(Math.round(product.averageRating || 0))}
                  </div>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{product.averageRating > 0 ? product.averageRating : 'Nincs'}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>({product.reviewCount} értékelés)</span>
                </div>

                <div className="pd-price-row">
                  <span className="pd-price">{Number(product.price).toLocaleString()} Ft</span>
                  {product.stockQuantity < 10 && product.stockQuantity > 0 && (
                    <span className="pd-stock-warning">Csak {product.stockQuantity} db maradt!</span>
                  )}
                  {product.stockQuantity === 0 && (
                    <span className="pd-out-of-stock">Elfogyott</span>
                  )}
                </div>

                <div className="pd-description">
                  <h3>Termékleírás</h3>
                  <p>{product.description || 'Nincs elérhető leírás ehhez a termékhez.'}</p>
                </div>

                <div className="pd-action-area">
                  <div className="quantity-selector">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={product.stockQuantity === 0}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))} disabled={product.stockQuantity === 0 || quantity >= product.stockQuantity}>+</button>
                  </div>
                  
                  <button 
                    className="btn-primary pd-add-cart-btn" 
                    onClick={handleAddToCart}
                    disabled={product.stockQuantity === 0}
                  >
                    <span className="material-symbols-outlined">shopping_cart</span>
                    {product.stockQuantity === 0 ? 'Készlethiány' : 'Kosárba rakom'}
                  </button>
                </div>

                <div className="pd-perks">
                  <div className="perk">
                    <span className="material-symbols-outlined">local_shipping</span>
                    <p>Gyors szállítás 1-2 munkanapon belül</p>
                  </div>
                  <div className="perk">
                    <span className="material-symbols-outlined">verified</span>
                    <p>14 napos pénzvisszafizetési garancia</p>
                  </div>
                  <div className="perk">
                    <span className="material-symbols-outlined">security</span>
                    <p>Biztonságos fizetés (SSL)</p>
                  </div>
                </div>
              </div>

              <div className="pd-reviews-section" style={{ gridColumn: '1 / -1', marginTop: '40px', paddingTop: '40px', borderTop: '2px solid var(--border)' }}>
                <h2>Vásárlói értékelések</h2>
                
                {token ? (
                  <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '30px' }}>
                    <h3 style={{ margin: '0 0 15px 0' }}>Írd meg a véleményed!</h3>
                    
                    {reviewError && <p style={{ color: '#ef4444', marginBottom: '10px' }}>{reviewError}</p>}
                    {reviewSuccess && <p style={{ color: '#10b981', marginBottom: '10px' }}>{reviewSuccess}</p>}
                    
                    <form onSubmit={handleSubmitReview}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                        <span>Értékelésed: </span>
                        <div style={{ display: 'flex', cursor: 'pointer' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              className="material-symbols-outlined" 
                              onClick={() => setReviewRating(star)}
                              style={{ color: star <= reviewRating ? '#f59e0b' : 'var(--border)', fontVariationSettings: star <= reviewRating ? "'FILL' 1" : "'FILL' 0", fontSize: '28px' }}
                            >
                              star
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <textarea 
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Milyen volt a termék? Írd le tapasztalataidat..."
                        style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '2px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', marginBottom: '15px', resize: 'vertical', minHeight: '100px' }}
                        required
                      />
                      <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={isSubmittingReview}>
                        {isSubmittingReview ? 'Küldés...' : 'Értékelés beküldése'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div style={{ background: 'var(--bg-input)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '30px', textAlign: 'center' }}>
                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Értékelés írásához <strong style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }))}>jelentkezz be</strong>!</p>
                  </div>
                )}

                <div className="reviews-list">
                  {!product.reviews || product.reviews.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>Még senki sem értékelte ezt a terméket. Légy te az első!</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {product.reviews.map(review => (
                        <div key={review.id} style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <strong style={{ color: 'var(--text-main)' }}>{review.userName}</strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div style={{ display: 'flex', marginBottom: '10px' }}>
                            {renderStars(review.rating)}
                          </div>
                          <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: '1.5' }}>{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          ) : null}
        </div>
      </main>

      <Footer />
      <Cart />
    </div>
  );
};

export default ProductDetail;