// src/App.jsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import UploadModal from './components/UploadModal';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

// ── Design tokens ──────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&family=Lato:wght@300;400;700&display=swap');

  :root {
    --bg:        #05080f;
    --surface:   #0d1424;
    --border:    rgba(255,255,255,0.07);
    --border-hi: rgba(255,255,255,0.15);
    --text:      #e8edf5;
    --muted:     #5a6a82;
    --accent:    #2563eb;
    --accent-hi: #3b82f6;
    --cyan:      #06b6d4;
    --green:     #10b981;
    --orange:    #f59e0b;
    --red:       #ef4444;
    --gray:      #6b7280;
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
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
  input, textarea, select, button { font-family: inherit; }
  input::placeholder, textarea::placeholder { color: var(--muted); }
  option { background: #1a2540; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:none } }
  @keyframes slideIn  { from { opacity:0; transform:translateX(32px) } to { opacity:1; transform:none } }
  @keyframes spin     { to { transform: rotate(360deg) } }
  @keyframes pulse    { 0%,100% { opacity:1 } 50% { opacity:.4 } }

  .animate-fade-up  { animation: fadeUp  0.35s ease both; }
  .animate-slide-in { animation: slideIn 0.28s ease both; }

  .row-hover:hover { background: rgba(255,255,255,0.028) !important; cursor: pointer; }
  .btn-ghost:hover { background: rgba(255,255,255,0.06) !important; }
  .nav-link.active { color: var(--accent-hi) !important; }
`;

function AppShell() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <style>{CSS}</style>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column',
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        height: '100vh', overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--cyan) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
              </svg>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--text)' }}>DocVault</div>
              <div style={{ fontSize: 9, color: 'var(--accent-hi)', fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>AZURE · CLOUD</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { to: '/', label: 'Dashboard', icon: <GridIcon /> },
            { to: '/search', label: 'Search', icon: <SearchIcon /> },
          ].map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end className="nav-link" style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, textDecoration: 'none',
              fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
              color: isActive ? 'var(--accent-hi)' : 'var(--muted)',
              background: isActive ? 'rgba(37,99,235,0.12)' : 'transparent',
            })}>
              {icon} {label}
            </NavLink>
          ))}

          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

          <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', fontFamily: 'var(--font-mono)' }}>
            Architecture
          </div>
          {[
            { label: 'React SPA',        dot: 'var(--cyan)' },
            { label: 'Node.js BFF',      dot: 'var(--green)' },
            { label: 'Azure APIM',       dot: 'var(--orange)' },
            { label: 'Spring Boot ×3',   dot: 'var(--accent-hi)' },
            { label: 'Blob Storage',     dot: 'var(--red)' },
          ].map(({ label, dot }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '5px 12px', fontSize: 12, color: 'var(--muted)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </nav>

        {/* Upload CTA */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <button onClick={() => setShowUpload(true)} style={{
            width: '100%', padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
            color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-display)',
            letterSpacing: '0.02em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          }}>
            <UploadIcon /> Upload Document
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/"       element={<Dashboard onUploadClick={() => setShowUpload(true)} />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// ── Inline SVG icons ───────────────────────────────────────────────────────
const GridIcon   = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const SearchIcon = () => <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const UploadIcon = () => <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
