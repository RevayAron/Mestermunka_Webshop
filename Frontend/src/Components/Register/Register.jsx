import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customFetch } from '../../services/fetchApi'; 
import '../Register/Register.css';

const Register = ({ onLoginSuccess, onSwitchToLogin, onClose, company = false }) => {
  const [isCompany, setIsCompany] = useState(company);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    taxId: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Regisztrció gomb megnyomva Adatok:", formData);
    
    setErrorMsg('');

    if (formData.password.length < 6) return setErrorMsg('A jelszónak legalább 6 karakter hosszúnak kell lennie.');
    if (formData.password !== formData.confirmPassword) return setErrorMsg('A megadott jelszavak nem egyeznek.');
    if (isCompany && formData.taxId.length < 8) return setErrorMsg('Kérem adjon meg érvényes Adóazonosítót.');

    try {
      const nameParts = formData.fullName ? formData.fullName.trim().split(' ') : ['Céges'];
      const firstName = nameParts[0] || 'Céges';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Fiók';

      const payload = isCompany 
        ? { 
            email: formData.email, 
            password: formData.password, 
            companyName: formData.companyName, 
            taxNumber: formData.taxId,
            firstName: firstName,
            lastName: lastName,  
            role: "Vendor", 
            isVendor: true
          }
        : { 
            email: formData.email, 
            password: formData.password, 
            firstName: firstName,
            lastName: lastName,
            role: "Customer",
            isVendor: false
          };


      const response = await fetch('https://localhost:7211/api/Users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend hiba történt", errorData);
        
        let exactError = "Helytelen adatok vagy a fiók már létezik.";

        if (errorData.errors) {
          const firstErrorKey = Object.keys(errorData.errors)[0];
          exactError = errorData.errors[firstErrorKey][0];
        } else if (errorData.message) {
          exactError = errorData.message;
        } else if (typeof errorData === 'string') {
          exactError = errorData;
        }

        setErrorMsg(exactError);
        return;
      }

      const data = await response.json();
      console.log("Sikeres regisztráció", data);

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      if (onLoginSuccess) onLoginSuccess(); 

    } catch (error) {
      console.error("Hiba történt catch", error);
      setErrorMsg('Nem sikerült elérni a szervert. Ellenőrizd, hogy fut-e a C# backend!');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="login-card">
        <button className="close-btn" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="login-header">
          <div className="v-logo-icon small">
            <span className="material-symbols-outlined">shopping_bag</span>
          </div>
          <h2>Fiók létrehozása</h2>
          <p>Csatlakozzon a Vendorához</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {errorMsg && <div className="error-message">{errorMsg}</div>}

          <div className="account-type-toggle">
            <button type="button" className={!isCompany ? 'active' : ''} onClick={() => setIsCompany(false)}>
              Személyes
            </button>
            <button type="button" className={isCompany ? 'active' : ''} onClick={() => setIsCompany(true)}>
              Vendor (Vállalati)
            </button>
          </div>

          {!isCompany && (
            <div className="input-group">
              <label>Teljes név</label>
              <input type="text" name="fullName" placeholder="Céges Fiók" value={formData.fullName} onChange={handleChange} required />
            </div>
          )}

          {isCompany && (
            <>
              <div className="input-group">
                <label>Cég neve</label>
                <input type="text" name="companyName" placeholder="Cég Kft." value={formData.companyName} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Adószám / VAT</label>
                <input type="text" name="taxId" placeholder="HU12345678" value={formData.taxId} onChange={handleChange} required />
              </div>
            </>
          )}

          <div className="input-group">
            <label>Email cím</label>
            <input type="email" name="email" placeholder="név@példa.com" value={formData.email} onChange={handleChange} required />
          </div>
          
          <div className="input-group">
            <label>Jelszó</label>
            <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Jelszó újra</label>
            <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
          </div>

          <button type="submit" className="v-btn-primary full-width">
            {isCompany ? 'Kérelmezés' : 'Létrehozás'}
          </button>
        </form>

        <div className="login-footer">
          <span>Van már fiókja?</span>
          <button type="button" className="text-link" onClick={onSwitchToLogin}>
            Bejelentkezés
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;