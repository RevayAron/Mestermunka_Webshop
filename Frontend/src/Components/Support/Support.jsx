import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Support.css';

const Support = () => {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [faqSearch, setFaqSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch('https://localhost:7211/api/Support/faq');
        if (!response.ok) throw new Error('Hálózati hiba a GYIK lekérésekor.');
        const data = await response.json();
        const dataWithOpenState = data.map(faq => ({ ...faq, open: false }));
        setFaqs(dataWithOpenState);
      } catch (error) {
        console.error("Hiba a GYIK betöltésekor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFaq = (id) => {
    setFaqs(faqs.map(faq => faq.id === id ? { ...faq, open: !faq.open } : faq));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!newQuestion.trim()) return;
    try {
      const response = await fetch('https://localhost:7211/api/Support/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ question: newQuestion })
      });
      if (!response.ok) throw new Error('Hiba történt a szerver oldalon.');
      alert("Kérdés sikeresen beküldve! Az adminok hamarosan válaszolnak.");
      setNewQuestion("");
    } catch (error) {
      alert("Hiba történt a küldés során.");
    }
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
    faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="support-container">
      <header className="support-header">
        <div className="support-brand" onClick={() => navigate('/')}>
          <span className="material-symbols-outlined brand-icon">shopping_bag</span>
          <h1 className="brand-title">VENDORA <span className="brand-subtitle">Support</span></h1>
        </div>
        <button onClick={() => navigate('/')} className="back-btn">Vissza a boltba</button>
      </header>

      <main className="support-main">
        <div className="faq-section">
          <h2>Gyakran Ismételt Kérdések</h2>
          
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-muted)' }}>search</span>
            <input 
              type="text" 
              placeholder="Keresés a kérdések és válaszok között..." 
              value={faqSearch} 
              onChange={(e) => setFaqSearch(e.target.value)} 
              style={{ width: '100%', padding: '12px 12px 12px 45px', borderRadius: '8px', border: '2px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '15px', boxSizing: 'border-box' }} 
            />
          </div>

          {loading ? (
            <p className="loading-text">Kérdések betöltése...</p>
          ) : filteredFaqs.length === 0 ? (
            <p className="loading-text">Nem található a keresésnek megfelelő válasz.</p>
          ) : (
            <div className="faq-list">
              {filteredFaqs.map(faq => (
                <div key={faq.id} className={`faq-card ${faq.open ? 'open' : ''}`} onClick={() => toggleFaq(faq.id)}>
                  <div className="faq-question">
                    <h3>{faq.question}</h3>
                    <span className="material-symbols-outlined">{faq.open ? 'remove' : 'add'}</span>
                  </div>
                  {faq.open && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="submit-section">
          <h2>Nem találod a választ?</h2>
          <p>Tedd fel a kérdésed, és kikerülhet a GYIK-be!</p>
          {token ? (
            <form onSubmit={handleSubmit} className="support-form">
              <textarea placeholder="Írd ide a kérdésed..." value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} rows="4" required />
              <button type="submit" className="submit-btn support-submit">Kérdés beküldése</button>
            </form>
          ) : (
            <div className="login-prompt-box">
              <span className="material-symbols-outlined prompt-icon">lock</span>
              <h3>Jelentkezz be a kérdés feltevéséhez!</h3>
              <p>Csak regisztrált felhasználóink használhatják a Support rendszert.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Support;