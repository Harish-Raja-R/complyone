import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, Mail, Lock, BadgeCheck, Building2, Fingerprint } from 'lucide-react';
import Notification from '../components/Notification';
import { PixelLiquidBg } from '@/components/unlumen-ui/pixel-liquid-bg';
import complyOneLogo from '../assets/complyone-logo.png';

const LOGIN_DARK_PALETTE = ['#020617', '#0f766e', '#2563eb', '#c026d3', '#f97316'];
const LOGIN_LIGHT_PALETTE = ['#f8fafc', '#bae6fd', '#60a5fa', '#a78bfa', '#f472b6'];

const Login = ({ onBackToLanding }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');

    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.message || 'Login failed. Please verify credentials.');
    }
  };

  return (
    <PixelLiquidBg
      className="auth-page"
      darkPalette={LOGIN_DARK_PALETTE}
      lightPalette={LOGIN_LIGHT_PALETTE}
      pixelSize={14}
      resolution={0.35}
      mouseForce={10}
      cursorSize={130}
    >
      <div className="auth-login-content">
        <div className="auth-card">
          {onBackToLanding && (
            <button className="auth-back-button" type="button" onClick={onBackToLanding}>
              <ArrowLeft size={16} /> Overview
            </button>
          )}
          <div className="auth-header">
            <div className="auth-chip-row">
              <span className="premium-chip premium-chip-compact">
                <BadgeCheck size={15} /> Enterprise governance suite
              </span>
            </div>
            <div className="logo-container auth-logo-container">
              <span className="auth-logo-frame">
                <img className="brand-logo brand-logo-auth" src={complyOneLogo} alt="ComplyOne" />
              </span>
            </div>
            <h2 className="auth-title">
              Welcome Back
            </h2>
            <p className="auth-subtitle">
              Sign in to ComplyOne to manage your regulatory compliance activities.
            </p>
          </div>

          <div className="auth-feature-grid">
            <div className="premium-mini glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Fingerprint size={18} color="var(--accent)" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Secure access</span>
            </div>
            <div className="premium-mini glass-panel" style={{ padding: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building2 size={18} color="var(--color-warning)" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>Admin ready</span>
            </div>
          </div>

          {error && <Notification message={error} type="error" onClose={() => setError('')} />}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@organization.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '48px', padding: '14px 14px 14px 48px', fontSize: '15px', width: '100%' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '48px', padding: '14px 14px 14px 48px', fontSize: '15px', width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', marginTop: '2px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                Remember me
              </label>
              <a href="#forgot" style={{ color: 'var(--primary)', fontWeight: 600, transition: 'color 0.2s' }} onClick={(e) => { e.preventDefault(); alert('Please contact your System Administrator to reset your password.'); }}>
                Forgot password?
              </a>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Signing in...' : (
                <>
                  Sign In <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-text">
            <p style={{ marginBottom: '16px', fontWeight: 500 }}>Demo accounts (password: <strong>password123</strong>):</p>
            <div className="demo-account-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', textAlign: 'left', backgroundColor: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div><code>admin@complyone.com</code></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }}></div><code>officer@complyone.com</code></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-info)' }}></div><code>manager@complyone.com</code></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-compliant)' }}></div><code>employee@complyone.com</code></div>
            </div>
          </div>
        </div>
      </div>
    </PixelLiquidBg>
  );
};

export default Login;
