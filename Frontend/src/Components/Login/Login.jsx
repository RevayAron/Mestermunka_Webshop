import React, { useState } from 'react';

const Login = ({ onClose, onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('https://localhost:7211/api/Users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      });

      if (!response.ok) {
        let exactError = "Hibás email cím vagy jelszó!";
        
        try {
          const errorData = await response.json();
          if (errorData.message) exactError = errorData.message;
          else if (errorData.Message) exactError = errorData.Message;
        } catch (parseErr) {
          const errorText = await response.text();
          if (errorText) exactError = errorText;
        }

        setErrorMsg(exactError);
        setIsLoading(false);
        return; 
      }
      const data = await response.json();
      
      const userToken = data.token || data.Token;
      if (userToken) {
        localStorage.setItem('token', userToken);
      }
      
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      }

    } catch (err) {
      console.error("Hálózati hiba a belépésnél:", err);
      setErrorMsg("Nem sikerült elérni a szervert. Ellenőrizd, hogy fut-e a backend!");
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="login-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', width: '100%', padding: '40px', background: '#3B2C35', borderRadius: '16px', border: '1px solid #81e1ac', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h2 style={{ margin: 0, color: '#FAB3A9', fontSize: '24px' }}>Bejelentkezés</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#C6AD94', cursor: 'pointer' }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {errorMsg && (
          <div className="error-alert" style={{ marginBottom: '20px', backgroundColor: 'rgba(250, 179, 169, 0.1)', color: '#FAB3A9', padding: '15px', borderRadius: '8px', border: '1px solid #FAB3A9', fontSize: '14px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#C6AD94', fontSize: '14px', fontWeight: 'bold' }}>Email cím</label>
            <input 
              type="email" 
              style={{ width: '100%', padding: '14px', background: '#2A1F2D', border: '1px solid #81e1ac', color: '#FAB3A9', borderRadius: '10px', boxSizing: 'border-box' }}
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#C6AD94', fontSize: '14px', fontWeight: 'bold' }}>Jelszó</label>
            <input 
              type="password" 
              style={{ width: '100%', padding: '14px', background: '#2A1F2D', border: '1px solid #81e1ac', color: '#FAB3A9', borderRadius: '10px', boxSizing: 'border-box' }}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ marginTop: '10px', width: '100%', padding: '14px', background: '#81e1ac', color: '#2A1F2D', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Bejelentkezés...' : 'Belépés'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', color: '#C6AD94', fontSize: '14px' }}>
          Nincs még fiókod?{' '}
          <span onClick={onSwitchToRegister} style={{ color: '#FAB3A9', cursor: 'pointer', fontWeight: 'bold', textDecoration: 'underline' }}>
            Regisztrálj itt!
          </span>
        </div>
        
      </div>
    </div>
  );
};

export default Login;