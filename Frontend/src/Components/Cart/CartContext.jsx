import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const API_URL = 'https://localhost:7211/api/Cart';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  const handleError = (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("A token lejárt vagy érvénytelen. Kijelentkeztetés...");
      localStorage.removeItem('token');
      setCartItems([]);
    } else {
      console.error("Kosár hiba:", error);
    }
  };

  const fetchCart = async () => {
    if (!localStorage.getItem('token')) {
      setCartItems([]);
      return;
    }
    try {
      const response = await axios.get(API_URL, getAuthHeaders());
      setCartItems(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId, quantity = 1) => {
    if (!localStorage.getItem('token')) {
      window.dispatchEvent(new CustomEvent('open-auth-modal', { detail: { mode: 'login' } }));
      return;
    }
    try {
      await axios.post(`${API_URL}/add`, { productId, quantity }, getAuthHeaders());
      fetchCart(); 
      setIsCartOpen(true);
    } catch (error) {
      handleError(error);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    try {
      await axios.put(`${API_URL}/update-quantity`, { productId, quantity }, getAuthHeaders());
      fetchCart();
    } catch (error) {
      handleError(error);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API_URL}/remove/${productId}`, getAuthHeaders());
      fetchCart();
    } catch (error) {
      handleError(error);
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_URL}/clear`, getAuthHeaders());
      setCartItems([]);
    } catch (error) {
      handleError(error);
    }
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + (price * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, updateQuantity, removeFromCart, clearCart, 
      cartCount, cartTotal, isCartOpen, toggleCart, fetchCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};