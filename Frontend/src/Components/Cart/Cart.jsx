import React from 'react';
import { useCart } from './CartContext';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = () => {
  const { cartItems, isCartOpen, toggleCart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    toggleCart();
    navigate('/checkout');
  };

  return (
    <div className="cart-overlay" onClick={toggleCart}>
      <div className="cart-sidebar" onClick={(e) => e.stopPropagation()}>
        
        <div className="cart-header">
          <h2><span className="material-symbols-outlined" style={{ verticalAlign: 'middle', marginRight: '8px' }}>shopping_cart</span> Kosaram</h2>
          <button className="close-cart" onClick={toggleCart}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="cart-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <span className="material-symbols-outlined empty-icon">remove_shopping_cart</span>
              <p>A kosarad jelenleg üres.</p>
              <button className="v-btn-primary" onClick={toggleCart} style={{ marginTop: '15px' }}>
                Vásárlás folytatása
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img 
                    src={item.product?.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070"} 
                    alt={item.product?.name || "Termék"} 
                  />
                </div>
                
                <div className="cart-item-details">
                  <h4 className="item-title">{item.product?.name || "Ismeretlen termék"}</h4>
                  <p className="item-price">{Number(item.product?.price || 0).toLocaleString()} Ft</p>
                  
                  <div className="cart-controls">
                    <div className="quantity-btn-group">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                    </div>
                    
                    <button className="remove-btn" onClick={() => removeFromCart(item.productId)} title="Eltávolítás">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Összesen fizetendő:</span>
              <span style={{ color: '#FAB3A9', fontSize: '1.4rem' }}>{cartTotal.toLocaleString()} Ft</span>
            </div>
            
            <button className="v-btn-primary full-width checkout-btn" onClick={handleCheckoutClick}>
              <span className="material-symbols-outlined">payments</span>
              Tovább a pénztárhoz
            </button>
            
            <button className="clear-cart-text" onClick={clearCart}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>delete_sweep</span>
              Kosár teljes kiürítése
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Cart;