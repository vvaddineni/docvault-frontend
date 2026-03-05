// src/components/StatsCards.jsx
const DEPT_ORDER = ['Finance','HR','Engineering','Legal','Product','Marketing','General'];

const DEPT_CFG = {
  Finance:     { color: '#10b981', icon: '💼' },
  HR:          { color: '#f59e0b', icon: '👥' },
  Engineering: { color: '#3b82f6', icon: '⚙️' },
  Legal:       { color: '#8b5cf6', icon: '⚖️' },
  Product:     { color: '#ec4899', icon: '📦' },
  Marketing:   { color: '#f97316', icon: '📣' },
  General:     { color: '#6b7280', icon: '📁' },
};

export default function StatsCards({ stats = {} }) {
  const byDept  = stats.byDepartment || [];
  const deptMap = Object.fromEntries(byDept.map(d => [d.department, d.count]));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 4 }}>

      {/* ── Tier counts ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {[
          { label: 'Hot',  val: stats.hot,  color: '#ef4444', bg: 'rgba(239,68,68,0.08)',    icon: '🔥' },
          { label: 'Cool', val: stats.cool, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)',   icon: '❄️' },
        ].map(({ label, val, color, bg, icon }) => (
          <div key={label} className="animate-fade-up" style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 16,
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
              background: color, borderRadius: '12px 0 0 12px' }} />
            <div style={{ paddingLeft: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                {icon}
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)',
                  fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                  {val ?? 0}
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700,
                  letterSpacing: '0.07em', textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                  {label} Tier
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Department cards ── */}
      <div className="stats-dept-grid">
        {DEPT_ORDER.map((dept, i) => {
          const cfg   = DEPT_CFG[dept];
          const count = deptMap[dept] ?? 0;
          return (
            <div key={dept} className="animate-fade-up" style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 16px',
              position: 'relative', overflow: 'hidden',
              animationDelay: `${(i + 1) * 0.05}s`,
            }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                background: cfg.color, borderRadius: '12px 0 0 12px' }} />
              <div style={{ fontSize: 16, marginBottom: 8, lineHeight: 1 }}>{cfg.icon}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)',
                fontFamily: 'var(--font-display)', lineHeight: 1, marginBottom: 6 }}>
                {count}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                fontFamily: 'var(--font-mono)', lineHeight: 1.3 }}>
                {dept}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
