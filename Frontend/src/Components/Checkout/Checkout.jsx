import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import { useCart } from '../Cart/CartContext';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems = [], clearCart } = useCart(); 
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Bankkártya');

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', zipCode: '', country: 'Hungary', companyName: '', taxNumber: ''
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '', cardName: '', expiryDate: '', cvv: '',
    bankAccount: '', transferName: ''
  });
  const [paymentErrors, setPaymentErrors] = useState({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      if (!success) navigate('/browse');
    }
  }, [cartItems, navigate, success]);

  useEffect(() => {
    if (token) fetchMyProfile();
  }, [token]);

  const fetchMyProfile = async () => {
    try {
      const response = await fetch('https://localhost:7211/api/Users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          email: data.email || '',
          companyName: data.companyName || ''
        }));
        // Automatikusan kitöltjük a kártyán/utaláson lévő nevet is
        setPaymentData(prev => ({
          ...prev,
          cardName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          transferName: `${data.firstName || ''} ${data.lastName || ''}`.trim()
        }));
      }
    } catch (error) {
      console.error('Hiba a profil betöltésekor', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'cardNumber') {
      value = value.replace(/\D/g, '').substring(0, 16);
      value = value.replace(/(\d{4})(?=\d)/g, '$1 '); //4-esével tagolás
    } else if (name === 'expiryDate') {
      value = value.replace(/\D/g, '').substring(0, 4);
      if (value.length > 2) value = `${value.substring(0, 2)}/${value.substring(2, 4)}`; //MM/YY formátum
    } else if (name === 'cvv') {
      value = value.replace(/\D/g, '').substring(0, 3);
    } else if (name === 'bankAccount') {
      value = value.replace(/\D/g, '').substring(0, 24);
      value = value.replace(/(\d{8})(?=\d)/g, '$1-'); //8-asával tagolás
    }

    setPaymentData({ ...paymentData, [name]: value });
    setPaymentErrors({ ...paymentErrors, [name]: '' }); //gépeléskor hibát töröljük
  };

  //regex validáció
  const validatePaymentDetails = () => {
    let errors = {};
    let isValid = true;

    if (paymentMethod === 'Bankkártya') {
      const cleanCard = paymentData.cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cleanCard)) {
        errors.cardNumber = "Érvénytelen kártyaszám (16 számjegy szükséges).";
        isValid = false;
      }
      if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]{3,}$/.test(paymentData.cardName)) {
        errors.cardName = "Kérjük adja meg a kártyán szereplő nevet.";
        isValid = false;
      }
      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(paymentData.expiryDate)) {
        errors.expiryDate = "Érvénytelen dátum (MM/YY).";
        isValid = false;
      }
      if (!/^\d{3}$/.test(paymentData.cvv)) {
        errors.cvv = "Érvénytelen CVV (3 számjegy).";
        isValid = false;
      }
    } 
    else if (paymentMethod === 'Előreutalás') {
      const cleanAccount = paymentData.bankAccount.replace(/-/g, '');
      if (!/^(\d{16}|\d{24})$/.test(cleanAccount)) {
        errors.bankAccount = "Érvénytelen számlaszám (2x8 vagy 3x8 számjegy).";
        isValid = false;
      }
      if (!/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s-]{3,}$/.test(paymentData.transferName)) {
        errors.transferName = "Kérjük adja meg a számla tulajdonosának nevét.";
        isValid = false;
      }
    }

    setPaymentErrors(errors);
    return isValid;
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod === 'Bankkártya' || paymentMethod === 'Előreutalás') {
      setShowPaymentModal(true);
    } else {
      executeOrder();
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (validatePaymentDetails()) {
      setShowPaymentModal(false);
      executeOrder();
    }
  };

  const executeOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://localhost:7211/api/Orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress: `${formData.address}, ${formData.zipCode} ${formData.city}`,
          paymentMethod: paymentMethod 
        })
      });

      if (response.ok) {
        setLoading(false);
        setSuccess(true);
        if (clearCart) clearCart();
        window.scrollTo(0, 0);
      } else {
        const errorData = await response.json();
        alert("Hiba a rendelés során: " + (errorData.message || "Ismeretlen hiba"));
        setLoading(false);
      }
    } catch (err) {
      console.error('Hálózati hiba:', err);
      alert("Nem sikerült elérni a szervert.");
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = Number(item.price) || Number(item.product?.price) || Number(item.Price) || 0;
      const itemQty = Number(item.quantity) || Number(item.Quantity) || 1;
      return total + (itemPrice * itemQty);
    }, 0);
  };

  if (success) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="modal-overlay">
          <div className="checkout-success-card">
            <div className="v-logo-icon" style={{ backgroundColor: '#5B6C5D', color: '#2A1F2D', margin: '0 auto 20px auto', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>local_shipping</span>
            </div>
            <h2 style={{ color: '#FAB3A9', fontSize: '28px', marginBottom: '10px', textAlign: 'center' }}>Rendelés rögzítve!</h2>
            <p style={{ color: '#C6AD94', marginBottom: '30px', textAlign: 'center' }}>Köszönjük a vásárlást! A rendelés visszaigazolását elküldtük a(z) <strong>{formData.email}</strong> címre.</p>
            <button 
              className="v-btn-primary full-width" 
              onClick={() => navigate('/account', { state: { activeTab: 'orders' } })} 
              style={{ justifyContent: 'center', padding: '15px' }}
            >
              Rendeléseim megtekintése
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Navbar />

      {/*Fizetési ablak */}
      {showPaymentModal && (
        <div className="modal-overlay" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)' }}>
          <div className="checkout-card" style={{ maxWidth: '500px', width: '100%', padding: '30px', position: 'relative' }}>
            <button onClick={() => setShowPaymentModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <h2 style={{ marginBottom: '5px', textAlign: 'center', color: 'var(--text-main)' }}>
              {paymentMethod === 'Bankkártya' ? 'Kártyaadatok megadása' : 'Utalási adatok megadása'}
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '25px', fontSize: '14px' }}>
              Fizetendő összeg: <strong style={{color: 'var(--text-highlight)', fontSize: '18px'}}>{(calculateTotal() || 0).toLocaleString()} Ft</strong>
            </p>

            <form onSubmit={handlePaymentSubmit}>
              {paymentMethod === 'Bankkártya' ? (
                <>
                  <div className="input-group">
                    <label>Kártyaszám</label>
                    <input type="text" name="cardNumber" placeholder="0000 0000 0000 0000" value={paymentData.cardNumber} onChange={handlePaymentChange} />
                    {paymentErrors.cardNumber && <span style={{ color: '#ef4444', fontSize: '12px' }}>{paymentErrors.cardNumber}</span>}
                  </div>
                  <div className="input-group">
                    <label>Kártyán szereplő név</label>
                    <input type="text" name="cardName" placeholder="Gipsz Jakab" value={paymentData.cardName} onChange={handlePaymentChange} />
                    {paymentErrors.cardName && <span style={{ color: '#ef4444', fontSize: '12px' }}>{paymentErrors.cardName}</span>}
                  </div>
                  <div className="input-row">
                    <div className="input-group">
                      <label>Lejárat (MM/YY)</label>
                      <input type="text" name="expiryDate" placeholder="MM/YY" value={paymentData.expiryDate} onChange={handlePaymentChange} />
                      {paymentErrors.expiryDate && <span style={{ color: '#ef4444', fontSize: '12px' }}>{paymentErrors.expiryDate}</span>}
                    </div>
                    <div className="input-group">
                      <label>CVC/CVV</label>
                      <input type="text" name="cvv" placeholder="123" value={paymentData.cvv} onChange={handlePaymentChange} />
                      {paymentErrors.cvv && <span style={{ color: '#ef4444', fontSize: '12px' }}>{paymentErrors.cvv}</span>}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="input-group">
                    <label>Küldő Bankszámlaszáma</label>
                    <input type="text" name="bankAccount" placeholder="11111111-22222222-33333333" value={paymentData.bankAccount} onChange={handlePaymentChange} />
                    {paymentErrors.bankAccount && <span style={{ color: '#ef4444', fontSize: '12px' }}>{paymentErrors.bankAccount}</span>}
                  </div>
                  <div className="input-group">
                    <label>Számla Tulajdonos Neve</label>
                    <input type="text" name="transferName" placeholder="Gipsz Jakab" value={paymentData.transferName} onChange={handlePaymentChange} />
                    {paymentErrors.transferName && <span style={{ color: '#ef4444', fontSize: '12px' }}>{paymentErrors.transferName}</span>}
                  </div>
                  <div style={{ background: 'var(--bg-page)', padding: '15px', borderRadius: '8px', border: '1px dashed var(--primary)', marginBottom: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    A sikeres rendelés után megkapja a mi bankszámlaszámunkat a visszaigazoló emailben, amire az összeget el kell utalnia!
                  </div>
                </>
              )}

              <button type="submit" className="v-btn-primary full-width" style={{ justifyContent: 'center', padding: '15px', fontSize: '16px' }}>
                <span className="material-symbols-outlined">lock</span> Biztonságos Fizetés Jóváhagyása
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="checkout-container">
        <div className="checkout-header">
          <h1>Pénztár</h1>
          <p>Kérjük, add meg a szállítási és számlázási adataidat a rendelés véglegesítéséhez.</p>
        </div>

        <form className="checkout-grid" onSubmit={handlePreSubmit}>

          <div className="checkout-form-section">
            
            <div className="checkout-card">
              <h2><span className="material-symbols-outlined">person</span> Kapcsolattartó adatai</h2>
              <div className="input-row">
                <div className="input-group">
                  <label>Teljes név</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Telefonszám</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>
              </div>
              <div className="input-group">
                <label>Email cím</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="checkout-card">
              <h2><span className="material-symbols-outlined">location_on</span> Szállítási adatok</h2>
              <div className="input-group">
                <label>Utca, házszám</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} required />
              </div>
              <div className="input-row">
                <div className="input-group">
                  <label>Város</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Irányítószám</label>
                  <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="checkout-card">
              <h2><span className="material-symbols-outlined">payments</span> Fizetési mód</h2>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'Bankkártya' ? 'active' : ''}`}>
                  <input type="radio" name="payment" value="Bankkártya" checked={paymentMethod === 'Bankkártya'} onChange={() => setPaymentMethod('Bankkártya')} />
                  <span className="material-symbols-outlined">credit_card</span>
                  <div>
                    <strong>Bankkártya</strong>
                    <p>Azonnali, biztonságos fizetés (Validációval)</p>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'Előreutalás' ? 'active' : ''}`}>
                  <input type="radio" name="payment" value="Előreutalás" checked={paymentMethod === 'Előreutalás'} onChange={() => setPaymentMethod('Előreutalás')} />
                  <span className="material-symbols-outlined">account_balance</span>
                  <div>
                    <strong>Előre utalás</strong>
                    <p>Közvetlen banki átutalás (Validációval)</p>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === 'Utánvét' ? 'active' : ''}`}>
                  <input type="radio" name="payment" value="Utánvét" checked={paymentMethod === 'Utánvét'} onChange={() => setPaymentMethod('Utánvét')} />
                  <span className="material-symbols-outlined">payments</span>
                  <div>
                    <strong>Utánvét</strong>
                    <p>Fizetés a futárnál készpénzzel vagy kártyával</p>
                  </div>
                </label>

                {formData.companyName && (
                  <label className={`payment-option ${paymentMethod === 'B2B Net-30' ? 'active' : ''}`} style={{ borderColor: '#FAB3A9' }}>
                    <input type="radio" name="payment" value="B2B Net-30" checked={paymentMethod === 'B2B Net-30'} onChange={() => setPaymentMethod('B2B Net-30')} />
                    <span className="material-symbols-outlined" style={{ color: '#FAB3A9' }}>handshake</span>
                    <div>
                      <strong style={{ color: '#FAB3A9' }}>B2B Net-30</strong>
                      <p>Fizetés 30 napos határidővel</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

          </div>

          <div className="checkout-summary-section">
            <div className="checkout-summary-card">
              <h2>Rendelés összegzése</h2>
              
              <div className="summary-items">
                {cartItems.map((item, index) => {
                  const itemPrice = Number(item.price) || Number(item.product?.price) || Number(item.Price) || 0;
                  const itemQty = Number(item.quantity) || Number(item.Quantity) || 1;
                  const itemName = item.name || item.title || item.product?.name || item.product?.title || 'Ismeretlen Termék';

                  return (
                    <div key={index} className="summary-item">
                      <div className="item-info">
                        <span className="item-qty">{itemQty}x</span>
                        <span className="item-name">{itemName}</span>
                      </div>
                      <span className="item-price">{(itemPrice * itemQty).toLocaleString()} Ft</span>
                    </div>
                  );
                })}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Részösszeg</span>
                  <span>{(calculateTotal() || 0).toLocaleString()} Ft</span>
                </div>
                <div className="total-row">
                  <span>Szállítás</span>
                  <span style={{ color: '#5B6C5D' }}>Ingyenes</span>
                </div>
                <div className="total-row grand-total">
                  <span>Fizetendő</span>
                  <span>{(calculateTotal() || 0).toLocaleString()} Ft</span>
                </div>
              </div>

              <button type="submit" className="v-btn-primary place-order-btn" disabled={loading}>
                {loading ? (
                  <span className="material-symbols-outlined spinning">sync</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    {paymentMethod === 'Bankkártya' || paymentMethod === 'Előreutalás' ? 'Tovább a fizetéshez' : 'Rendelés leadása'}
                  </>
                )}
              </button>

              <p className="secure-checkout-text">
                <span className="material-symbols-outlined">lock</span> SSL titkosított, biztonságos adatkezelés.
              </p>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
};

export default Checkout;