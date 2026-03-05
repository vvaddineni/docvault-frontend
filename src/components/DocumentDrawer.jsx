// src/components/DocumentDrawer.jsx
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { documentsApi } from '../api/client';
import { TierBadge, DeptBadge } from './DocumentTable';

const DEPTS = ['Finance','HR','Engineering','Legal','Product','Marketing','General'];

function fmt(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
function date(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DocumentDrawer({ doc, onClose, readOnly = false }) {
  const qc = useQueryClient();
  const [rehydrated, setRehydrated] = useState(false);
  const [editing, setEditing]       = useState(false);
  const [draft, setDraft]           = useState({});
  const isCool = doc.storageTier === 'Cool';

  const startEdit = () => {
    setDraft({
      title:       doc.title       || '',
      author:      doc.author      || '',
      department:  doc.department  || 'General',
      tags:        doc.tags?.join(', ') || '',
      description: doc.description || '',
    });
    setEditing(true);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = `/api/documents/${doc.id}/file`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const rehydrateMutation = useMutation(
    (priority) => documentsApi.rehydrate(doc.id, priority),
    { onSuccess: () => { setRehydrated(true); qc.invalidateQueries('documents'); } }
  );

  const updateMutation = useMutation(
    () => documentsApi.update(doc.id, {
      title:       draft.title,
      author:      draft.author,
      department:  draft.department,
      tags:        draft.tags.split(',').map(t => t.trim()).filter(Boolean),
      description: draft.description,
    }),
    {
      onSuccess: () => {
        qc.invalidateQueries('documents');
        setEditing(false);
      },
    }
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
      <div className="animate-slide-in drawer-panel" style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, zIndex: 900,
        background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '-24px 0 60px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: 'rgba(0,107,69,0.10)',
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

          {/* Edit form or static view */}
          {editing ? (
            <div style={{ marginBottom: 20 }}>
              {[
                { label: 'Title',       key: 'title',       type: 'text' },
                { label: 'Author',      key: 'author',      type: 'text' },
                { label: 'Description', key: 'description', type: 'textarea' },
                { label: 'Tags (comma-separated)', key: 'tags', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key} style={{ marginBottom: 12 }}>
                  <label style={labelStyle}>{label}</label>
                  {type === 'textarea' ? (
                    <textarea rows={2} value={draft[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                      style={{ ...editInput, resize: 'vertical' }} />
                  ) : (
                    <input type="text" value={draft[key]} onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                      style={editInput} />
                  )}
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Department</label>
                <select value={draft.department} onChange={e => setDraft(d => ({ ...d, department: e.target.value }))} style={editInput}>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              {updateMutation.error && (
                <div style={{ fontSize: 12, color: '#f87171', padding: '8px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', marginTop: 8 }}>
                  {updateMutation.error.message}
                </div>
              )}
            </div>
          ) : (
            <>
              {doc.description && (
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 20,
                  padding: '12px 14px', background: 'rgba(0,107,69,0.04)', borderRadius: 8,
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
                    background: i % 2 === 0 ? 'rgba(0,107,69,0.03)' : 'transparent' }}>
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
                      <span key={t} style={{ padding: '3px 9px', borderRadius: 20, background: 'rgba(0,107,69,0.07)', color: 'var(--muted)', fontSize: 12, border: '1px solid var(--border)' }}>#{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Archive warning */}
          {isCool && !rehydrated && (
            <div style={{ padding: '12px 14px', borderRadius: 9, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#3b82f6', marginBottom: 4 }}>Cool Tier</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                This document is in Cool storage. Download requires rehydration before it can be retrieved.
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
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>The blob is being rehydrated from Cool storage. You'll receive a notification when it's ready.</div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!readOnly && <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={handleDownload} disabled={isCool && !rehydrated}
            style={{ width: '100%', padding: '11px', borderRadius: 9, border: 'none', cursor: isCool && !rehydrated ? 'not-allowed' : 'pointer',
              background: isCool && !rehydrated ? 'rgba(107,114,128,0.1)' : 'linear-gradient(135deg, var(--accent), var(--cyan))',
              color: isCool && !rehydrated ? 'var(--muted)' : '#fff',
              fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-display)' }}>
            {isCool && !rehydrated ? 'Rehydrate First' : '↓ Download'}
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? (
              <>
                <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isLoading}
                  style={{ flex: 1, ...btnSecondary, color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                  {updateMutation.isLoading ? 'Saving…' : 'Save Changes'}
                </button>
                <button onClick={() => setEditing(false)} style={{ ...btnSecondary }}>Cancel</button>
              </>
            ) : (
              <>
                <button onClick={startEdit} style={{ flex: 1, ...btnSecondary }}>✎ Edit Metadata</button>
                <button onClick={() => { if (window.confirm('Delete this document?')) deleteMutation.mutate(); }}
                  disabled={deleteMutation.isLoading}
                  style={{ ...btnSecondary, color: '#f87171', borderColor: 'rgba(239,68,68,0.2)' }}>
                  {deleteMutation.isLoading ? '…' : 'Delete'}
                </button>
              </>
            )}
          </div>
        </div>}
      </div>
    </>
  );
}

const btnSm = { padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600 };
const btnSecondary = { padding: '9px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' };
const editInput = { width: '100%', padding: '8px 11px', borderRadius: 7, border: '1px solid var(--border-hi)', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', fontSize: 13, outline: 'none', fontFamily: 'inherit' };
const labelStyle = { display: 'block', fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 5, fontFamily: 'var(--font-mono)' };
