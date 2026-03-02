// src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import UploadModal from './components/UploadModal';
import LoginPage from './pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

// ── Design tokens ──────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Lato:wght@300;400;700&display=swap');

  :root {
    --bg:        #f0f7f3;
    --surface:   #ffffff;
    --border:    rgba(0,100,60,0.1);
    --border-hi: rgba(0,100,60,0.22);
    --text:      #0d2118;
    --muted:     #4d7060;
    --accent:    #006B45;
    --accent-hi: #008a57;
    --cyan:      #00976a;
    --green:     #006B45;
    --orange:    #c96b00;
    --red:       #c0392b;
    --gray:      #5a7060;
    --font-display: 'Syne', sans-serif;
    --font-body:    'Lato', sans-serif;
    --font-mono:    'JetBrains Mono', monospace;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
  }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,107,69,0.2); border-radius: 3px; }
  input, textarea, select, button { font-family: inherit; }
  input::placeholder, textarea::placeholder { color: var(--muted); }
  option { background: #f0f7f3; color: #0d2118; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(32px) } to { opacity:1; transform:none } }
  @keyframes spin     { to { transform: rotate(360deg) } }
  @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:.4 } }

  .animate-fade-up  { animation: fadeUp  0.35s ease both; }
  .animate-slide-in { animation: slideIn 0.28s ease both; }

  .row-hover:hover { background: rgba(0,107,69,0.04) !important; cursor: pointer; }
  .btn-ghost:hover { background: rgba(0,0,0,0.05) !important; }
  .nav-link.active { color: var(--accent) !important; background: rgba(0,107,69,0.08) !important; }
`;

function AppShell({ onLogout }) {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <style>{CSS}</style>

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 20,
        padding: '0 24px', height: 54, flexShrink: 0,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 12 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--cyan) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
              <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--text)', lineHeight: 1.1 }}>DocVault</div>
            <div style={{ fontSize: 8, color: 'var(--accent-hi)', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>AZURE · CLOUD</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', gap: 2 }}>
          {[
            { to: '/',       label: 'Dashboard', icon: <GridIcon /> },
            { to: '/search', label: 'Search',    icon: <SearchIcon /> },
          ].map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end className="nav-link" style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
              fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              color: isActive ? 'var(--accent-hi)' : 'var(--muted)',
              background: isActive ? 'rgba(37,99,235,0.12)' : 'transparent',
            })}>
              {icon} {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Upload */}
        <button onClick={() => setShowUpload(true)} style={{
          padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
          color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-display)',
          letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <UploadIcon /> Upload
        </button>

        {/* Sign out */}
        <button onClick={onLogout} className="btn-ghost" style={{
          padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'transparent', color: 'var(--muted)', fontSize: 12,
          fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <SignOutIcon /> Sign out
        </button>
      </header>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/"       element={<Dashboard />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}

export default function App() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('dv_auth') === '1');

  if (!authed) {
    return (
      <>
        <style>{CSS}</style>
        <LoginPage onLogin={() => setAuthed(true)} />
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell onLogout={() => { sessionStorage.removeItem('dv_auth'); setAuthed(false); }} />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// ── Inline SVG icons ───────────────────────────────────────────────────────
const GridIcon    = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const SearchIcon  = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const UploadIcon  = () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const SignOutIcon = () => <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
