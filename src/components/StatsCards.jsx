// src/components/StatsCards.jsx
const CARDS = [
  { key: 'total',   label: 'Total Documents', accent: '#2563eb', fmt: v => v },
  { key: 'hot',     label: 'Hot Tier',        accent: '#ef4444', fmt: v => v, sub: 'instant access' },
  { key: 'cool',    label: 'Cool / Cold',     accent: '#06b6d4', fmt: v => v, sub: 'secs to retrieve' },
  { key: 'archive', label: 'Archived',        accent: '#6b7280', fmt: v => v, sub: '1-15 hr rehydration' },
  { key: 'totalMb', label: 'Total Storage',   accent: '#10b981', fmt: v => `${v} MB`, sub: 'across all tiers' },
];

export default function StatsCards({ stats = {} }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 4 }}>
      {CARDS.map(({ key, label, accent, fmt, sub }, i) => (
        <div key={key} className="animate-fade-up" style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '18px 20px', position: 'relative', overflow: 'hidden',
          animationDelay: `${i * 0.06}s`,
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.04,
            background: `radial-gradient(circle at 80% 20%, ${accent}, transparent 70%)` }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
            background: accent, borderRadius: '12px 0 0 12px' }} />
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.07em',
            textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--text)',
            fontFamily: 'var(--font-display)', lineHeight: 1 }}>
            {fmt(stats[key] ?? '—')}
          </div>
          {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>{sub}</div>}
        </div>
      ))}
    </div>
  );
}
