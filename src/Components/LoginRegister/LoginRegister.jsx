import React, { useState } from 'react';
import './LoginRegister.css';

const LoginRegister = ({ onLoginSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="modal-overlay">
      <div className="login-card">
        <button className="close-btn" onClick={onBack}>
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="login-header">
          <div className="v-logo-icon small">
            <span className="material-symbols-outlined">shopping_bag</span>
          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Enter your vendor credentials to manage your shop' : 'Join Vendora as a professional merchant'}</p>
        </div>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="name@company.com" required />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          {isLogin && (
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-pwd">Forgot password?</a>
            </div>
          )}

          <button className="v-btn-primary full-width" onClick={onLoginSuccess}>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="login-footer">
          <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
          <button className="text-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register now' : 'Log in here'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;