// src/components/DocumentTable.jsx
import { useState } from 'react';

const TIER_CFG = {
  Hot:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    dot: '#ef4444' },
  Cool:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',   dot: '#3b82f6' },
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
      color: 'var(--accent)', background: 'rgba(0,107,69,0.10)', border: '1px solid rgba(0,107,69,0.2)' }}>
      {label}
    </span>
  );
}

export default function DocumentTable({ docs = [], loading, onSelect }) {
  const [previewDoc, setPreviewDoc] = useState(null);

  const handleDownload = (e, doc) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = `/api/documents/${doc.id}/file`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 10, color: 'var(--muted)' }}>
      <span style={{ width: 18, height: 18, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      Loading documents…
    </div>
  );

  return (
    <>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div className="doc-table-grid" style={{
          background: 'rgba(0,107,69,0.04)', borderBottom: '1px solid var(--border)',
          fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.09em',
          textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          <span>Document</span>
          <span className="col-dept">Department</span>
          <span className="col-date">Uploaded</span>
          <span className="col-size">Size</span>
          <span>Tier</span>
          <span></span>
        </div>

        {docs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
            <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>◫</div>
            <div style={{ fontWeight: 600 }}>No documents found</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your filters</div>
          </div>
        ) : docs.map((doc, i) => (
          <div key={doc.id} className="row-hover doc-table-grid" onClick={() => onSelect(doc)}
            style={{ borderBottom: i < docs.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.12s',
              animation: `fadeUp 0.3s ease ${i * 0.035}s both` }}>

            {/* Title + type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
              <MimeBadge mimeType={doc.mimeType} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{doc.author}</div>
              </div>
            </div>

            <div className="col-dept"><DeptBadge dept={doc.department} /></div>
            <div className="col-date" style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{date(doc.uploadedAt)}</div>
            <div className="col-size" style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{fmt(doc.fileSizeBytes)}</div>
            <TierBadge tier={doc.storageTier} />

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 5 }} onClick={e => e.stopPropagation()}>
              {/* Preview */}
              <button
                onClick={() => setPreviewDoc(doc)}
                title="Preview"
                style={actionBtn}
              >
                <EyeIcon />
              </button>
              {/* Download */}
              <button
                onClick={e => handleDownload(e, doc)}
                title="Download"
                disabled={doc.storageTier === 'Cool'}
                style={{ ...actionBtn, opacity: doc.storageTier === 'Cool' ? 0.4 : 1, cursor: doc.storageTier === 'Cool' ? 'not-allowed' : 'pointer' }}
              >
                <DownloadIcon />
              </button>
              {/* View metadata */}
              <button
                onClick={() => onSelect(doc)}
                title="View metadata"
                style={actionBtn}
              >
                <InfoIcon />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
          {/* Backdrop */}
          <div onClick={() => setPreviewDoc(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

          {/* Panel */}
          <div style={{
            position: 'relative', zIndex: 1, margin: 'auto',
            width: 'min(92vw, 1100px)', height: 'min(90vh, 840px)',
            background: 'var(--surface)', borderRadius: 14,
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Header bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 20px', borderBottom: '1px solid var(--border)',
              background: 'rgba(0,107,69,0.03)', flexShrink: 0,
            }}>
              <MimeBadge mimeType={previewDoc.mimeType} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{previewDoc.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>by {previewDoc.author} · {fmt(previewDoc.fileSizeBytes)}</div>
              </div>
              <button
                onClick={e => handleDownload(e, previewDoc)}
                disabled={previewDoc.storageTier === 'Cool'}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 8, border: 'none', cursor: previewDoc.storageTier === 'Cool' ? 'not-allowed' : 'pointer',
                  background: previewDoc.storageTier === 'Cool' ? 'rgba(107,114,128,0.15)' : 'linear-gradient(135deg, var(--accent), var(--cyan))',
                  color: previewDoc.storageTier === 'Cool' ? 'var(--muted)' : '#fff',
                  fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)',
                  opacity: previewDoc.storageTier === 'Cool' ? 0.6 : 1,
                }}
              >
                <DownloadIcon /> {previewDoc.storageTier === 'Cool' ? 'Cool Storage' : 'Download'}
              </button>
              <button onClick={() => setPreviewDoc(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
            </div>

            {/* iframe or unsupported message */}
            {previewDoc.mimeType === 'application/pdf' || previewDoc.mimeType === 'text/plain' ? (
              <iframe
                src={`/api/documents/${previewDoc.id}/file`}
                title={previewDoc.title}
                style={{ flex: 1, border: 'none', width: '100%' }}
              />
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--muted)', padding: 40 }}>
                <div style={{ fontSize: 48, opacity: 0.15 }}>◫</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Preview not available</div>
                <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 360 }}>
                  {MIME_LABELS[previewDoc.mimeType] || 'This file type'} cannot be previewed in the browser. Download the file to open it in its native application.
                </div>
                <button
                  onClick={e => { handleDownload(e, previewDoc); setPreviewDoc(null); }}
                  disabled={previewDoc.storageTier === 'Cool'}
                  style={{
                    padding: '9px 20px', borderRadius: 9, border: 'none',
                    background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
                    color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  ↓ Download to open
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const actionBtn = {
  padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)',
  background: 'transparent', color: 'var(--muted)', fontSize: 11,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const EyeIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
  </svg>
);
