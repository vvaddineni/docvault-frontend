// src/components/DocumentTable.jsx
const TIER_CFG = {
  Hot:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    dot: '#ef4444' },
  Cool:    { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',    dot: '#06b6d4' },
  Cold:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',   dot: '#8b5cf6' },
  Archive: { color: '#6b7280', bg: 'rgba(107,114,128,0.12)',  dot: '#9ca3af' },
};

const DEPT_COLORS = {
  Finance: '#10b981', HR: '#f59e0b', Engineering: '#3b82f6',
  Legal: '#8b5cf6', Product: '#ec4899', Marketing: '#f97316', General: '#6b7280',
};

const MIME_LABELS = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.ms-powerpoint': 'PPTX',
  'text/plain': 'TXT',
};

function fmt(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
function date(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function TierBadge({ tier }) {
  const c = TIER_CFG[tier] || TIER_CFG.Hot;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px',
      borderRadius: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
      color: c.color, background: c.bg, fontFamily: 'var(--font-mono)' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot }} />
      {tier?.toUpperCase()}
    </span>
  );
}

export function DeptBadge({ dept }) {
  const color = DEPT_COLORS[dept] || '#6b7280';
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10,
      fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
      color, background: `${color}1a`, border: `1px solid ${color}35` }}>
      {dept}
    </span>
  );
}

export function MimeBadge({ mimeType }) {
  const label = MIME_LABELS[mimeType] || 'FILE';
  return (
    <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: 4, fontSize: 10,
      fontWeight: 800, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
      color: '#3b82f6', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)' }}>
      {label}
    </span>
  );
}

const COLS = ['2fr','1fr','1fr','1fr','100px','60px'];

export default function DocumentTable({ docs = [], loading, onSelect }) {
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10, color: 'var(--muted)' }}>
      <span style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      Loading documents…
    </div>
  );

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'grid', gridTemplateColumns: COLS.join(' '), padding: '10px 20px',
        background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)',
        fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.09em',
        textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
        <span>Document</span><span>Department</span><span>Uploaded</span><span>Size</span><span>Tier</span><span></span>
      </div>

      {docs.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>◫</div>
          <div style={{ fontWeight: 600 }}>No documents found</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your filters</div>
        </div>
      ) : docs.map((doc, i) => (
        <div key={doc.id} className="row-hover" onClick={() => onSelect(doc)}
          style={{ display: 'grid', gridTemplateColumns: COLS.join(' '), padding: '13px 20px',
            borderBottom: i < docs.length - 1 ? '1px solid var(--border)' : 'none',
            alignItems: 'center', transition: 'background 0.12s',
            animation: `fadeUp 0.3s ease ${i * 0.035}s both` }}>

          {/* Title + type */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
            <MimeBadge mimeType={doc.mimeType} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{doc.author}</div>
            </div>
          </div>

          <DeptBadge dept={doc.department} />
          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{date(doc.uploadedAt)}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{fmt(doc.fileSizeBytes)}</div>
          <TierBadge tier={doc.storageTier} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={e => { e.stopPropagation(); onSelect(doc); }}
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--muted)', fontSize: 11, cursor: 'pointer' }}>
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
