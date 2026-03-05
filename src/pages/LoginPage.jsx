// src/pages/LoginPage.jsx
import { useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '../auth/msalConfig';

const TEST_USER = { username: 'admin', password: 'docvault123' };

let msalInstance = null;
try {
  if (msalConfig.auth.clientId) {
    msalInstance = new PublicClientApplication(msalConfig);
  }
} catch (_) {}

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('docvault123');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);

  const submit = e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (username === TEST_USER.username && password === TEST_USER.password) {
        sessionStorage.setItem('dv_auth', '1');
        onLogin();
      } else {
        setError('Invalid username or password.');
      }
      setLoading(false);
    }, 400);
  };

  const handleMsLogin = async () => {
    if (!msalInstance) {
      setError('Microsoft SSO is not configured. Set REACT_APP_AZURE_CLIENT_ID and REACT_APP_AZURE_TENANT_ID in .env');
      return;
    }
    setSsoLoading(true);
    try {
      await msalInstance.initialize();
      const result = await msalInstance.loginPopup(loginRequest);
      if (result?.accessToken) {
        sessionStorage.setItem('access_token', result.accessToken);
      }
      sessionStorage.setItem('dv_auth', '1');
      onLogin();
    } catch (err) {
      if (err.errorCode !== 'user_cancelled') {
        setError(err.message || 'Microsoft sign-in failed.');
      }
    } finally {
      setSsoLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: 24,
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'var(--surface)', border: '1px solid var(--border-hi)',
        borderRadius: 18, padding: '40px 36px',
        boxShadow: '0 8px 40px rgba(0,107,69,0.08)',
        animation: 'fadeUp 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--cyan) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>DocVault</div>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 22, color: 'var(--text)', marginBottom: 6 }}>
          Sign in
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>
          Enter your credentials to access the vault.
        </p>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Username</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              autoComplete="username" required style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              autoComplete="current-password" required style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              padding: '9px 13px', borderRadius: 8, marginBottom: 16,
              background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.2)',
              color: 'var(--red)', fontSize: 13,
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
            color: '#fff', fontWeight: 700, fontSize: 14,
            fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.15s',
          }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Microsoft SSO */}
        <button onClick={handleMsLogin} disabled={ssoLoading} style={{
          width: '100%', padding: '11px', borderRadius: 10,
          border: '1px solid var(--border-hi)', background: 'var(--surface)',
          color: 'var(--text)', fontWeight: 600, fontSize: 13, cursor: ssoLoading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          opacity: ssoLoading ? 0.7 : 1, transition: 'opacity 0.15s',
        }}>
          <MicrosoftIcon />
          {ssoLoading ? 'Redirecting…' : 'Sign in with Microsoft'}
        </button>
      </div>
    </div>
  );
}

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
    <rect x="1"  y="1"  width="9" height="9" fill="#f25022"/>
    <rect x="11" y="1"  width="9" height="9" fill="#7fba00"/>
    <rect x="1"  y="11" width="9" height="9" fill="#00a4ef"/>
    <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
  </svg>
);

const labelStyle = {
  display: 'block', fontSize: 10, color: 'var(--muted)', fontWeight: 700,
  letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
  fontFamily: 'var(--font-mono)',
};
const inputStyle = {
  width: '100%', padding: '10px 13px', borderRadius: 8,
  border: '1px solid var(--border-hi)', background: 'rgba(0,107,69,0.03)',
  color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
};
