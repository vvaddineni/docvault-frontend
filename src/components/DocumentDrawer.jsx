// src/components/DocumentDrawer.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { documentsApi } from '../api/client';
import { TierBadge, DeptBadge } from './DocumentTable';

function fmt(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
function date(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DocumentDrawer({ doc, onClose }) {
  const qc = useQueryClient();
  const [rehydrated, setRehydrated] = useState(false);
  const isArchive = doc.storageTier === 'Archive';

  const downloadMutation = useMutation(
    () => documentsApi.download(doc.id),
    {
      onSuccess: data => {
        if (data?.sasUrl) window.open(data.sasUrl, '_blank');
        else if (data?.status === 'rehydrating') setRehydrated(true);
      },
    }
  );

  const rehydrateMutation = useMutation(
    (priority) => documentsApi.rehydrate(doc.id, priority),
    { onSuccess: () => { setRehydrated(true); qc.invalidateQueries('documents'); } }
  );

  const deleteMutation = useMutation(
    () => documentsApi.delete(doc.id),
    { onSuccess: () => { qc.invalidateQueries('documents'); onClose(); } }
  );

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 800, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }} />

      {/* Drawer */}
      <div className="animate-slide-in" style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 900,
        width: 440, background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '-24px 0 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: 'rgba(37,99,235,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            color: 'var(--accent-hi)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          }}>
            {doc.mimeType?.includes('pdf') ? 'PDF' : doc.mimeType?.includes('word') ? 'DOC' : doc.mimeType?.includes('sheet') ? 'XLS' : 'FILE'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'var(--text)', lineHeight: 1.3, wordBreak: 'break-word' }}>{doc.title}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>by {doc.author}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <TierBadge tier={doc.storageTier} />
            <DeptBadge dept={doc.department} />
          </div>

          {doc.description && (
            <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65, marginBottom: 20,
              padding: '12px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8,
              borderLeft: '3px solid var(--border-hi)' }}>
              {doc.description}
            </p>
          )}

          {/* Metadata table */}
          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 20 }}>
            {[
              ['Author',    doc.author],
              ['Department', doc.department],
              ['Uploaded',  date(doc.uploadedAt)],
              ['File Size', fmt(doc.fileSizeBytes)],
              ['Storage',   doc.storageTier],
              ['Filename',  doc.filename || doc.title],
            ].map(([k, v], i, arr) => (
              <div key={k} style={{ display: 'flex', padding: '10px 14px',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                <span style={{ width: 100, flexShrink: 0, fontSize: 11, color: 'var(--muted)', fontWeight: 700, fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k}</span>
                <span style={{ fontSize: 13, color: 'var(--text)', wordBreak: 'break-all' }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          {doc.tags?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {doc.tags.map(t => (
                  <span key={t} style={{ padding: '3px 9px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: 12, border: '1px solid var(--border)' }}>#{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Archive warning */}
          {isArchive && !rehydrated && (
            <div style={{ padding: '12px 14px', borderRadius: 9, background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.25)', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 4 }}>Archive Tier</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                This document is in Azure Archive storage. Download requires rehydration before a SAS URL can be generated.
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button onClick={() => rehydrateMutation.mutate('High')} disabled={rehydrateMutation.isLoading}
                  style={{ ...btnSm, background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                  {rehydrateMutation.isLoading ? 'Starting…' : '⚡ High Priority (<1hr)'}
                </button>
                <button onClick={() => rehydrateMutation.mutate('Standard')} disabled={rehydrateMutation.isLoading}
                  style={{ ...btnSm, background: 'rgba(107,114,128,0.1)', color: '#9ca3af', border: '1px solid var(--border)' }}>
                  Standard (1-15hr)
                </button>
              </div>
            </div>
          )}

          {rehydrated && (
            <div style={{ padding: '12px 14px', borderRadius: 9, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 3 }}>Rehydration Started</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>The blob is being copied from Archive to Hot tier. You'll receive a notification when it's ready.</div>
            </div>
          )}

          {/* Flow info */}
          <div style={{ padding: '12px 14px', borderRadius: 9, background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)' }}>
            <div style={{ fontSize: 10, color: '#3b82f6', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>Request Flow</div>
            {['React SPA', 'Node.js BFF :4000', 'Azure APIM', 'Document Service :8080', 'Azure Blob Storage'].map((step, i, arr) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: i < arr.length - 1 ? 4 : 0 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === arr.length - 1 ? 'var(--green)' : '#3b82f6', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: i === arr.length - 1 ? 'var(--green)' : '#64748b', fontFamily: 'var(--font-mono)' }}>{step}</span>
                {i < arr.length - 1 && <span style={{ fontSize: 10, color: '#374151', marginLeft: 'auto' }}>→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => downloadMutation.mutate()} disabled={downloadMutation.isLoading || (isArchive && !rehydrated)}
            style={{ width: '100%', padding: '11px', borderRadius: 9, border: 'none', cursor: isArchive && !rehydrated ? 'not-allowed' : 'pointer',
              background: isArchive && !rehydrated ? 'rgba(107,114,128,0.1)' : 'linear-gradient(135deg, var(--accent), var(--cyan))',
              color: isArchive && !rehydrated ? 'var(--muted)' : '#fff',
              fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-display)',
              opacity: downloadMutation.isLoading ? 0.7 : 1 }}>
            {downloadMutation.isLoading ? 'Generating SAS URL…' : isArchive && !rehydrated ? 'Rehydrate First' : '↓ Download (SAS Link, 15 min)'}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, ...btnSecondary }}>✎ Edit Metadata</button>
            <button onClick={() => { if (window.confirm('Delete this document?')) deleteMutation.mutate(); }}
              disabled={deleteMutation.isLoading}
              style={{ ...btnSecondary, color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>
              {deleteMutation.isLoading ? '…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const btnSm = { padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 };
const btnSecondary = { padding: '9px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };
