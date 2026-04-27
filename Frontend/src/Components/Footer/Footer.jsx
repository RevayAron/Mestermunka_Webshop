import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-grid">
        
        <div className="footer-brand">
          <div className="logo">
            <span className="material-symbols-outlined">shopping_bag</span>
            <h2 className="logo-text">Vendora</h2>
          </div>
          <p>
            Prémium B2B és B2C piactér. Találd meg a legjobb termékeket, vagy csatlakozz eladóként és növeld a bevételedet velünk.
          </p>
        </div>

        <div className="footer-col">
          <h4>Vásárlóknak</h4>
          <ul>
            <li><Link to="/browse">Összes termék</Link></li>
            <li><Link to="/support">Gyakori kérdések</Link></li>
            <li><Link to="/">Szállítási információk</Link></li>
            <li><Link to="/">Rendelés követése</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Eladóknak (Vendors)</h4>
          <ul>
            <li><Link to="/vendors">Miért válassz minket?</Link></li>
            <li><Link to="/dashboard">Vezérlőpult</Link></li>
            <li><Link to="/support">Eladói támogatás</Link></li>
            <li><Link to="/">B2B Partnerek</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Vállalat</h4>
          <ul>
            <li><Link to="/">Rólunk</Link></li>
            <li><Link to="/">Kapcsolat</Link></li>
            <li><Link to="/">Adatvédelmi irányelvek</Link></li>
            <li><Link to="/">Általános Szerződési Feltételek</Link></li>
          </ul>
        </div>

      </div>
    </footer>
  );
};

export default Footer;