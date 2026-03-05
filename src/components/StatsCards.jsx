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

      {/* ── Department cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
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
